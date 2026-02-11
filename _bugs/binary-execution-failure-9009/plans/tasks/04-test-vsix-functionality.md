# Task Implementation Plan: Test VSIX Functionality

## Overview

This task performs **end-to-end functional testing** of the packaged VSIX to validate that the bug fix works in the real-world scenario: installing the extension from VSIX and running the "Visualize AST" command. This is the most critical validation because it tests the exact failure scenario described in the original bug report.

**Contribution to Fix**: Confirms that the bug is actually fixed from the user's perspective. The original symptom was "Service unavailable: process exited with code 9009" when running the command after installing from VSIX. This task verifies that symptom is eliminated and the extension functions correctly.

**Dependencies**: 
- Task 01 complete (build scripts and rimraf installed)
- Task 02 complete (build system validated)
- Task 03 complete (VSIX packaged and verified to contain current code)
- VSIX file exists: `python-ast-visualization-0.1.0.vsix`

**Task Type**: Black box functional testing (tests user-facing behavior, not internals)

## Files to Create/Modify

### No Code Changes Required

This task does not modify any source code or configuration. It only **installs and tests** the packaged extension.

### Files to Observe/Inspect

These outputs and logs are observed during testing to verify functionality:

1. **VS Code Extension View**
   - Extension installation status
   - Extension activation state
   - Extension version display

2. **VS Code Command Palette**
   - Availability of "Visualize AST" command
   - Command execution status

3. **VS Code Webview Panel**
   - Webview creation and rendering
   - AST graph display
   - Error banners (should not appear)

4. **VS Code Output Channel** (`Python AST Visualization`)
   - Service startup logs
   - Parse operation logs
   - Error messages (exit code 9009 should NOT appear)

5. **VS Code Notification Area**
   - Error notifications (should not appear)
   - Success indicators

6. **Test Python File** (`tests/test_placeholder.py` or custom test file)
   - Python source code to visualize
   - Location: `d:\Code\python-vis\tests\test_placeholder.py`

## Test Strategy

**Testing Approach**: Black box functional testing with manual execution in real VS Code environment

This task follows development practices for black box testing:
1. **User-facing behavior**: Test as if you're an end user installing and using the extension
2. **Observable outcomes**: Graph displays, no errors, extension works normally
3. **Can fail**: Tests can detect the original bug (exit code 9009) and other failures
4. **Clear criteria**: Explicit pass/fail conditions based on original bug symptoms

### Test Coverage

- ✅ **VSIX installation** (Test 1)
- ✅ **Command availability** (Test 2)
- ✅ **Extension functionality** (Test 3 - PRIMARY TEST)
- ✅ **Output log verification** (Test 4)
- ✅ **Alternative file testing** (Test 5 - optional but recommended)

### Tests NOT Included

- ❌ Automated VSIX testing (no infrastructure exists - planned for Phase 2)
- ❌ Regression testing of existing features (deferred to Task 05)
- ❌ Performance testing
- ❌ Cross-platform testing (testing on current platform only)

This task focuses ONLY on validating the bug fix: no exit code 9009 error.

### Black Box Testing Principles

All tests follow black box principles per `.cursor/rules/development_practices.mdc`:
1. **Test outcomes, not internals**: Don't check internal state, check what user sees
2. **Observable behavior**: Test graph display, error messages, extension activation
3. **Can fail**: All tests can detect failures if bug not fixed
4. **No internal checks**: Don't check for internal function calls or logs about internals

## Implementation Order

Execute these steps sequentially. **This is a manual testing task requiring human observation.**

### Step 1: Pre-Test Preparation

**Purpose**: Ensure environment is ready for testing and decide on testing approach

**Decision Point: Clean Profile vs Current Profile**

**Option A - Clean Profile (Recommended)**:
- **Pros**: No interference from other extensions, clean test environment, closer to user experience
- **Cons**: Requires creating temporary directories, slightly more setup
- **Use when**: You want highest confidence in test results

**Option B - Current Profile (Simpler)**:
- **Pros**: Faster setup, can keep extension installed for continued testing
- **Cons**: May have interference from other extensions or settings
- **Use when**: You need quick validation or iterative testing

**Commands for Option A (Clean Profile)**:
```powershell
# Launch VS Code with clean temporary profile
code --user-data-dir temp-profile --extensions-dir temp-extensions
```

**Commands for Option B (Current Profile)**:
```powershell
# Just launch VS Code normally
code .
```

**Expected Outcome**:
- VS Code launches
- If using clean profile: No extensions installed initially
- If using current profile: Existing extensions present

**Pass Criteria**:
- ✅ VS Code launches successfully
- ✅ Testing approach selected and documented

**Preparation Checklist**:
- [ ] VSIX file exists: `python-ast-visualization-0.1.0.vsix`
- [ ] Test Python file exists: `tests/test_placeholder.py` (or create one)
- [ ] VS Code launched with chosen profile approach
- [ ] Testing approach documented for results

---

### Step 2: Test 1 - Install VSIX in VS Code

**Purpose**: Install the extension from VSIX file and verify installation succeeds

**Black Box Principle**: Tests user-facing installation behavior, not internal installation mechanics

**Setup**:
1. VS Code open (from Step 1)
2. VSIX file accessible in workspace root
3. Test file ready for later steps

**Execution (Manual Steps)**:
1. Open Extensions view: Press `Ctrl+Shift+X` or click Extensions icon in Activity Bar
2. Click "..." (three dots) menu in Extensions view header
3. Select "Install from VSIX..."
4. Navigate to workspace root: `d:\Code\python-vis\`
5. Select file: `python-ast-visualization-0.1.0.vsix`
6. Click "Open" to begin installation
7. Wait for installation to complete
8. Observe installation progress in notification area
9. When prompted, click "Reload" to reload VS Code window

**Expected Behavior**:
- File picker opens to workspace root
- VSIX file appears in file list
- Installation begins after selecting file
- Progress notification appears: "Installing extension..."
- Success notification appears: "Extension 'Python AST Visualization' v0.1.0 was successfully installed. Please reload to enable it."
- Reload button appears in notification

**Expected Output (Extensions View)**:
- Extension appears in extensions list
- Extension name: "Python AST Visualization"
- Extension version: "0.1.0"
- Extension status: "Install" button changes to "Installed" or shows reload indicator

**Pass Criteria**:
- ✅ File picker opened successfully
- ✅ VSIX file visible and selectable
- ✅ Installation started (progress notification)
- ✅ Installation completed (success notification)
- ✅ No installation errors
- ✅ VS Code reloaded successfully
- ✅ Extension appears in extensions list

**Fail Scenarios & Actions**:

| Scenario | Symptoms | Action |
|----------|----------|--------|
| **VSIX not found** | File picker doesn't show VSIX | Verify VSIX exists, check file path, ensure Task 03 completed |
| **Installation error** | Error notification during install | Check VS Code version (requires 1.80+), check VSIX integrity, review error message |
| **Extension not listed** | Extension doesn't appear after reload | Check Extensions view filter (show installed), verify installation succeeded |
| **Version mismatch** | Wrong version shown | Check if old version already installed, uninstall and retry |

**Recovery Procedure (If Installation Fails)**:
```powershell
# Check VSIX file exists and is not corrupted
Test-Path python-ast-visualization-0.1.0.vsix
Get-Item python-ast-visualization-0.1.0.vsix | Select-Object Length, LastWriteTime

# Check VSIX file hash (should match Task 03 result)
Get-FileHash python-ast-visualization-0.1.0.vsix -Algorithm SHA256

# If VSIX missing or corrupted, re-run Task 03
pnpm run clean
pnpm run vscode:package
```

**Troubleshooting Tips**:
- If VS Code won't reload, manually reload: `Ctrl+Shift+P` → "Developer: Reload Window"
- If extension doesn't appear, check "Show Installed Extensions" filter
- If installation fails with "invalid VSIX", VSIX may be corrupted - re-package
- If version conflict, uninstall existing version first

**Documentation During Test**:
Record in test results:
- [ ] Installation method: Option A (clean profile) or Option B (current profile)
- [ ] Installation outcome: Success / Failure
- [ ] Any error messages encountered
- [ ] Time taken for installation
- [ ] VS Code version used

---

### Step 3: Test 2 - Verify Command Available

**Purpose**: Confirm the "Visualize AST" command is registered and available in command palette

**Black Box Principle**: Tests command availability (user-facing), not internal command registration

**Setup**:
1. Extension installed from Test 1
2. VS Code reloaded and ready

**Execution (Manual Steps)**:
1. Open Command Palette: Press `Ctrl+Shift+P` or `F1`
2. Type: "Visualize AST"
3. Observe command appears in list
4. Note command full name: "Visualize AST"
5. DO NOT execute yet (will test in next step)
6. Press `Esc` to close command palette

**Expected Behavior**:
- Command palette opens
- Typing "Visualize" filters to show command
- Command appears: "Visualize AST"
- Command shows extension name in parentheses (may show "Python AST Visualization")

**Expected Output (Command Palette)**:
```
> Visualize AST
  Python AST Visualization: Visualize AST
```

**Pass Criteria**:
- ✅ Command palette opened
- ✅ Command "Visualize AST" appears in list
- ✅ Command searchable by typing "visualize" or "ast"
- ✅ No error messages

**Fail Scenarios & Actions**:

| Scenario | Symptoms | Action |
|----------|----------|--------|
| **Command not found** | "Visualize AST" doesn't appear | Extension may not be activated, check Extensions view for activation |
| **Extension not activated** | Extension shows but no command | Open Output channel, check for activation errors |
| **Wrong command name** | Different command appears | Verify extension is correct version, check package.json |

**Recovery Procedure (If Command Not Available)**:
1. Check extension activation:
   - Open Extensions view (`Ctrl+Shift+X`)
   - Find "Python AST Visualization"
   - Check if extension is enabled (toggle should be on)
   
2. Check for activation errors:
   - Open Output channel: `Ctrl+Shift+U` or View → Output
   - Select "Python AST Visualization" from dropdown
   - Look for error messages about activation failures

3. Manual activation attempt:
   - Open any Python file (extension activates on Python files)
   - Try opening command palette again

4. If still failing:
   - Open Developer Tools: `Help` → `Toggle Developer Tools`
   - Check Console tab for JavaScript errors
   - Look for errors related to extension activation

**Troubleshooting Tips**:
- Extensions activate on specific triggers (Python AST Visualization activates on command or Python file)
- If command doesn't appear, try opening a `.py` file first to trigger activation
- Check that extension is not disabled or in error state
- Verify no other extension is conflicting with same command name

**Documentation During Test**:
Record in test results:
- [ ] Command found: Yes / No
- [ ] Command name as displayed
- [ ] Any activation issues encountered
- [ ] Time taken to verify

---

### Step 4: Test 3 - Execute Command and Verify Functionality (PRIMARY TEST)

**Purpose**: Execute the "Visualize AST" command and verify no exit code 9009 error occurs

**THIS IS THE CRITICAL TEST THAT VALIDATES THE BUG FIX**

**Black Box Principle**: Tests user-facing behavior (graph displays, no errors), not internal service behavior

**Setup**:
1. Extension installed and command available
2. Test Python file ready: `tests/test_placeholder.py` or create custom test file

**Test File Preparation** (if creating custom file):
```python
# test_ast_visualization.py
def example_function(x, y):
    """Simple function for testing AST visualization."""
    result = x + y
    return result

# Simple statement
value = example_function(10, 20)
print(f"Result: {value}")
```

**Execution (Manual Steps)**:
1. Open Python file in editor:
   - Open Explorer: `Ctrl+Shift+E`
   - Navigate to `tests/test_placeholder.py`
   - OR open custom test file created above
   - File opens in editor

2. Execute "Visualize AST" command:
   - Press `Ctrl+Shift+P` to open command palette
   - Type "Visualize AST"
   - Press `Enter` to execute command

3. **CRITICAL OBSERVATION POINT**: Watch for errors immediately after execution:
   - NO notification should appear saying "Service unavailable: process exited with code 9009"
   - NO error banner should appear in webview

4. Observe webview panel opens:
   - New panel appears on the side or below editor
   - Panel title: "Python AST: [filename]"
   - Webview content loads

5. Observe graph displays:
   - Loading indicator appears briefly
   - Graph nodes appear in webview
   - Graph is interactive (can drag nodes)

6. Verify no errors in Output channel:
   - Open Output: `Ctrl+Shift+U` or View → Output
   - Select "Python AST Visualization" from dropdown
   - Scan for error messages, especially "exit code 9009"

**Expected Behavior (Success - Bug Fixed)**:
- Command executes immediately
- Webview panel opens within 1-2 seconds
- Loading indicator shows briefly
- Graph displays with nodes representing AST elements
- No error notifications appear
- No error banner in webview
- Output channel shows successful parse operation

**Expected Output (Output Channel - Success)**:
```
[Timestamp] Python service started
[Timestamp] Parsing Python file: d:\Code\python-vis\tests\test_placeholder.py
[Timestamp] Parse successful: X nodes generated
```

**Expected Output (Webview - Success)**:
- Graph canvas visible
- Nodes displayed with labels (e.g., "Module", "FunctionDef", "Assign")
- Connections between nodes (lines showing relationships)
- Interactive UI (can drag nodes, zoom, pan)
- No error banner or error message

**Pass Criteria (Success Indicators)**:
- ✅ Command executed without errors
- ✅ Webview panel opened
- ✅ Graph displayed in webview
- ✅ **NO error notification: "Service unavailable: process exited with code 9009"**
- ✅ **NO error message in Output channel about exit code 9009**
- ✅ **NO error banner in webview**
- ✅ Extension activated successfully
- ✅ Python service started successfully
- ✅ Graph is interactive (can drag nodes)

**Fail Criteria (Bug NOT Fixed)**:
- ❌ Error notification: "Service unavailable: process exited with code 9009"
- ❌ Error message in Output: "process exited with code 9009"
- ❌ Webview shows error banner: "Python service error"
- ❌ Webview doesn't open at all
- ❌ Webview opens but blank (no graph)
- ❌ Extension fails to activate

**Fail Scenarios & Actions**:

| Scenario | Symptoms | Root Cause | Action |
|----------|----------|------------|--------|
| **Exit code 9009** (Original bug) | Error notification with 9009 | Binary resolution still missing or broken | **CRITICAL**: Bug fix failed - return to Task 03, verify hash comparison |
| **Webview doesn't open** | Command runs but no panel | Webview bundle issue or activation failure | Check if `out/media/webview.js` exists, check Output for errors |
| **Blank webview** | Panel opens but empty | Webview code not loaded or crashed | Check Developer Tools console, look for JavaScript errors |
| **Python syntax error** | Error message about syntax | Test file has invalid Python | Fix Python syntax in test file, retry |
| **Service not starting** | Error about service unavailable | Python service binary issue | Check if binary exists, check if Python installed |
| **Graph displays incorrectly** | Graph malformed or missing nodes | NOT the bug we're fixing | If graph displays at all, bug is fixed (graph issues are separate) |

**Recovery Procedure (If Exit Code 9009 Occurs - CRITICAL FAILURE)**:

**This means the bug fix did NOT work. Follow these steps:**

1. **Verify Tasks 01-03 completion**:
   ```powershell
   # Check prepublish hook exists
   Get-Content package.json | Select-String "vscode:prepublish"
   
   # Check workspace and VSIX hashes (should match from Task 03)
   $workspaceHash = (Get-FileHash out/extension.js -Algorithm MD5).Hash
   $vsixHash = (Get-FileHash .vsix-extracted-test/extension/out/extension.js -Algorithm MD5).Hash
   
   Write-Host "Workspace: $workspaceHash"
   Write-Host "VSIX: $vsixHash"
   Write-Host "Match: $($workspaceHash -eq $vsixHash)"
   ```

2. **If hashes matched in Task 03 but still failing**:
   - New root cause discovered (not stale artifacts)
   - Extract VSIX and manually inspect `extension/out/extension.js`
   - Search for binary resolution code: `Select-String -Path .vsix-extracted-test/extension/out/extension.js -Pattern "resolveBinaryPath" -Context 2,2`
   - Check if binary exists: `Test-Path .vsix-extracted-test/extension/bin/python_service-win-x64.exe`

3. **If hashes didn't match in Task 03**:
   - Task 03 verification failed
   - Return to Task 03 and re-run all tests
   - Fix hash mismatch issue before proceeding

4. **Check Output channel for detailed error**:
   - Open Output: View → Output
   - Select "Python AST Visualization"
   - Look for error message with details about failure
   - Screenshot error for investigation

5. **Create new investigation if different issue**:
   - If error is NOT related to binary resolution, this is a new bug
   - Document error details
   - Create new bug report
   - Current bug fix (9009) may still be valid but exposed different issue

**Recovery Procedure (If Webview Doesn't Open)**:

1. **Check Developer Tools**:
   - Open: `Help` → `Toggle Developer Tools`
   - Console tab: Look for JavaScript errors
   - Look for errors about webview creation or loading

2. **Check webview bundle exists**:
   ```powershell
   Test-Path out/media/webview.js
   Test-Path .vsix-extracted-test/extension/out/media/webview.js
   ```

3. **Check extension activation**:
   - Output channel for activation errors
   - Extensions view for extension status

4. **This is NOT the bug we're fixing**:
   - If webview issue but NO exit code 9009, the original bug is FIXED
   - Webview issue is separate problem
   - Document and report separately if needed

**Troubleshooting Tips**:
- The ONLY failure that means bug NOT fixed is exit code 9009
- Other errors may be separate issues (webview, parsing, etc.)
- Graph display issues don't mean bug not fixed (as long as no 9009)
- If unsure, check Output channel for "exit code 9009" specifically

**Documentation During Test**:
Record in test results (THIS IS THE MOST IMPORTANT TEST):
- [ ] Command executed: Yes / No
- [ ] Webview opened: Yes / No
- [ ] Graph displayed: Yes / No
- [ ] **Exit code 9009 error: Yes / No** ← CRITICAL
- [ ] Error messages in Output channel: [List any errors]
- [ ] Screenshots of success or failure
- [ ] Time taken for graph to display

**Screenshots to Take**:
1. Webview with graph displayed (success case)
2. Output channel showing successful parse (success case)
3. Error notification if it appears (failure case)
4. Output channel with error details (failure case)

---

### Step 5: Test 4 - Verify Output Logs

**Purpose**: Review Output channel to confirm no exit code 9009 errors and service started correctly

**Black Box Principle**: Tests observable logs (what user can see), not internal logging mechanisms

**Setup**:
1. Test 3 completed (command executed)
2. Webview may be open or closed (doesn't matter)

**Execution (Manual Steps)**:
1. Open Output panel: Press `Ctrl+Shift+U` or View → Output
2. Select "Python AST Visualization" from dropdown (if not already selected)
3. Review logs from most recent command execution
4. Scan for key indicators:
   - Service startup messages
   - Parse operation messages
   - **Absence of "exit code 9009"**
   - **Absence of "process exited"**
   - Success indicators

5. Scroll through entire log to check for any errors

**Expected Log Contents (Success)**:
```
Python service started successfully
Parsing file: d:\Code\python-vis\tests\test_placeholder.py
Parse completed successfully
Generated [X] nodes and [Y] connections
```

**Logs Should NOT Contain**:
- ❌ "exit code 9009"
- ❌ "process exited with code"
- ❌ "Service unavailable"
- ❌ "Binary not found"
- ❌ "Failed to start Python service"

**Pass Criteria**:
- ✅ Output channel accessible
- ✅ "Python AST Visualization" channel exists
- ✅ Logs show service started
- ✅ Logs show parse operations
- ✅ **NO "exit code 9009" in logs**
- ✅ **NO "process exited" errors in logs**
- ✅ No other critical errors

**Fail Criteria**:
- ❌ "exit code 9009" appears anywhere in logs
- ❌ "process exited" errors in logs
- ❌ "Service unavailable" errors
- ❌ No logs at all (service may not have started)

**Fail Scenarios & Actions**:

| Scenario | Symptoms | Action |
|----------|----------|--------|
| **Exit code 9009 in logs** | Log shows "process exited with code 9009" | Bug NOT fixed - see Test 3 recovery procedure |
| **No logs at all** | Output channel empty | Extension may not be logging, check activation |
| **Service start errors** | Errors about service startup | Binary issue or Python issue, investigate separately |
| **Parse errors** | Syntax errors | Test file issue, not bug we're fixing |

**Recovery Procedure (If Exit Code 9009 in Logs)**:
- Same as Test 3 recovery procedure
- This confirms the bug is NOT fixed
- Return to investigation phase

**Troubleshooting Tips**:
- Logs persist between commands - make sure you're looking at recent entries
- Timestamps help identify which logs are from current test
- If logs show parse errors but NOT exit code 9009, bug is fixed (parse errors are separate)
- Output channel may auto-clear on reload - take screenshots if needed

**Documentation During Test**:
Record in test results:
- [ ] Output channel accessible: Yes / No
- [ ] Logs contain service startup: Yes / No
- [ ] Logs contain parse operations: Yes / No
- [ ] **Exit code 9009 found: Yes / No** ← CRITICAL
- [ ] Other errors found: [List]
- [ ] Screenshot of output logs taken: Yes / No

---

### Step 6: Test 5 - Test with Different Python File (Optional but Recommended)

**Purpose**: Confirm fix works consistently across different Python files (not just test_placeholder.py)

**Black Box Principle**: Tests behavior with different inputs, not internal parsing logic

**Setup**:
1. Tests 1-4 completed successfully
2. Create or use different Python file

**Test File Examples**:

**Example 1: Simple Function**
```python
# test_ast_simple.py
def greet(name):
    return f"Hello, {name}!"

result = greet("World")
```

**Example 2: Class Definition**
```python
# test_ast_class.py
class Calculator:
    def add(self, a, b):
        return a + b
    
    def multiply(self, a, b):
        return a * b

calc = Calculator()
sum_result = calc.add(5, 3)
```

**Example 3: More Complex Code**
```python
# test_ast_complex.py
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# List comprehension
squares = [x**2 for x in range(10)]

# With statement
with open('temp.txt', 'w') as f:
    f.write("test")
```

**Execution (Manual Steps)**:
1. Create new Python file (use one of examples above or your own)
2. Save file in workspace
3. With file open in editor, run "Visualize AST" command
4. Observe same success criteria as Test 3:
   - Webview opens
   - Graph displays
   - No exit code 9009 error
   - No errors in Output

5. Optional: Test with 2-3 different files to increase confidence

**Expected Behavior**:
- Same success as Test 3 for each file tested
- Different graph structures (reflecting different Python code)
- Consistent behavior (no intermittent failures)

**Pass Criteria**:
- ✅ Command works with different Python files
- ✅ Graph displays for each file tested
- ✅ No exit code 9009 for any file
- ✅ Consistent behavior across files

**Fail Criteria**:
- ❌ Works for one file but not others (intermittent issue)
- ❌ Exit code 9009 appears for any file
- ❌ Inconsistent behavior

**Why This Test Matters**:
- Confirms fix is robust, not file-specific
- Catches issues that might only appear with certain code patterns
- Increases confidence in fix before proceeding to Task 05

**Fail Scenarios & Actions**:

| Scenario | Symptoms | Action |
|----------|----------|--------|
| **Works for some files, not others** | Intermittent failures | May be parsing issue specific to code patterns, investigate |
| **Exit code 9009 on specific file** | Error on one file but not others | Unlikely to be binary resolution issue, investigate specific file |
| **All files fail** | No files work | Same as Test 3 failure - bug not fixed |

**Documentation During Test**:
Record in test results:
- [ ] Number of files tested: [Count]
- [ ] Files tested: [List filenames]
- [ ] Success for all files: Yes / No
- [ ] Any files that failed: [List]
- [ ] Consistent behavior: Yes / No

**Time Investment**:
- Testing 1 additional file: +2 minutes
- Testing 3 additional files: +5 minutes
- Recommended: Test at least 1 additional file for confidence

---

### Step 7: Post-Test Summary and Results Documentation

**Purpose**: Document test results, generate summary report, and determine overall pass/fail status

**Actions**:
1. Review all test results
2. Determine overall outcome: BUG FIXED or BUG NOT FIXED
3. Document findings
4. Generate summary report
5. Clean up test environment (if using clean profile)

**Summary Report Template**:

Create or update test results document:

**File**: `_bugs/binary-execution-failure-9009/test-results.md` (create if doesn't exist)

**Content**:
```markdown
## Task 04 - VSIX Functionality Testing

**Test Date**: [Date]  
**Test Time**: [Time]  
**Tester**: [Your Name]  
**VS Code Version**: [Version - e.g., 1.85.0]  
**Testing Approach**: [Clean Profile / Current Profile]

---

### Test Environment

- **VSIX File**: `python-ast-visualization-0.1.0.vsix`
- **VSIX Size**: [Size in MB]
- **Test Platform**: Windows 10
- **VS Code Profile**: [Clean temporary / Current user profile]

---

### Test Results

| Test | Description | Result | Notes |
|------|-------------|--------|-------|
| Test 1 | Install VSIX in VS Code | ✅ PASS | Extension installed successfully, reload completed |
| Test 2 | Verify Command Available | ✅ PASS | "Visualize AST" command found in palette |
| Test 3 | Execute Command & Verify Functionality | ✅ PASS | **NO exit code 9009 error**, graph displayed correctly |
| Test 4 | Verify Output Logs | ✅ PASS | **NO exit code 9009 in logs**, service started successfully |
| Test 5 | Test with Different Files | ✅ PASS | Tested 2 additional files, consistent behavior |

---

### Critical Findings

**Original Bug Status: ✅ FIXED**

- **Original Symptom**: "Service unavailable: process exited with code 9009" when running "Visualize AST" after VSIX installation
- **Test Result**: **NO exit code 9009 error occurred**
- **Graph Display**: Graphs displayed successfully for all test files
- **Extension Functionality**: Extension works as expected in development mode

---

### Detailed Test Observations

#### Test 3 - Primary Validation (Critical)

**Python File Tested**: `tests/test_placeholder.py`

**Execution Results**:
- ✅ Command executed immediately
- ✅ Webview panel opened within 1 second
- ✅ Graph displayed with [X] nodes
- ✅ Graph interactive (nodes draggable)
- ✅ **NO error notification appeared**
- ✅ **NO error banner in webview**

**Output Channel Logs**:
```
[Timestamp] Python service started successfully
[Timestamp] Parsing file: d:\Code\python-vis\tests\test_placeholder.py
[Timestamp] Parse completed successfully
[Timestamp] Generated [X] nodes and [Y] connections
```

**Critical Check**: **NO "exit code 9009" found in logs** ✅

#### Test 5 - Additional Files (Optional)

**Files Tested**:
1. `test_ast_simple.py` - Simple function - ✅ Success
2. `test_ast_class.py` - Class definition - ✅ Success

**Consistency**: All files displayed graphs correctly, no errors

---

### Screenshots

[Attach screenshots if taken]:
- Screenshot 1: Webview with graph displayed
- Screenshot 2: Output channel showing successful operation
- Screenshot 3: Extensions view showing installed extension

---

### Overall Assessment

**BUG FIX VALIDATION: ✅ SUCCESS**

The bug "Service unavailable: process exited with code 9009" has been successfully fixed. The extension now works correctly when installed from VSIX, with binary resolution logic properly included in the packaged extension.

**Ready to Proceed**: ✅ Yes - Ready for Task 05 (Regression Testing)

---

### Time Metrics

- Test 1 (Installation): [Time]
- Test 2 (Command Check): [Time]
- Test 3 (Functionality): [Time]
- Test 4 (Logs): [Time]
- Test 5 (Additional Files): [Time]
- **Total Test Duration**: [Total Time]

---

### Next Steps

- Proceed to Task 05: Run Regression Tests
- Keep VSIX file for potential further testing
- Clean up test environment if using temporary profile

---

### Notes

[Any additional observations, anomalies, or comments]
```

**Alternative Outcome - If Bug NOT Fixed**:

If Test 3 or Test 4 showed exit code 9009:

```markdown
## Task 04 - VSIX Functionality Testing

**Test Date**: [Date]  
**Test Time**: [Time]  
**Tester**: [Your Name]  
**VS Code Version**: [Version]  
**Testing Approach**: [Clean Profile / Current Profile]

---

### Test Results

| Test | Description | Result | Notes |
|------|-------------|--------|-------|
| Test 1 | Install VSIX in VS Code | ✅ PASS | Extension installed successfully |
| Test 2 | Verify Command Available | ✅ PASS | Command found in palette |
| Test 3 | Execute Command & Verify Functionality | ❌ FAIL | **EXIT CODE 9009 ERROR OCCURRED** |
| Test 4 | Verify Output Logs | ❌ FAIL | Exit code 9009 found in logs |
| Test 5 | Test with Different Files | ⏭️ SKIPPED | Did not proceed due to Test 3 failure |

---

### Critical Findings

**Original Bug Status: ❌ NOT FIXED**

- **Original Symptom**: "Service unavailable: process exited with code 9009"
- **Test Result**: **Exit code 9009 ERROR STILL OCCURS**
- **Bug Fix**: FAILED - The bug is NOT fixed

---

### Error Details

**Error Notification**:
```
Service unavailable: process exited with code 9009
```

**Output Channel Error**:
```
[Timestamp] Python service started
[Timestamp] Error: process exited with code 9009
[Timestamp] Service unavailable
```

**Root Cause Investigation Needed**:
- Return to Task 03 and verify hash comparison results
- Verify prepublish hook actually ran during packaging
- Check if binary resolution logic is actually present in VSIX
- Investigate if there's a different root cause than originally identified

---

### Required Actions

1. **Do NOT proceed to Task 05**
2. **Return to Task 03**: Re-verify hash comparison
3. **Check VSIX contents**: Manually inspect extracted VSIX
4. **Investigate new root cause**: If hash matched but still failing, different issue
5. **Update bug investigation**: Document new findings
6. **Re-plan fix approach**: May need different solution

---

### Next Steps

- STOP current bug fix workflow
- Return to investigation phase
- Document new findings
- Determine if original root cause hypothesis was correct
- Create new plan if different root cause identified

---
```

**Pass Criteria (Overall Task)**:
- ✅ All 5 tests executed (or 4 if Test 5 skipped)
- ✅ Test 3 (primary) PASSED: No exit code 9009
- ✅ Test 4 (logs) PASSED: No exit code 9009 in logs
- ✅ Summary report created
- ✅ Overall status: BUG FIXED

**Fail Criteria (Overall Task)**:
- ❌ Test 3 FAILED: Exit code 9009 occurred
- ❌ Test 4 FAILED: Exit code 9009 in logs
- ❌ Overall status: BUG NOT FIXED

**Clean Up (If Using Clean Profile)**:

After successful testing with clean profile:

```powershell
# Clean up temporary profile directories
Remove-Item -Recurse -Force temp-profile -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force temp-extensions -ErrorAction SilentlyContinue
```

**Keep Artifacts**:
- Keep VSIX file for Task 05 or future reference
- Keep test results documentation
- Keep screenshots

---

## Validation Steps

Validation steps are embedded in the implementation order above (Steps 2-6). Each test includes its own pass/fail criteria.

### Quick Validation Checklist

After completing all tests, verify:

**Installation (Test 1)**:
```
[ ] VSIX installed successfully
[ ] Extension appears in extensions list
[ ] VS Code reloaded without errors
```

**Command Availability (Test 2)**:
```
[ ] "Visualize AST" command found in palette
[ ] Command is searchable
```

**Functionality (Test 3 - CRITICAL)**:
```
[ ] Command executed successfully
[ ] Webview panel opened
[ ] Graph displayed in webview
[ ] NO error notification appeared
[ ] NO "exit code 9009" error
[ ] NO error banner in webview
```

**Output Logs (Test 4 - CRITICAL)**:
```
[ ] Output channel accessible
[ ] Logs show service started
[ ] NO "exit code 9009" in logs
[ ] NO "process exited" errors
```

**Additional Files (Test 5 - Optional)**:
```
[ ] Tested additional files
[ ] Consistent behavior
[ ] No errors with any file
```

**Overall**:
```
[ ] All critical tests passed
[ ] BUG IS FIXED (no exit code 9009)
[ ] Summary report created
[ ] Ready for Task 05
```

## Common Pitfalls to Avoid

### Pitfall 1: Not Observing Carefully During Test 3

**Problem**: Executing command and immediately checking Output logs without watching for notification

**Impact**: Miss the actual error notification that appears for < 5 seconds

**Prevention**: Watch notification area in bottom-right corner during command execution

---

### Pitfall 2: Confusing Other Errors with Exit Code 9009

**Problem**: Seeing parse errors or webview errors and thinking bug not fixed

**Impact**: False negative - bug might be fixed but other issues present

**Prevention**: Only "exit code 9009" means bug not fixed. Other errors are separate issues.

---

### Pitfall 3: Testing in Development Mode Instead of VSIX

**Problem**: Pressing F5 to debug instead of installing VSIX

**Impact**: Tests development environment, not packaged VSIX (bug might still exist in VSIX)

**Prevention**: Must install from VSIX file, not run in debug mode

---

### Pitfall 4: Using Old VSIX File

**Problem**: Installing VSIX from previous build, not from Task 03

**Impact**: Testing old buggy VSIX, not new fixed one

**Prevention**: Verify VSIX timestamp matches Task 03 packaging time

---

### Pitfall 5: Accepting Partial Success

**Problem**: "Graph displayed but with some errors"

**Impact**: May miss critical failure indicators

**Prevention**: If ANY error related to exit code 9009, bug is NOT fixed

---

### Pitfall 6: Not Testing with Different Files

**Problem**: Only testing with one file (test_placeholder.py)

**Impact**: Miss issues that only appear with certain code patterns

**Prevention**: Test with at least 2-3 different Python files (Test 5)

---

### Pitfall 7: Skipping Output Log Review

**Problem**: Only checking for visual errors, not checking logs

**Impact**: Miss errors that logged but didn't show notification

**Prevention**: Always check Output channel in Test 4

---

### Pitfall 8: Not Documenting Results

**Problem**: "Bug is fixed" without detailed documentation

**Impact**: No record of testing, can't reference later, can't prove fix works

**Prevention**: Always create summary report with detailed findings

---

## Rollback Procedure

### This Task: No Rollback Needed

**Rationale**: This task does not modify any code or configuration. It only tests the packaged extension.

**If Bug NOT Fixed**: Do not rollback - instead:
1. Document failure in test results
2. Return to investigation phase
3. Verify Tasks 01-03 were completed correctly
4. Investigate why fix didn't work
5. Determine if different root cause or implementation issue

### Uninstalling Extension (If Needed)

If you need to uninstall the extension for any reason:

**Manual Uninstall**:
1. Open Extensions view: `Ctrl+Shift+X`
2. Find "Python AST Visualization"
3. Click gear icon → Uninstall
4. Reload VS Code when prompted

**Command Line Uninstall**:
```powershell
# List installed extensions to find extension ID
code --list-extensions

# Uninstall (use actual extension ID)
code --uninstall-extension publisher.python-ast-visualization
```

## Documentation Updates

### This Task: Update Scratchpad and Create Test Results

**Primary Documentation**: `.cursor/scratchpad.md`

**Update Content**:
```markdown
**Task 04 Plan Created**: `_bugs/binary-execution-failure-9009/plans/tasks/04-test-vsix-functionality.md`

**Task 04 Execution Status**: COMPLETE

**Test Results Summary**:
- ✅ Test 1: Install VSIX - PASS
- ✅ Test 2: Verify Command Available - PASS
- ✅ Test 3: Execute Command & Verify Functionality - PASS (NO EXIT CODE 9009)
- ✅ Test 4: Verify Output Logs - PASS (NO EXIT CODE 9009 IN LOGS)
- ✅ Test 5: Test with Different Files - PASS

**Critical Finding**: ✅ BUG FIXED - No "exit code 9009" error occurred

**Testing Approach**: [Clean Profile / Current Profile]
**Test Date**: [Date]
**VS Code Version**: [Version]

**Overall Status**: Task 04 COMPLETE - Ready for Task 05 (Regression Tests)
```

**Secondary Documentation**: `_bugs/binary-execution-failure-9009/test-results.md`

Create detailed test results report as shown in Step 7.

### No User-Facing Documentation Yet

**Rationale**: User-facing documentation (README, CHANGELOG) only updated after ALL tasks complete (including Task 05 regression testing).

**Deferred to Task 05**:
- README.md updates
- CHANGELOG.md entry
- Release notes
- Documentation of fix

## Success Criteria

Task 04 is considered complete when ALL of the following are true:

**Test Environment**:
- ✅ Testing approach selected and documented (clean profile or current profile)
- ✅ VSIX file exists and used for installation
- ✅ VS Code launched and ready for testing
- ✅ Test Python file prepared

**Test 1 - Installation**:
- ✅ VSIX installed successfully in VS Code
- ✅ Extension appears in extensions list
- ✅ Extension version correct (0.1.0)
- ✅ VS Code reloaded successfully
- ✅ No installation errors

**Test 2 - Command Availability**:
- ✅ "Visualize AST" command found in command palette
- ✅ Command is searchable by typing
- ✅ Extension activated successfully

**Test 3 - Functionality (CRITICAL)**:
- ✅ Command executed successfully
- ✅ Webview panel opened
- ✅ Graph displayed in webview
- ✅ **NO error notification appeared**
- ✅ **NO "exit code 9009" error**
- ✅ **NO error banner in webview**
- ✅ Graph is interactive
- ✅ Extension functions as expected

**Test 4 - Output Logs (CRITICAL)**:
- ✅ Output channel accessible
- ✅ Logs show service started
- ✅ Logs show parse operations
- ✅ **NO "exit code 9009" in logs**
- ✅ **NO "process exited" errors**
- ✅ No critical errors in logs

**Test 5 - Additional Files (Recommended)**:
- ✅ Tested with at least 1 additional file
- ✅ Consistent behavior across files
- ✅ No errors with any file

**Documentation**:
- ✅ Test results documented in scratchpad
- ✅ Detailed test results report created
- ✅ Screenshots taken (if applicable)
- ✅ Overall status determined: BUG FIXED or BUG NOT FIXED

**Overall**:
- ✅ All critical tests passed (Tests 3 and 4)
- ✅ **BUG IS FIXED**: No exit code 9009 error occurred
- ✅ Summary report generated
- ✅ Test environment cleaned (if using clean profile)
- ✅ Ready for Task 05

## Risk Assessment

**Overall Risk**: MEDIUM (manual testing, human observation required)

### Risk 1: Exit Code 9009 Still Occurs (Bug Not Fixed)

**Probability**: Low (if Tasks 01-03 validated correctly)  
**Impact**: CRITICAL (bug fix failed, must investigate)  
**Mitigation**: 
- Comprehensive recovery procedures documented
- Clear escalation path to re-investigation
- Hash comparison from Task 03 should have caught this

### Risk 2: Test Environment Issues

**Probability**: Low to Medium  
**Impact**: Medium (may give false results)  
**Mitigation**: 
- Option to test in clean profile (eliminates interference)
- Clear documentation of testing approach
- Repeatable test procedures

### Risk 3: Human Error During Manual Testing

**Probability**: Medium (manual testing prone to error)  
**Impact**: Medium (may miss errors or misinterpret results)  
**Mitigation**: 
- Detailed step-by-step procedures
- Clear pass/fail criteria
- Multiple checkpoints (Tests 3 and 4 both check for 9009)
- Documentation requirements force careful observation

### Risk 4: Intermittent Failures

**Probability**: Low  
**Impact**: High (hard to diagnose)  
**Mitigation**: 
- Test 5 uses multiple files to catch intermittent issues
- Can repeat tests if unsure
- Output logs provide evidence

### Risk 5: Other Bugs Exposed by Fix

**Probability**: Low to Medium  
**Impact**: Low (doesn't invalidate fix)  
**Mitigation**: 
- Clear distinction: only exit code 9009 matters for this bug
- Other errors documented separately
- Bug fix still valid even if other issues present

## Time Estimate

**Estimated Duration**: 15-25 minutes

**Breakdown**:
- Step 1 (Preparation): 2 minutes
- Step 2 (Test 1 - Installation): 3 minutes
- Step 3 (Test 2 - Command check): 2 minutes
- Step 4 (Test 3 - Functionality): 3 minutes
- Step 5 (Test 4 - Logs): 2 minutes
- Step 6 (Test 5 - Additional files): 5 minutes (optional)
- Step 7 (Summary): 3 minutes
- Documentation: 5 minutes

**Contingency**: +20 minutes if bug NOT fixed (investigation and recovery)

**Notes**:
- Clean profile setup adds ~2 minutes
- Taking screenshots adds ~2 minutes
- Testing multiple files (Test 5) adds ~2 minutes per file
- If bug NOT fixed, investigation can take significantly longer

**Total with Contingency**: 45 minutes maximum (including investigation if failure)

## Next Task

After completing this task and verifying all success criteria:

**If Bug Fixed (Expected)**:

**Proceed to**: Task 05 - Run Regression Tests

**File**: `_bugs/binary-execution-failure-9009/tasks/05-run-regression-tests.md`

**Dependencies**: Task 05 requires:
- Task 01 complete (build scripts)
- Task 02 complete (build validation)
- Task 03 complete (VSIX verified)
- Task 04 complete (bug fix validated)

**What Task 05 Will Do**:
- Run full Python test suite
- Run full TypeScript test suite
- Run linting and formatting checks
- Run type checking
- Ensure no regressions introduced by fix
- Final validation before considering bug fix complete

**If Bug NOT Fixed (Failure)**:

**DO NOT Proceed to Task 05**

**Required Actions**:
1. Document failure in detail
2. Return to Task 03 and re-verify hash comparison
3. Investigate why fix didn't work
4. Verify prepublish hook actually ran
5. Check if binary resolution logic actually present in VSIX
6. Determine if different root cause than originally identified
7. Update investigation documents with new findings
8. Create new fix plan if needed
9. Do NOT consider bug fix complete

---

## Manual Testing Notes

### Why Manual Testing?

This task requires **manual testing** because:

1. **VSIX Installation**: No automated way to install VSIX in VS Code from command line with verification
2. **Webview Rendering**: Requires real VS Code environment, can't be automated without complex test infrastructure
3. **User Experience Testing**: Need to verify actual user-facing behavior, not just API responses
4. **Visual Confirmation**: Need to see graph displays, error notifications, webview UI
5. **No Test Infrastructure**: No automated VSIX testing framework exists (planned for Phase 2)

### Manual Testing Best Practices

**During Testing**:
1. Take your time - don't rush through steps
2. Observe carefully, especially during Test 3
3. Take screenshots of key moments
4. Document everything as you go
5. If unsure, repeat the test
6. Better to over-document than under-document

**After Testing**:
1. Review all findings
2. Double-check critical results (exit code 9009)
3. Generate comprehensive summary
4. Save all artifacts (screenshots, logs)
5. Update all documentation

### Automation Plans (Phase 2 - Future)

After this bug fix is complete, consider adding:
1. Automated VSIX installation testing
2. Automated webview rendering tests
3. Integration tests for command execution
4. Automated screenshot comparison
5. CI/CD pipeline integration

But for now, manual testing is necessary and appropriate.

---

## Appendix: Quick Reference - What to Look For

### Success Indicators ✅

Look for these during Test 3:
- ✅ Command executes immediately (< 1 second)
- ✅ Webview panel opens (1-2 seconds)
- ✅ Loading indicator appears briefly
- ✅ Graph nodes appear in webview
- ✅ Graph is interactive (can drag)
- ✅ NO notifications in bottom-right corner
- ✅ NO red error banner in webview

Look for these in Test 4 (Output channel):
- ✅ "Python service started"
- ✅ "Parsing file: [path]"
- ✅ "Parse completed" or "Parse successful"
- ✅ "Generated X nodes"

### Failure Indicators ❌

Look for these during Test 3 (means bug NOT fixed):
- ❌ Error notification: "Service unavailable: process exited with code 9009"
- ❌ Error notification: "Python service error"
- ❌ Error banner in webview: "Service unavailable"
- ❌ Webview doesn't open at all
- ❌ Webview opens but blank

Look for these in Test 4 (means bug NOT fixed):
- ❌ "process exited with code 9009"
- ❌ "Service unavailable"
- ❌ "Failed to start Python service"
- ❌ "Binary not found"

### Quick Decision Tree

```
Command executed → Webview opened?
                    ├─ YES → Graph displayed?
                    │        ├─ YES → Check for errors?
                    │        │        ├─ NO ERRORS → ✅ BUG FIXED
                    │        │        └─ EXIT CODE 9009 → ❌ BUG NOT FIXED
                    │        └─ NO → Check Output for 9009?
                    │                 ├─ EXIT CODE 9009 → ❌ BUG NOT FIXED
                    │                 └─ OTHER ERROR → Different issue (document separately)
                    └─ NO → Check Output for 9009?
                             ├─ EXIT CODE 9009 → ❌ BUG NOT FIXED
                             └─ OTHER ERROR → Different issue (document separately)
```

**Key Point**: Only "exit code 9009" means the original bug is NOT fixed. Other errors are separate issues.
