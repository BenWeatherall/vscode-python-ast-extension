/** Snake_case ↔ camelCase conversion between Python and TypeScript. */

import type { NodeData, ReteConnection, ReteGraph, ReteNode, Socket } from "./types";

/** Python JSON format (snake_case). */
export interface PythonNodeData {
  ast_type: string;
  lineno?: number;
  col_offset?: number;
  [key: string]: unknown;
}

export interface PythonReteNode {
  id: string;
  label: string;
  inputs: Record<string, object>;
  outputs: Record<string, object>;
  data: PythonNodeData;
  position?: { x: number; y: number };
}

export interface PythonReteConnection {
  source: string;
  source_output: string;
  target: string;
  target_input: string;
}

export interface PythonReteGraph {
  nodes: PythonReteNode[];
  connections: PythonReteConnection[];
}

/** Convert Python snake_case NodeData to TypeScript camelCase. */
function pythonNodeDataToTs(data: PythonNodeData): NodeData {
  const result: NodeData = {
    astType: data.ast_type,
    lineno: data.lineno,
    colOffset: data.col_offset,
  };
  for (const [key, value] of Object.entries(data)) {
    if (!["ast_type", "lineno", "col_offset"].includes(key)) {
      result[key] = value;
    }
  }
  return result;
}

/** Convert Python snake_case ReteNode to TypeScript camelCase. */
function pythonNodeToTs(node: PythonReteNode): ReteNode {
  return {
    id: node.id,
    label: node.label,
    inputs: node.inputs as Record<string, Socket>,
    outputs: node.outputs as Record<string, Socket>,
    data: pythonNodeDataToTs(node.data),
    position: node.position,
  };
}

/** Convert Python snake_case ReteConnection to TypeScript camelCase. */
function pythonConnectionToTs(conn: PythonReteConnection): ReteConnection {
  return {
    source: conn.source,
    sourceOutput: conn.source_output,
    target: conn.target,
    targetInput: conn.target_input,
  };
}

/** Convert Python snake_case ReteGraph to TypeScript camelCase. */
export function pythonGraphToTs(graph: PythonReteGraph): ReteGraph {
  return {
    nodes: graph.nodes.map(pythonNodeToTs),
    connections: graph.connections.map(pythonConnectionToTs),
  };
}
