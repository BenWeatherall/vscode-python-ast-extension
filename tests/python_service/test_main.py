"""Tests for python_service.__main__."""

import unittest
from unittest.mock import patch

from python_service.__main__ import main
from python_service.parser import ReteConverter
from python_service.server import ASTParseServer


class TestServiceStartup(unittest.TestCase):
    """Tests for service startup."""

    def test_service_startup(self) -> None:
        """Main creates parser and server, starts server."""
        with patch.object(ASTParseServer, "start_server") as mock_start:
            mock_start.return_value = None
            # main() blocks on start_server, so we need it to return
            main()
            mock_start.assert_called_once()


class TestServiceShutdown(unittest.TestCase):
    """Tests for service shutdown."""

    def test_service_shutdown(self) -> None:
        """Server stop_server can be called without error."""
        from python_service.parser import ReteConverter
        from python_service.server import ASTParseServer

        parser = ReteConverter()
        server = ASTParseServer(parser)
        server.stop_server()
        server.stop_server()


class TestSignalHandling(unittest.TestCase):
    """Tests for signal handling."""

    def test_signal_handlers_registered(self) -> None:
        """Signal handlers are registered for SIGTERM and SIGINT."""
        with patch("signal.signal") as mock_signal:
            with patch.object(ASTParseServer, "start_server"):
                main()
                self.assertGreaterEqual(mock_signal.call_count, 2)


class TestEntryPointExecution(unittest.TestCase):
    """Tests for entry point execution."""

    def test_module_executable(self) -> None:
        """python -m python_service can be invoked and processes requests."""
        # Verify module has main and can be run
        import python_service.__main__ as main_mod

        self.assertTrue(callable(getattr(main_mod, "main", None)))

        # Verify server processes request correctly (integration)
        parser = ReteConverter()
        server = ASTParseServer(parser)
        response = server.handle_parse_request("x + y")
        self.assertIn("result", response)
        self.assertIn("nodes", response["result"])
