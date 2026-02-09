/** BinOp AST node component. */

import React from "react";
import { ASTNode } from "./ASTNode";
import type { ASTNodeProps } from "./ASTNode";

/**
 * Renders BinOp (binary operation) node with operator displayed in body.
 * Extracts operator from node data and displays it with optional location info.
 * @param props - AST node props containing BinOp node data.
 * @returns React element rendering the BinOp node.
 */
export const BinOpNode = React.memo(function BinOpNode(props: ASTNodeProps): React.ReactElement {
  const op = (props.data.data?.op as string) ?? "?";
  const loc =
    props.data.data?.lineno != null
      ? `L${props.data.data.lineno}${props.data.data?.colOffset != null ? `:${props.data.data.colOffset}` : ""}`
      : "";
  const body = loc ? `${op} ${loc}` : op;
  return <ASTNode {...props} bodyContent={body} />;
});
