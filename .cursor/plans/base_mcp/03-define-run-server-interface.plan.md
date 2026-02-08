# Implementation Plan: Define run_server Interface

## Overview

Define the public `run_server()` function interface in the `poe2_mcp/server` module. This establishes the public API that will be used to start the MCP server. The function will be implemented as a stub initially (full implementation in Phase 4). This task depends on Task 02 (package structure) being complete.

## Files to Modify

1. **`poe2_mcp/server/__init__.py`**
   - Add `run_server()` function with stub implementation
   - Add Google-style docstring describing function purpose
   - Export function in `__all__` list

## Implementation Steps

### Step 1: Define Function Signature
- Add `run_server()` function with signature: `def run_server() -> None:`
- Use stub implementation with `pass` (or `...`)

### Step 2: Add Documentation
- Add Google-style docstring describing:
  - Function purpose (run the PoE2 MCP server using stdio transport)
  - What it does (initializes FastMCP server, registers tools, starts listening)
  - When it stops (until process terminated or stdin closed)

### Step 3: Export Function
- Add `__all__` list to module if it doesn't exist
- Include `"run_server"` in `__all__` list
- This makes the function part of the public API

### Step 4: Verify Implementation
- Run type checking: `mypy poe2_mcp/server/__init__.py`
- Run linting: `ruff check poe2_mcp/server/__init__.py`
- Verify function can be imported: `from poe2_mcp.server import run_server`
- Verify function is callable (stub should not raise errors)

## Testing Strategy

This task defines a stub function, so testing is focused on validation rather than behavior:

1. **Type Checking**: Verify `mypy poe2_mcp/server/__init__.py` passes
2. **Linting**: Verify `ruff check poe2_mcp/server/__init__.py` passes
3. **Import Verification**: Verify `from poe2_mcp.server import run_server` works
4. **Function Callability**: Verify `run_server()` can be called without errors (stub implementation)

## Interface Contract

```python
def run_server() -> None:
    """Run the PoE2 MCP server using stdio transport.
    
    This function initializes the FastMCP server, registers all tools,
    and starts the server listening on stdio for JSON-RPC messages.
    
    The server will run until the process is terminated or stdin is closed.
    """
    pass  # Stub implementation
```

## Acceptance Criteria

- ✅ Function signature: `def run_server() -> None:`
- ✅ Google-style docstring describing function purpose
- ✅ Function is callable (stub implementation with `pass` or `...`)
- ✅ Function exported in `__all__` list
- ✅ Type checking passes: `mypy poe2_mcp/server/__init__.py`
- ✅ Linting passes: `ruff check poe2_mcp/server/__init__.py`
- ✅ Function can be imported: `from poe2_mcp.server import run_server`

## Notes

- This is a stub implementation - full implementation will be in Task 10
- The function signature and docstring establish the public API contract
- Following Google-style docstring format as per `AI_CONTEXT_PATTERNS.md`
- Type hints required (MyPy strict mode) - return type `-> None` is explicit
- This task depends on Task 02 (package structure) being complete
