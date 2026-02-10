# Task Plan: Test VSIX Packaging

## Overview

This task validates that VSIX packaging works correctly and produces a valid `.vsix` file with correct contents. This is the final packaging validation step that depends on Tasks 09 (package.json configuration), 10 (.vscodeignore), and 11 (binary build). The task performs manual validation of the VSIX creation process, file contents, and optional installation testing.

## Prerequisites

Before starting this task, ensure:

1. **Task 09 Complete**: `package.json` has:
   - `publisher` field set
   - `@vscode/vsce` in `devDependencies`
   - `vscode:package` script defined

2. **Task 10 Complete**: `.vscodeignore` file exists with correct exclusion patterns

3. **Task 11 Complete**: Binaries built successfully:
   - `pnpm run build:python-binaries` executed successfully
   - Binary files exist in `bin/` directory for current platform

4. **Extension Built**: TypeScript and webview compiled:
   - `pnpm run build` executed successfully
   - `out/` directory contains compiled extension files
   - `out/media/webview.js` and `out/media/webview.css` exist

## Files to Create/Modify

### No Code Changes Required

This is a validation/testing task. No source code files need to be created or modified. However, documentation may need updates based on findings.

### Potential Documentation Updates

- `README.md`: May need updates with VSIX packaging instructions and size notes
- `docs/`: May need developer documentation about VSIX creation process

## Test Strategy

This task IS a validation/testing task. Perform manual testing in the following order:

### Phase 1: Prerequisites Verification

**Actions**:
1. Verify `package.json` has `publisher` field:
   ```bash
   # Check package.json
   cat package.json | grep publisher
   ```

2. Verify `@vscode/vsce` installed:
   ```bash
   # Check if vsce is available
   pnpm list @vscode/vsce
   ```

3. Verify binaries exist:
   ```bash
   # List binaries in bin/ directory
   ls -la bin/
   ```

4. Verify extension built:
   ```bash
   # Check out/ directory exists with files
   ls -la out/
   ls -la out/media/
   ```

**Validation**: All prerequisites confirmed before proceeding.

### Phase 2: VSIX Packaging

**Actions**:
1. Run packaging command:
   ```bash
   pnpm run vscode:package
   ```

2. Verify command executes successfully:
   - No errors in output
   - Exit code is 0
   - VSIX file created

3. Verify VSIX filename:
   - Format: `<name>-<version>.vsix`
   - Example: `python-ast-visualization-0.1.0.vsix`
   - Location: Project root directory

**Validation**: VSIX file created with correct name format.

### Phase 3: VSIX Contents Inspection

**Actions**:
1. Extract VSIX (it's a zip file):
   ```bash
   # On Windows (PowerShell)
   Expand-Archive -Path python-ast-visualization-0.1.0.vsix -DestinationPath vsix-contents
   
   # On Unix/Mac
   unzip python-ast-visualization-0.1.0.vsix -d vsix-contents
   ```

2. Verify required files included:
   - `out/` directory exists with:
     - `extension.js` (compiled TypeScript)
     - `media/webview.js` (bundled webview)
     - `media/webview.css` (bundled CSS)
   - `bin/` directory exists with:
     - Platform-specific binary (e.g., `python_service-win-x64.exe`)
   - `package.json` exists (with publisher field)
   - `README.md` exists (if desired)

3. Verify development artifacts excluded:
   - No `.venv/` directory
   - No `tests/` directory
   - No `src/` directory (source TypeScript files)
   - No `webview-ui/src/` directory (source React files)
   - No `python_service/` directory (source Python files)
   - No `node_modules/` directory
   - No `.build/` directory
   - No `.cursor/` directory
   - No `_features/` or `_archive/` directories
   - No `*.map` files (source maps)

**Validation**: VSIX contains only runtime artifacts, excludes all development files.

### Phase 4: VSIX Size Verification

**Actions**:
1. Check VSIX file size:
   ```bash
   # On Windows (PowerShell)
   (Get-Item python-ast-visualization-0.1.0.vsix).Length
   
   # On Unix/Mac
   ls -lh python-ast-visualization-0.1.0.vsix
   ```

2. Verify size is reasonable:
   - Target: < 100MB total
   - Document actual size for reference
   - If size exceeds target, investigate large files

**Validation**: VSIX size is within acceptable limits.

### Phase 5: VSIX Installation Testing (Optional but Recommended)

**Actions**:
1. Install VSIX in clean VS Code instance:
   ```bash
   code --install-extension python-ast-visualization-0.1.0.vsix
   ```

2. Verify extension activates:
   - Open VS Code Developer Console (Help → Toggle Developer Tools)
   - Check for activation errors
   - Verify extension appears in Extensions view

3. Verify binary execution works:
   - Open a Python file (`.py`)
   - Run command: `Python AST: Visualize AST`
   - Verify Python service starts without errors
   - Verify no "Python not found" errors

4. Verify AST visualization works:
   - Graph renders correctly
   - Nodes display properly
   - Connections visible
   - Navigation works (click node → jump to source)

5. Verify no system Python required:
   - Close VS Code
   - Temporarily remove/rename system Python from PATH (if possible)
   - Reopen VS Code
   - Verify extension still works (uses bundled binary)

**Validation**: Extension installs and functions correctly without system Python.

## Implementation Order

Since this is a validation task, follow this sequence:

1. **Verify Prerequisites** (Phase 1)
   - Check all dependencies from Tasks 09, 10, 11 are complete
   - Ensure extension is built

2. **Package VSIX** (Phase 2)
   - Run packaging command
   - Verify VSIX created successfully

3. **Inspect Contents** (Phase 3)
   - Extract VSIX
   - Verify inclusions and exclusions
   - Document findings

4. **Check Size** (Phase 4)
   - Measure VSIX file size
   - Verify within limits
   - Document size

5. **Test Installation** (Phase 5 - Optional)
   - Install VSIX
   - Test extension functionality
   - Verify binary execution
   - Test without system Python

## Validation Steps

### Success Criteria

- ✅ VSIX created successfully via `pnpm run vscode:package`
- ✅ VSIX filename matches `<name>-<version>.vsix` format
- ✅ VSIX contains `out/` directory with compiled extension
- ✅ VSIX contains `bin/` directory with platform-specific binary
- ✅ VSIX contains `package.json` with publisher field
- ✅ VSIX excludes all development artifacts (`.venv`, `tests`, `src`, etc.)
- ✅ VSIX size is reasonable (< 100MB)
- ✅ VSIX installs successfully in VS Code (if tested)
- ✅ Extension activates and works correctly (if tested)
- ✅ Binary execution works without system Python (if tested)

### Failure Scenarios

If any validation fails:

1. **VSIX creation fails**:
   - Check `package.json` has `publisher` field
   - Verify `@vscode/vsce` is installed
   - Check for syntax errors in `package.json`
   - Review error messages from `vsce package`

2. **Missing files in VSIX**:
   - Verify files exist before packaging
   - Check `.vscodeignore` doesn't exclude required files
   - Ensure `out/` and `bin/` directories exist

3. **Development artifacts included**:
   - Review `.vscodeignore` patterns
   - Verify patterns match actual directory structure
   - Update `.vscodeignore` if needed (Task 10)

4. **VSIX too large**:
   - Identify large files using `du` or similar
   - Check if binaries are unnecessarily large
   - Verify source maps excluded
   - Consider excluding additional files if needed

5. **Installation fails**:
   - Check VS Code version compatibility
   - Verify `engines.vscode` in `package.json`
   - Review VS Code Developer Console for errors
   - Check extension activation events

6. **Binary execution fails**:
   - Verify binary exists in `bin/` directory
   - Check binary has execute permissions (Unix/Mac)
   - Verify binary path resolution works
   - Check extension Output channel for errors

## Documentation Updates

Based on validation findings, update:

1. **README.md**:
   - Add VSIX packaging section:
     ```markdown
     ## Packaging
     
     To create a VSIX package:
     
     1. Build binaries: `pnpm run build:python-binaries`
     2. Build extension: `pnpm run build`
     3. Package VSIX: `pnpm run vscode:package`
     
     The VSIX file will be created in the project root as `<name>-<version>.vsix`.
     ```

2. **Developer Documentation** (if created):
   - Document VSIX size expectations
   - Document platform support
   - Document installation process

## Dependencies

### Task Dependencies

- **Task 09**: `package.json` configuration (publisher, vsce, scripts)
- **Task 10**: `.vscodeignore` file (exclusion patterns)
- **Task 11**: Binary build validation (binaries exist)

### External Dependencies

- `@vscode/vsce`: VS Code extension packaging tool
- VS Code: For installation testing (optional)

## Notes

- This task is primarily manual validation
- No automated tests are required (manual testing is appropriate for packaging validation)
- Document all findings for future reference
- If issues found, they may require fixes in previous tasks (09, 10, or 11)
- VSIX installation testing is optional but highly recommended for production readiness

## References

- VS Code Extension Packaging: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- VS Code Extension Testing: https://code.visualstudio.com/api/working-with-extensions/testing-extension
- VSIX File Format: VSIX is a ZIP file with specific structure
