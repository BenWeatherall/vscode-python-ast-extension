# Background

This task creates the Node.js build script to orchestrate PyInstaller builds for platform-specific binaries. This script enables developers to build binaries for their platform. This task has no code dependencies but requires PyInstaller to be installed in the Python environment.

# This Task

1. Create `scripts/build-binaries.js`:

2. Implement platform detection:
   - Read `process.platform` and `process.arch`
   - Map to binary naming convention:
     - `win32` → `"win"`, extension `.exe`
     - `linux` → `"linux"`, extension `""`
     - `darwin` → `"darwin"`, extension `""`
   - Map architecture: `x64` → `"x64"`, `arm64` → `"arm64"`
   - Exit with error if platform unsupported

3. Implement binary build function:
   - Construct binary name: `python_service-{platform}-{arch}[.exe]`
   - Ensure `bin/` directory exists (create if needed)
   - Construct PyInstaller command arguments:
     - `--onefile`: Single-file executable
     - `--name {binaryName}`: Output binary name
     - `--distpath {binDir}`: Output directory
     - `--workpath {workDir}`: Temporary build directory
     - `--clean`: Clean build artifacts
     - `--hidden-import pydantic`: Include pydantic dependency
     - `python_service/__main__.py`: Entry point
   - Spawn PyInstaller process with `child_process.spawn()`
   - Handle Windows shell requirement: `shell: platform === "win32"`

4. Implement build validation:
   - Wait for PyInstaller process to complete
   - Check exit code (non-zero indicates failure)
   - Verify binary exists at expected path after build
   - Exit with error if binary not found

5. Add error handling:
   - Clear error messages for unsupported platforms
   - Clear error messages for PyInstaller failures
   - Log build progress and commands

6. Add file-level JSDoc comment:
   - Purpose: Build script for Python service binaries
   - Usage: `node scripts/build-binaries.js`
   - Requirements: PyInstaller installed, python_service importable

**Acceptance Criteria**:
- Script executes successfully on Windows x64
- Binary created in `bin/` directory with correct name
- Script handles errors gracefully
- Clear error messages for failures
- Script documented with JSDoc comments

# Testing Needed

Build scripts are tested manually (per testing.md strategy):

1. Manual test: Run script on Windows x64:
   - Verify platform detection works
   - Verify PyInstaller invoked correctly
   - Verify binary created: `bin/python_service-win-x64.exe`
   - Verify binary executable

2. Manual test: Error handling:
   - Run script without PyInstaller installed
   - Verify clear error message
   - Verify non-zero exit code

3. Manual test: Binary validation:
   - Run script successfully
   - Verify binary exists at expected path
   - Verify binary size reasonable (< 50MB)
