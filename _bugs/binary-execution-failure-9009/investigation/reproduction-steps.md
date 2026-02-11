# Reproduction Steps

## Prerequisites

1. Windows 10 system (win32 x64)
2. VS Code installed
3. Packaged VSIX file: `python-ast-visualization-0.1.0.vsix`
4. Test Python file (e.g., `tests/test_placeholder.py`)

## Steps to Reproduce

1. **Package the extension** (if not already packaged):
   ```bash
   pnpm run vscode:package
   ```
   This creates `python-ast-visualization-0.1.0.vsix`

2. **Install the packaged VSIX**:
   - In VS Code, open Command Palette (Ctrl+Shift+P)
   - Run: "Extensions: Install from VSIX..."
   - Select `python-ast-visualization-0.1.0.vsix`
   - Wait for installation to complete
   - Reload VS Code if prompted

3. **Open a Python file**:
   - Open `tests/test_placeholder.py` or any valid Python file
   - Ensure the file is in the active editor

4. **Execute the visualization command**:
   - Open Command Palette (Ctrl+Shift+P)
   - Run: "Visualize AST"
   - Observe the error message

## Expected Result

The AST visualization webview panel should open and display the node graph.

## Actual Result

Error message appears:
```
Python service error: Service unavailable: process exited with code 9009. Try restarting the extension or checking your Python installation.
```

The Output channel "Python AST Visualization" shows:
```
[2026-02-10T12:20:01.120Z] ERROR: Failed to parse AST for d:\Code\python-vis\tests\test_placeholder.py
  Error: Service unavailable: process exited with code 9009
```

## Reproducibility

**Frequency**: 100% - occurs every time with the packaged VSIX

**Affected Files**: All Python files (the issue is not file-specific)

## Variations Tested

- ✗ Different Python files - same error
- ✗ Restarting VS Code - same error
- ✗ Reinstalling the extension - same error
- ✓ Running in development mode (F5) - works correctly
