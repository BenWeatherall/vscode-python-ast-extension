# Root Cause Analysis: Binary Execution Failure (9009)

## Confirmed Root Cause

**Stale Compiled JavaScript in VSIX Package**: The VSIX was packaged with outdated `out/extension.js` that predates the binary resolution feature implementation.

## Evidence Chain

### Evidence 1: File Hash Mismatch

**Finding**: Compiled JavaScript files differ between workspace and VSIX.

**Data**:
- Workspace `out/extension.js`: MD5 hash `0AE99766249BF4B6BB62A505774D8B6F`
- VSIX `extension/out/extension.js`: MD5 hash `567032C82D6B7BF78979DAC2D6F2B61E`

**Conclusion**: The files are not identical, proving the VSIX contains different code than the workspace.

### Evidence 2: Missing Binary Resolution Logic

**Finding**: VSIX version lacks the binary resolution implementation.

**Workspace Code** (lines 172-185 of `out/extension.js`):
```javascript
let binaryPath = null;
try {
    binaryPath = resolveBinaryPath(context.extensionPath);
} catch {
    binaryPath = null;
}

if (!binaryPath) {
    const channel = getOutputChannel();
    channel.appendLine("Warning: Python service binary not found, using system Python");
}

pythonClient = new PythonClient(binaryPath);
```

**VSIX Code** (line 159 of extracted `out/extension.js`):
```javascript
pythonClient = new pythonClient_1.PythonClient();  // No binary path argument!
```

**Conclusion**: The VSIX activation code creates `PythonClient` without a binary path, confirming the code predates the feature.

### Evidence 3: Missing Import Statement

**Finding**: VSIX version does not import the `binaryResolver` module.

**Workspace Code** (line 9):
```javascript
const binaryResolver_1 = require("./binaryResolver");
```

**VSIX Code**: No such import statement exists.

**Conclusion**: Confirms the compiled code is from before `binaryResolver` was introduced.

### Evidence 4: Failure Chain Analysis

**Observed Behavior**:
1. User installs VSIX and runs "Visualize AST" command
2. Extension activates with stale `activate()` function
3. `PythonClient()` created without binary path argument
4. Service spawn falls back to `python -m python_service`
5. Python cannot find `python_service` module (excluded from VSIX by design)
6. Process exits immediately with code 9009
7. User sees error: "Service unavailable: process exited with code 9009"

**Conclusion**: The entire failure chain is caused by the missing binary path, which is caused by stale compiled code.

## Why Stale Code Ended Up in VSIX

### Build Script Analysis

**Current `package.json` scripts**:
```json
{
  "build": "npm run compile && npm run bundle-webview",
  "compile": "tsc -p .",
  "vscode:package": "vsce package"
}
```

**Issue**: `vscode:package` does NOT depend on `build`. There is no automatic compilation before packaging.

### Most Likely Scenario

**Timeline**:
1. Binary resolution feature implemented in `src/extension.ts`
2. Developer tested in development mode (F5) - TypeScript compiled on-the-fly, feature worked
3. Developer ran `pnpm run build:python-binaries` to build platform binaries
4. Developer ran `pnpm run vscode:package` to create VSIX
5. **Critical step missed**: Did not run `pnpm run build` before packaging
6. VSCE packaged the existing `out/` directory which contained stale artifacts
7. VSIX created with outdated code but correct binary files

### Root Cause Category

**Build Artifact Management Failure**: The build system relies on manual developer workflow to ensure artifacts are current. No automated verification or pre-packaging build step exists.

## Alternative Hypotheses Ruled Out

### Hypothesis: .vscodeignore Misconfiguration

**Claim**: Maybe `.vscodeignore` excluded compiled code.

**Investigation**: 
- `.vscodeignore` comment at line 22: "keep out/" 
- No explicit exclusion of `out/` directory
- Binary and other compiled files present in VSIX

**Verdict**: ✗ Ruled out - `.vscodeignore` is correctly configured.

### Hypothesis: TypeScript Compilation Failure

**Claim**: Maybe TypeScript compiler produced incorrect output.

**Investigation**:
- Workspace `out/extension.js` is correct and contains binary resolution
- Development mode works (uses same compiled code)
- No TypeScript compilation errors reported

**Verdict**: ✗ Ruled out - Compilation works correctly; issue is using stale artifacts.

### Hypothesis: VSCE Packaging Bug

**Claim**: Maybe `vsce package` has a bug corrupting or excluding files.

**Investigation**:
- Other files (binaryResolver.js, pythonClient.js) packaged correctly
- Binary file packaged correctly (~14.8 MB)
- Only extension.js affected
- File hash difference indicates different content, not corruption

**Verdict**: ✗ Ruled out - VSCE is working correctly, packaging the stale file it found.

## Supporting Evidence from Research

### Industry Standard: vscode:prepublish

From external research (`research/external-research.md`):
- Official VS Code extension guidelines recommend `vscode:prepublish` hook
- VSCE automatically executes this script before `vsce package` or `vsce publish`
- Standard pattern used across the VS Code extension ecosystem

**Implication**: Our project lacks this standard automation, making it vulnerable to stale artifact packaging.

### Similar Issue Patterns

From `research/similar-issues.md`:
- "Stale Compiled Output in Packaging" - recurring pattern in extensions
- "Missing Pre-Publishing Automation" - common cause of manual workflow failures
- "Source-Artifact Synchronization" - classic disconnect between code and compiled output

**Implication**: This is a well-known problem with well-established solutions.

## Confidence Assessment

**Confidence Level**: 95%

**Certainty Factors**:
- ✅ Direct evidence from file hash comparison
- ✅ Code inspection confirms missing feature implementation
- ✅ Failure chain fully explained by missing binary path
- ✅ Development mode works (proves feature implementation is correct)
- ✅ Alternative hypotheses systematically ruled out

**Remaining 5% Uncertainty**: Edge cases in timing or file system caching (highly unlikely).

## Conclusion

The root cause is definitively identified as **stale build artifacts packaged due to lack of automated pre-packaging build step**. The fix must ensure TypeScript is always recompiled with a clean output directory before packaging.
