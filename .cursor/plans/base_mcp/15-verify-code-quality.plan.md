# Plan: Verify Code Quality

## Overview

Run all code quality checks (linting, type checking) to ensure the codebase meets project standards. This is a verification task that validates existing code rather than implementing new features.

## Files to Verify

- `poe2_mcp/__init__.py` - Package root (empty)
- `poe2_mcp/server/__init__.py` - Server module public interface
- `poe2_mcp/server/mcp_server.py` - MCP server implementation
- `poe2_mcp/server/__main__.py` - Module entry point
- `tests/__init__.py` - Test package
- `tests/test_server.py` - Server tests
- `tests/test_validation_tool.py` - Validation tool tests
- `tests/test_mcp_integration.py` - MCP integration tests

## Validation Steps

### Step 1: Run Linting Check

Run `ruff check . --fix` to:
- Check for pycodestyle errors (E, W)
- Verify import sorting (I - isort)
- Check naming conventions (N - pep8-naming)
- Verify modern Python patterns (UP - pyupgrade)
- Check for pyflakes issues (F)
- Check pylint rules (PL)

**Expected**: No errors or warnings

### Step 2: Run Type Checking

Run `mypy poe2_mcp/` to verify:
- All functions have type hints
- Type hints are complete
- Function call arguments match parameter types
- No implicit Optional types
- Return types are correct

**Expected**: No type errors

### Step 3: Verify Pattern Compliance

Review code against `AI_CONTEXT_PATTERNS.md`:
- Import organization follows FUTURE → STDLIB → THIRDPARTY → FIRSTPARTY → LOCALFOLDER
- Google-style docstrings
- Type hints on all functions
- Maximum 88 character line length
- 4-space indentation

## Acceptance Criteria

- [ ] `ruff check . --fix` passes with no errors
- [ ] `mypy poe2_mcp/` passes with no errors
- [ ] Code follows all patterns from AI_CONTEXT_PATTERNS.md
