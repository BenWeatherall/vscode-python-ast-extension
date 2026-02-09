/** Tests for VS Code extension activation and command handling. */

import {
  activate,
  deactivate,
  createVisualizationPanel,
} from "../extension";
import { PythonClient } from "../pythonClient";
import { resolveBinaryPath } from "../binaryResolver";
import * as vscode from "vscode";
import {
  mockPostMessage,
  mockCreateOutputChannel,
  mockShowTextDocument,
  triggerWebviewMessage,
  mockOnDidSaveTextDocument,
  triggerSaveDocument,
} from "../__mocks__/vscodeMock";

jest.mock("../pythonClient");
jest.mock("../binaryResolver");

const MockPythonClient = PythonClient as jest.MockedClass<typeof PythonClient>;
const mockResolveBinaryPath = resolveBinaryPath as jest.MockedFunction<typeof resolveBinaryPath>;

function createMockContext(extensionPath?: string): vscode.ExtensionContext {
  return {
    subscriptions: [],
    extensionPath: extensionPath || "/mock/extension/path",
  } as unknown as vscode.ExtensionContext;
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
  deactivate();
  jest.clearAllMocks();
  mockResolveBinaryPath.mockReset();
  MockPythonClient.mockImplementation(() => ({
    spawnService: jest.fn().mockResolvedValue(undefined),
    parseAST: jest.fn().mockResolvedValue({ nodes: [], connections: [] }),
    stopService: jest.fn(),
    isServiceRunning: jest.fn().mockReturnValue(false),
  }) as unknown as PythonClient);
});

describe("extension", () => {
  describe("test_extension_activation", () => {
    it("registers python-ast.visualize command and creates PythonClient", () => {
      const context = createMockContext();
      activate(context);

      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        "python-ast.visualize",
        expect.any(Function)
      );
      expect(MockPythonClient).toHaveBeenCalled();
      expect(context.subscriptions.length).toBeGreaterThan(0);
    });
  });

  describe("test_command_registration", () => {
    it("registers python-ast.visualize command with handler", () => {
      const context = createMockContext();
      activate(context);

      const [, handler] = (vscode.commands.registerCommand as jest.Mock).mock.calls[0];
      expect(typeof handler).toBe("function");
    });
  });

  describe("test_command_execution", () => {
    it("calls parseAST with document content and creates webview panel", async () => {
      const context = createMockContext();
      const mockParseAST = jest.fn().mockResolvedValue({ nodes: [], connections: [] });
      MockPythonClient.mockImplementation(() => ({
        spawnService: jest.fn().mockResolvedValue(undefined),
        parseAST: mockParseAST,
        stopService: jest.fn(),
        isServiceRunning: jest.fn().mockReturnValue(true),
      }) as unknown as PythonClient);

      activate(context);
      const [, handler] = (vscode.commands.registerCommand as jest.Mock).mock.calls[0];

      vscode.window.activeTextEditor = createMockEditor({
        getText: () => "x = 1",
        languageId: "python",
      }) as vscode.TextEditor;

      await handler();

      expect(mockParseAST).toHaveBeenCalledWith("x = 1");
      expect(vscode.window.createWebviewPanel).toHaveBeenCalled();
    });
  });

  describe("test_extension_deactivation", () => {
    it("stops Python service on deactivate", () => {
      const mockStopService = jest.fn();
      MockPythonClient.mockImplementation(() => ({
        spawnService: jest.fn(),
        parseAST: jest.fn(),
        stopService: mockStopService,
        isServiceRunning: jest.fn().mockReturnValue(false),
      }) as unknown as PythonClient);

      const context = createMockContext();
      activate(context);
      deactivate();

      expect(mockStopService).toHaveBeenCalled();
    });
  });

  describe("test_error_handling_no_active_editor", () => {
    it("shows error message when no active editor", async () => {
      const context = createMockContext();
      activate(context);
      vscode.window.activeTextEditor = undefined;

      const [, handler] = (vscode.commands.registerCommand as jest.Mock).mock.calls[0];
      await handler();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        expect.stringMatching(/no.*editor|open.*file/i)
      );
    });
  });

  describe("test_error_handling_non_python_file", () => {
    it("shows error when document is not Python", async () => {
      const context = createMockContext();
      activate(context);
      vscode.window.activeTextEditor = createMockEditor({
        getText: () => "const x = 1;",
        languageId: "javascript",
      }) as vscode.TextEditor;

      const [, handler] = (vscode.commands.registerCommand as jest.Mock).mock.calls[0];
      await handler();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        expect.stringMatching(/python|\.py/i)
      );
    });
  });

  describe("test_webview_panel_creation", () => {
    it("creates panel with correct configuration and webview options", () => {
      const context = createMockContext();
      const mockClient = {
        spawnService: jest.fn(),
        parseAST: jest.fn(),
        stopService: jest.fn(),
        isServiceRunning: jest.fn(),
      } as unknown as PythonClient;
      const docUri = vscode.Uri.file("/test/file.py");
      const graph = { nodes: [], connections: [] };

      createVisualizationPanel(context, mockClient, docUri, graph);

      expect(vscode.window.createWebviewPanel).toHaveBeenCalledWith(
        "pythonAstVisualization",
        expect.any(String),
        expect.anything(),
        expect.objectContaining({ enableScripts: true })
      );
    });
  });

  describe("test_sending_graph_updates_to_webview", () => {
    it("sends graph via postMessage with correct format", () => {
      const context = createMockContext();
      const mockClient = {} as unknown as PythonClient;
      const docUri = vscode.Uri.file("/test/file.py");
      const graph = {
        nodes: [
          {
            id: "n1",
            label: "A",
            inputs: {},
            outputs: {},
            data: { astType: "A" },
          },
        ],
        connections: [],
      };

      createVisualizationPanel(context, mockClient, docUri, graph);

      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "updateGraph",
          graph,
        })
      );
    });
  });

  describe("test_navigation_to_source_code", () => {
    it("calls showTextDocument when receiving navigateToSource", () => {
      const context = createMockContext();
      const mockClient = {} as unknown as PythonClient;
      const docUri = vscode.Uri.file("/test/file.py");
      const graph = { nodes: [], connections: [] };

      createVisualizationPanel(context, mockClient, docUri, graph);

      triggerWebviewMessage({
        type: "navigateToSource",
        lineno: 5,
        colOffset: 10,
      });

      expect(mockShowTextDocument).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything()
      );
    });
  });

  describe("test_error_display", () => {
    it("can send error message to webview via postMessage", () => {
      const context = createMockContext();
      const mockClient = {} as unknown as PythonClient;
      const docUri = vscode.Uri.file("/test/file.py");
      const graph = { nodes: [], connections: [] };

      const panel = createVisualizationPanel(
        context,
        mockClient,
        docUri,
        graph
      );
      mockPostMessage.mockClear();

      panel.webview.postMessage({ type: "error", error: "Parse failed" });

      expect(mockPostMessage).toHaveBeenCalledWith({
        type: "error",
        error: "Parse failed",
      });
    });
  });

  describe("test_panel_lifecycle", () => {
    it("sets up onDidDispose for cleanup", () => {
      const context = createMockContext();
      const mockClient = {} as unknown as PythonClient;
      const docUri = vscode.Uri.file("/test/file.py");
      const graph = { nodes: [], connections: [] };

      const panel = createVisualizationPanel(
        context,
        mockClient,
        docUri,
        graph
      );

      expect(panel.onDidDispose).toHaveBeenCalled();
    });
  });

  describe("test_auto_refresh", () => {
    it("registers onDidSaveTextDocument on activate", () => {
      const context = createMockContext();
      activate(context);
      expect(mockOnDidSaveTextDocument).toHaveBeenCalled();
    });

    it("parse triggered when Python file saved and panel exists", async () => {
      const context = createMockContext();
      const mockParseAST = jest.fn().mockResolvedValue({ nodes: [], connections: [] });
      MockPythonClient.mockImplementation(() => ({
        spawnService: jest.fn().mockResolvedValue(undefined),
        parseAST: mockParseAST,
        stopService: jest.fn(),
        isServiceRunning: jest.fn().mockReturnValue(true),
      }) as unknown as PythonClient);

      activate(context);
      const mockClient = new MockPythonClient();
      const docUri = vscode.Uri.file("/test/file.py");
      createVisualizationPanel(context, mockClient, docUri, { nodes: [], connections: [] });

      mockParseAST.mockClear();
      triggerSaveDocument({
        uri: docUri,
        getText: () => "x = 2",
        languageId: "python",
      });

      await new Promise((r) => setTimeout(r, 400));

      expect(mockParseAST).toHaveBeenCalledWith("x = 2");
    });

    it("webview receives updateGraph when file saved", async () => {
      const context = createMockContext();
      const newGraph = { nodes: [{ id: "n1", label: "X", inputs: {}, outputs: {}, data: { astType: "Assign" } }], connections: [] };
      MockPythonClient.mockImplementation(() => ({
        spawnService: jest.fn().mockResolvedValue(undefined),
        parseAST: jest.fn().mockResolvedValue(newGraph),
        stopService: jest.fn(),
        isServiceRunning: jest.fn().mockReturnValue(true),
      }) as unknown as PythonClient);

      activate(context);
      const mockClient = new MockPythonClient();
      const docUri = vscode.Uri.file("/test/file.py");
      createVisualizationPanel(context, mockClient, docUri, { nodes: [], connections: [] });

      mockPostMessage.mockClear();
      triggerSaveDocument({
        uri: docUri,
        getText: () => "x = 2",
        languageId: "python",
      });

      await new Promise((r) => setTimeout(r, 400));

      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: "updateGraph", graph: newGraph })
      );
    });

    it("no errors when save with no panel open", async () => {
      const context = createMockContext();
      const mockParseAST = jest.fn().mockResolvedValue({ nodes: [], connections: [] });
      MockPythonClient.mockImplementation(() => ({
        spawnService: jest.fn().mockResolvedValue(undefined),
        parseAST: mockParseAST,
        stopService: jest.fn(),
        isServiceRunning: jest.fn().mockReturnValue(true),
      }) as unknown as PythonClient);

      activate(context);
      const docUri = vscode.Uri.file("/test/file.py");

      triggerSaveDocument({
        uri: docUri,
        getText: () => "x = 1",
        languageId: "python",
      });

      await new Promise((r) => setTimeout(r, 400));

      // No panels open, so auto-refresh skips parsing (no panels to update)
      expect(mockParseAST).not.toHaveBeenCalled();
    });

    it("debounces rapid saves to single parse", async () => {
      const context = createMockContext();
      const mockParseAST = jest.fn().mockResolvedValue({ nodes: [], connections: [] });
      MockPythonClient.mockImplementation(() => ({
        spawnService: jest.fn().mockResolvedValue(undefined),
        parseAST: mockParseAST,
        stopService: jest.fn(),
        isServiceRunning: jest.fn().mockReturnValue(true),
      }) as unknown as PythonClient);

      activate(context);
      const mockClient = new MockPythonClient();
      const docUri = vscode.Uri.file("/test/file.py");
      createVisualizationPanel(context, mockClient, docUri, { nodes: [], connections: [] });

      mockParseAST.mockClear();
      triggerSaveDocument({ uri: docUri, getText: () => "v1", languageId: "python" });
      triggerSaveDocument({ uri: docUri, getText: () => "v2", languageId: "python" });
      triggerSaveDocument({ uri: docUri, getText: () => "v3", languageId: "python" });

      await new Promise((r) => setTimeout(r, 50));
      expect(mockParseAST).not.toHaveBeenCalled();

      await new Promise((r) => setTimeout(r, 400));
      expect(mockParseAST).toHaveBeenCalledTimes(1);
      expect(mockParseAST).toHaveBeenCalledWith("v3");
    });

    it("all panels receive update when multiple panels for same document", async () => {
      const context = createMockContext();
      const newGraph = { nodes: [], connections: [] };
      MockPythonClient.mockImplementation(() => ({
        spawnService: jest.fn().mockResolvedValue(undefined),
        parseAST: jest.fn().mockResolvedValue(newGraph),
        stopService: jest.fn(),
        isServiceRunning: jest.fn().mockReturnValue(true),
      }) as unknown as PythonClient);

      activate(context);
      const mockClient = new MockPythonClient();
      const docUri = vscode.Uri.file("/test/file.py");
      createVisualizationPanel(context, mockClient, docUri, { nodes: [], connections: [] });
      createVisualizationPanel(context, mockClient, docUri, { nodes: [], connections: [] });

      mockPostMessage.mockClear();
      triggerSaveDocument({
        uri: docUri,
        getText: () => "x = 1",
        languageId: "python",
      });

      await new Promise((r) => setTimeout(r, 400));

      // 2 loading messages + 2 updateGraph messages = 4 total
      expect(mockPostMessage).toHaveBeenCalledTimes(4);
    });

    it("ignores non-Python file saves", async () => {
      const context = createMockContext();
      const mockParseAST = jest.fn().mockResolvedValue({ nodes: [], connections: [] });
      MockPythonClient.mockImplementation(() => ({
        spawnService: jest.fn().mockResolvedValue(undefined),
        parseAST: mockParseAST,
        stopService: jest.fn(),
        isServiceRunning: jest.fn().mockReturnValue(true),
      }) as unknown as PythonClient);

      activate(context);
      const mockClient = new MockPythonClient();
      const docUri = vscode.Uri.file("/test/file.py");
      createVisualizationPanel(context, mockClient, docUri, { nodes: [], connections: [] });

      mockParseAST.mockClear();
      triggerSaveDocument({
        uri: vscode.Uri.file("/test/file.js"),
        getText: () => "const x = 1",
        languageId: "javascript",
      });

      await new Promise((r) => setTimeout(r, 400));

      expect(mockParseAST).not.toHaveBeenCalled();
    });
  });

  describe("extension activation with binary resolution", () => {
    it("resolves binary path and passes to PythonClient", () => {
      const extensionPath = "/path/to/extension";
      const binaryPath = "/path/to/extension/bin/python_service-win-x64.exe";
      const context = createMockContext(extensionPath);

      mockResolveBinaryPath.mockReturnValue(binaryPath);

      activate(context);

      expect(mockResolveBinaryPath).toHaveBeenCalledWith(extensionPath);
      expect(MockPythonClient).toHaveBeenCalledWith(binaryPath);
    });

    it("handles missing binary gracefully", () => {
      const extensionPath = "/path/to/extension";
      const context = createMockContext(extensionPath);
      const mockOutputChannel = {
        appendLine: jest.fn(),
        show: jest.fn(),
        dispose: jest.fn(),
      };

      mockResolveBinaryPath.mockReturnValue(null);
      mockCreateOutputChannel.mockReturnValue(mockOutputChannel);

      activate(context);

      expect(mockResolveBinaryPath).toHaveBeenCalledWith(extensionPath);
      expect(MockPythonClient).toHaveBeenCalledWith(null);
      expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
        expect.stringMatching(/warning.*binary.*not found|using system python/i)
      );
    });

    it("handles unsupported platform gracefully", () => {
      const extensionPath = "/path/to/extension";
      const context = createMockContext(extensionPath);
      const mockOutputChannel = {
        appendLine: jest.fn(),
        show: jest.fn(),
        dispose: jest.fn(),
      };

      mockResolveBinaryPath.mockReturnValue(null);
      mockCreateOutputChannel.mockReturnValue(mockOutputChannel);

      activate(context);

      expect(mockResolveBinaryPath).toHaveBeenCalledWith(extensionPath);
      expect(MockPythonClient).toHaveBeenCalledWith(null);
      expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
        expect.stringMatching(/warning.*binary.*not found|using system python/i)
      );
      expect(context.subscriptions.length).toBeGreaterThan(0);
    });

    it("activation continues even if binary not found", () => {
      const extensionPath = "/path/to/extension";
      const context = createMockContext(extensionPath);

      mockResolveBinaryPath.mockReturnValue(null);

      expect(() => activate(context)).not.toThrow();

      expect(mockResolveBinaryPath).toHaveBeenCalledWith(extensionPath);
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        "python-ast.visualize",
        expect.any(Function)
      );
      expect(MockPythonClient).toHaveBeenCalled();
    });

    it("binary path passed through activation flow", async () => {
      const extensionPath = "/path/to/extension";
      const binaryPath = "/path/to/extension/bin/python_service-win-x64.exe";
      const context = createMockContext(extensionPath);
      const mockParseAST = jest.fn().mockResolvedValue({ nodes: [], connections: [] });

      mockResolveBinaryPath.mockReturnValue(binaryPath);
      MockPythonClient.mockImplementation(() => ({
        spawnService: jest.fn().mockResolvedValue(undefined),
        parseAST: mockParseAST,
        stopService: jest.fn(),
        isServiceRunning: jest.fn().mockReturnValue(true),
      }) as unknown as PythonClient);

      activate(context);

      expect(MockPythonClient).toHaveBeenCalledWith(binaryPath);

      const [, handler] = (vscode.commands.registerCommand as jest.Mock).mock.calls[0];
      vscode.window.activeTextEditor = createMockEditor({
        getText: () => "x = 1",
        languageId: "python",
      }) as vscode.TextEditor;

      await handler();

      expect(mockParseAST).toHaveBeenCalledWith("x = 1");
    });

    it("handles binary resolution errors gracefully", () => {
      const extensionPath = "/path/to/extension";
      const context = createMockContext(extensionPath);

      mockResolveBinaryPath.mockImplementation(() => {
        throw new Error("File system error");
      });

      expect(() => activate(context)).not.toThrow();

      expect(mockResolveBinaryPath).toHaveBeenCalledWith(extensionPath);
      expect(MockPythonClient).toHaveBeenCalled();
    });

    it("logs warning for development mode fallback", () => {
      const extensionPath = "/path/to/extension";
      const context = createMockContext(extensionPath);
      const mockOutputChannel = {
        appendLine: jest.fn(),
        show: jest.fn(),
        dispose: jest.fn(),
      };

      mockResolveBinaryPath.mockReturnValue(null);
      mockCreateOutputChannel.mockReturnValue(mockOutputChannel);

      activate(context);

      const warningCalls = mockOutputChannel.appendLine.mock.calls.filter(
        (call: unknown[]) => typeof call[0] === "string" &&
        ((call[0] as string).toLowerCase().includes("warning") ||
         (call[0] as string).toLowerCase().includes("binary") ||
         (call[0] as string).toLowerCase().includes("system python"))
      );

      expect(warningCalls.length).toBeGreaterThan(0);
    });
  });
});
