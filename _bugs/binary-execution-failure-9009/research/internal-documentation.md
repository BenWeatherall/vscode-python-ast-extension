# Internal Documentation Findings

## Source Documents

- `package.json` - Build and packaging scripts
- `CHANGELOG.md` - Historical feature implementations
- `.vscodeignore` - VSIX artifact exclusion rules
- `docs/AI_CONTEXT/AI_CONTEXT_PATTERNS.md` - Development patterns and practices
- `_archive/vscode-extension-packaging/` - Feature implementation documentation

---

## Current Build Configuration

### Package.json Scripts

From `package.json` (lines 30-38):

```json
{
  "scripts": {
    "compile": "tsc -p .",
    "watch": "tsc -p . -w",
    "build": "npm run compile && npm run bundle-webview",
    "bundle-webview": "esbuild webview-ui/src/index.tsx --bundle --outfile=out/media/webview.js --format=iife --global-name=webviewBundle && npx tailwindcss -i webview-ui/src/index.css -o out/media/webview.css -c webview-ui/tailwind.config.js --minify",
    "build:python-binaries": "node scripts/build-binaries.js",
    "vscode:package": "vsce package"
  }
}
```

**Key Observation**: The `vscode:package` script does **not** depend on or call the `build` script. It directly invokes `vsce package`, which will package whatever exists in the `out/` directory.

### Build Workflow from Feature Documentation

From `_archive/vscode-extension-packaging/plans/tasks/09-add-package-json-configuration.md`:

**Expected Workflow**:
1. `pnpm run build` - Compile TypeScript and bundle webview
2. `pnpm run build:python-binaries` - Build Python binaries
3. `pnpm run vscode:package` - Package VSIX

**Issue**: There is no automation or dependency chain enforcing this order. The packaging script assumes the `out/` directory is up-to-date but never verifies or updates it.

---

## VSIX Artifact Management

### .vscodeignore Configuration

From `.vscodeignore` (lines 22-30):

```
# Build artifacts (keep out/)
**/*.map
.build/
**/*.spec

# Source files (keep only compiled)
src/
webview-ui/src/
python_service/
```

**Pattern**: The VSIX includes the `out/` directory (compiled artifacts) while excluding source files (`src/`, `webview-ui/src/`). This means the VSIX depends entirely on pre-compiled artifacts being correct and current.

**Risk**: If `out/` is stale, the VSIX will contain outdated code. There is no validation or warning mechanism.

---

## Historical Context from CHANGELOG

### VSIX Packaging Feature (CHANGELOG.md, line 15)

The VSIX packaging feature was added with:
- `publisher` field
- `build:python-binaries` script
- `vscode:package` script
- `@vscode/vsce` dev dependency

**Notable**: The implementation focused on packaging infrastructure but did not include build verification or pre-packaging automation.

### Related Features

From CHANGELOG.md (lines 6-11):
- Integration tests were added for binary execution flow
- VSIX packaging validation verified package contents
- Node.js compatibility fixes were applied

**Observation**: Testing validated that packaging *works* but did not catch the workflow issue where users might package without building first.

---

## Development Patterns

### From AI_CONTEXT_PATTERNS.md

**TDD Approach** (lines 205-214):
- Write test first, then implementation
- Black box testing - validate functionality, not internal behavior
- All tests must work; fix broken tests
- All tests must be able to fail

**Validation Pattern** (lines 284-305):
- Use Pydantic models for data validation
- Once validated, trust the data
- No redundant checks after validation

**Application to This Bug**: The current packaging workflow has no validation step to ensure TypeScript is compiled before packaging. This violates the validation principle by assuming the `out/` directory is correct without verification.

---

## Similar Patterns in Codebase

### Build Dependencies

The `build` script (package.json, line 33) demonstrates proper dependency chaining:

```json
"build": "npm run compile && npm run bundle-webview"
```

This ensures `compile` runs before `bundle-webview`. The same pattern should apply to `vscode:package`.

### Bundle-Webview Script

The `bundle-webview` script uses `esbuild` for compilation and `tailwindcss` for styling, both of which produce fresh output each time they run. This is a clean build pattern that `vscode:package` should follow.

---

## Gaps in Current Implementation

1. **No Build Verification**: `vscode:package` does not verify that `out/` is up-to-date
2. **No Dependency Chain**: Scripts are independent; user must manually orchestrate order
3. **No Timestamp Checks**: No mechanism to warn if source files are newer than compiled files
4. **No Pre-Packaging Hook**: Unlike npm's `prepublish`, VSCE does not automatically run pre-packaging tasks (though it supports `vscode:prepublish`)

---

## Relevant File Locations

- `package.json` - Script definitions
- `.vscodeignore` - Artifact inclusion/exclusion rules
- `out/` - Compiled TypeScript output (included in VSIX)
- `src/` - TypeScript source files (excluded from VSIX)
- `bin/` - Python binaries (included in VSIX)
- `python_service/` - Python source files (excluded from VSIX)

---

## Cross-References

- Investigation Phase: `_bugs/binary-execution-failure-9009/investigation/root-cause-hypothesis.md`
- Feature Documentation: `_archive/vscode-extension-packaging/`
- Development Patterns: `docs/AI_CONTEXT/AI_CONTEXT_PATTERNS.md`
- Packaging Configuration: `.vscodeignore`
