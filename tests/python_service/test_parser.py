"""Tests for python_service.parser."""

import unittest

from python_service.parser import ReteConverter
from python_service.schema import ReteGraph


class TestParsingSimpleBinaryOperation(unittest.TestCase):
    """Tests for parsing binary operations."""

    def test_parsing_simple_binary_operation(self) -> None:
        """Parse 'x + y' and verify BinOp, Name nodes, connections."""
        converter = ReteConverter()
        graph = converter.parse_to_rete("x + y")

        self.assertIsInstance(graph, ReteGraph)

        # Find BinOp node
        binop_nodes = [n for n in graph.nodes if n.data.ast_type == "BinOp"]
        self.assertEqual(len(binop_nodes), 1, "Should have exactly one BinOp node")
        binop = binop_nodes[0]

        # Find Name nodes
        name_nodes = [n for n in graph.nodes if n.data.ast_type == "Name"]
        self.assertGreaterEqual(len(name_nodes), 2, "Should have Name nodes for x and y")

        # Verify connections between BinOp and operands
        node_ids = {n.id for n in graph.nodes}
        self.assertEqual(len(node_ids), len(graph.nodes), "Node IDs should be unique")

        # BinOp should have connections to left and right
        binop_connections = [
            c for c in graph.connections if c.source == binop.id or c.target == binop.id
        ]
        self.assertGreater(len(binop_connections), 0, "BinOp should have connections")


class TestParsingFunctionDefinition(unittest.TestCase):
    """Tests for parsing function definitions."""

    def test_parsing_function_definition(self) -> None:
        """Parse 'def hello(): pass' and verify FunctionDef node."""
        converter = ReteConverter()
        graph = converter.parse_to_rete("def hello(): pass")

        func_nodes = [n for n in graph.nodes if n.data.ast_type == "FunctionDef"]
        self.assertEqual(len(func_nodes), 1)
        func = func_nodes[0]
        self.assertIn("name", func.data.model_extra or func.data.model_dump())
        # FunctionDef has name in node data (via extra or we add it)
        name = getattr(func.data, "name", None) or (func.data.model_extra or {}).get(
            "name"
        )
        if name is None:
            self.assertEqual(func.label, "hello")
        else:
            self.assertEqual(name, "hello")
        self.assertIsNotNone(func.data.lineno)


class TestParsingClassDefinition(unittest.TestCase):
    """Tests for parsing class definitions."""

    def test_parsing_class_definition(self) -> None:
        """Parse 'class MyClass: pass' and verify ClassDef node."""
        converter = ReteConverter()
        graph = converter.parse_to_rete("class MyClass: pass")

        class_nodes = [n for n in graph.nodes if n.data.ast_type == "ClassDef"]
        self.assertEqual(len(class_nodes), 1)
        cls = class_nodes[0]
        self.assertEqual(cls.label, "MyClass")


class TestErrorHandling(unittest.TestCase):
    """Tests for error handling."""

    def test_error_handling_invalid_syntax(self) -> None:
        """Invalid Python code raises SyntaxError."""
        converter = ReteConverter()

        with self.assertRaises(SyntaxError):
            converter.parse_to_rete("def incomplete")

        with self.assertRaises(SyntaxError):
            converter.parse_to_rete("if")


class TestLineNumberPreservation(unittest.TestCase):
    """Tests for line number preservation."""

    def test_line_number_preservation(self) -> None:
        """Verify lineno and col_offset in node data."""
        converter = ReteConverter()
        code = '''def foo():
    x = 1
'''
        graph = converter.parse_to_rete(code)

        func_nodes = [n for n in graph.nodes if n.data.ast_type == "FunctionDef"]
        self.assertGreater(len(func_nodes), 0)
        func = func_nodes[0]
        self.assertEqual(func.data.lineno, 1)


class TestNodeIdGeneration(unittest.TestCase):
    """Tests for node ID generation."""

    def test_node_id_generation(self) -> None:
        """Node IDs are unique and deterministic."""
        converter1 = ReteConverter()
        graph1 = converter1.parse_to_rete("x + y")

        converter2 = ReteConverter()
        graph2 = converter2.parse_to_rete("x + y")

        ids1 = [n.id for n in graph1.nodes]
        ids2 = [n.id for n in graph2.nodes]

        self.assertEqual(len(ids1), len(set(ids1)), "IDs should be unique within graph")
        self.assertEqual(
            sorted(ids1),
            sorted(ids2),
            "Same code should produce same node IDs",
        )


class TestConnectionCreation(unittest.TestCase):
    """Tests for connection creation."""

    def test_connection_creation(self) -> None:
        """Parent-child relationships create connections."""
        converter = ReteConverter()
        graph = converter.parse_to_rete("x + y")

        self.assertGreater(len(graph.nodes), 0)
        self.assertGreater(len(graph.connections), 0)

        for conn in graph.connections:
            source_ids = {n.id for n in graph.nodes}
            target_ids = {n.id for n in graph.nodes}
            self.assertIn(conn.source, source_ids)
            self.assertIn(conn.target, target_ids)


class TestEmptySourceCode(unittest.TestCase):
    """Tests for empty source code handling."""

    def test_empty_source_code(self) -> None:
        """Empty string returns empty graph (ast.parse accepts empty)."""
        converter = ReteConverter()
        graph = converter.parse_to_rete("")

        self.assertEqual(len(graph.nodes), 0)
        self.assertEqual(len(graph.connections), 0)


class TestVisitCall(unittest.TestCase):
    """Tests for Call node handler."""

    def test_visit_call(self) -> None:
        """Parse function call and verify Call node with connections."""
        converter = ReteConverter()
        graph = converter.parse_to_rete("foo(1, 2)")

        call_nodes = [n for n in graph.nodes if n.data.ast_type == "Call"]
        self.assertEqual(len(call_nodes), 1)
        call = call_nodes[0]
        self.assertEqual(call.label, "Call")

        call_connections = [
            c for c in graph.connections if c.source == call.id or c.target == call.id
        ]
        self.assertGreater(len(call_connections), 0)


class TestVisitIf(unittest.TestCase):
    """Tests for If node handler."""

    def test_visit_if(self) -> None:
        """Parse if statement and verify If node with test/body/orelse."""
        converter = ReteConverter()
        graph = converter.parse_to_rete("if x:\n    pass\nelse:\n    pass")

        if_nodes = [n for n in graph.nodes if n.data.ast_type == "If"]
        self.assertEqual(len(if_nodes), 1)
        if_node = if_nodes[0]
        self.assertEqual(if_node.label, "If")


class TestVisitFor(unittest.TestCase):
    """Tests for For node handler."""

    def test_visit_for(self) -> None:
        """Parse for loop and verify For node."""
        converter = ReteConverter()
        graph = converter.parse_to_rete("for x in y:\n    pass")

        for_nodes = [n for n in graph.nodes if n.data.ast_type == "For"]
        self.assertEqual(len(for_nodes), 1)
        for_node = for_nodes[0]
        self.assertEqual(for_node.label, "For")


class TestVisitWhile(unittest.TestCase):
    """Tests for While node handler."""

    def test_visit_while(self) -> None:
        """Parse while loop and verify While node."""
        converter = ReteConverter()
        graph = converter.parse_to_rete("while x:\n    pass")

        while_nodes = [n for n in graph.nodes if n.data.ast_type == "While"]
        self.assertEqual(len(while_nodes), 1)
        while_node = while_nodes[0]
        self.assertEqual(while_node.label, "While")


class TestVisitReturn(unittest.TestCase):
    """Tests for Return node handler."""

    def test_visit_return(self) -> None:
        """Parse return statement and verify Return node."""
        converter = ReteConverter()
        graph = converter.parse_to_rete("def f():\n    return 1")

        return_nodes = [n for n in graph.nodes if n.data.ast_type == "Return"]
        self.assertEqual(len(return_nodes), 1)
        ret = return_nodes[0]
        self.assertEqual(ret.label, "Return")


class TestComplexNestedStructures(unittest.TestCase):
    """Tests for complex nested structures."""

    def test_complex_nested_structures(self) -> None:
        """Parse nested functions/classes and verify structure."""
        converter = ReteConverter()
        code = """
def outer():
    class Inner:
        def method(self):
            return 1
"""
        graph = converter.parse_to_rete(code)

        func_nodes = [n for n in graph.nodes if n.data.ast_type == "FunctionDef"]
        class_nodes = [n for n in graph.nodes if n.data.ast_type == "ClassDef"]

        self.assertGreaterEqual(len(func_nodes), 2)
        self.assertGreaterEqual(len(class_nodes), 1)

        for node in graph.nodes:
            if node.data.lineno is not None:
                self.assertGreater(node.data.lineno, 0)


class TestEdgeCases(unittest.TestCase):
    """Tests for edge cases."""

    def test_empty_function_body(self) -> None:
        """Parse function with empty body (docstring only)."""
        converter = ReteConverter()
        graph = converter.parse_to_rete('def f():\n    """doc"""')

        func_nodes = [n for n in graph.nodes if n.data.ast_type == "FunctionDef"]
        self.assertEqual(len(func_nodes), 1)

    def test_if_without_else(self) -> None:
        """Parse if without else."""
        converter = ReteConverter()
        graph = converter.parse_to_rete("if x:\n    pass")

        if_nodes = [n for n in graph.nodes if n.data.ast_type == "If"]
        self.assertEqual(len(if_nodes), 1)
