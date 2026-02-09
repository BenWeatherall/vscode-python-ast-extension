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
        """Generate deterministic unique ID for AST node.

        Args:
            node: AST node to generate ID for.

        Returns:
            Unique string identifier for the node (e.g., 'n0', 'n1').
        """
        node_key = id(node)
        if node_key not in self._node_id_map:
            self._node_id_map[node_key] = f"n{self._node_counter}"
            self._node_counter += 1
        return self._node_id_map[node_key]

    def _add_connection(
        self, source_id: str, source_output: str, target_id: str, target_input: str
    ) -> None:
        """Add connection from source to target node.

        Args:
            source_id: ID of the source node.
            source_output: Output socket name on source node.
            target_id: ID of the target node.
            target_input: Input socket name on target node.
        """
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
        """Visit module node and traverse all statements in body.

        Args:
            node: AST Module node representing the top-level Python file.
        """
        for child in node.body:
            self.visit(child)

    def visit_Expr(self, node: ast.Expr) -> None:
        """Visit expression statement (e.g. function call at module level).

        Args:
            node: AST Expr node containing an expression value.
        """
        self.visit(node.value)

    def visit_BinOp(self, node: ast.BinOp) -> None:
        """Handle binary operation nodes (e.g., a + b, x * y).

        Creates a BinOp node with left and right inputs, and connects
        the operand nodes to it.

        Args:
            node: AST BinOp node containing left operand, operator, and right operand.
        """
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
        """Handle name/variable nodes (e.g., variable references).

        Creates a Name node with the identifier as the label.

        Args:
            node: AST Name node containing an identifier string.
        """
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
        """Handle function definition nodes.

        Creates a FunctionDef node and connects all statements in the
        function body to it via the 'body' output socket.

        Args:
            node: AST FunctionDef node containing function name, parameters, and body.
        """
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
        """Handle class definition nodes.

        Creates a ClassDef node and connects all statements in the
        class body to it via the 'body' output socket.

        Args:
            node: AST ClassDef node containing class name and body statements.
        """
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
        """Handle pass statements (no-op placeholder).

        Creates a Pass node with no inputs or outputs.

        Args:
            node: AST Pass node.
        """
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
        """Handle function call nodes (e.g., func(arg1, arg2)).

        Creates a Call node and connects the function expression and
        all argument expressions to it.

        Args:
            node: AST Call node containing function expression and arguments.
        """
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
        """Handle if statement nodes (if/else blocks).

        Creates an If node and connects the test condition, body statements,
        and else statements (if any) to it.

        Args:
            node: AST If node containing test condition, body, and optional else block.
        """
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
            self._add_connection(node_id, "orelse", self._get_node_id(stmt), f"orelse_{i}")

    def visit_For(self, node: ast.For) -> None:
        """Handle for loop nodes (for target in iterable: ...).

        Creates a For node and connects the target, iterable, body statements,
        and else statements (if any) to it.

        Args:
            node: AST For node containing target, iterable, body, and optional else block.
        """
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
        """Handle while loop nodes (while condition: ...).

        Creates a While node and connects the test condition, body statements,
        and else statements (if any) to it.

        Args:
            node: AST While node containing test condition, body, and optional else block.
        """
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
        """Handle return statement nodes.

        Creates a Return node and connects the return value expression
        (if present) to it.

        Args:
            node: AST Return node containing optional return value.
        """
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
            self._add_connection(self._get_node_id(node.value), "result", node_id, "value")

    def visit_Assign(self, node: ast.Assign) -> None:
        """Handle assignment nodes (e.g., x = value, a, b = 1, 2).

        Creates an Assign node and connects the value expression and
        all target expressions to it.

        Args:
            node: AST Assign node containing targets and value expression.
        """
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
        """Handle augmented assignment nodes (e.g., x += 1, y *= 2).

        Creates an AugAssign node with the operator and connects the
        target and value expressions to it.

        Args:
            node: AST AugAssign node containing target, operator, and value.
        """
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
        """Handle constant nodes (Python 3.8+): literals like numbers, strings, None.

        Creates a Constant node with the literal value as the label.

        Args:
            node: AST Constant node containing a literal value.
        """
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
        """Handle list literal nodes (e.g., [1, 2, 3]).

        Creates a List node and connects all element expressions to it.

        Args:
            node: AST List node containing element expressions.
        """
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
            self._add_connection(self._get_node_id(elt), "result", node_id, f"elt_{i}")

    def visit_Dict(self, node: ast.Dict) -> None:
        """Handle dictionary literal nodes (e.g., {'key': value}).

        Creates a Dict node and visits all key and value expressions.

        Args:
            node: AST Dict node containing key-value pairs.
        """
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
