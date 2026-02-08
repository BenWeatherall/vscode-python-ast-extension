# Plan: Write Server Initialization Tests

**Feature**: `_features/mcp_server_frame/tasks/05-write-server-initialization-tests.md`  
**Created**: 2026-01-18

## Overview

Create unit tests for server module initialization following TDD and black box principles. Tests validate that the server module can be imported and the `run_server()` function exists with the correct signature.

## Files to Create

| File | Purpose |
|------|---------|
| `tests/__init__.py` | Test package marker |
| `tests/test_server.py` | Server initialization tests |

## Implementation Order

### Step 1: Create Test Directory Structure

Create the `tests/` directory and `__init__.py` to establish it as a Python package.

### Step 2: Create Test File

Create `tests/test_server.py` with:

1. **`test_server_module_can_be_imported()`** - Validates that `run_server` can be imported from `poe2_mcp.server` and is callable
2. **`test_run_server_function_exists()`** - Validates that `run_server` has the correct signature (no parameters, returns None)

## Test Strategy

**Black Box Principles Applied**:
- Tests validate public interface only (`run_server` function)
- Tests do not inspect internal implementation
- Tests verify function signature matches expected contract

**Test Structure**:
```python
"""Tests for server initialization and configuration."""
import inspect

from poe2_mcp.server import run_server


def test_server_module_can_be_imported() -> None:
    """Test that server module can be imported and run_server is callable."""
    assert callable(run_server)


def test_run_server_function_exists() -> None:
    """Test that run_server function has correct signature."""
    assert callable(run_server)
    sig = inspect.signature(run_server)
    assert len(sig.parameters) == 0
    # Return annotation should be None (type(None) or inspect._empty resolved to None)
    assert sig.return_annotation in (type(None), None)
```

## Validation Steps

1. Run tests with `pytest tests/test_server.py -v`
2. Verify tests PASS (since `run_server` stub already exists)
3. Run `ruff check tests/` to verify code quality
4. Run `mypy tests/` to verify type hints

## Expected Outcome

- Tests pass because `run_server()` stub already exists in `poe2_mcp/server/__init__.py`
- Tests follow black box principles (test public interface, not internals)
- Tests are valid (would fail if `run_server` didn't exist or had wrong signature)

## Documentation Updates

- Update `CHANGELOG.md` with test addition
- Archive feature file to `_features/archive/base_mcp/`
