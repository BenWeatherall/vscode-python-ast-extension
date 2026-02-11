# Root Cause Hypothesis

## Primary Hypothesis: Stale Compiled JavaScript in VSIX Package

### Evidence

1. **File Hash Mismatch**:
   - Workspace `out/extension.js`: `0AE99766249BF4B6BB62A505774D8B6F`
   - VSIX `extension/out/extension.js`: `567032C82D6B7BF78979DAC2D6F2B61E`
   - The files are different, indicating outdated compiled code in the VSIX

2. **Missing Binary Resolution Logic**:
   - Workspace version (lines 172-185): Contains full binary resolution with `resolveBinaryPath()`
   - VSIX version (line 159): Missing binary resolution, creates `PythonClient()` with no arguments
   - The VSIX version predates the implementation of binary resolution feature

3. **Missing Import Statement**:
   - Workspace version (line 9): `const binaryResolver_1 = require("./binaryResolver");`
   - VSIX version: No import of `binaryResolver` module
   - This confirms the compiled code is from before the binary resolution feature was added

4. **Exit Code 9009 Explanation**:
   - Without binary path, `PythonClient` falls back to `python -m python_service`
   - The `python_service` module is excluded from the VSIX package (`.vscodeignore` line 30)
   - Python cannot find the module and exits with error code 9009
   - Error message: "Service unavailable: process exited with code 9009"

5. **Development Mode Works**:
   - When running from source (F5 debug), TypeScript is compiled on-the-fly
   - The runtime uses the current, correct compiled code from `out/extension.js`
   - Binary resolution works correctly, binary is found and executed

## Chain of Events Leading to Failure

```
1. VSIX packaged with stale out/extension.js (missing binary resolution)
   ↓
2. User installs VSIX and runs "Visualize AST" command
   ↓
3. Extension activates, runs outdated activate() function
   ↓
4. activate() creates PythonClient() with no binary path argument
   ↓
5. PythonClient.binaryPath set to null
   ↓
6. User triggers visualization, calls pythonClient.spawnService()
   ↓
7. spawnService() uses fallback: command="python", args=["-m", "python_service"]
   ↓
8. Node.js spawn executes: python -m python_service
   ↓
9. Python interpreter cannot find python_service module (not in package)
   ↓
10. Process exits immediately with code 9009
    ↓
11. onExit handler rejects with error: "Service unavailable: process exited with code 9009"
    ↓
12. Error propagates to user as: "Python service error: Service unavailable..."
```

## How the Stale Code Ended Up in VSIX

### Most Likely Scenario

**Hypothesis**: The TypeScript code was not recompiled before packaging the VSIX.

**Timeline**:
1. Binary resolution feature was implemented in `src/extension.ts`
2. Developer tested in development mode (F5) - worked correctly
3. Developer ran `pnpm run build:python-binaries` to build the binary
4. Developer ran `pnpm run vscode:package` to create VSIX
5. **CRITICAL**: Did not run `pnpm run build` before packaging
6. VSIX packager included the stale `out/extension.js` from a previous compilation
7. VSIX was created with outdated compiled code but correct binary

### Package Script Analysis

From `package.json`:

```json
{
  "scripts": {
    "build": "npm run compile && npm run bundle-webview",
    "compile": "tsc -p .",
    "vscode:package": "vsce package"
  }
}
```

**Issue**: `vscode:package` does NOT automatically run `build` first.

**Expected Workflow**:
```bash
pnpm run build              # Compile TypeScript
pnpm run build:python-binaries  # Build binaries
pnpm run vscode:package     # Package VSIX
```

**Likely Actual Workflow**:
```bash
# (TypeScript compiled at some earlier time)
pnpm run build:python-binaries  # Built binaries
pnpm run vscode:package     # Packaged with STALE out/ directory
```

## Verification of Hypothesis

### Test 1: Recompile and Repackage

If the hypothesis is correct, running these commands should fix the issue:

```bash
pnpm run build              # Recompile TypeScript
pnpm run vscode:package     # Repackage VSIX
```

Expected result: New VSIX should work correctly.

### Test 2: Check Compilation Timestamp

Compare timestamps of source and compiled files:

- `src/extension.ts` - Last modified: ?
- `out/extension.js` - Last modified: ?

If `out/extension.js` is older than `src/extension.ts`, it confirms stale compilation.

### Test 3: Extract and Compare New VSIX

After recompiling and repackaging:

1. Extract new VSIX
2. Check MD5 hash of `extension/out/extension.js`
3. Should match workspace `out/extension.js` hash: `0AE99766249BF4B6BB62A505774D8B6F`
4. Verify `activate()` function includes binary resolution logic

## Alternative Hypotheses (Less Likely)

### Alternative 1: .vscodeignore Excludes Compiled Code

**Hypothesis**: The `.vscodeignore` file might be excluding the compiled code.

**Investigation**:
```
# .vscodeignore line 22-23
# Build artifacts (keep out/)
**/*.map
```

The comment "keep out/" suggests the `out/` directory should be included, not excluded. No explicit exclusion of `out/` directory.

**Conclusion**: ✗ Unlikely - Not the root cause

### Alternative 2: TypeScript Compilation Failure

**Hypothesis**: TypeScript compilation produced incorrect output.

**Evidence Against**:
- Workspace `out/extension.js` is correct and contains binary resolution logic
- TypeScript compiler would fail with errors if there were syntax issues
- Development mode (which uses the same compiled code) works correctly

**Conclusion**: ✗ Unlikely - Compilation works correctly; the issue is using stale artifacts

### Alternative 3: VSCE Package Bug

**Hypothesis**: The `vsce package` tool has a bug that corrupts or excludes files.

**Evidence Against**:
- Other files (binaryResolver.js, pythonClient.js) are packaged correctly
- Binary file is packaged correctly
- Only extension.js is affected
- Different file hashes suggest different file contents, not corruption

**Conclusion**: ✗ Unlikely - VSCE is working correctly; it's packaging the stale file it found

## Conclusion

**Confirmed Root Cause**: The VSIX package was created with stale compiled JavaScript code from `out/extension.js` that predates the binary resolution implementation. The packaging script does not automatically recompile TypeScript before packaging, leading to outdated code being included in the distributable extension.

**Confidence Level**: 95%

**Recommended Fix**: 
1. Recompile TypeScript: `pnpm run build`
2. Repackage VSIX: `pnpm run vscode:package`
3. Consider updating package script to automatically run `build` before packaging
