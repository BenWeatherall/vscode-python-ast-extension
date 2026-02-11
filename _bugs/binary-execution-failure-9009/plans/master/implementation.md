# Implementation Plan: Binary Execution Failure (9009)

## Implementation Overview

This plan follows Test-Driven Development (TDD) principles per `.cursor/rules/development_practices.mdc`. However, since this is a build system fix (not code logic), we cannot write traditional unit tests first. Instead, we'll verify the fix through validation testing after implementation.

## Implementation Sequence

### Step 1: Add rimraf Dependency

**Order**: First (required for clean script)

**File**: `package.json`

**Change**: Add to `devDependencies`

**Before**:
```json
{
  "devDependencies": {
    "esbuild": "^0.24.0",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@types/jest": "^29.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@vscode/vsce": "^3.7.1",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^30.2.0",
    "ts-jest": "^29.0.0",
    "typescript": "^5.0.0"
  }
}
```

**After**:
```json
{
  "devDependencies": {
    "esbuild": "^0.24.0",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@types/jest": "^29.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@vscode/vsce": "^3.7.1",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^30.2.0",
    "rimraf": "^5.0.0",
    "ts-jest": "^29.0.0",
    "typescript": "^5.0.0"
  }
}
```

**Action**: Run `pnpm install` after modifying package.json

### Step 2: Add Build Scripts

**Order**: Second (after rimraf is available)

**File**: `package.json`

**Change**: Add three scripts to `scripts` section

**Before**:
```json
{
  "scripts": {
    "compile": "tsc -p .",
    "watch": "tsc -p . -w",
    "build": "npm run compile && npm run bundle-webview",
    "bundle-webview": "esbuild webview-ui/src/index.tsx --bundle --outfile=out/media/webview.js --format=iife --global-name=webviewBundle && npx tailwindcss -i webview-ui/src/index.css -o out/media/webview.css -c webview-ui/tailwind.config.js --minify",
    "build:python-binaries": "node scripts/build-binaries.js",
    "vscode:package": "vsce package",
    "test": "jest",
    "test:python": "python -m pytest tests/ -v"
  }
}
```

**After**:
```json
{
  "scripts": {
    "clean": "rimraf out",
    "compile": "tsc -p .",
    "watch": "tsc -p . -w",
    "build": "npm run compile && npm run bundle-webview",
    "build:clean": "npm run clean && npm run build",
    "bundle-webview": "esbuild webview-ui/src/index.tsx --bundle --outfile=out/media/webview.js --format=iife --global-name=webviewBundle && npx tailwindcss -i webview-ui/src/index.css -o out/media/webview.css -c webview-ui/tailwind.config.js --minify",
    "build:python-binaries": "node scripts/build-binaries.js",
    "vscode:prepublish": "npm run build:clean",
    "vscode:package": "vsce package",
    "test": "jest",
    "test:python": "python -m pytest tests/ -v"
  }
}
```

**New Scripts**:
1. `clean`: Removes `out/` directory using rimraf
2. `build:clean`: Runs clean, then build (ensures fresh compilation)
3. `vscode:prepublish`: Lifecycle hook that VSCE runs before packaging

**Script Order**: Alphabetical within logical groups (follows existing convention)

### Step 3: Install Dependencies

**Order**: Third (after package.json modified)

**Command**: 
```bash
pnpm install
```

**Expected Outcome**:
- `rimraf` installed to `node_modules/`
- `pnpm-lock.yaml` updated with rimraf dependency tree

**Verification**:
```bash
pnpm list rimraf
```

Expected output: `rimraf 5.0.x` (or latest 5.x version)

### Step 4: Test Clean Script

**Order**: Fourth (verify clean script works)

**Purpose**: Ensure `clean` script correctly removes `out/` directory

**Test Steps**:
1. Verify `out/` directory exists: `ls out/`
2. Run clean script: `pnpm run clean`
3. Verify `out/` directory removed: `ls out/` (should fail or show empty)

**Expected Outcome**: `out/` directory deleted successfully

**Rollback**: If fails, check rimraf installation and path

### Step 5: Test Build:Clean Script

**Order**: Fifth (verify clean build works)

**Purpose**: Ensure `build:clean` script successfully rebuilds from clean state

**Test Steps**:
1. Delete `out/` if exists: `pnpm run clean`
2. Run clean build: `pnpm run build:clean`
3. Verify `out/` directory recreated
4. Verify `out/extension.js` exists
5. Verify `out/media/webview.js` exists
6. Verify `out/media/webview.css` exists

**Expected Outcome**: 
- Clean build completes without errors
- All expected output files generated

**Verification Command**:
```bash
ls -la out/extension.js out/media/webview.js out/media/webview.css
```

### Step 6: Test vscode:prepublish Hook

**Order**: Sixth (verify prepublish hook triggers)

**Purpose**: Ensure VSCE automatically runs prepublish before packaging

**Test Steps**:
1. Delete `out/` directory: `pnpm run clean`
2. Run package command: `pnpm run vscode:package`
3. Observe console output - should show:
   - "Running prepublish script..."
   - TypeScript compilation output
   - Webview bundling output
   - VSCE packaging output
4. Verify `out/` directory recreated
5. Verify VSIX file created

**Expected Outcome**:
- Prepublish hook executes automatically
- Build completes successfully
- VSIX package created

**Verification**: Check for `python-ast-visualization-0.1.0.vsix` file

### Step 7: Verify VSIX Contents

**Order**: Seventh (verify packaged code is current)

**Purpose**: Ensure VSIX contains fresh compiled code

**Test Steps**:
1. Extract VSIX (it's a ZIP file):
   ```bash
   # On Windows PowerShell
   Expand-Archive python-ast-visualization-0.1.0.vsix .vsix-extracted-test -Force
   ```

2. Calculate hash of packaged extension.js:
   ```bash
   # On Windows PowerShell
   Get-FileHash .vsix-extracted-test/extension/out/extension.js -Algorithm MD5
   ```

3. Calculate hash of workspace extension.js:
   ```bash
   Get-FileHash out/extension.js -Algorithm MD5
   ```

4. Compare hashes - **they MUST match**

5. Inspect packaged code for binary resolution logic:
   ```bash
   # Search for binaryResolver import
   Select-String -Path .vsix-extracted-test/extension/out/extension.js -Pattern "binaryResolver"
   
   # Search for resolveBinaryPath call
   Select-String -Path .vsix-extracted-test/extension/out/extension.js -Pattern "resolveBinaryPath"
   ```

**Expected Outcome**:
- Hashes match exactly
- Binary resolution logic present in packaged code

### Step 8: Install and Test VSIX

**Order**: Eighth (functional testing)

**Purpose**: Verify VSIX works correctly when installed

**Test Steps**:
1. Open VS Code (separate window or clean profile)
2. Install VSIX: Extensions → "..." → Install from VSIX
3. Select `python-ast-visualization-0.1.0.vsix`
4. Reload VS Code when prompted
5. Open a Python file (e.g., `tests/test_placeholder.py`)
6. Run command: Ctrl+Shift+P → "Visualize AST"
7. Verify:
   - No error messages
   - Webview panel opens
   - AST graph displays
   - No exit code 9009 error

**Expected Outcome**: Extension works correctly, no errors

**Success Criteria**: Graph displays without "Service unavailable: process exited with code 9009" error

### Step 9: Run Test Suite

**Order**: Ninth (regression testing)

**Purpose**: Ensure fix doesn't break existing functionality

**Test Commands**:
```bash
# Python tests
python -m pytest tests/python_service -v

# TypeScript tests
pnpm test

# Type checking
mypy python_service/

# Linting
ruff check . --fix
```

**Expected Outcome**: All tests pass (0 failures)

**Action on Failure**: Investigate and fix any broken tests before proceeding

### Step 10: Clean Up Test Artifacts

**Order**: Tenth (cleanup)

**Purpose**: Remove test extraction directory

**Command**:
```bash
# Remove test extraction directory
Remove-Item -Recurse -Force .vsix-extracted-test
```

**Note**: Keep the `.vsix-extracted/` directory if it exists from previous investigation (for reference)

### Step 11: Delete Old VSIX (Optional)

**Order**: Eleventh (optional cleanup)

**Purpose**: Remove old broken VSIX to avoid confusion

**Consideration**: The old VSIX file `python-ast-visualization-0.1.0.vsix` should be replaced by the new one from Step 6. If a backup is needed, rename it before packaging:

```bash
# Backup old VSIX if exists
if (Test-Path python-ast-visualization-0.1.0.vsix) {
    Move-Item python-ast-visualization-0.1.0.vsix python-ast-visualization-0.1.0-old.vsix
}
```

**Action**: Delete old VSIX after confirming new one works

## Implementation Dependencies

### Dependency Order

1. `rimraf` package must be installed before clean script can run
2. Clean script must work before build:clean can run
3. Build:clean must work before vscode:prepublish can be tested
4. Prepublish hook must work before VSIX can be packaged correctly

### Parallel vs Sequential

**All steps must be sequential** - each step depends on the previous step's success.

**No parallel operations** - build system changes are inherently sequential.

## File Modification Summary

### Files to Modify

1. **package.json**
   - Add `rimraf` to devDependencies
   - Add `clean`, `build:clean`, `vscode:prepublish` scripts

2. **pnpm-lock.yaml** (automatically updated)
   - Updated when `pnpm install` runs

### Files NOT Modified

- No TypeScript source files
- No Python source files
- No test files
- No configuration files (tsconfig.json, .vscodeignore, etc.)
- No documentation files (yet - will update after validation)

## Error Handling

### If rimraf Installation Fails

**Symptom**: `pnpm install` fails or rimraf not found

**Resolution**:
1. Check Node.js version (must be compatible with pnpm)
2. Clear pnpm cache: `pnpm store prune`
3. Retry: `pnpm install --force`
4. Alternative: Use `del-cli` package instead of rimraf

### If Clean Script Fails

**Symptom**: `pnpm run clean` fails to remove `out/` directory

**Resolution**:
1. Check file permissions on `out/` directory
2. Close VS Code (may have files locked)
3. Manually delete `out/` and retry
4. Check rimraf version: `pnpm list rimraf`

### If Build Script Fails

**Symptom**: `pnpm run build:clean` fails during compilation

**Resolution**:
1. Check TypeScript compiler: `pnpm list typescript`
2. Check for syntax errors: `pnpm run compile`
3. Check esbuild: `pnpm list esbuild`
4. Review compiler error messages

### If Prepublish Hook Doesn't Trigger

**Symptom**: `pnpm run vscode:package` doesn't show build output

**Resolution**:
1. Verify script name is exactly `vscode:prepublish` (colon, not underscore)
2. Check VSCE version: `pnpm list @vscode/vsce`
3. Test manually: `pnpm run vscode:prepublish`
4. Review VSCE documentation for lifecycle hooks

### If VSIX Still Fails

**Symptom**: New VSIX still shows exit code 9009

**Resolution**:
1. Verify binary file exists in VSIX: `bin/python_service-win-x64.exe`
2. Check extracted code for binary resolution logic
3. Compare file hashes again
4. Review investigation documents for additional factors
5. Create new bug report if root cause differs

## Time Estimates

| Step | Task | Estimated Time |
|------|------|----------------|
| 1 | Add rimraf dependency | 2 minutes |
| 2 | Add build scripts | 3 minutes |
| 3 | Install dependencies | 2 minutes |
| 4 | Test clean script | 2 minutes |
| 5 | Test build:clean script | 3 minutes |
| 6 | Test vscode:prepublish hook | 3 minutes |
| 7 | Verify VSIX contents | 5 minutes |
| 8 | Install and test VSIX | 5 minutes |
| 9 | Run test suite | 5 minutes |
| 10 | Clean up test artifacts | 1 minute |
| **Total** | | **31 minutes** |

**Note**: Time estimates assume no errors. Add buffer for troubleshooting if needed.

## Success Indicators

After completing all steps, the following must be true:

1. ✅ `rimraf` package installed
2. ✅ `clean` script removes `out/` directory
3. ✅ `build:clean` script successfully rebuilds from clean state
4. ✅ `vscode:prepublish` hook executes automatically before packaging
5. ✅ VSIX file hashes match workspace file hashes
6. ✅ VSIX contains binary resolution logic
7. ✅ Installed VSIX extension works correctly
8. ✅ All tests pass (Python + TypeScript)
9. ✅ No regressions introduced

## Rollback Plan

If implementation fails at any step:

1. **Before Step 3**: Revert package.json changes, no harm done
2. **After Step 3**: Run `pnpm remove rimraf`, revert package.json
3. **After Step 6**: Use manual workflow (`pnpm run build && pnpm run vscode:package`) while debugging
4. **If VSIX fails**: Keep investigation/research documents, investigate new root cause

## Next Actions After Implementation

1. Update `.cursor/scratchpad.md` with fix completion
2. Create validation document (see `validation.md`)
3. Document fix in CHANGELOG.md (per `.cursor/rules/documentation.mdc`)
4. Update README.md if packaging workflow documented
5. Delete old VSIX file
6. Commit changes with descriptive message
