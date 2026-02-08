# Implementation Plan: Add MCP Dependency

## Overview

Add the `mcp` package dependency to the project's `pyproject.toml` file. This establishes the foundation for the MCP server implementation by providing access to the FastMCP SDK.

## Files to Modify

1. **`pyproject.toml`**

- Add `mcp>=1.0.0,<2.0.0` to the `dependencies` section

2. **`install.sh`** (create if missing)

- Create installation script per environment rules
- Script should create `.venv` with `uv`, activate it, install project, and run tests

## Implementation Steps

### Step 1: Add Dependency to pyproject.toml

- Add `mcp>=1.0.0,<2.0.0` to the `dependencies` list in `pyproject.toml`
- Ensure proper formatting and version constraint

### Step 2: Create install.sh (if missing)

- Create `install.sh` script that:

1. Creates virtual environment in `.venv` using `uv`
2. Activates the virtual environment
3. Installs project using `uv` and `pyproject.toml`
4. Runs pytest

### Step 3: Verify Installation

- Run `./install.sh` to verify dependency installation works
- Verify `mcp` package can be imported: `python -c "from mcp.server.fastmcp import FastMCP"`

## Testing Strategy

This task doesn't require unit tests (it's a dependency addition), but requires:

- Manual verification that `./install.sh` completes successfully
- Manual verification that the `mcp` package can be imported

## Acceptance Criteria

- ✅ `mcp>=1.0.0,<2.0.0` added to `dependencies` section in `pyproject.toml`
- ✅ Dependency can be installed via `./install.sh` or `uv sync`
- ✅ `mcp` package can be imported: `python -c "from mcp.server.fastmcp import FastMCP"`

## Notes

- This is the first task in the MCP server implementation sequence
- No code changes required, only dependency configuration
- The `install.sh` script creation follows project environment rules