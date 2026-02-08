# Plan: Write Validation Tool Tests

**Feature**: `_features/mcp_server_frame/tasks/06-write-validation-tool-tests.md`  
**Created**: 2024-01-18

## Overview

Create unit tests for the `poe2_validate` tool using MCP client to call the tool via stdio transport (black box approach). Tests validate the tool returns the expected confirmation message when called.

## Files to Modify

### 1. `pyproject.toml`
- Add `pytest-asyncio>=0.23.0` to dev dependencies
- Add asyncio_mode configuration for pytest

### 2. `tests/test_validation_tool.py` (NEW)
- Create test file with two async tests
- `test_validation_tool_returns_expected_message()` - validates tool response content
- `test_validation_tool_accepts_no_parameters()` - validates tool works with empty params

## Test Strategy (TDD)

1. Write tests first using MCP client to call tool via stdio
2. Tests should FAIL initially (implementation raises NotImplementedError)
3. Tests validate output content only (black box - no internal behavior checks)
4. Tests use pytest-asyncio for async support

## Implementation Order

1. Add `pytest-asyncio` dependency to `pyproject.toml`
2. Update pytest configuration for async mode
3. Create `tests/test_validation_tool.py` with both tests
4. Run `install.sh` to install new dependency
5. Run tests and verify they fail (expected - TDD approach)

## Validation Steps

- [ ] Tests fail because implementation is stub (NotImplementedError or tool not found)
- [ ] Tests are valid (can fail for correct reasons)
- [ ] Tests use black box approach (validate output, not implementation)
- [ ] Tests use pytest-asyncio for async support

## Acceptance Criteria

- Test file `tests/test_validation_tool.py` exists
- Test `test_validation_tool_returns_expected_message()` validates tool response
- Test `test_validation_tool_accepts_no_parameters()` validates tool works with empty parameters
- Tests use MCP client to call tool (black box approach)
- Tests follow black box principles (test output, not implementation)
- Tests are valid (can fail before implementation)
- Tests use pytest with async support
