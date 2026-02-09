/** Node factory: maps AST type to React component. */

import type { ASTNodeProps } from "./ASTNode";
import { ASTNode } from "./ASTNode";
import { BinOpNode } from "./BinOpNode";
import { CallNode } from "./CallNode";
import { ClassDefNode } from "./ClassDefNode";
import { FunctionDefNode } from "./FunctionDefNode";
import { NameNode } from "./NameNode";

const TYPE_MAP: Record<string, (props: ASTNodeProps) => React.ReactElement> = {
  BinOp: BinOpNode,
  Call: CallNode,
  ClassDef: ClassDefNode,
  FunctionDef: FunctionDefNode,
  Name: NameNode,
};

/**
 * Returns the node component for the given AST type.
 * Falls back to ASTNode for unknown types.
 */
export function getNodeComponent(
  astType: string
): (props: ASTNodeProps) => React.ReactElement {
  return TYPE_MAP[astType] ?? ASTNode;
}
