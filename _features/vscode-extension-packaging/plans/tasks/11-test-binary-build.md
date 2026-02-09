# Per-Task Implementation Plan: Test Binary Build

## Overview

This task validates that the binary build process works correctly by installing PyInstaller (if needed), building a binary for the current platform, verifying the binary output, testing binary execution with JSON-RPC protocol, and documenting any issues encountered. This is a validation/testing task that ensures binaries can be built successfully before attempting VSIX packaging (task 12).

**Context within feature**: This task is Step 11 in the implementation sequence. It depends on tasks 08 (build scripts) and 09 (package.json configuration), which must be completed first. This task validates the build infrastructure before proceeding to VSIX packaging. It performs manual testing rather than automated unit tests, as build scripts and binary execution require real file system and process execution.

## Files to Create/Modify

### Files to Create

1. **`docs/BINARY_BUILD_TESTING.md`** (optional)
   - Documentation of test results
   - Platform-specific notes
   - Known issues and workarounds
   - Binary size benchmarks

### Files to Verify (No Modifications)

1. **`scripts/build-binaries.js`** (from task 08)
   - Must exist and be executable
   - Must contain platform detection logic
   - Must invoke PyInstaller correctly

2. **`package.json`** (from task 09)
   - Must contain `build:python-binaries` script
   - Script must reference `scripts/build-binaries.js`

3. **`bin/` directory**
   - Will be created by build script if it doesn't exist
   - Must contain platform-specific binary after build

## Test Strategy

This task performs **manual validation testing** (not automated unit tests):

1. **Build Validation**: Verify build script executes successfully
2. **Output Validation**: Verify binary created at expected path
3. **Execution Validation**: Verify binary executes and responds to JSON-RPC
4. **Protocol Validation**: Verify binary maintains protocol compatibility
5. **Documentation**: Record any issues, warnings, or platform-specific notes

### Test Prerequisites

- Tasks 08 and 09 must be completed
- Python environment with `python_service` package available
- Node.js environment available
- Virtual environment activated (if using `.venv`)

## Implementation Order

### Step 1: Verify Prerequisites

**Actions**:

1. **Check task dependencies**:
   - Verify `scripts/build-binaries.js` exists
   - Verify `package.json` contains `build:python-binaries` script
   - Verify script references correct file path

2. **Check Python environment**:
   ```bash
   # Verify Python version (3.12+)
   python --version
   
   # Verify virtual environment activated (if using .venv)
   # Windows: .venv\Scripts\activate
   # Unix: source .venv/bin/activate
   
   # Verify python_service importable
   python -c "import python_service; print('OK')"
   ```

3. **Check Node.js environment**:
   ```bash
   # Verify Node.js available
   node --version
   
   # Verify pnpm available
   pnpm --version
   ```

**Validation**: All prerequisites verified, no errors

---

### Step 2: Install PyInstaller

**Actions**:

1. **Check if PyInstaller already installed**:
   ```bash
   pyinstaller --version
   ```
   - If command succeeds, PyInstaller is installed → proceed to Step 3
   - If command fails, proceed to installation

2. **Install PyInstaller** (if needed):
   ```bash
   # Using uv (preferred)
   uv pip install pyinstaller
   
   # Or using pip
   pip install pyinstaller
   ```

3. **Verify installation**:
   ```bash
   pyinstaller --version
   ```
   - Should output version number (e.g., `6.x.x`)

**Validation**: PyInstaller installed and accessible

**Documentation**: Record PyInstaller version in test notes

---

### Step 3: Build Binary for Current Platform

**Actions**:

1. **Run build script**:
   ```bash
   pnpm run build:python-binaries
   ```
   - Script should execute without errors
   - Watch for PyInstaller output (may take 2-5 minutes)
   - Note any warnings (non-fatal warnings are acceptable)

2. **Monitor build output**:
   - Verify platform detection message appears
   - Verify PyInstaller command logged correctly
   - Verify build progress messages
   - Note any warnings (e.g., missing modules, hidden imports)

3. **Verify script exit code**:
   - Script should exit with code 0 (success)
   - If exit code non-zero, note error message

**Validation**: Build script executes successfully, exits with code 0

**Documentation**: Record build time, any warnings, exit code

---

### Step 4: Verify Binary Output

**Actions**:

1. **Check `bin/` directory exists**:
   ```bash
   # Windows
   dir bin\
   
   # Unix
   ls bin/
   ```
   - Directory should exist
   - Should contain platform-specific binary

2. **Verify platform-specific binary name**:
   - **Windows x64**: `bin/python_service-win-x64.exe`
   - **Linux x64**: `bin/python_service-linux-x64`
   - **macOS ARM64**: `bin/python_service-darwin-arm64`
   - **macOS x64**: `bin/python_service-darwin-x64`

3. **Verify binary file size**:
   ```bash
   # Windows PowerShell
   (Get-Item bin\python_service-win-x64.exe).Length / 1MB
   
   # Unix
   ls -lh bin/python_service-*
   ```
   - Binary should be reasonable size (< 50MB)
   - Typical size: 15-30MB for PyInstaller onefile builds

4. **Verify binary is executable**:
   ```bash
   # Windows: file should have .exe extension
   # Unix: check permissions
   ls -l bin/python_service-*
   # Should show executable permissions (x flag)
   ```

**Validation**: Binary exists at expected path, reasonable size, executable

**Documentation**: Record binary path, file size, platform/architecture

---

### Step 5: Test Binary Execution

**Actions**:

1. **Execute binary directly**:
   ```bash
   # Windows
   bin\python_service-win-x64.exe
   
   # Unix
   ./bin/python_service-linux-x64
   # or
   bin/python_service-darwin-arm64
   ```
   - Binary should start and wait for stdin input
   - Should not exit immediately (waiting for JSON-RPC input)

2. **Send test JSON-RPC request** (in separate terminal or via script):
   ```bash
   # Create test request file
   echo '{"method":"parse","params":{"sourceCode":"def hello(): pass"}}' > test_request.json
   
   # Send request to binary (Windows PowerShell)
   Get-Content test_request.json | .\bin\python_service-win-x64.exe
   
   # Send request to binary (Unix)
   cat test_request.json | ./bin/python_service-linux-x64
   ```

3. **Verify JSON-RPC response**:
   - Binary should output JSON response to stdout
   - Response should match format:
     ```json
     {
       "result": {
         "nodes": [...],
         "connections": [...]
       }
     }
     ```
   - Response should contain valid Rete graph structure

4. **Test with invalid input** (optional):
   ```bash
   # Send invalid JSON
   echo 'invalid json' | ./bin/python_service-linux-x64
   ```
   - Should return error response:
     ```json
     {
       "error": {
         "code": -32700,
         "message": "..."
       }
     }
     ```

**Validation**: Binary executes, accepts JSON-RPC input, returns valid responses

**Documentation**: Record test cases executed, response format verified

---

### Step 6: Verify Protocol Compatibility

**Actions**:

1. **Compare binary vs Python command execution**:
   ```bash
   # Test with Python command (baseline)
   echo '{"method":"parse","params":{"sourceCode":"x + y"}}' | python -m python_service
   
   # Test with binary
   echo '{"method":"parse","params":{"sourceCode":"x + y"}}' | ./bin/python_service-linux-x64
   ```

2. **Compare response structures**:
   - Parse both JSON responses
   - Verify node structures match
   - Verify connection structures match
   - Verify data fields match (ast_type, lineno, col_offset, etc.)

3. **Test multiple parse requests** (if binary supports multiple requests):
   ```bash
   # Send multiple requests sequentially
   echo -e '{"method":"parse","params":{"sourceCode":"x + y"}}\n{"method":"parse","params":{"sourceCode":"def foo(): pass"}}' | ./bin/python_service-linux-x64
   ```
   - Verify binary handles multiple requests correctly
   - Verify responses are separated by newlines

**Validation**: Binary protocol matches Python command protocol exactly

**Documentation**: Record protocol compatibility verified, any differences noted

---

### Step 7: Document Issues and Notes

**Actions**:

1. **Create test results document** (optional):
   - File: `docs/BINARY_BUILD_TESTING.md`
   - Include: platform, PyInstaller version, build time, binary size
   - Include: any warnings or issues encountered
   - Include: test cases executed and results

2. **Document PyInstaller warnings** (if any):
   - Missing modules warnings (may need `--hidden-import`)
   - Deprecation warnings (non-critical)
   - Platform-specific warnings

3. **Document platform-specific issues**:
   - Windows: Any path or permission issues
   - macOS: Code signing or Gatekeeper issues (if applicable)
   - Linux: Library dependencies or compatibility issues

4. **Document binary size and performance**:
   - Record binary file size
   - Note startup time (if noticeable)
   - Note memory usage (if measured)

**Validation**: Issues documented, test results recorded

**Documentation**: Test results file created (if issues found or for reference)

---

## Validation Steps

After completing all steps:

1. **Build Success**:
   - ✅ Binary builds successfully
   - ✅ No fatal errors during build
   - ✅ Build script exits with code 0

2. **Binary Exists**:
   - ✅ Binary file exists at expected path
   - ✅ Binary filename matches platform/architecture
   - ✅ Binary size reasonable (< 50MB)

3. **Binary Executes**:
   - ✅ Binary starts without errors
   - ✅ Binary accepts stdin input
   - ✅ Binary outputs JSON-RPC responses

4. **Protocol Compatibility**:
   - ✅ Binary responds to JSON-RPC parse requests
   - ✅ Response format matches Python service
   - ✅ Graph data structure correct
   - ✅ Error handling works correctly

5. **Documentation**:
   - ✅ Any issues documented
   - ✅ Platform-specific notes recorded
   - ✅ Test results available for reference

## Acceptance Criteria

Per task document, all criteria must be met:

- ✅ **Binary builds successfully**: Build script executes without fatal errors
- ✅ **Binary exists at expected path**: Platform-specific binary found in `bin/` directory
- ✅ **Binary executes correctly**: Binary starts and accepts input
- ✅ **Binary responds to JSON-RPC requests**: Valid responses received for parse requests
- ✅ **Protocol compatibility verified**: Binary protocol matches Python service protocol

## Error Handling

### PyInstaller Not Found

**Symptom**: `spawn` error or "command not found"

**Action**: Install PyInstaller (Step 2)

**Resolution**: Verify installation with `pyinstaller --version`

---

### Build Script Fails

**Symptom**: Build script exits with non-zero code

**Action**: 
1. Check PyInstaller output for error messages
2. Verify Python service package importable
3. Check for missing dependencies
4. Review build script for platform detection issues

**Resolution**: Fix underlying issue, retry build

---

### Binary Not Created

**Symptom**: Build succeeds but binary file missing

**Action**:
1. Check `bin/` directory exists
2. Verify PyInstaller output directory matches expected path
3. Check for file permission issues
4. Review PyInstaller logs for warnings

**Resolution**: Fix path or permission issues, rebuild

---

### Binary Execution Fails

**Symptom**: Binary exits immediately or crashes

**Action**:
1. Check binary file permissions (Unix)
2. Verify binary is executable
3. Check for missing system libraries (Unix)
4. Review error messages or crash logs

**Resolution**: Fix permissions or dependencies, rebuild if needed

---

### Protocol Mismatch

**Symptom**: Binary responses don't match Python service

**Action**:
1. Compare response structures side-by-side
2. Check for data type differences
3. Verify JSON serialization matches
4. Review Python service code for changes

**Resolution**: Fix protocol differences, rebuild binary

---

### Binary Size Too Large

**Symptom**: Binary exceeds 50MB

**Action**:
1. Check PyInstaller options (may need `--exclude-module`)
2. Review included dependencies
3. Consider `--onedir` vs `--onefile` trade-offs
4. Document acceptable size for platform

**Resolution**: Optimize PyInstaller options or document acceptable size

## Documentation Updates

### Code Documentation

No code changes in this task (validation only).

### Project Documentation

**Optional**: Create `docs/BINARY_BUILD_TESTING.md` with:

- **Test Environment**: Platform, Python version, PyInstaller version
- **Build Results**: Build time, binary size, warnings
- **Test Cases**: Test scenarios executed and results
- **Known Issues**: Any issues encountered and resolutions
- **Platform Notes**: Platform-specific considerations

**Format**:
```markdown
# Binary Build Testing Results

## Test Environment
- Platform: Windows 10 x64
- Python: 3.12.0
- PyInstaller: 6.3.0
- Date: 2026-02-09

## Build Results
- Build Time: ~3 minutes
- Binary Size: 24.5 MB
- Warnings: None

## Test Cases
1. ✅ Binary builds successfully
2. ✅ Binary executes correctly
3. ✅ JSON-RPC protocol verified
...

## Known Issues
None

## Platform Notes
Windows: Binary requires no special permissions
```

## Dependencies

### Prerequisites

- **Task 08**: Build script (`scripts/build-binaries.js`) must exist
- **Task 09**: Package.json must contain `build:python-binaries` script
- **Python Environment**: Python 3.12+ with `python_service` package
- **PyInstaller**: Must be installable (will be installed in Step 2)

### Code Dependencies

- **None**: This task performs manual validation only

### Runtime Dependencies

- **Node.js**: Required to run `pnpm run build:python-binaries`
- **Python**: Required for PyInstaller and Python service
- **File System**: Required for binary creation and execution

## Implementation Notes

### Testing Approach

This task uses **manual validation testing** rather than automated tests because:

1. **Build scripts** require real file system and process execution
2. **Binary execution** requires spawning real processes
3. **Protocol testing** requires actual JSON-RPC communication
4. **Platform detection** requires real platform environment

Automated tests would require complex mocking and may not catch real-world issues.

### Test Data

Use simple Python code samples for testing:

- **Simple function**: `def hello(): pass`
- **Expression**: `x + y`
- **Class**: `class Foo: pass`
- **Complex**: `def foo(x, y): return x + y`

These samples are sufficient to verify protocol compatibility.

### Binary Execution Testing

Binary execution testing can be done via:

1. **Manual terminal**: Execute binary, send JSON via stdin
2. **Script**: Create test script to automate JSON-RPC requests
3. **Python script**: Use Python `subprocess` to test binary

For this task, manual terminal testing is sufficient. Automated testing can be added in task 13 (integration testing).

### Protocol Compatibility

Protocol compatibility is critical. The binary must:

1. Accept identical JSON-RPC request format
2. Return identical JSON-RPC response format
3. Handle errors identically
4. Support multiple sequential requests (if applicable)

Any protocol differences will break extension functionality.

### Platform-Specific Considerations

**Windows**:
- Binary must have `.exe` extension
- May require administrator privileges for execution (unlikely)
- Path separators: Use backslashes or forward slashes (both work)

**macOS**:
- Binary may trigger Gatekeeper warnings (first execution)
- May require code signing for distribution (future task)
- Binary permissions: Must be executable (`chmod +x`)

**Linux**:
- Binary must be executable (`chmod +x`)
- May require system libraries (libc, etc.)
- Binary should be statically linked or include dependencies

## References

- **Master Plan**: `_features/vscode-extension-packaging/plans/master/implementation.md` Step 11
- **Task Document**: `_features/vscode-extension-packaging/tasks/11-test-binary-build.md`
- **Build Script**: `scripts/build-binaries.js` (from task 08)
- **PyInstaller Documentation**: https://pyinstaller.org/en/stable/usage.html
- **JSON-RPC Protocol**: See `python_service/server.py` for protocol details
