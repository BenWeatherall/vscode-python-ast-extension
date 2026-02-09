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
            # Format user-friendly syntax error message with location
            error_msg = "Invalid Python syntax"
            if e.msg:
                error_msg = f"Syntax error: {e.msg}"
            if e.lineno is not None:
                location = f" at line {e.lineno}"
                if e.offset is not None:
                    location += f", column {e.offset}"
                error_msg += location
            elif str(e):
                error_msg = f"Syntax error: {str(e)}"
            return {
                "error": {
                    "code": self.PARSE_ERROR_CODE,
                    "message": error_msg,
                }
            }
        except Exception as e:
            # Format user-friendly internal error message
            error_msg = "An internal error occurred while parsing your code"
            if str(e):
                error_msg = f"Parse error: {str(e)}"
            return {
                "error": {
                    "code": self.INTERNAL_ERROR_CODE,
                    "message": error_msg,
                }
            }

    def _parse_request(self, line: str) -> Dict[str, Any] | None:
        """Parse JSON request and extract source code.

        Validates the request format, extracts the sourceCode parameter
        (supports both camelCase and snake_case), and calls handle_parse_request.

        Args:
            line: JSON string from stdin containing the parse request.

        Returns:
            Response dict with 'result' (graph) or 'error' (code, message),
            or None if request is invalid.
        """
        try:
            data = json.loads(line)
        except json.JSONDecodeError as e:
            return {
                "error": {
                    "code": self.INTERNAL_ERROR_CODE,
                    "message": f"Invalid request format: {e.msg if hasattr(e, 'msg') else str(e)}",
                }
            }

        if not isinstance(data, dict):
            return {
                "error": {
                    "code": self.INTERNAL_ERROR_CODE,
                    "message": "Invalid request: expected a JSON object",
                }
            }

        if data.get("method") != "parse":
            return {
                "error": {
                    "code": self.INTERNAL_ERROR_CODE,
                    "message": (
                        f"Unsupported request method: {data.get('method', 'unknown')}. "
                        "Only 'parse' is supported."
                    ),
                }
            }

        params = data.get("params") or {}

        # Support both sourceCode (camelCase) and source_code (snake_case)
        source_code = params.get("sourceCode") or params.get("source_code")

        if source_code is None:
            return {
                "error": {
                    "code": self.INTERNAL_ERROR_CODE,
                    "message": (
                        "Missing required parameter: 'sourceCode' is required "
                        "to parse Python code"
                    ),
                }
            }

        if not isinstance(source_code, str):
            return {
                "error": {
                    "code": self.INTERNAL_ERROR_CODE,
                    "message": (
                        "Invalid parameter type: 'sourceCode' must be a string "
                        "containing Python code"
                    ),
                }
            }

        return self.handle_parse_request(source_code)

    def start_server(self) -> None:
        """Start stdio server loop.

        Reads JSON-RPC-like requests from stdin, processes them via
        handle_parse_request, and writes JSON responses to stdout.
        Continues until stop_server() is called or stdin is closed.
        """
        self._running = True
        
        # DEBUG
        import os
        debug = os.environ.get("DEBUG_SERVICE")
        if debug:
            sys.stderr.write("DEBUG: Server starting\n")
            sys.stderr.flush()

        for line in sys.stdin:
            if debug:
                sys.stderr.write(f"DEBUG: Received line: {repr(line)}\n")
                sys.stderr.flush()
                
            if not self._running:
                break
            line = line.strip()
            if not line:
                continue
            response = self._parse_request(line)
            if response is not None:
                if debug:
                    sys.stderr.write(f"DEBUG: Sending response\n")
                    sys.stderr.flush()
                sys.stdout.write(json.dumps(response) + "\n")
                sys.stdout.flush()
                if debug:
                    sys.stderr.write(f"DEBUG: Response sent\n")
                    sys.stderr.flush()

        self._running = False

    def stop_server(self) -> None:
        """Stop the server gracefully.

        Sets the running flag to False, which causes the server loop
        to exit after processing the current request (if any).
        """
        self._running = False
