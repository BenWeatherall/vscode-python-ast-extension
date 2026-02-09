/** ClassDef AST node component. */

import React from "react";
import { ASTNode } from "./ASTNode";
import type { ASTNodeProps } from "./ASTNode";

/** Renders ClassDef node with class name. */
export function ClassDefNode(props: ASTNodeProps): React.ReactElement {
  const name = (props.data.data?.name as string) ?? "?";
  return <ASTNode {...props} bodyContent={name} />;
}
