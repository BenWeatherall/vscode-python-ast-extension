/** Call AST node component. */

import React from "react";
import { ASTNode } from "./ASTNode";
import type { ASTNodeProps } from "./ASTNode";

/**
 * Renders Call (function call) node with function name in body.
 * @param props - AST node props containing Call node data.
 * @returns React element rendering the Call node.
 */
export const CallNode = React.memo(function CallNode(props: ASTNodeProps): React.ReactElement {
  const func = (props.data.data?.func as string) ?? "?";
  return <ASTNode {...props} bodyContent={`call ${func}`} />;
});
