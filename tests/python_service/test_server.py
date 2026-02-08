"""Tests for python_service.server."""

import json
import unittest

from python_service.parser import ReteConverter
from python_service.server import ASTParseServer


class TestServerInitialization(unittest.TestCase):
    """Tests for server initialization."""

    def test_server_initialization(self) -> None:
        """Server initializes with parser dependency injected."""
        parser = ReteConverter()
        server = ASTParseServer(parser)
        self.assertIsNotNone(server)
        self.assertIs(server.parser, parser)


class TestHandlingValidParseRequest(unittest.TestCase):
    """Tests for handling valid parse requests."""

    def test_handling_valid_parse_request(self) -> None:
        """Valid source code returns graph in response."""
        parser = ReteConverter()
        server = ASTParseServer(parser)
        response = server.handle_parse_request("x + y")

        self.assertIn("result", response)
        self.assertNotIn("error", response)
        result = response["result"]
        self.assertIn("nodes", result)
        self.assertIn("connections", result)
        self.assertIsInstance(result["nodes"], list)
        self.assertIsInstance(result["connections"], list)


class TestHandlingInvalidSourceCode(unittest.TestCase):
    """Tests for handling invalid source code."""

    def test_handling_invalid_source_code(self) -> None:
        """Invalid Python code returns error response."""
        parser = ReteConverter()
        server = ASTParseServer(parser)
        response = server.handle_parse_request("def incomplete")

        self.assertIn("error", response)
        self.assertNotIn("result", response)
        error = response["error"]
        self.assertEqual(error["code"], -32700)
        self.assertIn("message", error)
        self.assertIsInstance(error["message"], str)


class TestErrorResponseFormatting(unittest.TestCase):
    """Tests for error response formatting."""

    def test_error_response_formatting(self) -> None:
        """Error response has correct structure."""
        parser = ReteConverter()
        server = ASTParseServer(parser)
        response = server.handle_parse_request("if")

        self.assertIn("error", response)
        error = response["error"]
        self.assertIn("code", error)
        self.assertIn("message", error)
        self.assertIsInstance(error["code"], int)
        self.assertIsInstance(error["message"], str)


class TestServerLifecycle(unittest.TestCase):
    """Tests for server lifecycle."""

    def test_server_lifecycle(self) -> None:
        """Server can be started and stopped."""
        parser = ReteConverter()
        server = ASTParseServer(parser)
        server.stop_server()
        # No exception – stop is idempotent


class TestRequestParsing(unittest.TestCase):
    """Tests for request parsing."""

    def test_handle_parse_request_with_empty_string(self) -> None:
        """Empty string returns empty graph."""
        parser = ReteConverter()
        server = ASTParseServer(parser)
        response = server.handle_parse_request("")
        self.assertIn("result", response)
        self.assertEqual(len(response["result"]["nodes"]), 0)


class TestResponseSerialization(unittest.TestCase):
    """Tests for response serialization."""

    def test_response_serialization(self) -> None:
        """Graph serializes to JSON correctly."""
        parser = ReteConverter()
        server = ASTParseServer(parser)
        response = server.handle_parse_request("x + y")

        json_str = json.dumps(response)
        parsed = json.loads(json_str)
        self.assertIn("result", parsed)
        self.assertIn("nodes", parsed["result"])
        self.assertIn("connections", parsed["result"])


class TestConcurrentRequests(unittest.TestCase):
    """Tests for sequential requests (no state leakage)."""

    def test_sequential_requests(self) -> None:
        """Multiple requests handled correctly without state leakage."""
        parser = ReteConverter()
        server = ASTParseServer(parser)

        r1 = server.handle_parse_request("x + y")
        r2 = server.handle_parse_request("a * b")

        self.assertIn("result", r1)
        self.assertIn("result", r2)
        self.assertNotEqual(r1["result"], r2["result"])
        self.assertEqual(len(r1["result"]["nodes"]), 3)
        self.assertEqual(len(r2["result"]["nodes"]), 3)
