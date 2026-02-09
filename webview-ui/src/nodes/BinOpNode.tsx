/** BinOp AST node component. */

import React from "react";
import { ASTNode } from "./ASTNode";
import type { ASTNodeProps } from "./ASTNode";

/** Renders BinOp node with operator in body. */
export function BinOpNode(props: ASTNodeProps): React.ReactElement {
  const op = (props.data.data?.op as string) ?? "?";
  const loc =
    props.data.data?.lineno != null
      ? `L${props.data.data.lineno}${props.data.data?.colOffset != null ? `:${props.data.data.colOffset}` : ""}`
      : "";
  const body = loc ? `${op} ${loc}` : op;
  return <ASTNode {...props} bodyContent={body} />;
}
