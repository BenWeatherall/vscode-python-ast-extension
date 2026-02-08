"""Entry point for Python AST parse service.

Run with: python -m python_service
"""

import signal
import sys

from python_service.parser import ReteConverter
from python_service.server import ASTParseServer


def main() -> None:
    """Start the AST parse service. Reads requests from stdin, writes to stdout."""
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
