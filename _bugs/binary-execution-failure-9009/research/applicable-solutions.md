# Applicable Solutions

## Overview

This document presents candidate solutions for preventing stale build artifacts in VSIX packaging, with analysis of pros, cons, implementation complexity, and recommendations.

---

## Solution 1: Add vscode:prepublish Hook (RECOMMENDED)

### Description

Add `vscode:prepublish` script to `package.json`. VSCE automatically executes this hook before `vsce package` or `vsce publish`.

### Implementation

**package.json**:
```json
{
  "scripts": {
    "compile": "tsc -p .",
    "watch": "tsc -p . -w",
    "build": "npm run compile && npm run bundle-webview",
    "bundle-webview": "esbuild webview-ui/src/index.tsx --bundle --outfile=out/media/webview.js --format=iife --global-name=webviewBundle && npx tailwindcss -i webview-ui/src/index.css -o out/media/webview.css -c webview-ui/tailwind.config.js --minify",
    "build:python-binaries": "node scripts/build-binaries.js",
    "vscode:prepublish": "npm run build",
    "vscode:package": "vsce package"
  }
}
```

**Key Change**: Add `"vscode:prepublish": "npm run build"`

### Behavior

When developer runs `pnpm run vscode:package`:
1. VSCE detects `vscode:prepublish` hook
2. Executes `npm run build` (compiles TypeScript + bundles webview)
3. Proceeds with `vsce package` using fresh artifacts

### Pros

- ✅ **Industry standard**: Official VS Code extension pattern
- ✅ **Zero-friction**: No workflow changes for developers
- ✅ **Automated**: Impossible to forget to build
- ✅ **Works in CI/CD**: CI pipelines automatically get fresh builds
- ✅ **Minimal changes**: One-line addition to package.json
- ✅ **Self-documenting**: Clear that packaging triggers build

### Cons

- ⚠️ **Build time added**: Packaging always takes extra time for build (even if already built)
- ⚠️ **Redundant builds**: If developer manually built, prepublish builds again

### Mitigation for Cons

**Build Time**: Acceptable trade-off. TypeScript compilation takes ~5-10 seconds, which is negligible compared to packaging time and bug prevention value.

**Redundant Builds**: Can be mitigated with Solution 4 (clean + build script).

### Complexity

- **Implementation**: Very Low (1 line change)
- **Testing**: Low (test that packaging triggers build)
- **Maintenance**: None

### Recommendation

**STRONGLY RECOMMENDED**. This is the industry-standard solution and prevents the bug with minimal effort.

---

## Solution 2: Create Combined Package Script

### Description

Create a new script (`package:vsix` or `package:full`) that explicitly runs build before packaging.

### Implementation

**package.json**:
```json
{
  "scripts": {
    "build": "npm run compile && npm run bundle-webview",
    "vscode:package": "vsce package",
    "package:full": "npm run build && npm run vscode:package"
  }
}
```

**Usage**: Developers run `pnpm run package:full` instead of `pnpm run vscode:package`.

### Pros

- ✅ **Explicit workflow**: Clear that this script builds + packages
- ✅ **Optional**: Developers can still use `vscode:package` for quick packaging (if they know artifacts are fresh)
- ✅ **Simple**: Easy to understand and implement

### Cons

- ❌ **Manual choice**: Developers might use `vscode:package` and forget to build (same problem)
- ❌ **Not standard**: VS Code community expects `vscode:package` to work
- ❌ **Documentation burden**: Need to document which script to use
- ❌ **CI/CD risk**: CI pipeline might use wrong script

### Mitigation

Deprecate `vscode:package` and rename combined script to `vscode:package`.

### Complexity

- **Implementation**: Very Low
- **Testing**: Low
- **Maintenance**: Low (but requires documentation)

### Recommendation

**NOT RECOMMENDED** as primary solution. Use Solution 1 instead. However, this could be **added alongside Solution 1** as a convenience script with a clear name (e.g., `package:full`) for completeness.

---

## Solution 3: Add Clean Step to Build Script

### Description

Ensure `build` script cleans output directory before compiling to prevent stale artifacts.

### Implementation

**Current `build` script**:
```json
"build": "npm run compile && npm run bundle-webview"
```

**Enhanced `build` script**:
```json
{
  "scripts": {
    "clean": "rimraf out",
    "compile": "tsc -p .",
    "bundle-webview": "esbuild webview-ui/src/index.tsx --bundle --outfile=out/media/webview.js --format=iife --global-name=webviewBundle && npx tailwindcss -i webview-ui/src/index.css -o out/media/webview.css -c webview-ui/tailwind.config.js --minify",
    "build": "npm run clean && npm run compile && npm run bundle-webview"
  }
}
```

**Dependencies**: Requires `rimraf` package (cross-platform `rm -rf`).

### Pros

- ✅ **Guarantees fresh build**: No partial stale artifacts
- ✅ **CI/CD friendly**: Ensures clean builds in pipelines
- ✅ **Catches deleted files**: Removed source files won't leave orphaned compiled files
- ✅ **Simple**: One additional script line

### Cons

- ⚠️ **Slower builds**: Always full rebuild (no incremental compilation)
- ⚠️ **Watch mode impact**: Don't want clean step in watch mode
- ⚠️ **Dependency added**: Requires `rimraf` package

### Mitigation

- Use separate `build:clean` script for packaging/CI, keep `build` without clean for development
- `watch` mode already doesn't use `build` script (runs `tsc -p . -w` directly)

### Complexity

- **Implementation**: Low (add rimraf dependency, add clean script, update build script)
- **Testing**: Medium (verify clean build, verify watch mode unaffected)
- **Maintenance**: Low

### Recommendation

**RECOMMENDED** as complementary solution to Solution 1. Provides additional safety in CI/CD pipelines.

**Suggested Implementation**:
```json
{
  "scripts": {
    "clean": "rimraf out",
    "compile": "tsc -p .",
    "build": "npm run compile && npm run bundle-webview",
    "build:clean": "npm run clean && npm run build",
    "vscode:prepublish": "npm run build:clean"
  }
}
```

---

## Solution 4: Add Build Verification Step

### Description

Add a verification script that checks if compiled artifacts are up-to-date before packaging.

### Implementation Approach

**Option A: Timestamp Checking**
```javascript
// scripts/verify-build.js
const fs = require('fs');
const path = require('path');

const sourceDir = 'src';
const outDir = 'out';

// Get newest source file timestamp
const newestSource = getNewestFile(sourceDir);
// Get oldest compiled file timestamp
const oldestCompiled = getOldestFile(outDir);

if (newestSource > oldestCompiled) {
  console.error('ERROR: Source files are newer than compiled output.');
  console.error('Run `pnpm run build` before packaging.');
  process.exit(1);
}
```

**Option B: Hash-Based Verification**
```javascript
// scripts/verify-build.js
// Compare Git commit hash embedded in compiled output
// with current Git HEAD
```

**package.json**:
```json
{
  "scripts": {
    "verify-build": "node scripts/verify-build.js",
    "vscode:package": "npm run verify-build && vsce package"
  }
}
```

### Pros

- ✅ **Fast**: Only checks timestamps/hashes, doesn't rebuild
- ✅ **Fails fast**: Catches stale artifacts before packaging
- ✅ **Educational**: Error message tells developer what to do

### Cons

- ❌ **Complex**: Requires custom verification script
- ❌ **Incomplete**: Timestamp checks can be fooled (file touched without changes)
- ❌ **Maintenance burden**: Verification script needs updates if directory structure changes
- ❌ **Doesn't solve problem**: Only detects issue, doesn't fix it

### Mitigation

Combined with Solution 1, verification becomes redundant (prepublish always builds).

### Complexity

- **Implementation**: Medium to High
- **Testing**: High (many edge cases)
- **Maintenance**: Medium

### Recommendation

**NOT RECOMMENDED**. Solution 1 (prepublish hook) is simpler and actually solves the problem rather than just detecting it.

---

## Solution 5: CI/CD Pipeline Enforcement

### Description

Implement CI/CD pipeline that always builds from clean state before packaging.

### Implementation (Example: GitHub Actions)

```yaml
name: Package Extension

on:
  push:
    tags:
      - 'v*'

jobs:
  package:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm run build:clean  # Clean build
      - run: pnpm run build:python-binaries
      - run: pnpm run vscode:package
      - uses: actions/upload-artifact@v3
        with:
          name: vsix-package
          path: '*.vsix'
```

### Pros

- ✅ **Guaranteed clean builds**: CI always starts from clean state
- ✅ **Versioning**: Automated version bumping
- ✅ **Testing**: Can run tests before packaging
- ✅ **Audit trail**: Build logs and artifacts stored
- ✅ **Distribution**: Direct marketplace publishing

### Cons

- ⚠️ **Doesn't prevent local errors**: Developers can still package stale artifacts locally
- ⚠️ **Setup overhead**: Requires CI/CD infrastructure
- ⚠️ **Not immediate**: Need to set up pipeline, secrets, etc.

### Complexity

- **Implementation**: High (requires CI/CD setup)
- **Testing**: High (test entire pipeline)
- **Maintenance**: Medium (pipeline updates, secret management)

### Recommendation

**HIGHLY RECOMMENDED** for production releases, but as a **long-term** solution. Short-term, implement Solution 1 first.

**Phasing**:
1. **Immediate**: Implement Solution 1 (prepublish hook) to fix local packaging
2. **Short-term**: Implement Solution 3 (clean builds)
3. **Long-term**: Implement Solution 5 (CI/CD) for production releases

---

## Solution 6: TypeScript Project References with Build Mode

### Description

Use TypeScript project references and `tsc --build` mode for more intelligent incremental compilation.

### Implementation

**tsconfig.json** (root):
```json
{
  "files": [],
  "references": [
    { "path": "./src" },
    { "path": "./webview-ui" }
  ]
}
```

**tsconfig.json** (src):
```json
{
  "compilerOptions": {
    "composite": true,
    "outDir": "../out"
  }
}
```

**package.json**:
```json
{
  "scripts": {
    "compile": "tsc --build",
    "clean": "tsc --build --clean"
  }
}
```

### Pros

- ✅ **Intelligent increments**: TypeScript tracks dependencies
- ✅ **Clean builds**: Built-in `--clean` flag
- ✅ **Faster rebuilds**: Only rebuilds changed projects

### Cons

- ⚠️ **Configuration complexity**: Requires restructuring TypeScript config
- ⚠️ **Learning curve**: Project references are advanced TypeScript feature
- ⚠️ **Not a direct fix**: Still need prepublish hook for automation

### Complexity

- **Implementation**: High
- **Testing**: High
- **Maintenance**: Medium

### Recommendation

**NOT RECOMMENDED** for this bug fix. Over-engineered for the problem. TypeScript project references are useful for large monorepos, but our project structure doesn't benefit significantly.

---

## Solution Comparison Matrix

| Solution | Prevents Bug | Complexity | CI/CD Ready | Standard | Immediate Fix |
|----------|--------------|------------|-------------|----------|---------------|
| 1. vscode:prepublish | ✅ Yes | Very Low | ✅ Yes | ✅ Yes | ✅ Yes |
| 2. Combined Script | ⚠️ Partial | Very Low | ⚠️ Maybe | ❌ No | ⚠️ Manual |
| 3. Clean Builds | ✅ Yes | Low | ✅ Yes | ✅ Yes | ✅ Yes |
| 4. Verification Script | ⚠️ Detection | High | ✅ Yes | ❌ No | ❌ No |
| 5. CI/CD Pipeline | ✅ Yes | High | ✅ Yes | ✅ Yes | ❌ No |
| 6. TS Project Refs | ⚠️ Indirect | High | ✅ Yes | ⚠️ Advanced | ❌ No |

---

## Recommended Implementation Plan

### Phase 1: Immediate Fix (This Bug)

**Goal**: Prevent stale artifacts in packaging workflow

**Actions**:
1. ✅ Add `vscode:prepublish` hook (Solution 1)
2. ✅ Add `clean` script with `rimraf` (Solution 3)
3. ✅ Update `vscode:prepublish` to use clean build

**Implementation**:
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
    "vscode:package": "vsce package"
  },
  "devDependencies": {
    "rimraf": "^5.0.0"
  }
}
```

**Dependencies**: Add `rimraf` to `devDependencies`

**Testing**:
1. Delete `out/` directory
2. Run `pnpm run vscode:package`
3. Verify `out/` is created and populated
4. Verify VSIX contains correct code

**Effort**: ~30 minutes (implementation + testing)

### Phase 2: Testing Enhancement (Next Sprint)

**Goal**: Catch packaging issues in testing phase

**Actions**:
1. Add VSIX functionality testing task to feature implementation workflow
2. Create test script that installs VSIX and runs basic commands
3. Document testing workflow

**Effort**: ~2-4 hours (task creation + documentation)

### Phase 3: CI/CD Pipeline (Long-Term)

**Goal**: Automate release process

**Actions**:
1. Set up GitHub Actions or equivalent CI/CD
2. Automated testing on push
3. Automated VSIX packaging on tag
4. Optional: Automated marketplace publishing

**Effort**: ~8-16 hours (pipeline setup + testing + documentation)

---

## Alternative: Quick Fix Only (Not Recommended)

If time is extremely limited and only immediate bug fix is needed:

**Minimal Fix**:
```json
{
  "scripts": {
    "vscode:prepublish": "npm run build"
  }
}
```

**One line addition**, no other changes.

**Pros**: Solves immediate bug
**Cons**: No clean build, potential for partial stale artifacts

**Recommendation**: Not ideal, but acceptable as emergency fix. Follow up with clean build addition later.

---

## Final Recommendation

**Implement Phase 1 in full**:
- Add `vscode:prepublish` hook
- Add clean step
- Use clean build in prepublish

**Reasoning**:
1. **Prevents bug**: Impossible to package stale artifacts
2. **Industry standard**: Follows VS Code extension best practices
3. **Low effort**: ~30 minutes total
4. **High impact**: Prevents entire class of bugs
5. **CI/CD ready**: Works in automated pipelines
6. **Zero workflow changes**: Developers continue using `pnpm run vscode:package`

---

## Cross-References

- Investigation: `_bugs/binary-execution-failure-9009/investigation/root-cause-hypothesis.md`
- Internal Documentation: `_bugs/binary-execution-failure-9009/research/internal-documentation.md`
- External Research: `_bugs/binary-execution-failure-9009/research/external-research.md`
- Similar Issues: `_bugs/binary-execution-failure-9009/research/similar-issues.md`
