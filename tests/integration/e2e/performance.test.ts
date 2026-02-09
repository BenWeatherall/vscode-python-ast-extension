/**
 * Integration test: large file handling.
 */
import { activate } from "../../../src/extension";
import { PythonClient } from "../../../src/pythonClient";
import * as vscode from "vscode";

jest.mock("../../../src/pythonClient");

const MockPythonClient = PythonClient as jest.MockedClass<typeof PythonClient>;

function createMockContext(): vscode.ExtensionContext {
  return { subscriptions: [] } as unknown as vscode.ExtensionContext;
}

function createMockEditor(doc: {
  getText: () => string;
  languageId: string;
}): vscode.TextEditor {
  return {
    document: doc as vscode.TextDocument,
    selection: {} as vscode.Selection,
    viewColumn: undefined,
    options: {},
    edit: jest.fn(),
    insertSnippet: jest.fn(),
    setDecorations: jest.fn(),
    revealRange: jest.fn(),
    show: jest.fn(),
    hide: jest.fn(),
  } as unknown as vscode.TextEditor;
}

function createLargeGraph(nodeCount: number) {
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    id: `n${i}`,
    label: "Name",
    inputs: {},
    outputs: {},
    data: { astType: "Name" },
  }));
  return { nodes, connections: [] };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("test_large_file_handling", () => {
  it("parses and visualizes graph with 100+ nodes", async () => {
    const graph = createLargeGraph(120);
    const mockParseAST = jest.fn().mockResolvedValue(graph);
    MockPythonClient.mockImplementation(() => ({
      spawnService: jest.fn().mockResolvedValue(undefined),
      parseAST: mockParseAST,
      stopService: jest.fn(),
      isServiceRunning: jest.fn().mockReturnValue(true),
    }) as unknown as PythonClient);

    const context = createMockContext();
    activate(context);
    vscode.window.activeTextEditor = createMockEditor({
      getText: () => "x\n".repeat(60),
      languageId: "python",
    }) as vscode.TextEditor;

    const [, handler] = (vscode.commands.registerCommand as jest.Mock).mock.calls[0];
    const start = Date.now();
    await handler();
    const elapsed = Date.now() - start;

    expect(mockParseAST).toHaveBeenCalled();
    expect(vscode.window.createWebviewPanel).toHaveBeenCalled();
    expect(elapsed).toBeLessThan(5000);
  });
});
