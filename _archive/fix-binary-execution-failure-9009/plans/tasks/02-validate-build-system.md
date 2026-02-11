# Task Implementation Plan: Validate Build System

## Overview

This task systematically validates that the build scripts added in Task 01 (`clean`, `build:clean`, `vscode:prepublish`) work correctly. This is a **validation-only task** that tests observable outcomes of the build automation infrastructure.

**Contribution to Fix**: Ensures the build automation mechanism functions correctly before packaging new VSIX files. Validates that clean builds remove stale artifacts and that the `vscode:prepublish` hook automatically triggers during packaging.

**Dependencies**: Task 01 must be complete (rimraf installed, scripts added to package.json)

**Task Type**: Black box testing / validation (tests observable outcomes, not internal implementation)

## Files to Create/Modify

### No Code Changes Required

This task does not modify any code files. It only **executes and validates** the scripts created in Task 01.

### Files to Monitor/Inspect

These files are observed during testing to verify outcomes:

1. **`out/` directory**
   - Created/deleted by build scripts
   - Location: `d:\Code\python-vis\out\`
   - Verification: Directory existence checks

2. **`out/extension.js`**
   - Compiled TypeScript for extension host
   - Location: `d:\Code\python-vis\out\extension.js`
   - Verification: File existence and content checks

3. **`out/media/webview.js`**
   - Bundled React + Rete.js webview code
   - Location: `d:\Code\python-vis\out\media\webview.js`
   - Verification: File existence checks

4. **`out/media/webview.css`**
   - Bundled Tailwind CSS for webview
   - Location: `d:\Code\python-vis\out\media\webview.css`
   - Verification: File existence checks

5. **`python-ast-visualization-0.1.0.vsix`**
   - Packaged extension file
   - Location: `d:\Code\python-vis\python-ast-visualization-0.1.0.vsix`
   - Verification: File creation during prepublish hook test

6. **Console Output**
   - Terminal output from build commands
   - Verification: Observe build progress during prepublish hook execution

## Test Strategy

**Testing Approach**: Validation-based black box testing

Since this task validates build automation (not application logic), we follow these principles:

1. **Observable Outcomes**: Test file creation/deletion, not internal script behavior
2. **Can Fail**: All tests can detect failures (broken scripts, missing dependencies)
3. **Black Box**: Test functionality, not implementation details
4. **Clear Criteria**: Each test has explicit pass/fail conditions

### Test Coverage

- ✅ **Clean script functionality** (Test 1)
- ✅ **Clean build functionality** (Test 2)
- ✅ **Prepublish hook execution** (Test 3)
- ✅ **No regressions** (Tests use existing functionality)

### Tests NOT Included

- ❌ Code hash comparison (deferred to Task 03)
- ❌ Binary resolution presence (deferred to Task 03)
- ❌ VSIX installation (deferred to Task 04)
- ❌ Full regression suite (deferred to Task 05)

This task focuses ONLY on build script functionality.

## Implementation Order

Execute these steps sequentially. **Stop and investigate if any test fails before proceeding to the next.**

### Step 1: Pre-Test Environment Verification

**Purpose**: Confirm Task 01 completed successfully and environment is ready for testing

**Actions**:
1. Verify rimraf is installed
2. Verify all three scripts exist in package.json
3. Verify Node packages are up to date

**Commands**:
```powershell
# Verify rimraf installed
pnpm list rimraf

# Verify scripts registered
pnpm run  # Should list clean, build:clean, vscode:prepublish

# Ensure dependencies current
pnpm install
```

**Expected Output**:
- `pnpm list rimraf`: Shows `rimraf@5.0.x`
- `pnpm run`: Lists all scripts including three new ones
- `pnpm install`: "Already up-to-date" or completes successfully

**Pass Criteria**:
- ✅ rimraf shows version 5.x.x
- ✅ All three new scripts listed
- ✅ No dependency warnings or errors

**Fail Actions**:
- If rimraf missing: Return to Task 01, run `pnpm install`
- If scripts missing: Return to Task 01, verify package.json modifications
- If dependency errors: Resolve errors before proceeding

---

### Step 2: Test 1 - Clean Script Removes Output Directory

**Purpose**: Validate that `pnpm run clean` successfully removes the `out/` directory

**Black Box Principle**: Tests observable outcome (directory deleted), not how rimraf works internally

**Setup**:
1. Ensure `out/` directory exists with content
2. If `out/` doesn't exist, create it: `pnpm run build`

**Execution**:
```powershell
# Verify out/ exists before test
Test-Path out/  # Should return True

# Execute clean script
pnpm run clean

# Verify out/ removed
Test-Path out/  # Should return False
```

**Expected Output**:
- Before: `Test-Path out/` returns `True`
- Command: `pnpm run clean` completes with exit code 0
- After: `Test-Path out/` returns `False`

**Pass Criteria**:
- ✅ `out/` directory existed before test
- ✅ Clean command completes without errors
- ✅ `out/` directory does not exist after test
- ✅ No file lock errors or permission issues

**Fail Scenarios & Actions**:

| Scenario | Symptoms | Action |
|----------|----------|--------|
| **Script not found** | "Unknown command: clean" | Return to Task 01, verify script added |
| **rimraf not found** | "rimraf: command not found" | Run `pnpm install`, verify rimraf installed |
| **Permission error** | "Access denied" or "Permission denied" | Close VS Code, retry (may have locked files) |
| **Directory remains** | `Test-Path out/` still returns True | Check for locked files, manually delete, investigate rimraf |

**Recovery Procedure**:
```powershell
# If test fails, manually verify
Get-ChildItem out/ -Recurse | Select-Object FullName  # List remaining files
Get-Process | Where-Object {$_.Path -like "*Code*"}    # Check for locking processes

# Manual cleanup if needed
Remove-Item out/ -Recurse -Force
```

---

### Step 3: Test 2 - Build:Clean Creates Fresh Output

**Purpose**: Validate that `pnpm run build:clean` performs clean build (delete + compile + bundle)

**Black Box Principle**: Tests observable outcome (files created from clean state), not build internals

**Setup**:
1. Start from clean state (no `out/` directory)
2. If `out/` exists, remove it: `pnpm run clean`

**Execution**:
```powershell
# Start from clean state
pnpm run clean
Test-Path out/  # Should return False

# Execute clean build
pnpm run build:clean

# Verify all expected output files created
Test-Path out/extension.js         # Should return True
Test-Path out/media/webview.js     # Should return True
Test-Path out/media/webview.css    # Should return True
```

**Expected Output**:
- Before: `out/` directory does not exist
- During: Console shows compilation and bundling progress
- After: All three expected files exist

**Console Output Indicators**:
```
> clean
> rimraf out

> build
> compile
[TypeScript compilation messages...]
> bundle-webview
[esbuild bundling messages...]
[Tailwind CSS processing messages...]
```

**Pass Criteria**:
- ✅ Started from clean state (no `out/` directory)
- ✅ Build command completes without errors
- ✅ `out/extension.js` exists (extension compiled)
- ✅ `out/media/webview.js` exists (webview bundled)
- ✅ `out/media/webview.css` exists (styles bundled)
- ✅ Files contain content (not empty)

**Fail Scenarios & Actions**:

| Scenario | Symptoms | Action |
|----------|----------|--------|
| **TypeScript compilation fails** | Syntax errors in console | Check for TypeScript errors, run `pnpm run compile` directly to diagnose |
| **Webview bundling fails** | esbuild errors in console | Check for React/import errors, run `pnpm run bundle-webview` directly |
| **Missing output files** | One or more files not created | Check which step failed (compile or bundle), investigate specific tool |
| **Empty output files** | Files exist but 0 bytes | Build partially failed, check console errors |

**Recovery Procedure**:
```powershell
# If test fails, diagnose each step individually
pnpm run compile          # Test TypeScript compilation alone
pnpm run bundle-webview   # Test webview bundling alone

# Check for missing dependencies
pnpm install

# Verify TypeScript and esbuild installed
pnpm list typescript
pnpm list esbuild
```

---

### Step 4: Test 3 - Prepublish Hook Triggers on Package

**Purpose**: Validate that `vscode:prepublish` hook automatically executes when running `pnpm run vscode:package`

**Black Box Principle**: Tests observable behavior (hook executes automatically), not VSCE internals

**Setup**:
1. Start from clean state (no `out/` directory)
2. Remove any existing VSIX file
3. This test proves prepublish runs automatically

**Execution**:
```powershell
# Start from clean state
pnpm run clean
Remove-Item python-ast-visualization-0.1.0.vsix -ErrorAction SilentlyContinue

# Verify clean state
Test-Path out/                                  # Should return False
Test-Path python-ast-visualization-0.1.0.vsix  # Should return False

# Execute package command (should trigger prepublish automatically)
pnpm run vscode:package

# Verify prepublish executed (created out/ directory and files)
Test-Path out/extension.js                     # Should return True
Test-Path python-ast-visualization-0.1.0.vsix  # Should return True
```

**Expected Console Output**:
```
> vscode:package
> vsce package

> vscode:prepublish (automatically triggered)
> npm run build:clean

> clean
> rimraf out

> build
> compile
[TypeScript compilation messages...]
> bundle-webview
[esbuild bundling messages...]

Executing prepublish script 'npm run build:clean'...
Done. Packaged: python-ast-visualization-0.1.0.vsix
```

**Key Observation**: The console MUST show build output BEFORE packaging starts. This proves the prepublish hook executed.

**Pass Criteria**:
- ✅ Started from clean state (no `out/` or VSIX)
- ✅ Console shows prepublish hook execution
- ✅ Console shows build steps (clean → compile → bundle)
- ✅ Build steps appear BEFORE packaging starts
- ✅ `out/extension.js` exists (proving prepublish ran)
- ✅ VSIX file created successfully
- ✅ No errors during build or packaging

**Fail Scenarios & Actions**:

| Scenario | Symptoms | Action |
|----------|----------|--------|
| **Hook doesn't run** | No build output in console, `out/` doesn't exist | Verify script name is exactly `vscode:prepublish` (colon, not underscore) |
| **Hook name typo** | Same as above | Check package.json, fix script name |
| **Build fails during hook** | Build errors, VSIX not created | Fix build errors using Test 2 diagnostics |
| **VSCE version outdated** | Hook not recognized | Check VSCE version: `pnpm list @vscode/vsce` (should be 3.7+) |
| **VSIX creates but out/ missing** | Hook didn't run | Test manually: `pnpm run vscode:prepublish`, investigate |

**Recovery Procedure**:
```powershell
# If hook doesn't run, verify configuration
Get-Content package.json | Select-String "vscode:prepublish"  # Must use colon

# Test hook manually
pnpm run vscode:prepublish  # Should run build:clean

# Check VSCE version
pnpm list @vscode/vsce  # Should be 3.7.1 or higher

# If VSCE outdated, update
pnpm update @vscode/vsce
```

---

### Step 5: Post-Test Validation

**Purpose**: Confirm all tests passed and document results

**Actions**:
1. Review test results
2. Verify all pass criteria met
3. Document any anomalies or warnings
4. Confirm environment ready for Task 03

**Validation Checklist**:
```powershell
# Verify clean script works
pnpm run clean
Test-Path out/  # Should return False ✅

# Verify build:clean works
pnpm run build:clean
Test-Path out/extension.js  # Should return True ✅

# Verify VSIX exists from prepublish test
Test-Path python-ast-visualization-0.1.0.vsix  # Should return True ✅

# All three tests successful
```

**Pass Criteria (Overall)**:
- ✅ Test 1 passed: Clean script removes `out/` directory
- ✅ Test 2 passed: Build:clean creates fresh output files
- ✅ Test 3 passed: Prepublish hook executes automatically
- ✅ No errors in any test
- ✅ Environment ready for Task 03

**If Any Test Failed**:
1. Do NOT proceed to Step 5
2. Investigate failure using recovery procedures
3. Fix underlying issue
4. Restart from Step 1 (re-validate environment)
5. Only proceed when ALL tests pass

---

## Validation Steps

These validation steps are embedded in the implementation order above (Steps 2-4). Each test includes its own pass/fail criteria and verification commands.

### Summary of Validation Commands

**Test 1 - Clean Script**:
```powershell
pnpm run clean
Test-Path out/  # Should return False
```

**Test 2 - Build:Clean Script**:
```powershell
pnpm run clean
pnpm run build:clean
Test-Path out/extension.js && Test-Path out/media/webview.js && Test-Path out/media/webview.css
# All should return True
```

**Test 3 - Prepublish Hook**:
```powershell
pnpm run clean
Remove-Item python-ast-visualization-0.1.0.vsix -ErrorAction SilentlyContinue
pnpm run vscode:package
# Observe console output for prepublish execution
Test-Path out/extension.js && Test-Path python-ast-visualization-0.1.0.vsix
# Both should return True
```

## Common Pitfalls to Avoid

### Pitfall 1: Skipping Pre-Test Verification

**Problem**: Assuming Task 01 completed correctly without verifying

**Impact**: Tests fail due to missing dependencies or scripts, not actual script functionality

**Prevention**: Always execute Step 1 (Pre-Test Environment Verification) first

---

### Pitfall 2: Not Starting from Clean State

**Problem**: Running tests with existing `out/` directory or VSIX files

**Impact**: Tests pass even if scripts broken (false positive)

**Prevention**: Each test explicitly cleans state before execution

---

### Pitfall 3: Ignoring Console Output

**Problem**: Only checking file existence, not observing build progress

**Impact**: Miss critical clues about why prepublish hook failed to execute

**Prevention**: Always observe console output during Test 3, look for build messages

---

### Pitfall 4: Testing Script Functionality Separately

**Problem**: Running `pnpm run clean`, `pnpm run build:clean`, `pnpm run vscode:prepublish` manually in isolation

**Impact**: Miss integration issues where scripts work individually but fail together

**Prevention**: Test 3 validates integration by testing automatic prepublish hook execution

---

### Pitfall 5: Accepting Partial Failures

**Problem**: "Test mostly worked" or "only one file missing"

**Impact**: Underlying issues remain, will cause problems in Task 03 or 04

**Prevention**: All pass criteria must be met. Investigate and fix any anomalies.

---

### Pitfall 6: VS Code File Locking

**Problem**: Clean script fails because VS Code has files open in extension host

**Impact**: Test 1 or Test 2 fails with permission errors

**Prevention**: Close VS Code or reload window before running tests

---

### Pitfall 7: Testing Beyond Scope

**Problem**: Trying to verify code quality, hashes, or VSIX functionality in this task

**Impact**: Scope creep, mixing validation concerns

**Prevention**: This task ONLY validates build script functionality. Other validations are in Tasks 03-05.

---

## Rollback Procedure

### This Task: No Rollback Needed

**Rationale**: This task does not modify any code or configuration files. It only tests existing functionality.

**If Tests Fail**: Investigate and fix the underlying issue (likely in Task 01 implementation)

### If Task 01 Needs Correction

If validation reveals issues with Task 01 implementation:

1. **Return to Task 01**:
   - Review Task 01 success criteria
   - Verify package.json modifications
   - Re-run `pnpm install` if dependency issues found

2. **Fix Issues**:
   - Correct script names (ensure `vscode:prepublish` uses colon)
   - Fix JSON syntax if errors found
   - Update dependencies if version issues found

3. **Re-validate Task 01**:
   - Run Task 01 validation steps again
   - Confirm all Task 01 success criteria met

4. **Restart Task 02**:
   - Begin from Step 1 (Pre-Test Environment Verification)
   - Execute all tests again

## Documentation Updates

### This Task: Minimal Documentation

**During Execution**: Update `.cursor/scratchpad.md` with progress

**After Completion**: Document test results for reference

### Updates Required

#### 1. Scratchpad Update

**File**: `.cursor/scratchpad.md`

**Update Location**: Per-Task Planning Phase section

**Content to Add**:
```markdown
**Task 02 Plan Created**: `_bugs/binary-execution-failure-9009/plans/tasks/02-validate-build-system.md`

**Validation Status**: Task 02 execution
- Test 1 (Clean Script): [PASS/FAIL]
- Test 2 (Build:Clean): [PASS/FAIL]
- Test 3 (Prepublish Hook): [PASS/FAIL]
- Overall: [COMPLETE/IN PROGRESS]
```

#### 2. Test Results Documentation (Optional)

For future reference, consider creating a test results log:

**File**: `_bugs/binary-execution-failure-9009/test-results.md` (optional)

**Content**:
```markdown
## Task 02 Validation Results

**Date**: 2026-02-11  
**Environment**: Windows 10, Node 20.x, pnpm 8.x

### Test 1: Clean Script
- **Status**: ✅ PASS
- **Command**: `pnpm run clean`
- **Result**: `out/` directory successfully removed
- **Duration**: < 1 second

### Test 2: Build:Clean Script
- **Status**: ✅ PASS
- **Command**: `pnpm run build:clean`
- **Result**: All output files created from clean state
- **Files**: `out/extension.js`, `out/media/webview.js`, `out/media/webview.css`
- **Duration**: ~15 seconds

### Test 3: Prepublish Hook
- **Status**: ✅ PASS
- **Command**: `pnpm run vscode:package`
- **Result**: Hook executed automatically, VSIX created
- **Observation**: Build output visible in console before packaging
- **Duration**: ~20 seconds

**Overall Result**: ✅ ALL TESTS PASSED
```

### No User-Facing Documentation Yet

**Rationale**: User-facing documentation (README, CHANGELOG) should only be updated after the complete fix is validated (all 5 tasks complete).

**Deferred to Later Tasks**:
- README.md updates - after Task 04 (VSIX functionality validated)
- CHANGELOG.md entry - after Task 05 (regression testing complete)

## Success Criteria

Task 02 is considered complete when ALL of the following are true:

**Environment Validation**:
- ✅ rimraf installed and version verified (5.x.x)
- ✅ All three scripts exist in package.json
- ✅ Scripts registered by pnpm (visible in `pnpm run`)

**Test 1 - Clean Script**:
- ✅ `out/` directory existed before test
- ✅ `pnpm run clean` completed without errors
- ✅ `out/` directory removed after test
- ✅ No permission or lock errors

**Test 2 - Build:Clean Script**:
- ✅ Started from clean state (no `out/`)
- ✅ `pnpm run build:clean` completed without errors
- ✅ `out/extension.js` created
- ✅ `out/media/webview.js` created
- ✅ `out/media/webview.css` created
- ✅ All files contain content (not empty)

**Test 3 - Prepublish Hook**:
- ✅ Started from clean state (no `out/` or VSIX)
- ✅ `pnpm run vscode:package` completed without errors
- ✅ Console showed prepublish hook execution
- ✅ Console showed build steps before packaging
- ✅ `out/` directory created by hook
- ✅ VSIX file created successfully
- ✅ No build or packaging errors

**Documentation**:
- ✅ Scratchpad updated with plan location and test results

**Overall**:
- ✅ All three tests passed
- ✅ No failures or anomalies
- ✅ Environment ready for Task 03

## Risk Assessment

**Overall Risk**: LOW

### Risk 1: File Locking by VS Code

**Probability**: Medium  
**Impact**: Low (easy workaround)  
**Mitigation**: Close VS Code or reload window before testing

### Risk 2: Permission Issues on Windows

**Probability**: Low  
**Impact**: Low (can manually delete and retry)  
**Mitigation**: Run terminal as administrator if needed, or manually clean `out/`

### Risk 3: Prepublish Hook Name Typo

**Probability**: Very Low (if Task 01 validated correctly)  
**Impact**: High (hook won't work, entire fix fails)  
**Mitigation**: Pre-test verification in Step 1 checks script names

### Risk 4: Build Failures Unrelated to Scripts

**Probability**: Low  
**Impact**: Medium (blocks progress)  
**Mitigation**: Diagnostic commands in failure recovery procedures

### Risk 5: VSCE Version Incompatibility

**Probability**: Very Low  
**Impact**: High (prepublish hook unsupported)  
**Mitigation**: Task 01 ensured `@vscode/vsce@^3.7.1` installed

## Time Estimate

**Estimated Duration**: 10-15 minutes

**Breakdown**:
- Step 1 (Pre-test verification): 2 minutes
- Step 2 (Test 1 - Clean): 1 minute
- Step 3 (Test 2 - Build:Clean): 3 minutes (includes compilation time)
- Step 4 (Test 3 - Prepublish): 5 minutes (includes packaging time)
- Step 5 (Post-test validation): 2 minutes
- Documentation: 2 minutes

**Contingency**: +10 minutes for troubleshooting if any test fails

**Notes**:
- Build times may vary based on system performance
- First build after `pnpm install` may take longer (dependency resolution)
- Packaging time depends on VSIX size and disk speed

## Next Task

After completing this task and verifying all success criteria:

**Proceed to**: Task 03 - Package and Verify VSIX

**File**: `_bugs/binary-execution-failure-9009/tasks/03-package-and-verify-vsix.md`

**Dependencies**: Task 03 requires:
- Task 01 complete (scripts and rimraf installed)
- Task 02 complete (build system validated)
- VSIX file created during Task 02 Test 3 can be used or recreated

**What Task 03 Will Do**:
- Verify packaged code matches workspace code (file hash comparison)
- Verify binary resolution logic present in VSIX
- Validate VSIX structure and contents

**Note**: The VSIX file created during Test 3 of this task can be used for Task 03, or Task 03 may create a fresh VSIX. Either approach is valid.
