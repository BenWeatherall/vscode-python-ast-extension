/** Call AST node component. */

import React from "react";
import { ASTNode } from "./ASTNode";
import type { ASTNodeProps } from "./ASTNode";

/** Renders Call node with function name. */
export function CallNode(props: ASTNodeProps): React.ReactElement {
  const func = (props.data.data?.func as string) ?? "?";
  return <ASTNode {...props} bodyContent={`call ${func}`} />;
}
