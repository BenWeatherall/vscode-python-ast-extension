"""Tests for python_service.schema models."""

import json
import unittest

from pydantic import ValidationError

from python_service.schema import (
    NodeData,
    ReteConnection,
    ReteGraph,
    ReteNode,
    Socket,
)


class TestReteNodeCreation(unittest.TestCase):
    """Tests for ReteNode creation and serialization."""

    def test_rete_node_creation_with_valid_data(self) -> None:
        """Create ReteNode with all required fields and verify serialization."""
        node_data = NodeData(ast_type="BinOp", lineno=1, col_offset=0)
        node = ReteNode(
            id="node-1",
            label="BinOp",
            inputs={"left": Socket(), "right": Socket()},
            outputs={"result": Socket()},
            data=node_data,
        )
        self.assertIsNotNone(node)
        self.assertEqual(node.id, "node-1")
        self.assertEqual(node.label, "BinOp")
        self.assertEqual(node.data.ast_type, "BinOp")
        self.assertEqual(node.data.lineno, 1)
        self.assertEqual(node.data.col_offset, 0)

        json_str = node.model_dump_json()
        parsed = json.loads(json_str)
        self.assertEqual(parsed["id"], "node-1")
        self.assertEqual(parsed["label"], "BinOp")
        self.assertIn("data", parsed)
        self.assertEqual(parsed["data"]["ast_type"], "BinOp")


class TestReteNodeValidation(unittest.TestCase):
    """Tests for ReteNode validation with invalid data."""

    def test_rete_node_validation_with_invalid_data(self) -> None:
        """Missing required fields or invalid types raise ValidationError."""
        with self.assertRaises(ValidationError):
            ReteNode(
                id="node-1",
                label="Test",
                inputs={},
                outputs={},
                data=None,  # type: ignore[arg-type]
            )

        with self.assertRaises(ValidationError):
            ReteNode(
                id="node-1",
                label="Test",
                inputs={},
                outputs={},
                # missing data
            )

        with self.assertRaises(ValidationError):
            ReteNode(
                id=123,  # type: ignore[arg-type]
                label="Test",
                inputs={},
                outputs={},
                data=NodeData(ast_type="BinOp"),
            )


class TestReteConnectionCreation(unittest.TestCase):
    """Tests for ReteConnection creation."""

    def test_rete_connection_creation(self) -> None:
        """Create ReteConnection with valid source/target and verify serialization."""
        conn = ReteConnection(
            source="node-1",
            source_output="result",
            target="node-2",
            target_input="left",
        )
        self.assertIsNotNone(conn)
        self.assertEqual(conn.source, "node-1")
        self.assertEqual(conn.source_output, "result")
        self.assertEqual(conn.target, "node-2")
        self.assertEqual(conn.target_input, "left")

        json_str = conn.model_dump_json()
        parsed = json.loads(json_str)
        self.assertEqual(parsed["source"], "node-1")
        self.assertEqual(parsed["target"], "node-2")


class TestReteGraphCreation(unittest.TestCase):
    """Tests for ReteGraph creation."""

    def test_rete_graph_creation(self) -> None:
        """Create ReteGraph with nodes and connections and verify structure."""
        node = ReteNode(
            id="node-1",
            label="BinOp",
            inputs={},
            outputs={"result": Socket()},
            data=NodeData(ast_type="BinOp"),
        )
        conn = ReteConnection(
            source="node-1",
            source_output="result",
            target="node-2",
            target_input="left",
        )
        graph = ReteGraph(nodes=[node], connections=[conn])

        self.assertEqual(len(graph.nodes), 1)
        self.assertEqual(len(graph.connections), 1)
        self.assertEqual(graph.nodes[0].id, "node-1")
        self.assertEqual(graph.connections[0].source, "node-1")

        json_str = graph.model_dump_json()
        parsed = json.loads(json_str)
        self.assertIn("nodes", parsed)
        self.assertIn("connections", parsed)
        self.assertEqual(len(parsed["nodes"]), 1)
        self.assertEqual(len(parsed["connections"]), 1)


class TestModelDeserialization(unittest.TestCase):
    """Tests for model deserialization from JSON."""

    def test_model_deserialization(self) -> None:
        """Deserialize JSON to models and verify all fields populated."""
        json_data = {
            "id": "node-1",
            "label": "BinOp",
            "inputs": {},
            "outputs": {"result": {}},
            "data": {"ast_type": "BinOp", "lineno": 5, "col_offset": 10},
        }
        node = ReteNode.model_validate(json_data)

        self.assertEqual(node.id, "node-1")
        self.assertEqual(node.label, "BinOp")
        self.assertEqual(node.data.ast_type, "BinOp")
        self.assertEqual(node.data.lineno, 5)
        self.assertEqual(node.data.col_offset, 10)

        json_data_minimal = {
            "id": "node-2",
            "label": "Name",
            "inputs": {},
            "outputs": {},
            "data": {"ast_type": "Name"},
        }
        node2 = ReteNode.model_validate(json_data_minimal)
        self.assertIsNone(node2.data.lineno)
        self.assertIsNone(node2.data.col_offset)


class TestNodeDataExtraFields(unittest.TestCase):
    """Tests for NodeData extra fields (extra='allow')."""

    def test_node_data_extra_fields(self) -> None:
        """Extra fields are preserved with extra='allow'."""
        data = NodeData(ast_type="FunctionDef", lineno=1, name="hello")  # type: ignore[call-arg]
        self.assertEqual(data.ast_type, "FunctionDef")
        self.assertEqual(data.lineno, 1)
        self.assertEqual(getattr(data, "name", None), "hello")

        serialized = data.model_dump()
        self.assertIn("name", serialized)
        self.assertEqual(serialized["name"], "hello")

        deserialized = NodeData.model_validate(serialized)
        self.assertEqual(getattr(deserialized, "name", None), "hello")
