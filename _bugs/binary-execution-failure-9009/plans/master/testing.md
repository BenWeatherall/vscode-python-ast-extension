# Testing Plan: Binary Execution Failure (9009)

## Testing Overview

This fix modifies the build system, not application logic. Traditional unit testing (write test first, implement, verify) doesn't apply. Instead, we use **validation testing** to confirm the fix works correctly.

Per `.cursor/rules/development_practices.mdc`, we must ensure:
- ✅ All tests work (no broken tests introduced)
- ✅ Tests can fail (validation must be able to detect problems)
- ✅ Black box testing (test outcomes, not internals)
- ✅ Regression gate (all tests pass before completion)

## Test Categories

### 1. Build System Tests (New)

These tests verify the fix works as intended.

### 2. Regression Tests (Existing)

These tests ensure the fix doesn't break existing functionality.

## Build System Tests

### Test 1: Clean Script Removes Output Directory

**Type**: Functional test  
**Black Box**: Yes - tests observable outcome (directory deleted)  
**Can Fail**: Yes - if clean script broken or rimraf missing

**Test Steps**:
1. Verify `out/` directory exists (create with `pnpm run build` if needed)
2. Run: `pnpm run clean`
3. Check: `out/` directory should not exist

**Expected Result**: `out/` directory deleted

**Verification Command**:
```powershell
# PowerShell
Test-Path out/  # Should return False
```

**Failure Scenarios**:
- rimraf not installed
- rimraf fails (permissions, locked files)
- Script misconfigured (wrong path)

---

### Test 2: Build:Clean Creates Fresh Output

**Type**: Integration test  
**Black Box**: Yes - tests observable outcome (files created)  
**Can Fail**: Yes - if build broken or dependencies missing

**Test Steps**:
1. Delete `out/` directory: `pnpm run clean`
2. Run: `pnpm run build:clean`
3. Check: `out/` directory exists
4. Check: `out/extension.js` exists
5. Check: `out/media/webview.js` exists

**Expected Result**: All expected output files created

**Verification Command**:
```powershell
# PowerShell
Test-Path out/extension.js         # Should return True
Test-Path out/media/webview.js     # Should return True
Test-Path out/media/webview.css    # Should return True
```

**Failure Scenarios**:
- TypeScript compilation fails
- Webview bundling fails
- Clean step failed
- Dependencies missing

---

### Test 3: Prepublish Hook Triggers on Package

**Type**: Integration test  
**Black Box**: Yes - tests observable behavior (hook executes)  
**Can Fail**: Yes - if hook misconfigured or VSCE outdated

**Test Steps**:
1. Delete `out/` directory: `pnpm run clean`
2. Run: `pnpm run vscode:package`
3. Observe: Console output should show build steps before packaging
4. Check: `out/` directory exists (created by prepublish)
5. Check: VSIX file created

**Expected Result**: 
- Build output visible in console
- VSIX file created
- `out/` directory present

**Verification Command**:
```powershell
# PowerShell
Test-Path python-ast-visualization-0.1.0.vsix  # Should return True
Test-Path out/extension.js                     # Should return True
```

**Failure Scenarios**:
- Hook name typo (must be exactly `vscode:prepublish`)
- VSCE version doesn't support hooks
- Build fails during prepublish

---

### Test 4: Packaged Code Matches Workspace Code

**Type**: Validation test  
**Black Box**: Yes - tests observable outcome (file contents match)  
**Can Fail**: Yes - if prepublish doesn't run or stale artifacts remain

**Test Steps**:
1. Package extension: `pnpm run vscode:package`
2. Extract VSIX: 
   ```powershell
   Expand-Archive python-ast-visualization-0.1.0.vsix .vsix-test -Force
   ```
3. Calculate workspace hash:
   ```powershell
   $workspaceHash = (Get-FileHash out/extension.js -Algorithm MD5).Hash
   ```
4. Calculate VSIX hash:
   ```powershell
   $vsixHash = (Get-FileHash .vsix-test/extension/out/extension.js -Algorithm MD5).Hash
   ```
5. Compare: `$workspaceHash -eq $vsixHash`

**Expected Result**: Hashes match exactly

**Verification Command**:
```powershell
# PowerShell - One-liner comparison
(Get-FileHash out/extension.js -Algorithm MD5).Hash -eq `
(Get-FileHash .vsix-test/extension/out/extension.js -Algorithm MD5).Hash
# Should return: True
```

**Failure Scenarios**:
- Prepublish hook didn't run
- Different build artifacts used
- VSIX packaging excludes compiled code

---

### Test 5: Packaged Code Contains Binary Resolution Logic

**Type**: Functional test  
**Black Box**: Yes - tests presence of required feature  
**Can Fail**: Yes - if stale code packaged

**Test Steps**:
1. Extract VSIX (if not already): see Test 4
2. Search for binaryResolver import:
   ```powershell
   Select-String -Path .vsix-test/extension/out/extension.js -Pattern "binaryResolver"
   ```
3. Search for resolveBinaryPath call:
   ```powershell
   Select-String -Path .vsix-test/extension/out/extension.js -Pattern "resolveBinaryPath"
   ```

**Expected Result**: Both patterns found

**Verification Command**:
```powershell
# PowerShell - Check both patterns exist
(Select-String -Path .vsix-test/extension/out/extension.js -Pattern "binaryResolver").Count -gt 0
(Select-String -Path .vsix-test/extension/out/extension.js -Pattern "resolveBinaryPath").Count -gt 0
# Both should return: True
```

**Failure Scenarios**:
- Stale code packaged (prepublish failed)
- Feature removed or refactored
- TypeScript compilation issue

---

### Test 6: VSIX Installs and Runs Without Errors

**Type**: End-to-end functional test  
**Black Box**: Yes - tests user-facing behavior  
**Can Fail**: Yes - if any part of packaging or feature broken

**Test Steps**:
1. Open VS Code (clean profile recommended)
2. Install VSIX: Extensions → "..." → Install from VSIX
3. Select `python-ast-visualization-0.1.0.vsix`
4. Reload VS Code when prompted
5. Open Python file: `tests/test_placeholder.py`
6. Run command: Ctrl+Shift+P → "Visualize AST"
7. Observe:
   - Webview panel opens
   - No error messages in corner
   - Graph displays
   - Output channel has no exit code 9009

**Expected Result**: 
- Extension activates successfully
- Visualization completes without errors
- Graph displays in webview

**Failure Detection**:
- Error message: "Service unavailable: process exited with code 9009" ❌
- Error message: "Python service error" ❌
- No webview opens ❌
- Webview shows error banner ❌

**Success Indicators**:
- Webview opens ✅
- Graph displays ✅
- No error messages ✅

**Failure Scenarios**:
- Binary still not found (different issue)
- Feature broken during refactor
- Dependencies missing from VSIX

---

## Regression Tests

### Test 7: Existing Python Tests Pass

**Type**: Regression test  
**Black Box**: Yes - tests pass/fail outcomes  
**Can Fail**: Yes - if implementation broke Python service

**Test Command**:
```bash
python -m pytest tests/python_service -v
```

**Expected Result**: All tests pass, 0 failures

**Failure Action**: Fix broken tests before completing bug fix

**Note**: Per development_practices.mdc, failing tests are regressions and must be resolved.

---

### Test 8: Existing TypeScript Tests Pass

**Type**: Regression test  
**Black Box**: Yes - tests pass/fail outcomes  
**Can Fail**: Yes - if implementation broke extension or webview

**Test Command**:
```bash
pnpm test
```

**Expected Result**: All tests pass, 0 failures

**Failure Action**: Fix broken tests before completing bug fix

---

### Test 9: Type Checking Passes

**Type**: Static analysis regression test  
**Black Box**: Yes - tests for type errors  
**Can Fail**: Yes - if code changes introduced type issues

**Test Command**:
```bash
mypy python_service/
```

**Expected Result**: No type errors

**Failure Action**: Fix type errors before completing bug fix

---

### Test 10: Linting Passes

**Type**: Style regression test  
**Black Box**: Yes - tests for style violations  
**Can Fail**: Yes - if code changes introduced style issues

**Test Command**:
```bash
ruff check . --fix
```

**Expected Result**: No linting errors after auto-fix

**Failure Action**: Fix linting errors before completing bug fix

---

## Test Execution Order

### Phase 1: Build System Validation (Tests 1-5)

Execute in order:
1. Test 1: Clean Script
2. Test 2: Build:Clean
3. Test 3: Prepublish Hook
4. Test 4: Hash Comparison
5. Test 5: Feature Presence

**Stop Condition**: If any test fails, fix issue before proceeding

### Phase 2: Functional Validation (Test 6)

Execute after Phase 1 completes successfully:
6. Test 6: VSIX Installation and Execution

**Stop Condition**: If test fails, investigate root cause

### Phase 3: Regression Testing (Tests 7-10)

Execute in parallel (independent tests):
7. Test 7: Python Tests
8. Test 8: TypeScript Tests
9. Test 9: Type Checking
10. Test 10: Linting

**Stop Condition**: All tests must pass (regression gate)

## Test Automation Script (Optional)

For convenience, create a test script to run all validations:

**File**: `scripts/validate-vsix-packaging.ps1`

```powershell
# VSIX Packaging Validation Script
# Tests that the prepublish hook and clean builds work correctly

Write-Host "=== VSIX Packaging Validation ===" -ForegroundColor Cyan

# Test 1: Clean
Write-Host "`nTest 1: Clean script removes output directory" -ForegroundColor Yellow
pnpm run clean
if (Test-Path out/) {
    Write-Host "FAIL: out/ directory still exists" -ForegroundColor Red
    exit 1
}
Write-Host "PASS: out/ directory removed" -ForegroundColor Green

# Test 2: Build:Clean
Write-Host "`nTest 2: Build:clean creates fresh output" -ForegroundColor Yellow
pnpm run build:clean
if (-not (Test-Path out/extension.js)) {
    Write-Host "FAIL: out/extension.js not created" -ForegroundColor Red
    exit 1
}
Write-Host "PASS: Fresh build completed" -ForegroundColor Green

# Test 3 & 4: Package and verify hashes
Write-Host "`nTest 3: Prepublish hook triggers on package" -ForegroundColor Yellow
pnpm run clean  # Start from clean state
pnpm run vscode:package
if (-not (Test-Path python-ast-visualization-0.1.0.vsix)) {
    Write-Host "FAIL: VSIX not created" -ForegroundColor Red
    exit 1
}
Write-Host "PASS: VSIX created" -ForegroundColor Green

Write-Host "`nTest 4: Packaged code matches workspace code" -ForegroundColor Yellow
Remove-Item -Recurse -Force .vsix-test -ErrorAction SilentlyContinue
Expand-Archive python-ast-visualization-0.1.0.vsix .vsix-test -Force
$workspaceHash = (Get-FileHash out/extension.js -Algorithm MD5).Hash
$vsixHash = (Get-FileHash .vsix-test/extension/out/extension.js -Algorithm MD5).Hash
if ($workspaceHash -ne $vsixHash) {
    Write-Host "FAIL: Hashes don't match" -ForegroundColor Red
    Write-Host "  Workspace: $workspaceHash"
    Write-Host "  VSIX: $vsixHash"
    exit 1
}
Write-Host "PASS: Hashes match" -ForegroundColor Green

# Test 5: Feature presence
Write-Host "`nTest 5: Binary resolution logic present in VSIX" -ForegroundColor Yellow
$binaryResolverFound = (Select-String -Path .vsix-test/extension/out/extension.js -Pattern "binaryResolver").Count -gt 0
$resolvePathFound = (Select-String -Path .vsix-test/extension/out/extension.js -Pattern "resolveBinaryPath").Count -gt 0
if (-not $binaryResolverFound -or -not $resolvePathFound) {
    Write-Host "FAIL: Binary resolution logic not found" -ForegroundColor Red
    exit 1
}
Write-Host "PASS: Binary resolution logic present" -ForegroundColor Green

# Cleanup
Write-Host "`nCleaning up test artifacts..." -ForegroundColor Cyan
Remove-Item -Recurse -Force .vsix-test -ErrorAction SilentlyContinue

Write-Host "`n=== All Validation Tests Passed ===" -ForegroundColor Green
Write-Host "Next: Install VSIX manually and test functionality" -ForegroundColor Cyan
```

**Note**: This script is optional but recommended for future testing.

## Test Documentation

### Recording Test Results

Document test results in validation.md after execution:

```markdown
## Test Results

**Date**: YYYY-MM-DD  
**Tester**: [Name]  
**Environment**: Windows 10, Node 20.x, pnpm 8.x

| Test | Status | Notes |
|------|--------|-------|
| Test 1: Clean Script | ✅ PASS | out/ directory removed |
| Test 2: Build:Clean | ✅ PASS | Fresh build completed |
| Test 3: Prepublish Hook | ✅ PASS | Hook executed automatically |
| Test 4: Hash Comparison | ✅ PASS | Hashes match |
| Test 5: Feature Presence | ✅ PASS | Binary resolution found |
| Test 6: VSIX Functionality | ✅ PASS | Extension works correctly |
| Test 7: Python Tests | ✅ PASS | All tests passed |
| Test 8: TypeScript Tests | ✅ PASS | All tests passed |
| Test 9: Type Checking | ✅ PASS | No type errors |
| Test 10: Linting | ✅ PASS | No style violations |

**Overall Result**: ✅ ALL TESTS PASSED
```

## Test Success Criteria

The fix is considered validated when:

1. ✅ All 10 tests pass
2. ✅ No regressions introduced
3. ✅ VSIX installs and runs without errors
4. ✅ Exit code 9009 error eliminated
5. ✅ File hashes match between workspace and VSIX

## Test Failure Response

If any test fails:

1. **Build System Tests (1-5)**: Fix implementation, repeat Phase 1
2. **Functional Test (6)**: Investigate root cause, may need new bug report
3. **Regression Tests (7-10)**: Fix broken code, repeat Phase 3

**Do not proceed to next phase until all tests in current phase pass.**

## Long-Term Testing Enhancements (Phase 2)

Future improvements to testing workflow:

1. **Automated VSIX Testing**: Script that installs VSIX in clean VS Code and runs commands
2. **Integration with Feature Workflow**: Add VSIX testing to Task 12 of feature implementation
3. **CI/CD Integration**: Run validation tests in GitHub Actions (Phase 3)
4. **Performance Testing**: Measure build times, ensure clean builds acceptable
5. **Cross-Platform Testing**: Test on Windows, macOS, Linux

**Note**: Phase 2 enhancements are out of scope for this fix but documented for future reference.
