/** Rete.js AST editor for graph visualization. */

import React from "react";
import { createRoot } from "react-dom/client";
import { NodeEditor, GetSchemes, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from "rete-connection-plugin";
import { ReactPlugin, Presets, ReactArea2D } from "rete-react-plugin";
import { getNodeComponent } from "./nodes";
import type { NodeData, ReteConnection, ReteGraph, ReteNode } from "./types";

/** Handler for node click events. */
export type NodeClickHandler = (nodeId: string, data: NodeData) => void;

/** Interface for AST graph editor. */
export interface ASTEditor {
  initialize(container: HTMLElement): Promise<void>;
  loadGraph(graph: ReteGraph): Promise<void>;
  clearGraph(): Promise<void>;
  getGraph(): ReteGraph;
  onNodeClick(handler: NodeClickHandler): void;
}

type Schemes = GetSchemes<
  ClassicPreset.Node,
  ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>
>;
type AreaExtra = ReactArea2D<Schemes>;

const socket = new ClassicPreset.Socket("default");

/** Rete.js-based AST editor implementing ASTEditor interface. */
export class ReteASTEditor implements ASTEditor {
  private editor: NodeEditor<Schemes> | null = null;
  private area: AreaPlugin<Schemes, AreaExtra> | null = null;
  private nodeClickHandlers: NodeClickHandler[] = [];
  private nodeDataMap = new Map<string, NodeData>();

  /** Initializes the editor and mounts it to the container. */
  async initialize(container: HTMLElement): Promise<void> {
    const editor = new NodeEditor<Schemes>();
    const area = new AreaPlugin<Schemes, AreaExtra>(container);
    const render = new ReactPlugin<Schemes, AreaExtra>({ createRoot });
    const connection = new ConnectionPlugin<Schemes, AreaExtra>();

    const self = this;
    render.addPreset(
      Presets.classic.setup({
        customize: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          node: (contextData) => {
            const Component = getNodeComponent(contextData.payload.label);
            return (props: any) => {
              const handleClick = () => {
                const data = (props.data as { data?: NodeData }).data ?? { astType: props.data.label };
                self.nodeClickHandlers.forEach((h) => h(props.data.id, data));
              };
              return (
                <div onClick={handleClick} data-testid="ast-node" style={{ cursor: "pointer" }}>
                  <Component {...props} />
                </div>
              );
            };
          },
        },
      })
    );
    connection.addPreset(ConnectionPresets.classic.setup());

    editor.use(area);
    area.use(render);
    area.use(connection);

    AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
      accumulating: AreaExtensions.accumulateOnCtrl(),
    });
    AreaExtensions.simpleNodesOrder(area);

    this.editor = editor;
    this.area = area;
  }

  /** Loads a graph into the editor. */
  async loadGraph(graph: ReteGraph): Promise<void> {
    if (!this.editor || !this.area) {
      throw new Error("Editor not initialized");
    }
    await this.clearGraph();
    this.nodeDataMap.clear();

    const nodeMap = new Map<string, ClassicPreset.Node>();
    for (const n of graph.nodes) {
      const node = new ClassicPreset.Node(n.label);
      node.id = n.id;
      for (const [key] of Object.entries(n.inputs || {})) {
        node.addInput(key, new ClassicPreset.Input(socket, key));
      }
      for (const [key] of Object.entries(n.outputs || {})) {
        node.addOutput(key, new ClassicPreset.Output(socket, key));
      }
      (node as unknown as { data?: NodeData }).data = n.data;
      this.nodeDataMap.set(n.id, n.data);
      await this.editor.addNode(node);
      nodeMap.set(n.id, node);
      if (n.position) {
        await this.area.translate(n.id, n.position);
      }
    }

    for (const c of graph.connections) {
      const source = nodeMap.get(c.source);
      const target = nodeMap.get(c.target);
      if (source && target) {
        await this.editor.addConnection(
          new ClassicPreset.Connection(
            source,
            c.sourceOutput as keyof typeof source.outputs,
            target,
            c.targetInput as keyof typeof target.inputs
          )
        );
      }
    }

    if (graph.nodes.length > 0) {
      await AreaExtensions.zoomAt(this.area, this.editor.getNodes());
    }
  }

  /** Clears all nodes and connections. */
  async clearGraph(): Promise<void> {
    if (!this.editor) return;
    await this.editor.clear();
    this.nodeDataMap.clear();
  }

  /** Returns the current graph structure. */
  getGraph(): ReteGraph {
    if (!this.editor) {
      return { nodes: [], connections: [] };
    }
    const nodes: ReteNode[] = [];
    for (const n of this.editor.getNodes()) {
      const data = this.nodeDataMap.get(n.id) ?? { astType: n.label };
      const pos = this.area?.nodeViews.get(n.id)?.position;
      nodes.push({
        id: n.id,
        label: n.label,
        inputs: Object.fromEntries(
          Object.entries(n.inputs || {}).map(([k]) => [k, {}])
        ),
        outputs: Object.fromEntries(
          Object.entries(n.outputs || {}).map(([k]) => [k, {}])
        ),
        data,
        position: pos ? { x: pos.x, y: pos.y } : undefined,
      });
    }
    const connections: ReteConnection[] = this.editor
      .getConnections()
      .map((c) => ({
        source: c.source,
        sourceOutput: c.sourceOutput as string,
        target: c.target,
        targetInput: c.targetInput as string,
      }));
    return { nodes, connections };
  }

  /** Registers a handler for node click events. */
  onNodeClick(handler: NodeClickHandler): void {
    this.nodeClickHandlers.push(handler);
  }
}
