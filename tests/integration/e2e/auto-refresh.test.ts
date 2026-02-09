/**
 * Integration test: file save → auto-refresh.
 */
import { activate, createVisualizationPanel, deactivate } from "../../../src/extension";
import { PythonClient } from "../../../src/pythonClient";
import * as vscode from "vscode";
import {
  mockPostMessage,
  triggerSaveDocument,
} from "../../../src/__mocks__/vscodeMock";

jest.mock("../../../src/pythonClient");

const MockPythonClient = PythonClient as jest.MockedClass<typeof PythonClient>;

function createMockContext(): vscode.ExtensionContext {
  return { subscriptions: [] } as unknown as vscode.ExtensionContext;
}

beforeEach(() => {
  deactivate();
  jest.clearAllMocks();
  MockPythonClient.mockImplementation(() => ({
    spawnService: jest.fn().mockResolvedValue(undefined),
    parseAST: jest.fn().mockResolvedValue({ nodes: [], connections: [] }),
    stopService: jest.fn(),
    isServiceRunning: jest.fn().mockReturnValue(true),
  }) as unknown as PythonClient);
});

describe("test_file_save_to_auto_refresh", () => {
  it("when file is saved, graph is re-parsed and webview updated", async () => {
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

    await new Promise((r) => setTimeout(r, 450));

    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: "updateGraph", graph: newGraph })
    );
  });
});
