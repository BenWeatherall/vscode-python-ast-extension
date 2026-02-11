# Observed Behavior

## Expected Behavior

When the user installs the packaged VSIX extension (`python-ast-visualization-0.1.0.vsix`) and attempts to visualize the AST of a Python file using the "Visualize AST" command, the extension should:

1. Resolve the platform-specific Python service binary from `bin/python_service-win-x64.exe`
2. Spawn the binary as a child process
3. Send the Python source code to the binary via stdio
4. Receive the parsed AST graph response
5. Display the graph in a webview panel

## Actual Behavior

The extension fails with the following error when attempting to visualize any Python file:

```
[2026-02-10T12:20:01.120Z] ERROR: Failed to parse AST for d:\Code\python-vis\tests\test_placeholder.py
  Error: Service unavailable: process exited with code 9009
```

### Error Details

- **Error Location**: `pythonClient.js:105:24` (onExit handler in spawnService method)
- **Exit Code**: 9009
- **Exit Code Meaning**: Windows system error indicating "program is not recognized" or "file not found"
- **Process State**: The child process starts but immediately exits before the `spawn` event completes

### Environment

- **OS**: Windows 10 (10.0.19045)
- **Platform**: win32
- **Architecture**: x64
- **Extension**: python-ast-visualization-0.1.0.vsix (packaged)
- **Test File**: `tests/test_placeholder.py`

## Key Observations

1. The binary file DOES exist in the VSIX package at `extension/bin/python_service-win-x64.exe` (~14.8 MB)
2. The binary file DOES exist in the workspace at `bin/python_service-win-x64.exe`
3. The error occurs during the `spawnService()` call, specifically in the process exit handler
4. Exit code 9009 suggests the spawned process cannot find or execute a required file/command

## Difference from Development Mode

When running the extension in development mode (F5 debug), the extension works correctly. This suggests:
- The issue is specific to the packaged VSIX extension
- The development environment has different behavior or configuration
- The packaging process may have introduced the issue
