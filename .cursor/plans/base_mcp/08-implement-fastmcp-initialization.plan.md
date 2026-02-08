# Plan: Implement FastMCP Initialization

**Feature**: [08-implement-fastmcp-initialization](_features/mcp_server_frame/tasks/08-implement-fastmcp-initialization.md)  
**Created**: 2026-01-18

## Overview

Implement FastMCP server initialization in `poe2_mcp/server/mcp_server.py` to create a working MCP server that passes all existing tests. This involves:
1. Creating the FastMCP instance
2. Registering the `poe2_validate` tool
3. Creating a `__main__.py` entry point for `python -m poe2_mcp.server`
4. Implementing `run_server()` to start the server

## Files to Create/Modify

### Files to Modify

1. **`poe2_mcp/server/mcp_server.py`**
   - Add FastMCP import
   - Create FastMCP instance: `mcp = FastMCP("Path of Exile 2 MCP Server")`
   - Decorate `poe2_validate` with `@mcp.tool()` 
   - Implement `poe2_validate` to return the expected message

2. **`poe2_mcp/server/__init__.py`**
   - Update `run_server()` to call `mcp.run()`

### Files to Create

1. **`poe2_mcp/server/__main__.py`**
   - Entry point for `python -m poe2_mcp.server`
   - Calls `run_server()`

## Implementation Order

1. **Step 1**: Update `mcp_server.py` with FastMCP initialization and tool registration
2. **Step 2**: Update `__init__.py` to implement `run_server()` properly
3. **Step 3**: Create `__main__.py` entry point
4. **Step 4**: Run linting and type checking
5. **Step 5**: Run tests to verify implementation

## Implementation Details

### Step 1: Update mcp_server.py

```python
"""MCP server implementation for PoE2 data tools."""

from __future__ import annotations

from mcp.server.fastmcp import FastMCP

# Initialize FastMCP server
mcp = FastMCP("Path of Exile 2 MCP Server")


@mcp.tool()
def poe2_validate() -> str:
    """Validate that the PoE2 MCP server is operational.

    This tool provides a simple way for agents to verify that the
    MCP server is running and responding correctly.

    Returns:
        A confirmation message indicating server status.
    """
    return (
        "PoE2 MCP Server is operational and ready to serve "
        "Path of Exile 2 data."
    )
```

### Step 2: Update __init__.py

```python
"""PoE2 MCP Server module."""

from __future__ import annotations

__all__ = ["run_server"]


def run_server() -> None:
    """Run the PoE2 MCP server using stdio transport.

    This function initializes the FastMCP server, registers all tools,
    and starts the server listening on stdio for JSON-RPC messages.

    The server will run until the process is terminated or stdin is closed.
    """
    from .mcp_server import mcp

    mcp.run()
```

### Step 3: Create __main__.py

```python
"""Entry point for running the PoE2 MCP server as a module."""

from __future__ import annotations

from poe2_mcp.server import run_server

if __name__ == "__main__":
    run_server()
```

## Validation Steps

1. **Linting**: `ruff check poe2_mcp/server/ --fix`
2. **Type Checking**: `mypy poe2_mcp/server/`
3. **Unit Tests**: `pytest tests/test_server.py -v`
4. **Validation Tool Tests**: `pytest tests/test_validation_tool.py -v`
5. **Integration Tests**: `pytest tests/test_mcp_integration.py -v`
6. **Full Test Suite**: `pytest tests/ -v`

## Test Strategy

Tests are already written (TDD - Tasks 05, 06, 07). This task implements the code to make them pass:

- `test_server.py`: Tests `run_server()` signature and importability
- `test_validation_tool.py`: Tests `poe2_validate` returns expected message via MCP client
- `test_mcp_integration.py`: Tests server starts, responds to protocol, handles errors

## Documentation Updates

- Update `CHANGELOG.md` with implementation entry
- Archive feature file to `_features/archive/base_mcp/`

## Acceptance Criteria

- [ ] FastMCP instance created with name "Path of Exile 2 MCP Server"
- [ ] `poe2_validate` tool registered and returns expected message
- [ ] `run_server()` starts the MCP server
- [ ] Server can be run via `python -m poe2_mcp.server`
- [ ] All tests pass
- [ ] No linting errors
- [ ] No type errors
