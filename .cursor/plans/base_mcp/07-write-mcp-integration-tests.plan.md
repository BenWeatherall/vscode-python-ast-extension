# Plan: Write MCP Integration Tests

## Overview

Create integration tests for end-to-end MCP server functionality. These tests validate server-client communication, protocol compliance, and error handling using the MCP client library for black box testing.

## Files to Create

- `tests/test_mcp_integration.py` - Integration tests for MCP server

## Test Strategy (TDD Approach)

Tests will be written first and should fail initially since the server implementation is not complete. Tests validate:

1. **Server starts and responds** - Server can start and handle MCP protocol messages
2. **Error handling for invalid tools** - Server returns appropriate error for unknown tool names
3. **Protocol compliance** - Server follows MCP protocol correctly

## Implementation Order

1. Create `tests/test_mcp_integration.py` with three async tests
2. Run tests to verify they fail (TDD - implementation not complete)
3. Verify tests follow black box principles (test client perspective)

## Test Details

### test_server_starts_and_responds()
- Validates server can start via stdio transport
- Validates server responds to MCP protocol initialization
- Validates tool call returns a result with content

### test_server_handles_invalid_tool_name()
- Validates server returns error for unknown tool name
- Uses `pytest.raises(Exception)` to catch MCP error
- Black box: tests error behavior from client perspective

### test_server_protocol_compliance()
- Validates successful communication indicates protocol compliance
- Tests that tool call works correctly
- Validates response structure

## Validation Steps

1. Run `pytest tests/test_mcp_integration.py -v` to verify tests exist and can run
2. Tests should fail (TDD) since server implementation is incomplete
3. Verify tests use MCP client (black box approach)
4. Verify tests use pytest async support

## Documentation Updates

- Update `CHANGELOG.md` with new test file
- Archive feature file to `_features/archive/base_mcp/`
