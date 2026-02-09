/** Name AST node component. */

import React from "react";
import { ASTNode } from "./ASTNode";
import type { ASTNodeProps } from "./ASTNode";

/**
 * Renders Name (variable/identifier) node with identifier name in body.
 * @param props - AST node props containing Name node data.
 * @returns React element rendering the Name node.
 */
export const NameNode = React.memo(function NameNode(props: ASTNodeProps): React.ReactElement {
  const id = (props.data.data?.id as string) ?? "?";
  return <ASTNode {...props} bodyContent={id} />;
});
