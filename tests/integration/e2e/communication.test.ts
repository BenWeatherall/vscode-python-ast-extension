/**
 * Integration test: extension ↔ webview message round trip.
 */
import { createVisualizationPanel } from "../../../src/extension";
import { PythonClient } from "../../../src/pythonClient";
import * as vscode from "vscode";
import {
  mockPostMessage,
  mockOnDidReceiveMessage,
  triggerWebviewMessage,
} from "../../../src/__mocks__/vscodeMock";

jest.mock("../../../src/pythonClient");

const MockPythonClient = PythonClient as jest.MockedClass<typeof PythonClient>;

function createMockContext(): vscode.ExtensionContext {
  return { subscriptions: [] } as unknown as vscode.ExtensionContext;
}

beforeEach(() => {
  jest.clearAllMocks();
  MockPythonClient.mockImplementation(() => ({
    spawnService: jest.fn(),
    parseAST: jest.fn(),
    stopService: jest.fn(),
    isServiceRunning: jest.fn().mockReturnValue(false),
  }) as unknown as PythonClient);
});

describe("test_message_round_trip", () => {
  it("extension sends updateGraph to webview", () => {
    const context = createMockContext();
    const mockClient = {} as unknown as PythonClient;
    const docUri = vscode.Uri.file("/test/file.py");
    const graph = { nodes: [], connections: [] };

    createVisualizationPanel(context, mockClient, docUri, graph);

    expect(mockPostMessage).toHaveBeenCalledWith({
      type: "updateGraph",
      graph,
    });
  });

  it("webview message handler registered for receiving from webview", () => {
    const context = createMockContext();
    const mockClient = {} as unknown as PythonClient;
    const docUri = vscode.Uri.file("/test/file.py");
    const graph = { nodes: [], connections: [] };

    createVisualizationPanel(context, mockClient, docUri, graph);

    expect(mockOnDidReceiveMessage).toHaveBeenCalled();
    expect(typeof mockOnDidReceiveMessage.mock.calls[0][0]).toBe("function");
  });

  it("extension receives navigateToSource from webview", () => {
    const context = createMockContext();
    const mockClient = {} as unknown as PythonClient;
    const docUri = vscode.Uri.file("/test/file.py");
    const graph = { nodes: [], connections: [] };

    createVisualizationPanel(context, mockClient, docUri, graph);

    triggerWebviewMessage({
      type: "navigateToSource",
      nodeId: "n1",
      lineno: 1,
      colOffset: 0,
    });

    expect(vscode.window.showTextDocument).toHaveBeenCalled();
  });
});
