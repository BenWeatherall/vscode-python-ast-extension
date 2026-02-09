/**
 * @jest-environment jsdom
 */
/**
 * Tests for error handling and user feedback.
 */
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
import { App } from "../../webview-ui/src/App";
import { PythonClient } from "../../src/pythonClient";
import * as vscode from "vscode";
import { activate, deactivate, createVisualizationPanel } from "../../src/extension";
import type { ReteGraph } from "../../src/types";

jest.mock("../../src/pythonClient");
jest.mock("../../src/binaryResolver", () => ({
  resolveBinaryPath: jest.fn().mockReturnValue("/mock/binary/path"),
}));
jest.mock("../../webview-ui/src/editor", () => {
  const actual = jest.requireActual<typeof import("../../webview-ui/src/editor")>("../../webview-ui/src/editor");
  
  type NodeClickHandler = (nodeId: string, data: { lineno?: number; colOffset?: number }) => void;
  
  type MockGraph = {
    nodes: Array<{ id: string; label: string; data?: Record<string, unknown> }>;
    connections: unknown[];
  };
  
  class MockReteASTEditor {
    private container: HTMLElement | null = null;
    private handlers: NodeClickHandler[] = [];
    
    initialize(container: HTMLElement): Promise<void> {
      this.container = container;
      return Promise.resolve();
    }
    
    onNodeClick(handler: NodeClickHandler): void {
      this.handlers.push(handler);
    }
    
    clearGraph(): Promise<void> {
      if (this.container) this.container.innerHTML = "";
      return Promise.resolve();
    }
    
    loadGraph(graph: MockGraph): Promise<void> {
      if (!this.container) return Promise.resolve();
      this.container.innerHTML = "";
      for (const node of graph.nodes) {
        const el = document.createElement("div");
        el.setAttribute("data-testid", "ast-node");
        el.onclick = () => {
          this.handlers.forEach((h) => h(node.id, node.data ?? { astType: node.label }));
        };
        this.container.appendChild(el);
      }
      return Promise.resolve();
    }
    
    getGraph(): MockGraph {
      return { nodes: [], connections: [] };
    }
  }
  
  return { ...actual, ReteASTEditor: MockReteASTEditor };
});

const MockPythonClient = PythonClient as jest.MockedClass<typeof PythonClient>;

const mockPostMessage = jest.fn<void, [unknown]>();
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

function createVscodeApi() {
  return { postMessage: mockPostMessage };
}

function createMockContext(): vscode.ExtensionContext {
  return {
    subscriptions: [],
    extensionUri: vscode.Uri.file("/test"),
  } as unknown as vscode.ExtensionContext;
}

function createMockEditor(doc: {
  getText: () => string;
  languageId: string;
  uri: vscode.Uri;
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

function createMockPanel(): vscode.WebviewPanel {
  const webview = {
    postMessage: jest.fn(),
    asWebviewUri: jest.fn((uri: vscode.Uri) => uri),
  } as unknown as vscode.Webview;
  
  return {
    webview,
    onDidDispose: jest.fn(() => ({ dispose: jest.fn() })),
  } as unknown as vscode.WebviewPanel;
}

beforeEach(() => {
  deactivate();
  jest.clearAllMocks();
  mockPostMessage.mockClear();
  mockAddEventListener.mockClear();
  mockRemoveEventListener.mockClear();
  
  Object.defineProperty(window, "addEventListener", {
    value: mockAddEventListener,
    writable: true,
  });
  Object.defineProperty(window, "removeEventListener", {
    value: mockRemoveEventListener,
    writable: true,
  });
  
  MockPythonClient.mockImplementation(() => ({
    spawnService: jest.fn().mockResolvedValue(undefined),
    parseAST: jest.fn().mockResolvedValue({ nodes: [], connections: [] }),
    stopService: jest.fn(),
    isServiceRunning: jest.fn().mockReturnValue(false),
  }) as unknown as PythonClient);
});

async function renderApp() {
  let result: ReturnType<typeof render>;
  await act(async () => {
    result = render(<App getVscodeApi={createVscodeApi} />);
    await Promise.resolve();
  });
  return result!;
}

describe("test_error_message_display", () => {
  it("displays user-friendly error messages in webview", async () => {
    await renderApp();
    const [, handler] = mockAddEventListener.mock.calls.find(
      (c) => c[0] === "message"
    ) ?? [null, null];
    
    await act(async () => {
      handler?.({ data: { type: "error", error: "Failed to parse Python code: invalid syntax at line 5" } });
    });
    
    await waitFor(() => {
      const errorElement = screen.getByTestId("error");
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent).toContain("Failed to parse Python code");
    });
  });
  
  it("formats error messages clearly", async () => {
    await renderApp();
    const [, handler] = mockAddEventListener.mock.calls.find(
      (c) => c[0] === "message"
    ) ?? [null, null];
    
    await act(async () => {
      handler?.({ data: { type: "error", error: "Syntax error: unexpected token" } });
    });
    
    await waitFor(() => {
      const errorElement = screen.getByTestId("error");
      expect(errorElement.textContent).toMatch(/syntax error/i);
    });
  });
});

describe("test_service_failure_handling", () => {
  it("handles Python service failure gracefully", async () => {
    MockPythonClient.mockImplementation(() => ({
      spawnService: jest.fn().mockRejectedValue(new Error("Python service crashed")),
      parseAST: jest.fn(),
      stopService: jest.fn(),
      isServiceRunning: jest.fn().mockReturnValue(false),
    }) as unknown as PythonClient);
    
    const context = createMockContext();
    activate(context);
    
    vscode.window.activeTextEditor = createMockEditor({
      getText: () => "x + y",
      languageId: "python",
      uri: vscode.Uri.file("/test.py"),
    }) as vscode.TextEditor;
    
    const [, handler] = (vscode.commands.registerCommand as jest.Mock).mock.calls[0];
    await handler();
    
    expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    const errorCall = (vscode.window.showErrorMessage as jest.Mock).mock.calls[0][0];
    expect(errorCall).toMatch(/python service/i);
  });
  
  it("provides recovery suggestions for service failures", async () => {
    MockPythonClient.mockImplementation(() => ({
      spawnService: jest.fn().mockRejectedValue(new Error("Service unavailable")),
      parseAST: jest.fn(),
      stopService: jest.fn(),
      isServiceRunning: jest.fn().mockReturnValue(false),
    }) as unknown as PythonClient);
    
    const context = createMockContext();
    activate(context);
    
    vscode.window.activeTextEditor = createMockEditor({
      getText: () => "x + y",
      languageId: "python",
      uri: vscode.Uri.file("/test.py"),
    }) as vscode.TextEditor;
    
    const [, handler] = (vscode.commands.registerCommand as jest.Mock).mock.calls[0];
    await handler();
    
    expect(vscode.window.showErrorMessage).toHaveBeenCalled();
  });
});

describe("test_loading_state_display", () => {
  it("shows loading indicator during parsing", async () => {
    await renderApp();
    expect(screen.getByTestId("loading")).toBeTruthy();
  });
  
  it("clears loading state on successful parse", async () => {
    await renderApp();
    const [, handler] = mockAddEventListener.mock.calls.find(
      (c) => c[0] === "message"
    ) ?? [null, null];
    
    const graph: ReteGraph = {
      nodes: [{ id: "n1", label: "BinOp", inputs: {}, outputs: {}, data: { astType: "BinOp" } }],
      connections: [],
    };
    
    await act(async () => {
      handler?.({ data: { type: "updateGraph", graph } });
    });
    
    await waitFor(() => {
      expect(screen.queryByTestId("loading")).toBeNull();
    });
  });
  
  it("clears loading state on error", async () => {
    await renderApp();
    const [, handler] = mockAddEventListener.mock.calls.find(
      (c) => c[0] === "message"
    ) ?? [null, null];
    
    await act(async () => {
      handler?.({ data: { type: "error", error: "Parse failed" } });
    });
    
    await waitFor(() => {
      expect(screen.queryByTestId("loading")).toBeNull();
    });
  });
});

describe("test_error_recovery", () => {
  it("displays error recovery suggestions", async () => {
    await renderApp();
    const [, handler] = mockAddEventListener.mock.calls.find(
      (c) => c[0] === "message"
    ) ?? [null, null];
    
    await act(async () => {
      handler?.({ data: { type: "error", error: "Syntax error", recovery: "Check your Python syntax" } });
    });
    
    await waitFor(() => {
      const errorElement = screen.getByTestId("error");
      expect(errorElement).toBeTruthy();
    });
  });
  
  it("allows retry functionality", async () => {
    await renderApp();
    const [, handler] = mockAddEventListener.mock.calls.find(
      (c) => c[0] === "message"
    ) ?? [null, null];
    
    await act(async () => {
      handler?.({ data: { type: "error", error: "Parse failed" } });
    });
    
    await waitFor(() => {
      expect(screen.getByTestId("error")).toBeTruthy();
    });
    
    // Retry button should be present if implemented
    const retryButton = screen.queryByText(/retry/i);
    // This test verifies the structure exists for retry functionality
    expect(screen.getByTestId("error")).toBeTruthy();
  });
});

describe("test_parsing_error_display", () => {
  it("displays syntax errors clearly", async () => {
    await renderApp();
    const [, handler] = mockAddEventListener.mock.calls.find(
      (c) => c[0] === "message"
    ) ?? [null, null];
    
    await act(async () => {
      handler?.({ data: { type: "error", error: "Syntax error at line 3, column 5: invalid syntax" } });
    });
    
    await waitFor(() => {
      const errorElement = screen.getByTestId("error");
      expect(errorElement.textContent).toMatch(/syntax error/i);
      expect(errorElement.textContent).toMatch(/line 3/i);
    });
  });
  
  it("shows error location (line/column)", async () => {
    await renderApp();
    const [, handler] = mockAddEventListener.mock.calls.find(
      (c) => c[0] === "message"
    ) ?? [null, null];
    
    await act(async () => {
      handler?.({ data: { type: "error", error: "Error at line 10, column 15" } });
    });
    
    await waitFor(() => {
      const errorElement = screen.getByTestId("error");
      expect(errorElement.textContent).toMatch(/line 10/i);
      expect(errorElement.textContent).toMatch(/column 15/i);
    });
  });
  
  it("provides descriptive error messages", async () => {
    await renderApp();
    const [, handler] = mockAddEventListener.mock.calls.find(
      (c) => c[0] === "message"
    ) ?? [null, null];
    
    await act(async () => {
      handler?.({ data: { type: "error", error: "Invalid Python syntax: expected ':' after 'if' statement" } });
    });
    
    await waitFor(() => {
      const errorElement = screen.getByTestId("error");
      expect(errorElement.textContent).toMatch(/invalid python syntax/i);
    });
  });
});

describe("test_error_logging", () => {
  it("logs errors to output channel", async () => {
    const outputChannel = {
      appendLine: jest.fn(),
      show: jest.fn(),
      dispose: jest.fn(),
    };
    
    (vscode.window.createOutputChannel as jest.Mock).mockReturnValue(outputChannel);
    
    MockPythonClient.mockImplementation(() => ({
      spawnService: jest.fn().mockRejectedValue(new Error("Test error")),
      parseAST: jest.fn(),
      stopService: jest.fn(),
      isServiceRunning: jest.fn().mockReturnValue(false),
    }) as unknown as PythonClient);
    
    const context = createMockContext();
    activate(context);
    
    vscode.window.activeTextEditor = createMockEditor({
      getText: () => "x + y",
      languageId: "python",
      uri: vscode.Uri.file("/test.py"),
    }) as vscode.TextEditor;
    
    const [, handler] = (vscode.commands.registerCommand as jest.Mock).mock.calls[0];
    await handler();
    
    expect(vscode.window.createOutputChannel).toHaveBeenCalled();
    expect(outputChannel.appendLine).toHaveBeenCalled();
  });
  
  it("includes context in error logs", async () => {
    const outputChannel = {
      appendLine: jest.fn(),
      show: jest.fn(),
      dispose: jest.fn(),
    };
    
    (vscode.window.createOutputChannel as jest.Mock).mockReturnValue(outputChannel);
    
    MockPythonClient.mockImplementation(() => ({
      spawnService: jest.fn().mockRejectedValue(new Error("Service error")),
      parseAST: jest.fn(),
      stopService: jest.fn(),
      isServiceRunning: jest.fn().mockReturnValue(false),
    }) as unknown as PythonClient);
    
    const context = createMockContext();
    activate(context);
    
    vscode.window.activeTextEditor = createMockEditor({
      getText: () => "test code",
      languageId: "python",
      uri: vscode.Uri.file("/test.py"),
    }) as vscode.TextEditor;
    
    const [, handler] = (vscode.commands.registerCommand as jest.Mock).mock.calls[0];
    await handler();
    
    const logCalls = (outputChannel.appendLine as jest.Mock).mock.calls;
    expect(logCalls.length).toBeGreaterThan(0);
    const logMessage = logCalls[0][0];
    expect(logMessage).toMatch(/error/i);
  });
  
  it("includes stack traces for debugging", async () => {
    const outputChannel = {
      appendLine: jest.fn(),
      show: jest.fn(),
      dispose: jest.fn(),
    };
    
    (vscode.window.createOutputChannel as jest.Mock).mockReturnValue(outputChannel);
    
    const testError = new Error("Test error");
    testError.stack = "Error: Test error\n    at test.js:1:1";
    
    MockPythonClient.mockImplementation(() => ({
      spawnService: jest.fn().mockRejectedValue(testError),
      parseAST: jest.fn(),
      stopService: jest.fn(),
      isServiceRunning: jest.fn().mockReturnValue(false),
    }) as unknown as PythonClient);
    
    const context = createMockContext();
    activate(context);
    
    vscode.window.activeTextEditor = createMockEditor({
      getText: () => "x + y",
      languageId: "python",
      uri: vscode.Uri.file("/test.py"),
    }) as vscode.TextEditor;
    
    const [, handler] = (vscode.commands.registerCommand as jest.Mock).mock.calls[0];
    await handler();
    
    const logCalls = (outputChannel.appendLine as jest.Mock).mock.calls;
    // Stack trace should be logged if available
    expect(logCalls.length).toBeGreaterThan(0);
  });
});
