/** Name AST node component. */

import React from "react";
import { ASTNode } from "./ASTNode";
import type { ASTNodeProps } from "./ASTNode";

/** Renders Name node with identifier. */
export function NameNode(props: ASTNodeProps): React.ReactElement {
  const id = (props.data.data?.id as string) ?? "?";
  return <ASTNode {...props} bodyContent={id} />;
}
