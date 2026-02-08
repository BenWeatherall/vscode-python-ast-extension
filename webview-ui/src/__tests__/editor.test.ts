/**
 * @jest-environment jsdom
 */
/** Tests for ReteASTEditor. */
import type { NodeData, ReteGraph } from "../types";
import { ReteASTEditor } from "../editor";

describe("ReteASTEditor", () => {
  let editor: ReteASTEditor;
  let container: HTMLElement;

  beforeEach(() => {
    editor = new ReteASTEditor();
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe("test_editor_initialization", () => {
    it("creates editor and mounts to container", async () => {
      await editor.initialize(container);
      expect(container.children.length).toBeGreaterThan(0);
    });
  });

  describe("test_loading_graph_from_json", () => {
    it("loads graph and renders nodes", async () => {
      await editor.initialize(container);
      const graph: ReteGraph = {
        nodes: [
          {
            id: "n1",
            label: "BinOp",
            inputs: {},
            outputs: { result: {} },
            data: { astType: "BinOp", lineno: 1 },
          },
        ],
        connections: [],
      };
      await editor.loadGraph(graph);
      const out = editor.getGraph();
      expect(out.nodes).toHaveLength(1);
      expect(out.nodes[0].id).toBe("n1");
    });
  });

  describe("test_clearing_graph", () => {
    it("clears graph and allows reload", async () => {
      await editor.initialize(container);
      const graph: ReteGraph = {
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
      await editor.loadGraph(graph);
      await editor.clearGraph();
      const cleared = editor.getGraph();
      expect(cleared.nodes).toHaveLength(0);
      expect(cleared.connections).toHaveLength(0);
      await editor.loadGraph(graph);
      const reloaded = editor.getGraph();
      expect(reloaded.nodes).toHaveLength(1);
    });
  });

  describe("test_getting_graph_data", () => {
    it("returns graph matching input structure", async () => {
      await editor.initialize(container);
      const graph: ReteGraph = {
        nodes: [
          {
            id: "n1",
            label: "BinOp",
            inputs: { left: {} },
            outputs: { result: {} },
            data: { astType: "BinOp", lineno: 5 },
          },
        ],
        connections: [
          { source: "n1", sourceOutput: "result", target: "n2", targetInput: "in" },
        ],
      };
      await editor.loadGraph(graph);
      const out = editor.getGraph();
      expect(out.nodes).toHaveLength(1);
      expect(out.nodes[0].data.astType).toBe("BinOp");
      expect(out.nodes[0].data.lineno).toBe(5);
    });
  });

  describe("test_node_click_event_handling", () => {
    it("registers click handler", async () => {
      await editor.initialize(container);
      const graph: ReteGraph = {
        nodes: [
          {
            id: "n1",
            label: "A",
            inputs: {},
            outputs: {},
            data: { astType: "A", lineno: 1 },
          },
        ],
        connections: [],
      };
      await editor.loadGraph(graph);
      const clickHandler = jest.fn<void, [string, NodeData]>();
      editor.onNodeClick(clickHandler);
      expect(clickHandler).not.toThrow();
    });
  });

  describe("test_error_handling", () => {
    it("handles empty graph", async () => {
      await editor.initialize(container);
      await editor.loadGraph({ nodes: [], connections: [] });
      const out = editor.getGraph();
      expect(out.nodes).toHaveLength(0);
    });
  });
});
