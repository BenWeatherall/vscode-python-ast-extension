# Validation Plan: Binary Execution Failure (9009)

## Validation Overview

This document defines how to verify the fix resolves the bug and prevents future occurrences. Validation follows the testing plan (see `testing.md`) with additional verification steps.

## Pre-Validation Checklist

Before beginning validation, ensure:

- ✅ Implementation completed per `implementation.md`
- ✅ All build system tests passed (Tests 1-5 from `testing.md`)
- ✅ All regression tests passed (Tests 7-10 from `testing.md`)
- ✅ VSIX file created: `python-ast-visualization-0.1.0.vsix`

## Validation Phases

### Phase 1: Fix Verification

**Goal**: Confirm the bug is resolved

#### Step 1.1: Verify Prepublish Hook Installation

**Action**: Inspect `package.json`

**Check**:
```json
{
  "scripts": {
    "vscode:prepublish": "npm run build:clean"
  }
}
```

**Expected**: Hook present with correct script reference

**Validation**: ✅ Script exists and references `build:clean`

---

#### Step 1.2: Verify Clean Script Installation

**Action**: Inspect `package.json`

**Check**:
```json
{
  "scripts": {
    "clean": "rimraf out",
    "build:clean": "npm run clean && npm run build"
  }
}
```

**Expected**: Both scripts present

**Validation**: ✅ Scripts exist with correct commands

---

#### Step 1.3: Verify rimraf Dependency

**Action**: Check `package.json` devDependencies

**Check**:
```json
{
  "devDependencies": {
    "rimraf": "^5.0.0"
  }
}
```

**Expected**: rimraf listed in devDependencies

**Validation**: ✅ Dependency present

**Verification Command**:
```bash
pnpm list rimraf
```

Expected output: `rimraf 5.0.x`

---

#### Step 1.4: Test Prepublish Automation

**Purpose**: Prove prepublish hook runs automatically

**Test Sequence**:
1. Delete `out/` directory: `pnpm run clean`
2. Verify deleted: `Test-Path out/` should be False
3. Run package: `pnpm run vscode:package`
4. Verify recreated: `Test-Path out/` should be True
5. Verify VSIX created: `Test-Path python-ast-visualization-0.1.0.vsix` should be True

**Expected Behavior**: `out/` directory recreated automatically during packaging

**Validation**: ✅ Prepublish hook executes automatically

---

#### Step 1.5: Verify VSIX Contains Current Code

**Purpose**: Confirm packaged code matches workspace

**Test Sequence**:
1. Extract VSIX:
   ```powershell
   Expand-Archive python-ast-visualization-0.1.0.vsix .vsix-validation -Force
   ```

2. Compare file hashes:
   ```powershell
   $workspace = (Get-FileHash out/extension.js -Algorithm MD5).Hash
   $vsix = (Get-FileHash .vsix-validation/extension/out/extension.js -Algorithm MD5).Hash
   Write-Host "Workspace: $workspace"
   Write-Host "VSIX:      $vsix"
   Write-Host "Match:     $($workspace -eq $vsix)"
   ```

**Expected Result**: Hashes match exactly

**Validation**: ✅ VSIX contains current compiled code

---

#### Step 1.6: Verify Binary Resolution in VSIX

**Purpose**: Confirm fix feature present in packaged code

**Test**:
```powershell
# Check for binaryResolver import
Select-String -Path .vsix-validation/extension/out/extension.js -Pattern "binaryResolver" | Select-Object -First 1

# Check for resolveBinaryPath call
Select-String -Path .vsix-validation/extension/out/extension.js -Pattern "resolveBinaryPath" | Select-Object -First 1

# Check for PythonClient with argument
Select-String -Path .vsix-validation/extension/out/extension.js -Pattern "new.*PythonClient\(" | Select-Object -First 1
```

**Expected Results**:
- `binaryResolver` import found
- `resolveBinaryPath` function call found
- `PythonClient` constructor called with argument

**Validation**: ✅ Binary resolution logic present in VSIX

---

### Phase 2: Functional Validation

**Goal**: Confirm extension works when installed from VSIX

#### Step 2.1: Install VSIX in Clean Environment

**Purpose**: Test installation in environment similar to end user

**Setup**:
1. Open VS Code with clean profile:
   ```bash
   code --profile-temp
   ```
   OR
2. Use existing VS Code instance (if confident)

**Installation**:
1. View → Extensions (Ctrl+Shift+X)
2. Click "..." menu → Install from VSIX
3. Select `python-ast-visualization-0.1.0.vsix`
4. Click "Install" when prompted
5. Reload window when prompted (click "Reload Now")

**Expected Behavior**: Installation completes without errors

**Validation**: ✅ Extension installed successfully

---

#### Step 2.2: Verify Extension Activation

**Purpose**: Confirm extension activates without errors

**Test**:
1. View → Output (Ctrl+Shift+U)
2. Select "Python AST Visualization" from dropdown
3. Check for activation errors

**Expected**: No error messages about missing binaries or exit codes

**Validation**: ✅ Extension activates cleanly

---

#### Step 2.3: Test Visualization Command

**Purpose**: Reproduce original bug scenario and verify fix

**Test Sequence**:
1. Open Python file: `File → Open File` → `tests/test_placeholder.py`
   
   OR create test file:
   ```python
   def greet(name):
       return f"Hello, {name}!"
   
   result = greet("World")
   ```

2. Run command: Ctrl+Shift+P → Type "Visualize AST" → Enter

3. Observe results:
   - Webview panel should open
   - Graph should render
   - No error messages

**Expected Behavior**:
- ✅ Webview opens with title "Python AST"
- ✅ Graph displays with nodes (FunctionDef, Name, Call, etc.)
- ✅ No error banner in webview
- ✅ No error messages in VS Code corner

**Failure Indicators** (if these occur, fix failed):
- ❌ Error: "Service unavailable: process exited with code 9009"
- ❌ Error: "Python service error"
- ❌ No webview opens
- ❌ Webview shows error banner

**Validation**: ✅ Visualization completes successfully

---

#### Step 2.4: Test Interactive Features

**Purpose**: Verify full extension functionality

**Test**:
1. Click a node in the graph
2. Verify source navigation works (editor jumps to line)
3. Modify Python file and save
4. Verify auto-refresh updates graph

**Expected**: All features work correctly

**Validation**: ✅ Extension fully functional

---

#### Step 2.5: Check Output Channel Logs

**Purpose**: Verify no hidden errors or warnings

**Test**:
1. View → Output
2. Select "Python AST Visualization"
3. Review logs for:
   - ✅ No exit code 9009
   - ✅ No "Service unavailable" errors
   - ✅ No "binary not found" warnings (optional warning is acceptable)

**Expected**: Logs show successful operations, no critical errors

**Validation**: ✅ No error logs present

---

### Phase 3: Regression Validation

**Goal**: Ensure fix doesn't break existing functionality

#### Step 3.1: Development Mode Still Works

**Purpose**: Confirm F5 debug workflow unchanged

**Test**:
1. Close VS Code used for VSIX testing
2. Open workspace in VS Code: `code .`
3. Press F5 to start debugging
4. Open Python file in debug host
5. Run "Visualize AST" command

**Expected**: Extension works in development mode (should work as before)

**Validation**: ✅ Development workflow unaffected

---

#### Step 3.2: Build Scripts Work Independently

**Purpose**: Verify scripts can be run manually if needed

**Tests**:
```bash
# Test compile
pnpm run compile
# Expected: TypeScript compiles, no errors

# Test bundle-webview
pnpm run bundle-webview
# Expected: Webview bundled, no errors

# Test build
pnpm run build
# Expected: Full build completes, no errors

# Test clean
pnpm run clean
# Expected: out/ directory removed

# Test build:clean
pnpm run build:clean
# Expected: Clean build completes, no errors
```

**Validation**: ✅ All scripts work independently

---

#### Step 3.3: Watch Mode Unaffected

**Purpose**: Confirm development workflow not impacted

**Test**:
1. Run: `pnpm run watch`
2. Modify `src/extension.ts` (add comment)
3. Save file
4. Check: `out/extension.js` updated (timestamp changes)
5. Stop watch: Ctrl+C

**Expected**: Watch mode compiles on changes as before

**Validation**: ✅ Watch mode works correctly

---

#### Step 3.4: Test Suite Passes

**Purpose**: Confirm no regressions in tests

**Tests**:
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

**Expected**: All tests pass, no failures

**Validation**: ✅ Test suite passes completely

---

### Phase 4: Edge Case Validation

**Goal**: Verify fix handles edge cases

#### Step 4.1: Package Without Manual Build

**Purpose**: Prove prepublish hook prevents stale artifacts

**Test Sequence**:
1. Modify `src/extension.ts` (add comment to line 1):
   ```typescript
   // Test change for validation
   ```
2. Do NOT run `pnpm run build`
3. Run: `pnpm run vscode:package`
4. Extract new VSIX
5. Check: Comment present in `extension/out/extension.js`

**Expected**: Comment present (proves fresh compilation during packaging)

**Validation**: ✅ Prepublish hook compiles even without manual build

---

#### Step 4.2: Package After Partial Build

**Purpose**: Verify clean step removes partial artifacts

**Test Sequence**:
1. Compile only: `pnpm run compile`
2. Delete webview output: `Remove-Item out/media/webview.js`
3. Run: `pnpm run vscode:package`
4. Extract VSIX
5. Check: `extension/out/media/webview.js` exists

**Expected**: Webview file present (proves clean build recreates all artifacts)

**Validation**: ✅ Clean build prevents partial artifacts

---

#### Step 4.3: Multiple Sequential Packages

**Purpose**: Verify prepublish hook reliable across multiple runs

**Test**:
```bash
pnpm run vscode:package
pnpm run vscode:package
pnpm run vscode:package
```

**Expected**: All three succeed, each package contains current code

**Validation**: ✅ Prepublish hook reliable and repeatable

---

## Validation Completion Checklist

Mark each item when validated:

### Implementation Validation
- [ ] vscode:prepublish hook installed
- [ ] clean script installed
- [ ] build:clean script installed
- [ ] rimraf dependency installed
- [ ] Prepublish hook runs automatically
- [ ] VSIX contains current code
- [ ] Binary resolution present in VSIX

### Functional Validation
- [ ] VSIX installs successfully
- [ ] Extension activates without errors
- [ ] Visualization command works
- [ ] No exit code 9009 error
- [ ] Interactive features work
- [ ] No error logs present

### Regression Validation
- [ ] Development mode works
- [ ] Build scripts work independently
- [ ] Watch mode unaffected
- [ ] Test suite passes (Python + TypeScript)
- [ ] Type checking passes
- [ ] Linting passes

### Edge Case Validation
- [ ] Package without manual build works
- [ ] Clean build removes partial artifacts
- [ ] Multiple sequential packages work

## Validation Success Criteria

The fix is considered **validated and complete** when:

1. ✅ All checklist items marked complete
2. ✅ No exit code 9009 error occurs
3. ✅ VSIX contains current code (verified by hash)
4. ✅ Extension works when installed from VSIX
5. ✅ No regressions introduced
6. ✅ Prepublish hook prevents future stale artifacts

## Validation Failure Response

If any validation step fails:

### Build System Failures (Phase 1)
- Review implementation.md
- Check for typos in script names
- Verify rimraf installed correctly
- Re-run implementation steps

### Functional Failures (Phase 2)
- If exit code 9009 still occurs: New root cause, create new bug report
- If different error: Investigate separately
- If feature missing: Check compilation logs

### Regression Failures (Phase 3)
- Fix broken tests (per development_practices.mdc)
- Review changes for unintended side effects
- Ensure no files accidentally modified

### Edge Case Failures (Phase 4)
- Review prepublish hook configuration
- Check VSCE version compatibility
- Verify clean script works correctly

## Post-Validation Actions

After successful validation:

1. **Update Documentation**:
   - Update `.cursor/scratchpad.md` with completion status
   - Document fix in CHANGELOG.md
   - Update README.md if packaging workflow documented

2. **Clean Up**:
   - Delete validation extraction: `Remove-Item -Recurse -Force .vsix-validation`
   - Delete old VSIX (if kept for comparison)
   - Commit changes with descriptive message

3. **Archival**:
   - Move investigation and research to permanent location
   - Keep plan documents for future reference
   - Update bug tracking system (if applicable)

4. **Knowledge Sharing**:
   - Document lesson learned in project documentation
   - Share fix approach with team
   - Update development practices if needed

## Prevention Verification

**Long-term Goal**: Ensure this bug cannot recur

**Verification**:
- ✅ Prepublish hook makes it impossible to package stale artifacts
- ✅ Clean builds prevent partial artifacts
- ✅ No manual steps required
- ✅ Works in CI/CD pipelines (when implemented)
- ✅ Self-documenting (standard npm lifecycle hook)

**Future Work** (Phase 2 & 3):
- Add VSIX functionality testing to feature workflow
- Implement CI/CD pipeline for automated builds
- Add monitoring/alerting for build failures

## Validation Sign-Off

**Validated By**: [Name]  
**Date**: [YYYY-MM-DD]  
**Result**: [ ] PASS / [ ] FAIL  
**Notes**: [Any observations or issues]

---

## Validation Test Results Template

Use this template to record results:

```markdown
## Validation Results: Binary Execution Failure (9009)

**Date**: YYYY-MM-DD  
**Validator**: [Name]  
**Environment**: Windows 10, Node 20.x, pnpm 8.x, VS Code 1.80.x

### Phase 1: Fix Verification
| Step | Status | Notes |
|------|--------|-------|
| 1.1: Prepublish hook installed | ✅ PASS | Hook present in package.json |
| 1.2: Clean scripts installed | ✅ PASS | Scripts present |
| 1.3: rimraf dependency | ✅ PASS | rimraf 5.0.5 installed |
| 1.4: Prepublish automation | ✅ PASS | Hook runs automatically |
| 1.5: VSIX contains current code | ✅ PASS | Hashes match |
| 1.6: Binary resolution in VSIX | ✅ PASS | Logic present |

### Phase 2: Functional Validation
| Step | Status | Notes |
|------|--------|-------|
| 2.1: VSIX installation | ✅ PASS | Installed without errors |
| 2.2: Extension activation | ✅ PASS | No errors in output |
| 2.3: Visualization command | ✅ PASS | Graph displays correctly |
| 2.4: Interactive features | ✅ PASS | Navigation and refresh work |
| 2.5: Output channel logs | ✅ PASS | No exit code 9009 |

### Phase 3: Regression Validation
| Step | Status | Notes |
|------|--------|-------|
| 3.1: Development mode | ✅ PASS | F5 debug works |
| 3.2: Build scripts | ✅ PASS | All scripts work |
| 3.3: Watch mode | ✅ PASS | Compiles on save |
| 3.4: Test suite | ✅ PASS | All tests pass |

### Phase 4: Edge Case Validation
| Step | Status | Notes |
|------|--------|-------|
| 4.1: Package without manual build | ✅ PASS | Prepublish compiles |
| 4.2: Package after partial build | ✅ PASS | Clean build recreates all |
| 4.3: Multiple sequential packages | ✅ PASS | Repeatable and reliable |

### Overall Result
**Status**: ✅ ALL VALIDATION PASSED  
**Bug Resolved**: Yes  
**Prevention Verified**: Yes  
**Ready for Release**: Yes
```
