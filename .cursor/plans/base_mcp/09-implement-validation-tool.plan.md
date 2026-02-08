# Plan: Implement Validation Tool

## Overview

This task completes the `poe2_validate` tool implementation by ensuring the docstring fully documents the return message as specified in the feature requirements. The tool was partially implemented in Task 08, but the docstring's Returns section needs to include the exact message text.

## Current State

The `poe2_validate` tool exists in `poe2_mcp/server/mcp_server.py` with:
- `@mcp.tool()` decorator ✅
- Correct return value ✅
- Type hints ✅
- Google-style docstring (partial - Returns section incomplete)

## Files to Modify

1. **`poe2_mcp/server/mcp_server.py`**
   - Update the docstring's Returns section to include the exact message text

## Implementation Steps

### Step 1: Update Docstring

Update the `poe2_validate` function's docstring to match the feature specification exactly:

```python
@mcp.tool()
def poe2_validate() -> str:
    """Validate that the PoE2 MCP server is operational.
    
    This tool provides a simple way for agents to verify that the
    MCP server is running and responding correctly.
    
    Returns:
        A confirmation message indicating server status. The message
        will be: "PoE2 MCP Server is operational and ready to serve Path of Exile 2 data."
    """
    return (
        "PoE2 MCP Server is operational and ready to serve "
        "Path of Exile 2 data."
    )
```

### Step 2: Run Linting

```bash
ruff check poe2_mcp/server/mcp_server.py --fix
```

### Step 3: Run Type Checking

```bash
mypy poe2_mcp/server/mcp_server.py
```

### Step 4: Run Tests

Verify existing tests still pass:

```bash
python -m pytest tests/test_validation_tool.py -v
```

## Validation Steps

1. Docstring includes exact return message text
2. `ruff check` passes with no errors
3. `mypy` passes with no errors
4. All tests in `test_validation_tool.py` pass

## Acceptance Criteria

- [x] Tool function decorated with `@mcp.tool()`
- [ ] Docstring Returns section includes exact message text
- [x] Function has proper type hints
- [ ] No linting errors
- [ ] No type errors
- [ ] Tests pass
