/** ClassDef AST node component. */

import React from "react";
import { ASTNode } from "./ASTNode";
import type { ASTNodeProps } from "./ASTNode";

/**
 * Renders ClassDef (class definition) node with class name in body.
 * @param props - AST node props containing ClassDef node data.
 * @returns React element rendering the ClassDef node.
 */
export const ClassDefNode = React.memo(function ClassDefNode(props: ASTNodeProps): React.ReactElement {
  const name = (props.data.data?.name as string) ?? "?";
  return <ASTNode {...props} bodyContent={name} />;
});
