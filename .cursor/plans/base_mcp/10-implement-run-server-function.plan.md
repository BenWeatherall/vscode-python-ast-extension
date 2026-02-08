# Plan: Implement run_server() Function

## Overview

Implement the `run_server()` function in `poe2_mcp/server/mcp_server.py` that starts the FastMCP server with explicit stdio transport. This function will be the primary entry point for starting the MCP server.

## Current State

- `run_server()` exists in `poe2_mcp/server/__init__.py` and calls `mcp.run()` without explicit transport
- `mcp_server.py` contains the FastMCP initialization and `poe2_validate` tool but no `run_server()` function
- The `__init__.py` imports `mcp` from `mcp_server.py` and calls `mcp.run()` directly

## Target State

- `run_server()` function defined in `mcp_server.py` with explicit `transport="stdio"` parameter
- `__init__.py` imports and re-exports `run_server` from `mcp_server.py`
- Function has Google-style docstring and proper type hints

## Files to Modify

1. **`poe2_mcp/server/mcp_server.py`**

- Add `run_server()` function with `mcp.run(transport="stdio")`
- Add Google-style docstring
- Add `-> None` return type hint

2. **`poe2_mcp/server/__init__.py`**

- Update to import `run_server` from `mcp_server` instead of defining it locally

## Test Strategy

Since existing tests in `test_server.py` already validate:

- `run_server` is callable
- `run_server` takes no parameters
- `run_server` returns None

These tests will continue to pass after the refactor. The tests are black-box and don't care about implementation location.

Additional validation:

- Linting passes: `ruff check poe2_mcp/server/mcp_server.py --fix`
- Type checking passes: `mypy poe2_mcp/server/mcp_server.py`
- Import works: `from poe2_mcp.server.mcp_server import run_server`

## Implementation Order

1. Add `run_server()` function to `mcp_server.py`
2. Update `__init__.py` to import from `mcp_server`
3. Run linting and fix any issues
4. Run type checking and fix any issues
5. Run tests to verify functionality

## Validation Steps

1. `ruff check poe2_mcp/server/ --fix` - No errors
2. `mypy poe2_mcp/server/` - No errors
3. `pytest tests/test_server.py -v` - All tests pass
4. `pytest tests/` - Full test suite passes

## Documentation Updates

- Update CHANGELOG.md with implementation details
- Archive feature file to `_features/archive/base_mcp/`