/**
 * @jest-environment jsdom
 */
import { ReteASTEditor } from "../../webview-ui/src/editor";
import type { ReteGraph } from "../../webview-ui/src/types";

function createLargeGraph(nodeCount: number): ReteGraph {
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    id: `n${i}`,
    label: "Name",
    inputs: {},
    outputs: {},
    data: { astType: "Name", id: `x${i}` },
  }));
  return { nodes, connections: [] };
}

describe("test_render_performance", () => {
  it("loads graph with 100+ nodes in under 3 seconds", async () => {
    const graph = createLargeGraph(120);
    const container = document.createElement("div");
    container.style.width = "800px";
    container.style.height = "600px";
    document.body.appendChild(container);

    const editor = new ReteASTEditor();
    await editor.initialize(container);

    const start = Date.now();
    await editor.loadGraph(graph);
    const elapsed = Date.now() - start;

    const result = editor.getGraph();
    expect(result.nodes.length).toBe(120);
    expect(elapsed).toBeLessThan(3000);

    document.body.removeChild(container);
  });
});
