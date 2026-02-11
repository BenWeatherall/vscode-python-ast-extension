# Background

Task 01 added the rimraf dependency and new build scripts (`clean`, `build:clean`, `vscode:prepublish`) to package.json. Now we need to validate that these scripts work correctly before packaging a new VSIX.

Per `.cursor/rules/development_practices.mdc`, we must validate functionality through black box testing - testing observable outcomes rather than internal behavior.

This task validates:
1. `clean` script successfully removes the `out/` directory
2. `build:clean` script successfully rebuilds from a clean state
3. `vscode:prepublish` hook executes automatically when packaging

**Dependencies**: Task 01 must be completed (scripts and rimraf dependency must be present)

# This Task

Validate that the new build scripts work correctly through systematic testing.

## Testing Steps

### Test 1: Clean Script Removes Output Directory

**Black Box**: Tests observable outcome (directory deleted)  
**Can Fail**: Yes - if clean script broken or rimraf missing

1. Ensure `out/` directory exists (run `pnpm run build` if needed)
2. Run: `pnpm run clean`
3. Verify: `out/` directory should not exist

**Verification Command**:
```powershell
Test-Path out/  # Should return False
```

**Expected Result**: `out/` directory deleted

### Test 2: Build:Clean Creates Fresh Output

**Black Box**: Tests observable outcome (files created)  
**Can Fail**: Yes - if build broken or dependencies missing

1. Delete `out/` directory: `pnpm run clean`
2. Run: `pnpm run build:clean`
3. Verify all expected output files created:
   - `out/extension.js`
   - `out/media/webview.js`
   - `out/media/webview.css`

**Verification Command**:
```powershell
Test-Path out/extension.js        # Should return True
Test-Path out/media/webview.js    # Should return True
Test-Path out/media/webview.css   # Should return True
```

**Expected Result**: All expected output files created from clean build

### Test 3: Prepublish Hook Triggers on Package

**Black Box**: Tests observable behavior (hook executes)  
**Can Fail**: Yes - if hook misconfigured or VSCE outdated

1. Delete `out/` directory: `pnpm run clean`
2. Run: `pnpm run vscode:package`
3. Observe console output - should show build steps before packaging
4. Verify:
   - `out/` directory exists (created by prepublish)
   - VSIX file created: `python-ast-visualization-0.1.0.vsix`

**Verification Commands**:
```powershell
Test-Path python-ast-visualization-0.1.0.vsix  # Should return True
Test-Path out/extension.js                     # Should return True
```

**Expected Result**: 
- Build output visible in console before packaging starts
- VSIX file created successfully
- `out/` directory present (proving prepublish ran)

## Files to Monitor

- `out/` directory - Should be created/deleted by scripts
- `python-ast-visualization-0.1.0.vsix` - Created by packaging
- Console output - Should show build steps during prepublish

## Acceptance Criteria

- ✅ Test 1 passes: `clean` script removes `out/` directory
- ✅ Test 2 passes: `build:clean` creates fresh output files
- ✅ Test 3 passes: `vscode:prepublish` hook executes automatically
- ✅ All verifications return expected results
- ✅ No errors in console output

## Troubleshooting

### If Test 1 Fails (Clean Script)

**Symptoms**: `out/` directory still exists after running `pnpm run clean`

**Actions**:
1. Check rimraf installation: `pnpm list rimraf`
2. Check file permissions on `out/` directory
3. Close VS Code (may have files locked)
4. Manually delete `out/` and retry

### If Test 2 Fails (Build:Clean Script)

**Symptoms**: Build fails or output files missing

**Actions**:
1. Check TypeScript compiler: `pnpm list typescript`
2. Check for syntax errors: `pnpm run compile`
3. Check esbuild: `pnpm list esbuild`
4. Review compiler error messages

### If Test 3 Fails (Prepublish Hook)

**Symptoms**: `pnpm run vscode:package` doesn't show build output

**Actions**:
1. Verify script name is exactly `vscode:prepublish` (colon, not underscore)
2. Check VSCE version: `pnpm list @vscode/vsce`
3. Test manually: `pnpm run vscode:prepublish`
4. Review console for error messages

# Testing Needed

This task IS the testing task - it validates the build system functionality. Tests are documented above in "Testing Steps".

The validation follows black box testing principles:
- Tests observable outcomes (files created/deleted, VSIX packaged)
- Tests can fail (detects broken configuration or missing dependencies)
- Tests functionality, not implementation details
- Tests have clear success/failure criteria
