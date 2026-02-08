# Task Plan: 07-python-service-entry-point

## Overview

Create main() entry point for Python service. Initializes ReteConverter, ASTParseServer, starts server, handles SIGTERM/SIGINT. Executable via `python -m python_service`.

## Files to Create/Modify

| File | Action |
|------|--------|
| `python_service/__main__.py` | Create – main() |
| `pyproject.toml` | Modify – add [project.scripts] if needed |
| `tests/python_service/test_main.py` | Create – main tests |

## Test Strategy (Write First)

1. `test_service_startup` – main() with mocked server
2. `test_service_shutdown` – Graceful shutdown
3. `test_signal_handling` – SIGTERM/SIGINT → stop_server
4. `test_entry_point_execution` – Module runs as entry point

## Implementation Order

1. Create main() – ReteConverter(), ASTParseServer(parser), start_server()
2. Register signal handlers for SIGTERM, SIGINT
3. On signal: stop_server(), sys.exit(0)
4. Update pyproject.toml if console script needed
5. Add docstring

## Validation Steps

- `python -m python_service` runs
- Responds to shutdown signals
- All tests pass

## Documentation Updates

Docstring on main().
