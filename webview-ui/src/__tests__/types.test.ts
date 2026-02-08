/** Tests for types and conversion utilities. */

import {
  pythonConnectionToTs,
  pythonGraphToTs,
  pythonNodeDataToTs,
  pythonNodeToTs,
} from "../conversion";
import type { NodeData, ReteConnection, ReteGraph, ReteNode } from "../types";

describe("type compatibility with Python models", () => {
  it("has all required fields for NodeData", () => {
    const data: NodeData = {
      astType: "BinOp",
      lineno: 1,
      colOffset: 0,
    };
    expect(data.astType).toBe("BinOp");
    expect(data.lineno).toBe(1);
    expect(data.colOffset).toBe(0);
  });

  it("has all required fields for ReteNode", () => {
    const node: ReteNode = {
      id: "node-1",
      label: "BinOp",
      inputs: {},
      outputs: { result: {} },
      data: { astType: "BinOp" },
    };
    expect(node.id).toBe("node-1");
    expect(node.label).toBe("BinOp");
    expect(node.data).toBeDefined();
    expect(node.data.astType).toBe("BinOp");
  });

  it("has all required fields for ReteConnection", () => {
    const conn: ReteConnection = {
      source: "node-1",
      sourceOutput: "result",
      target: "node-2",
      targetInput: "left",
    };
    expect(conn.source).toBe("node-1");
    expect(conn.sourceOutput).toBe("result");
    expect(conn.target).toBe("node-2");
    expect(conn.targetInput).toBe("left");
  });

  it("has all required fields for ReteGraph", () => {
    const graph: ReteGraph = {
      nodes: [],
      connections: [],
    };
    expect(graph.nodes).toEqual([]);
    expect(graph.connections).toEqual([]);
  });
});

describe("json serialization", () => {
  it("round-trips ReteGraph through JSON", () => {
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
      connections: [
        {
          source: "n1",
          sourceOutput: "result",
          target: "n2",
          targetInput: "left",
        },
      ],
    };
    const json = JSON.stringify(graph);
    const parsed = JSON.parse(json) as ReteGraph;
    expect(parsed.nodes).toHaveLength(1);
    expect(parsed.nodes[0].id).toBe("n1");
    expect(parsed.connections).toHaveLength(1);
    expect(parsed.connections[0].source).toBe("n1");
  });
});

describe("case conversion", () => {
  it("converts Python NodeData to TypeScript", () => {
    const python = { ast_type: "BinOp", lineno: 5, col_offset: 10 };
    const ts = pythonNodeDataToTs(python);
    expect(ts.astType).toBe("BinOp");
    expect(ts.lineno).toBe(5);
    expect(ts.colOffset).toBe(10);
  });

  it("converts Python ReteConnection to TypeScript", () => {
    const python = {
      source: "a",
      source_output: "out",
      target: "b",
      target_input: "in",
    };
    const ts = pythonConnectionToTs(python);
    expect(ts.source).toBe("a");
    expect(ts.sourceOutput).toBe("out");
    expect(ts.target).toBe("b");
    expect(ts.targetInput).toBe("in");
  });

  it("converts Python ReteNode to TypeScript", () => {
    const python = {
      id: "n1",
      label: "BinOp",
      inputs: {},
      outputs: {},
      data: { ast_type: "BinOp", lineno: 1 },
    };
    const ts = pythonNodeToTs(python);
    expect(ts.id).toBe("n1");
    expect(ts.data.astType).toBe("BinOp");
    expect(ts.data.lineno).toBe(1);
  });

  it("converts Python ReteGraph to TypeScript", () => {
    const python = {
      nodes: [
        {
          id: "n1",
          label: "BinOp",
          inputs: {},
          outputs: {},
          data: { ast_type: "BinOp" },
        },
      ],
      connections: [
        {
          source: "n1",
          source_output: "r",
          target: "n2",
          target_input: "i",
        },
      ],
    };
    const ts = pythonGraphToTs(python);
    expect(ts.nodes).toHaveLength(1);
    expect(ts.nodes[0].data.astType).toBe("BinOp");
    expect(ts.connections).toHaveLength(1);
    expect(ts.connections[0].sourceOutput).toBe("r");
  });

  it("preserves extra fields in NodeData", () => {
    const python = { ast_type: "Func", name: "hello", lineno: 1 };
    const ts = pythonNodeDataToTs(python);
    expect(ts.astType).toBe("Func");
    expect((ts as Record<string, unknown>).name).toBe("hello");
  });
});
