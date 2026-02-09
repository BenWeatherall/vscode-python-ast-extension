/**
 * Integration test: error propagation end-to-end.
 */
import { activate } from "../../../src/extension";
import { PythonClient } from "../../../src/pythonClient";
import * as vscode from "vscode";
import { mockPostMessage } from "../../../src/__mocks__/vscodeMock";

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
});

describe("test_error_propagation_end_to_end", () => {
  it("parse error from Python service shows error message", async () => {
    MockPythonClient.mockImplementation(() => ({
      spawnService: jest.fn().mockResolvedValue(undefined),
      parseAST: jest.fn().mockRejectedValue(new Error("invalid syntax")),
      stopService: jest.fn(),
      isServiceRunning: jest.fn().mockReturnValue(true),
    }) as unknown as PythonClient);

    const context = createMockContext();
    activate(context);
    vscode.window.activeTextEditor = createMockEditor({
      getText: () => "invalid {{{",
      languageId: "python",
    }) as vscode.TextEditor;

    const [, handler] = (vscode.commands.registerCommand as jest.Mock).mock.calls[0];
    await handler();

    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
      expect.stringMatching(/invalid syntax/)
    );
  });
});
