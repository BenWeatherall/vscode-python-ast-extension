/** FunctionDef AST node component. */

import React from "react";
import { ASTNode } from "./ASTNode";
import type { ASTNodeProps } from "./ASTNode";

/**
 * Renders FunctionDef (function definition) node with name and parameters.
 * Displays function signature in the body (e.g., "func_name(param1, param2)").
 * @param props - AST node props containing FunctionDef node data.
 * @returns React element rendering the FunctionDef node.
 */
export const FunctionDefNode = React.memo(function FunctionDefNode(props: ASTNodeProps): React.ReactElement {
  const name = (props.data.data?.name as string) ?? "?";
  const params = (props.data.data?.params as string[]) ?? [];
  const body = `${name}(${params.join(", ")})`;
  return <ASTNode {...props} bodyContent={body} />;
});
