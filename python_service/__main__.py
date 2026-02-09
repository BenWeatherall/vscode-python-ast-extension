"""Entry point for Python AST parse service.

Run with: python -m python_service
"""

import signal
import sys

from python_service.parser import ReteConverter
from python_service.server import ASTParseServer


def main() -> None:
    """Start the AST parse service.

    Initializes the parser and server, sets up signal handlers for
    graceful shutdown (SIGTERM, SIGINT), and starts the stdio server loop.
    Reads JSON-RPC-like parse requests from stdin and writes responses to stdout.
    """
    parser = ReteConverter()
    server = ASTParseServer(parser)

    def handle_shutdown(signum: int, frame: object) -> None:
        server.stop_server()
        sys.exit(0)

    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, handle_shutdown)
    signal.signal(signal.SIGINT, handle_shutdown)

    try:
        server.start_server()
    except KeyboardInterrupt:
        server.stop_server()
        sys.exit(0)
