# Background

This task creates the main entry point for the Python service, allowing it to be executed as a module. The entry point initializes the parser and server, and handles shutdown signals. This task depends on Task 06 (Communication Server) as it uses the ASTParseServer class. Following TDD principles, tests must be written before implementation.

# This Task

1. Create `python_service/__main__.py` with:

   - `main()` function:
     - Initialize `ReteConverter` instance
     - Initialize `ASTParseServer` with parser instance
     - Start server using `server.start_server()`
     - Handle shutdown signals (SIGTERM, SIGINT)
     - Call `server.stop_server()` on shutdown
     - Exit with appropriate exit code

2. Add Google-style docstring to main function

3. Update `pyproject.toml` with entry point configuration:
   - Add `[project.scripts]` section (if using console scripts)
   - Or configure as Python module entry point

4. Ensure proper signal handling:
   - Register signal handlers for SIGTERM and SIGINT
   - Gracefully shutdown server on signal
   - Exit cleanly

**Acceptance Criteria**:
- Service starts and runs successfully
- Service responds to shutdown signals correctly
- Entry point executable via `python -m python_service`
- Service exits with appropriate exit codes
- All tests pass

# Testing Needed

1. Write test: `tests/python_service/test_main.py::test_service_startup`
   - Import and call main function (with mocked server)
   - Verify service starts successfully
   - Verify parser and server initialized

2. Write test: `tests/python_service/test_main.py::test_service_shutdown`
   - Start service, then trigger shutdown
   - Verify service shuts down gracefully
   - Verify cleanup performed

3. Write test: `tests/python_service/test_main.py::test_signal_handling`
   - Test SIGTERM handling
   - Test SIGINT handling
   - Verify signal handlers registered
   - Verify graceful shutdown on signal

4. Write test: `tests/python_service/test_main.py::test_entry_point_execution`
   - Verify module can be executed as `python -m python_service`
   - Verify entry point configuration correct

5. Manual validation: Test service execution:
   - Run `python -m python_service` and verify it starts
   - Send test request via stdin
   - Verify response received
   - Send SIGTERM/SIGINT and verify shutdown
