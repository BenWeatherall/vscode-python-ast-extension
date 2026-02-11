# Background

Tasks 01-03 implemented the build system fix and verified the VSIX contains current code with binary resolution logic. Now we must test the most critical validation: does the VSIX actually work when installed?

This is the **end-to-end functional test** that directly validates the bug is fixed. The original symptom was:
- Install extension from VSIX
- Run "Visualize AST" command
- Get error: `Service unavailable: process exited with code 9009`

This task verifies that symptom is eliminated and the extension functions correctly when installed from the new VSIX.

**Dependencies**: Task 03 must be completed (verified VSIX must exist)

# This Task

Install the new VSIX in VS Code and test that the extension works correctly without exit code 9009 errors.

## Testing Approach

Per `.cursor/rules/development_practices.mdc`, this is black box testing:
- Test user-facing behavior (extension functionality)
- Test observable outcomes (graph displays, no errors)
- Do NOT test internal implementation details
- Clear pass/fail criteria

## Testing Steps

### Preparation

**Note**: Testing in a clean VS Code profile is recommended to avoid interference from other extensions or settings, but not required.

**Option A - Clean Profile (Recommended)**:
```powershell
# Launch VS Code with clean profile
code --user-data-dir temp-profile --extensions-dir temp-extensions
```

**Option B - Current Profile (Simpler)**:
- Use current VS Code installation
- May have interference from other extensions, but faster

### Test 1: Install VSIX

1. Open VS Code (using chosen approach above)
2. Open Extensions view: `Ctrl+Shift+X`
3. Click "..." menu (three dots) in Extensions view
4. Select "Install from VSIX..."
5. Navigate to workspace root and select: `python-ast-visualization-0.1.0.vsix`
6. Wait for installation to complete
7. Click "Reload" when prompted

**Expected Result**: 
- Extension installs successfully
- No installation errors
- VS Code reloads

### Test 2: Verify Extension Activated

1. Open Command Palette: `Ctrl+Shift+P`
2. Type: "Visualize AST"
3. Command should appear in list

**Expected Result**: "Visualize AST" command is available

### Test 3: Test Extension Functionality (Primary Validation)

**This is the critical test that validates the bug fix.**

1. Open a Python file in the workspace:
   - Navigate to: `tests/test_placeholder.py`
   - OR use any Python file with valid syntax

2. Run the command:
   - Press: `Ctrl+Shift+P`
   - Type: "Visualize AST"
   - Press Enter

3. Observe behavior:
   - Webview panel should open
   - Python service should start (no exit code 9009)
   - AST graph should display in webview
   - No error messages in corner notification area

4. Check Output channel for errors:
   - Open Output panel: `Ctrl+Shift+U` or View → Output
   - Select "Python AST Visualization" from dropdown
   - Check for exit code 9009 or Python service errors

**Expected Result (Success Criteria)**:
- ✅ Webview panel opens
- ✅ AST graph displays in webview
- ✅ No error notification: "Service unavailable: process exited with code 9009"
- ✅ No Python service errors in Output channel
- ✅ Extension works normally

**Failure Indicators (Bug NOT Fixed)**:
- ❌ Error message: "Service unavailable: process exited with code 9009"
- ❌ Error message: "Python service error"
- ❌ Webview doesn't open
- ❌ Webview opens but shows error banner
- ❌ Output channel shows exit code 9009

### Test 4: Test with Different Python File (Optional)

To ensure consistency, test with another Python file:

1. Create a simple test file `test_ast.py`:
   ```python
   def example_function(x, y):
       return x + y
   
   result = example_function(1, 2)
   ```

2. Run "Visualize AST" command on this file
3. Verify graph displays without errors

**Expected Result**: Graph displays, no errors (confirms fix works on different files)

## Manual Testing vs Automation

**This task requires MANUAL testing** because:
- Extension must be installed in actual VS Code instance
- Webview rendering requires real VS Code environment
- No automated VSIX testing infrastructure exists (yet)

**Note**: Per the scratchpad, automated VSIX testing is planned for Phase 2 (future work).

## Acceptance Criteria

- ✅ VSIX installs without errors
- ✅ "Visualize AST" command available
- ✅ Extension activates when command run
- ✅ Webview panel opens
- ✅ AST graph displays correctly
- ✅ NO error: "Service unavailable: process exited with code 9009"
- ✅ NO Python service errors in Output channel
- ✅ Extension functions as expected in development mode

## Troubleshooting

### If VSIX Installation Fails

**Symptoms**: Installation error, VSIX not accepted

**Actions**:
1. Check VSIX file exists and is not corrupted
2. Check VS Code version compatible (requires 1.80.0+)
3. Try installing in clean profile
4. Review VS Code installation logs

### If Exit Code 9009 Still Occurs

**Symptoms**: Same error as original bug

**Possible Causes**:
- Binary resolution logic still missing (verify Task 03)
- Binary file not included (verify Task 03, Test 5)
- Different root cause than investigated

**Actions**:
1. Re-run Task 03 verifications (hash comparison, pattern search)
2. Check Output channel for detailed error message
3. Extract VSIX and manually inspect `out/extension.js` for binary resolution code
4. If hash matched in Task 03 but still fails, investigate new root cause
5. Create new bug report if different issue discovered

### If Webview Doesn't Open

**Symptoms**: Command runs but webview doesn't appear

**Possible Causes**:
- Extension activation failure
- Webview bundling issue
- Different bug (not related to binary resolution)

**Actions**:
1. Check Developer Tools: `Help → Toggle Developer Tools`
2. Look for JavaScript errors in console
3. Check if webview assets missing from VSIX
4. Test in development mode (F5) to compare behavior

### If Graph Displays Incorrectly

**Symptoms**: Webview opens but graph malformed or missing nodes

**This is NOT the bug we're fixing** - this task only validates the exit code 9009 issue is resolved.

**Action**: If graph displays at all (even incorrectly), the bug is FIXED. Graph display issues are separate bugs.

## Post-Test Cleanup

After successful testing:

1. **If using clean profile**: Delete temporary directories
   ```powershell
   Remove-Item -Recurse -Force temp-profile
   Remove-Item -Recurse -Force temp-extensions
   ```

2. **If using current profile**: Extension remains installed
   - Can uninstall manually if desired
   - Or keep for continued testing

## Documentation

Record test results with:
- Date and time of test
- VS Code version used
- Test approach (clean profile vs current profile)
- Test outcome for each step
- Screenshots if helpful (optional)

**Example**:
```
Test Date: 2026-02-11
VS Code Version: 1.85.0
Approach: Clean profile
Results:
- Test 1: ✅ PASS - VSIX installed successfully
- Test 2: ✅ PASS - Command available
- Test 3: ✅ PASS - Graph displayed, no exit code 9009
- Test 4: ✅ PASS - Works with different file
Overall: ✅ BUG FIXED
```

# Testing Needed

This task IS the testing task - it validates end-to-end functionality. Tests are documented above in "Testing Steps".

The validation follows black box testing principles:
- Tests user-facing behavior (extension usage)
- Tests observable outcomes (graph displays, no error messages)
- Does not test internal implementation
- Clear pass/fail criteria based on original bug symptom
