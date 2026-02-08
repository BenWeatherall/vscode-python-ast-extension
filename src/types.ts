/** TypeScript interfaces for Rete graph (matches webview-ui and Python schema). */

/** Socket for Rete.js node inputs/outputs. */
export interface Socket {
  // Empty for now, extensible for future socket metadata
}

/** Data payload for a Rete node. */
export interface NodeData {
  astType: string;
  lineno?: number;
  colOffset?: number;
  [key: string]: unknown;
}

/** Rete.js node structure. */
export interface ReteNode {
  id: string;
  label: string;
  inputs: Record<string, Socket>;
  outputs: Record<string, Socket>;
  data: NodeData;
  position?: { x: number; y: number };
}

/** Connection between two Rete nodes. */
export interface ReteConnection {
  source: string;
  sourceOutput: string;
  target: string;
  targetInput: string;
}

/** Complete Rete.js graph structure. */
export interface ReteGraph {
  nodes: ReteNode[];
  connections: ReteConnection[];
}

/** Message from extension to webview. */
export interface VSCodeMessageOut {
  type: "updateGraph" | "error";
  graph?: ReteGraph;
  error?: string;
}

/** Message from webview to extension. */
export interface VSCodeMessageIn {
  type: "navigateToSource";
  nodeId?: string;
  lineno?: number;
  colOffset?: number;
}
