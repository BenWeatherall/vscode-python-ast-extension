/** FunctionDef AST node component. */

import React from "react";
import { ASTNode } from "./ASTNode";
import type { ASTNodeProps } from "./ASTNode";

/** Renders FunctionDef node with name and params. */
export function FunctionDefNode(props: ASTNodeProps): React.ReactElement {
  const name = (props.data.data?.name as string) ?? "?";
  const params = (props.data.data?.params as string[]) ?? [];
  const body = `${name}(${params.join(", ")})`;
  return <ASTNode {...props} bodyContent={body} />;
}
