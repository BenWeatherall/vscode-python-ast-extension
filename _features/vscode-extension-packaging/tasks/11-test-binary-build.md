# Background

This task validates that the binary build process works correctly. This is a validation task that depends on Tasks 08 (build scripts) and 09 (package.json). This ensures binaries can be built before attempting VSIX packaging.

# This Task

1. Install PyInstaller (if not already installed):
   - Run `uv pip install pyinstaller` or `pip install pyinstaller`
   - Verify installation: `pyinstaller --version`

2. Build binary for current platform:
   - Run `pnpm run build:python-binaries`
   - Verify script executes successfully
   - Verify no errors during build

3. Verify binary output:
   - Check `bin/` directory exists
   - Verify platform-specific binary created:
     - Windows: `bin/python_service-win-x64.exe`
     - Linux: `bin/python_service-linux-x64`
     - macOS: `bin/python_service-darwin-arm64` or `bin/python_service-darwin-x64`
   - Verify binary file size reasonable (< 50MB)

4. Test binary execution:
   - Run binary directly (e.g., `bin/python_service-win-x64.exe`)
   - Verify binary accepts JSON-RPC input on stdin
   - Send test JSON-RPC request
   - Verify JSON-RPC response received
   - Verify protocol compatibility with existing Python service

5. Document any issues:
   - Note any PyInstaller warnings
   - Note any missing dependencies
   - Note any platform-specific issues

**Acceptance Criteria**:
- Binary builds successfully
- Binary exists at expected path
- Binary executes correctly
- Binary responds to JSON-RPC requests
- Protocol compatibility verified

# Testing Needed

This task IS a validation/testing task. Perform manual testing:

1. Build validation:
   - Run build script
   - Verify binary created
   - Verify binary executable

2. Protocol validation:
   - Execute binary
   - Send JSON-RPC parse request
   - Verify response format matches Python service
   - Verify graph data structure correct

3. Integration validation:
   - Test binary with extension (if extension code ready)
   - Verify binary execution path works
   - Compare with Python command execution
