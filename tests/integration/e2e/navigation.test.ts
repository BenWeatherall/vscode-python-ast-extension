/**
 * Integration test: node click → editor navigation.
 */
import {
  createVisualizationPanel,
} from "../../../src/extension";
import { PythonClient } from "../../../src/pythonClient";
import * as vscode from "vscode";
import {
  mockShowTextDocument,
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

describe("test_node_click_to_navigation", () => {
  it("webview navigateToSource message triggers editor navigation", () => {
    const context = createMockContext();
    const mockClient = {} as unknown as PythonClient;
    const docUri = vscode.Uri.file("/test/file.py");
    const graph = {
      nodes: [
        {
          id: "n1",
          label: "BinOp",
          inputs: {},
          outputs: {},
          data: { astType: "BinOp", lineno: 5, colOffset: 2 },
        },
      ],
      connections: [],
    };

    createVisualizationPanel(context, mockClient, docUri, graph);

    triggerWebviewMessage({
      type: "navigateToSource",
      nodeId: "n1",
      lineno: 5,
      colOffset: 2,
    });

    expect(mockShowTextDocument).toHaveBeenCalledWith(
      expect.objectContaining({ path: expect.stringContaining("file.py") }),
      expect.anything()
    );
  });
});
