/** Base AST node component with header, body, and shared styling. */

import React from "react";
import { ClassicPreset } from "rete";
import { Presets } from "rete-react-plugin";
import type { NodeData } from "../types";

type PortLike = { socket: unknown; label?: string; index?: number };
type NodePayload = {
  id: string;
  label: string;
  inputs: Record<string, PortLike | undefined>;
  outputs: Record<string, PortLike | undefined>;
  controls?: Record<string, { id: string; index?: number } | undefined>;
  selected?: boolean;
  width?: number;
  height?: number;
  data?: NodeData;
};

export interface ASTNodeProps {
  data: NodePayload;
  emit: (props: unknown) => void;
  /** Optional body content override (e.g. for type-specific nodes). */
  bodyContent?: React.ReactNode;
}

/**
 * Sorts entries by their index property (for consistent port ordering).
 * @param entries - Array of [key, value] tuples with optional index.
 * @returns Sorted array of entries.
 */
function sortByIndex<T extends { index?: number }>(
  entries: [string, T | undefined][]
): [string, T | undefined][] {
  return [...entries].sort(
    (a, b) => (a[1]?.index ?? 0) - (b[1]?.index ?? 0)
  );
}

/**
 * Base node component with header and body.
 * Renders a Rete.js node with title, optional body content, input/output sockets,
 * and controls. Displays line number and column offset if available.
 * @param props - Component props including node data, emit function, and optional body content.
 * @returns React element rendering the AST node.
 */
export const ASTNode = React.memo(function ASTNode({ data, emit, bodyContent }: ASTNodeProps): React.ReactElement {
  const nodeData = data.data ?? { astType: data.label };
  const loc =
    nodeData.lineno != null
      ? `L${nodeData.lineno}${nodeData.colOffset != null ? `:${nodeData.colOffset}` : ""}`
      : "";
  const body = bodyContent ?? (loc ? loc : null);
  const inputs = sortByIndex<PortLike>(
    Object.entries(data.inputs ?? {}) as [string, PortLike | undefined][]
  );
  const outputs = sortByIndex<PortLike>(
    Object.entries(data.outputs ?? {}) as [string, PortLike | undefined][]
  );
  const controls = sortByIndex(
    Object.entries(data.controls ?? {}).filter(
      (c): c is [string, { id: string; index?: number }] =>
        c[1] != null && typeof (c[1] as { id?: string }).id === "string"
    )
  );

  return (
    <Presets.classic.NodeStyles
      selected={data.selected ?? false}
      width={data.width}
      height={data.height}
      data-testid="ast-node-inner"
    >
      <div className="title" data-testid="title">
        {data.label}
      </div>
      {body != null && (
        <div className="body" data-testid="body" style={{ fontSize: 11, opacity: 0.8, padding: "0 8px 4px" }}>
          {body}
        </div>
      )}
      {outputs.map(([key, output]) =>
        output && "socket" in output ? (
          <div className="output" key={key} data-testid={`output-${key}`}>
            <div className="output-title">{output.label}</div>
            <Presets.classic.RefSocket
              name="output-socket"
              side="output"
              socketKey={key}
              nodeId={data.id}
              emit={emit}
              payload={output.socket as ClassicPreset.Socket}
              data-testid="output-socket"
            />
          </div>
        ) : null
      )}
      {controls.map(([key, control]) =>
        control ? (
          <Presets.classic.RefControl
            key={key}
            name="control"
            emit={emit}
            payload={control as { id: string; index?: number } & unknown}
            data-testid={`control-${key}`}
          />
        ) : null
      )}
      {inputs.map(([key, input]) =>
        input && "socket" in input ? (
          <div className="input" key={key} data-testid={`input-${key}`}>
            <Presets.classic.RefSocket
              name="input-socket"
              side="input"
              socketKey={key}
              nodeId={data.id}
              emit={emit}
              payload={input.socket as ClassicPreset.Socket}
              data-testid="input-socket"
            />
            <div className="input-title">{input.label}</div>
          </div>
        ) : null
      )}
    </Presets.classic.NodeStyles>
  );
});
