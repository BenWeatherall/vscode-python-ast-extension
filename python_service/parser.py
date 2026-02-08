"""AST to Rete.js graph converter."""

import ast
from typing import Dict, List

from python_service.schema import (
    NodeData,
    ReteConnection,
    ReteGraph,
    ReteNode,
    Socket,
)


class ReteConverter(ast.NodeVisitor):
    """Converts Python AST to Rete.js graph structure."""

    def __init__(self) -> None:
        """Initialize converter with empty graph state."""
        self.nodes: List[ReteNode] = []
        self.connections: List[ReteConnection] = []
        self._node_id_map: Dict[int, str] = {}
        self._node_counter = 0

    def _get_node_id(self, node: ast.AST) -> str:
        """Generate deterministic unique ID for AST node."""
        node_key = id(node)
        if node_key not in self._node_id_map:
            self._node_id_map[node_key] = f"node-{self._node_counter}"
            self._node_counter += 1
        return self._node_id_map[node_key]

    def _add_connection(
        self, source_id: str, source_output: str, target_id: str, target_input: str
    ) -> None:
        """Add connection from source to target."""
        self.connections.append(
            ReteConnection(
                source=source_id,
                source_output=source_output,
                target=target_id,
                target_input=target_input,
            )
        )

    def parse_to_rete(self, source_code: str) -> ReteGraph:
        """Parse Python source and convert to Rete graph.

        Args:
            source_code: Python source code string.

        Returns:
            ReteGraph with nodes and connections.

        Raises:
            SyntaxError: If source code is invalid Python.
        """
        self.nodes = []
        self.connections = []
        self._node_id_map = {}
        self._node_counter = 0

        tree = ast.parse(source_code)
        self.visit(tree)

        return ReteGraph(nodes=self.nodes, connections=self.connections)

    def visit_Module(self, node: ast.Module) -> None:
        """Visit module node, traverse body."""
        for child in node.body:
            self.visit(child)

    def visit_Expr(self, node: ast.Expr) -> None:
        """Visit expression statement (e.g. function call at module level)."""
        self.visit(node.value)

    def visit_BinOp(self, node: ast.BinOp) -> None:
        """Handle binary operation nodes."""
        node_id = self._get_node_id(node)
        op_name = type(node.op).__name__
        label = f"BinOp({op_name})"

        data = NodeData.model_validate(
            {
                "ast_type": "BinOp",
                "lineno": node.lineno,
                "col_offset": node.col_offset,
                "op": op_name,
            }
        )

        self.visit(node.left)
        self.visit(node.right)

        left_id = self._get_node_id(node.left)
        right_id = self._get_node_id(node.right)

        rete_node = ReteNode(
            id=node_id,
            label=label,
            inputs={"left": Socket(), "right": Socket()},
            outputs={"result": Socket()},
            data=data,
            position=None,
        )
        self.nodes.append(rete_node)

        self._add_connection(left_id, "result", node_id, "left")
        self._add_connection(right_id, "result", node_id, "right")

    def visit_Name(self, node: ast.Name) -> None:
        """Handle name/variable nodes."""
        node_id = self._get_node_id(node)
        data = NodeData.model_validate(
            {
                "ast_type": "Name",
                "lineno": node.lineno,
                "col_offset": node.col_offset,
                "id": node.id,
            }
        )
        rete_node = ReteNode(
            id=node_id,
            label=node.id,
            inputs={},
            outputs={"result": Socket()},
            data=data,
            position=None,
        )
        self.nodes.append(rete_node)

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        """Handle function definition nodes."""
        node_id = self._get_node_id(node)
        data = NodeData.model_validate(
            {
                "ast_type": "FunctionDef",
                "lineno": node.lineno,
                "col_offset": node.col_offset,
                "name": node.name,
            }
        )
        rete_node = ReteNode(
            id=node_id,
            label=node.name,
            inputs={},
            outputs={"body": Socket()},
            data=data,
            position=None,
        )
        self.nodes.append(rete_node)

        for i, stmt in enumerate(node.body):
            self.visit(stmt)
            stmt_id = self._get_node_id(stmt)
            self._add_connection(node_id, "body", stmt_id, f"stmt_{i}")

    def visit_ClassDef(self, node: ast.ClassDef) -> None:
        """Handle class definition nodes."""
        node_id = self._get_node_id(node)
        data = NodeData.model_validate(
            {
                "ast_type": "ClassDef",
                "lineno": node.lineno,
                "col_offset": node.col_offset,
                "name": node.name,
            }
        )
        rete_node = ReteNode(
            id=node_id,
            label=node.name,
            inputs={},
            outputs={"body": Socket()},
            data=data,
            position=None,
        )
        self.nodes.append(rete_node)

        for i, stmt in enumerate(node.body):
            self.visit(stmt)
            stmt_id = self._get_node_id(stmt)
            self._add_connection(node_id, "body", stmt_id, f"stmt_{i}")

    def visit_Pass(self, node: ast.Pass) -> None:
        """Handle pass statements."""
        node_id = self._get_node_id(node)
        data = NodeData.model_validate(
            {
                "ast_type": "Pass",
                "lineno": node.lineno,
                "col_offset": node.col_offset,
            }
        )
        rete_node = ReteNode(
            id=node_id,
            label="Pass",
            inputs={},
            outputs={},
            data=data,
            position=None,
        )
        self.nodes.append(rete_node)

    def visit_Call(self, node: ast.Call) -> None:
        """Handle function call nodes."""
        node_id = self._get_node_id(node)

        self.visit(node.func)
        for arg in node.args:
            self.visit(arg)

        data = NodeData.model_validate(
            {
                "ast_type": "Call",
                "lineno": node.lineno,
                "col_offset": node.col_offset,
            }
        )
        rete_node = ReteNode(
            id=node_id,
            label="Call",
            inputs={"func": Socket(), "args": Socket()},
            outputs={"result": Socket()},
            data=data,
            position=None,
        )
        self.nodes.append(rete_node)

        func_id = self._get_node_id(node.func)
        self._add_connection(func_id, "result", node_id, "func")
        for i, arg in enumerate(node.args):
            arg_id = self._get_node_id(arg)
            self._add_connection(arg_id, "result", node_id, f"arg_{i}")

    def visit_If(self, node: ast.If) -> None:
        """Handle if statement nodes."""
        node_id = self._get_node_id(node)

        self.visit(node.test)
        for stmt in node.body:
            self.visit(stmt)
        for stmt in node.orelse:
            self.visit(stmt)

        data = NodeData.model_validate(
            {
                "ast_type": "If",
                "lineno": node.lineno,
                "col_offset": node.col_offset,
            }
        )
        rete_node = ReteNode(
            id=node_id,
            label="If",
            inputs={"test": Socket(), "body": Socket(), "orelse": Socket()},
            outputs={},
            data=data,
            position=None,
        )
        self.nodes.append(rete_node)

        self._add_connection(self._get_node_id(node.test), "result", node_id, "test")
        for i, stmt in enumerate(node.body):
            self._add_connection(node_id, "body", self._get_node_id(stmt), f"stmt_{i}")
        for i, stmt in enumerate(node.orelse):
            self._add_connection(
                node_id, "orelse", self._get_node_id(stmt), f"orelse_{i}"
            )

    def visit_For(self, node: ast.For) -> None:
        """Handle for loop nodes."""
        node_id = self._get_node_id(node)

        self.visit(node.target)
        self.visit(node.iter)
        for stmt in node.body:
            self.visit(stmt)
        for stmt in node.orelse:
            self.visit(stmt)

        data = NodeData.model_validate(
            {
                "ast_type": "For",
                "lineno": node.lineno,
                "col_offset": node.col_offset,
            }
        )
        rete_node = ReteNode(
            id=node_id,
            label="For",
            inputs={"target": Socket(), "iter": Socket(), "body": Socket()},
            outputs={},
            data=data,
            position=None,
        )
        self.nodes.append(rete_node)

        self._add_connection(self._get_node_id(node.target), "result", node_id, "target")
        self._add_connection(self._get_node_id(node.iter), "result", node_id, "iter")
        for i, stmt in enumerate(node.body):
            self._add_connection(node_id, "body", self._get_node_id(stmt), f"stmt_{i}")

    def visit_While(self, node: ast.While) -> None:
        """Handle while loop nodes."""
        node_id = self._get_node_id(node)

        self.visit(node.test)
        for stmt in node.body:
            self.visit(stmt)
        for stmt in node.orelse:
            self.visit(stmt)

        data = NodeData.model_validate(
            {
                "ast_type": "While",
                "lineno": node.lineno,
                "col_offset": node.col_offset,
            }
        )
        rete_node = ReteNode(
            id=node_id,
            label="While",
            inputs={"test": Socket(), "body": Socket()},
            outputs={},
            data=data,
            position=None,
        )
        self.nodes.append(rete_node)

        self._add_connection(self._get_node_id(node.test), "result", node_id, "test")
        for i, stmt in enumerate(node.body):
            self._add_connection(node_id, "body", self._get_node_id(stmt), f"stmt_{i}")

    def visit_Return(self, node: ast.Return) -> None:
        """Handle return statement nodes."""
        node_id = self._get_node_id(node)

        if node.value is not None:
            self.visit(node.value)

        data = NodeData.model_validate(
            {
                "ast_type": "Return",
                "lineno": node.lineno,
                "col_offset": node.col_offset,
            }
        )
        rete_node = ReteNode(
            id=node_id,
            label="Return",
            inputs={"value": Socket()} if node.value else {},
            outputs={},
            data=data,
            position=None,
        )
        self.nodes.append(rete_node)

        if node.value is not None:
            self._add_connection(
                self._get_node_id(node.value), "result", node_id, "value"
            )

    def visit_Assign(self, node: ast.Assign) -> None:
        """Handle assignment nodes."""
        node_id = self._get_node_id(node)

        for target in node.targets:
            self.visit(target)
        self.visit(node.value)

        data = NodeData.model_validate(
            {
                "ast_type": "Assign",
                "lineno": node.lineno,
                "col_offset": node.col_offset,
            }
        )
        rete_node = ReteNode(
            id=node_id,
            label="Assign",
            inputs={"value": Socket()},
            outputs={"result": Socket()},
            data=data,
            position=None,
        )
        self.nodes.append(rete_node)

        self._add_connection(self._get_node_id(node.value), "result", node_id, "value")
        for i, target in enumerate(node.targets):
            target_id = self._get_node_id(target)
            self._add_connection(node_id, "result", target_id, f"target_{i}")

    def visit_AugAssign(self, node: ast.AugAssign) -> None:
        """Handle augmented assignment nodes."""
        node_id = self._get_node_id(node)
        op_name = type(node.op).__name__

        self.visit(node.target)
        self.visit(node.value)

        data = NodeData.model_validate(
            {
                "ast_type": "AugAssign",
                "lineno": node.lineno,
                "col_offset": node.col_offset,
                "op": op_name,
            }
        )
        rete_node = ReteNode(
            id=node_id,
            label=f"AugAssign({op_name})",
            inputs={"target": Socket(), "value": Socket()},
            outputs={"result": Socket()},
            data=data,
            position=None,
        )
        self.nodes.append(rete_node)

        self._add_connection(self._get_node_id(node.target), "result", node_id, "target")
        self._add_connection(self._get_node_id(node.value), "result", node_id, "value")

    def visit_Constant(self, node: ast.Constant) -> None:
        """Handle constant nodes (Python 3.8+)."""
        node_id = self._get_node_id(node)
        value_str = repr(node.value) if node.value is not None else "None"

        data = NodeData.model_validate(
            {
                "ast_type": "Constant",
                "lineno": node.lineno,
                "col_offset": node.col_offset,
                "value": node.value,
            }
        )
        rete_node = ReteNode(
            id=node_id,
            label=value_str[:50],
            inputs={},
            outputs={"result": Socket()},
            data=data,
            position=None,
        )
        self.nodes.append(rete_node)

    def visit_List(self, node: ast.List) -> None:
        """Handle list literal nodes."""
        node_id = self._get_node_id(node)

        for elt in node.elts:
            self.visit(elt)

        data = NodeData.model_validate(
            {
                "ast_type": "List",
                "lineno": node.lineno,
                "col_offset": node.col_offset,
            }
        )
        inputs = {f"elt_{i}": Socket() for i in range(len(node.elts))}
        rete_node = ReteNode(
            id=node_id,
            label="List",
            inputs=inputs,
            outputs={"result": Socket()},
            data=data,
            position=None,
        )
        self.nodes.append(rete_node)

        for i, elt in enumerate(node.elts):
            self._add_connection(
                self._get_node_id(elt), "result", node_id, f"elt_{i}"
            )

    def visit_Dict(self, node: ast.Dict) -> None:
        """Handle dictionary literal nodes."""
        node_id = self._get_node_id(node)

        for k in node.keys:
            if k is not None:
                self.visit(k)
        for v in node.values:
            self.visit(v)

        data = NodeData.model_validate(
            {
                "ast_type": "Dict",
                "lineno": node.lineno,
                "col_offset": node.col_offset,
            }
        )
        rete_node = ReteNode(
            id=node_id,
            label="Dict",
            inputs={},
            outputs={"result": Socket()},
            data=data,
            position=None,
        )
        self.nodes.append(rete_node)
