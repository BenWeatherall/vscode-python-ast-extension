# Plan: Verify Server Can Start (Task 17)

## Overview

This task performs manual verification that the MCP server can be started and responds correctly to MCP protocol messages. This is a validation step confirming all previous implementation tasks (1-16) work together as expected.

## Prerequisites

- Task 16 complete (all tests pass)
- Virtual environment available with dependencies installed

## Verification Steps

### Step 1: Activate Virtual Environment

Ensure the virtual environment is active before running any commands.

```bash
source .venv/bin/activate  # Unix
# or
.venv\Scripts\activate     # Windows
```

### Step 2: Run Validation Script

The validation script (`tools/validate_server.py`) will:
1. Start the MCP server as a subprocess
2. Connect via stdio
3. Call the `poe2_validate` tool
4. Verify the response contains expected message
5. Exit with code 0 on success, 1 on failure

```bash
python tools/validate_server.py
```

**Expected Output:**
```
✓ MCP server is operational
```

### Step 3: Manual Server Start Test (Optional)

For additional verification, manually start the server:

```bash
python -m poe2_mcp.server
```

The server will start and wait for MCP protocol messages on stdin. Press Ctrl+C to stop.

### Step 4: Document Cursor Configuration

The server can be configured in Cursor's MCP settings. Example configuration:

```json
{
  "mcpServers": {
    "poe2": {
      "command": "python",
      "args": ["-m", "poe2_mcp.server"],
      "cwd": "<path-to-project>"
    }
  }
}
```

## Acceptance Criteria

- [ ] Validation script exits with code 0
- [ ] Server responds with "PoE2 MCP Server is operational" message
- [ ] Server can be started via `python -m poe2_mcp.server`

## Files Affected

- None (verification only)

## Documentation Updates

- Update CHANGELOG.md with verification completion
- Archive feature file to `_features/archive/base_mcp/mcp_server_frame/tasks/`
