/**
 * Integration test: file → parse → visualize workflow.
 */
import {
  activate,
  createVisualizationPanel,
} from "../../../src/extension";
import { PythonClient } from "../../../src/pythonClient";
import * as vscode from "vscode";
import {
  mockPostMessage,
  triggerWebviewMessage,
} from "../../../src/__mocks__/vscodeMock";

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
    document: { ...doc, uri: vscode.Uri.file("/test/file.py") } as vscode.TextDocument,
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

beforeEach(() => {
  jest.clearAllMocks();
  MockPythonClient.mockImplementation(() => ({
    spawnService: jest.fn().mockResolvedValue(undefined),
    parseAST: jest.fn().mockResolvedValue({ nodes: [], connections: [] }),
    stopService: jest.fn(),
    isServiceRunning: jest.fn().mockReturnValue(false),
  }) as unknown as PythonClient);
});

describe("test_file_to_parse_to_visualize", () => {
  it("triggering command parses file and sends graph to webview", async () => {
    const graph = {
      nodes: [
        { id: "n1", label: "BinOp", inputs: {}, outputs: {}, data: { astType: "BinOp" } },
      ],
      connections: [],
    };
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
      getText: () => "1 + 2",
      languageId: "python",
    }) as vscode.TextEditor;

    const [, handler] = (vscode.commands.registerCommand as jest.Mock).mock.calls[0];
    await handler();

    expect(mockParseAST).toHaveBeenCalledWith("1 + 2");
    expect(vscode.window.createWebviewPanel).toHaveBeenCalled();
    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: "updateGraph", graph })
    );
  });
});
