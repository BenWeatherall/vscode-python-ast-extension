# Plan: Create Validation Script

## Overview

Create a standalone validation script that connects to the MCP server, calls the validation tool, and verifies the response. This provides a quick way to verify the server is working without needing to use Cursor or write test code.

## Files Created

- `tools/validate_server.py` - Standalone validation script

## Implementation Details

### Script Structure

1. **`validate_server()` async function**:
   - Creates `StdioServerParameters` to launch server via `python -m poe2_mcp.server`
   - Connects using `stdio_client` context manager
   - Creates `ClientSession` and initializes it
   - Calls `poe2_validate` tool with empty parameters
   - Verifies response contains "PoE2 MCP Server is operational"
   - Returns `True` on success, `False` on failure
   - Catches exceptions and prints error to stderr

2. **`main()` function**:
   - Runs async validation via `asyncio.run()`
   - Prints success/failure message to stderr
   - Exits with code 0 on success, 1 on failure

### Error Handling

- All exceptions caught in `validate_server()` function
- Error details printed to stderr
- Returns `False` on any error, causing exit code 1

## Validation

- Ruff linting passes
- MyPy type checking passes
- Script runs successfully and exits with code 0
- Clear output message displayed

## Acceptance Criteria Met

- [x] Script file `tools/validate_server.py` exists
- [x] Script connects to server via MCP client
- [x] Script calls `poe2_validate` tool
- [x] Script verifies response contains expected message
- [x] Script prints clear success/failure message to stderr
- [x] Script exits with code 0 on success, 1 on failure
- [x] Script has proper error handling
- [x] No linting errors
- [x] No type errors
