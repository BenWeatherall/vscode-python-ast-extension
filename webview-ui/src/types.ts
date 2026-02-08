/** TypeScript interfaces matching Python schema models. */

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

/** Message types for extension ↔ webview communication. */
export type VSCodeMessageType = "updateGraph" | "error" | "navigateToSource";

/** Message for extension ↔ webview communication. */
export interface VSCodeMessage {
  type: VSCodeMessageType;
  graph?: ReteGraph;
  error?: string;
  nodeId?: string;
  lineno?: number;
  colOffset?: number;
}
