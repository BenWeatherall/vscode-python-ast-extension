"""Stdio-based communication server for AST parse requests."""

import json
import sys
from typing import Any, Dict

from python_service.parser import ReteConverter


class ASTParseServer:
    """Server for handling AST parse requests via stdio."""

    PARSE_ERROR_CODE = -32700
    INTERNAL_ERROR_CODE = -32603

    def __init__(self, parser: ReteConverter) -> None:
        """Initialize server with parser instance.

        Args:
            parser: ReteConverter instance for parsing source code.
        """
        self.parser = parser
        self._running = False

    def handle_parse_request(self, source_code: str) -> Dict[str, Any]:
        """Handle parse request and return graph or error.

        Args:
            source_code: Python source code to parse.

        Returns:
            Dict with 'result' (graph as dict) or 'error' (code, message).
        """
        try:
            graph = self.parser.parse_to_rete(source_code)
            return {"result": graph.model_dump()}
        except SyntaxError as e:
            return {
                "error": {
                    "code": self.PARSE_ERROR_CODE,
                    "message": str(e) or "Invalid Python syntax",
                }
            }
        except Exception as e:
            return {
                "error": {
                    "code": self.INTERNAL_ERROR_CODE,
                    "message": str(e) or "Internal error",
                }
            }

    def _parse_request(self, line: str) -> Dict[str, Any] | None:
        """Parse JSON request and extract source code.

        Args:
            line: JSON string from stdin.

        Returns:
            Response dict or None if request invalid.
        """
        try:
            data = json.loads(line)
        except json.JSONDecodeError as e:
            return {
                "error": {
                    "code": self.INTERNAL_ERROR_CODE,
                    "message": f"Invalid JSON: {e}",
                }
            }

        if not isinstance(data, dict):
            return {
                "error": {
                    "code": self.INTERNAL_ERROR_CODE,
                    "message": "Request must be a JSON object",
                }
            }

        if data.get("method") != "parse":
            return {
                "error": {
                    "code": self.INTERNAL_ERROR_CODE,
                    "message": f"Unknown method: {data.get('method', 'unknown')}",
                }
            }

        params = data.get("params") or {}

        # Support both sourceCode (camelCase) and source_code (snake_case)
        source_code = params.get("sourceCode") or params.get("source_code")

        if source_code is None:
            return {
                "error": {
                    "code": self.INTERNAL_ERROR_CODE,
                    "message": "Missing required parameter: sourceCode",
                }
            }

        if not isinstance(source_code, str):
            return {
                "error": {
                    "code": self.INTERNAL_ERROR_CODE,
                    "message": "sourceCode must be a string",
                }
            }

        return self.handle_parse_request(source_code)

    def start_server(self) -> None:
        """Start stdio server loop. Read requests, process, write responses."""
        self._running = True

        for line in sys.stdin:
            if not self._running:
                break
            line = line.strip()
            if not line:
                continue
            response = self._parse_request(line)
            if response is not None:
                sys.stdout.write(json.dumps(response) + "\n")
                sys.stdout.flush()

        self._running = False

    def stop_server(self) -> None:
        """Stop the server gracefully."""
        self._running = False
