# Fix Plan Overview: Binary Execution Failure (9009)

## Bug Summary

**Bug Name**: binary-execution-failure-9009  
**Severity**: Critical (extension completely non-functional when installed from VSIX)  
**Discovered**: 2026-02-10

### Symptom

Extension fails with error `Service unavailable: process exited with code 9009` when visualizing Python AST after installing from VSIX package.

### Impact

- **User-Facing**: 100% - Extension completely unusable when installed from VSIX
- **Development Mode**: No impact - extension works correctly when run from source (F5 debug)
- **Affected Users**: Any user installing the extension from the VSIX file

## Root Cause (Confirmed)

The VSIX package contains stale compiled JavaScript (`out/extension.js`) that predates the binary resolution feature implementation. The packaging workflow does not automatically recompile TypeScript before creating the VSIX, resulting in outdated code being distributed.

**Evidence**:
- File hash mismatch between workspace and VSIX `extension.js`
- VSIX version missing binary resolution logic (function calls and imports)
- VSIX falls back to `python -m python_service` which fails (module intentionally excluded)

**Confidence Level**: 95%

## Fix Goal

Prevent stale build artifacts from being included in VSIX packages by implementing automated pre-packaging build steps that follow industry standards.

## Success Criteria

1. **Immediate**: VSIX package contains current compiled code with binary resolution
2. **Prevention**: Impossible to package stale artifacts in future builds
3. **Standards**: Implementation follows official VS Code extension best practices
4. **CI/CD Ready**: Solution works in automated build pipelines
5. **Zero Friction**: No developer workflow changes required

## Relationship to Existing Systems

### Affected Components

1. **Build System** (`package.json` scripts):
   - `build` - compiles TypeScript and bundles webview
   - `vscode:package` - creates VSIX (currently no dependency on build)
   - New: `clean` and `vscode:prepublish` scripts

2. **TypeScript Compilation**:
   - Works correctly, but not automatically triggered before packaging

3. **Binary Resolution** (recently implemented):
   - Feature works in development but not in packaged VSIX

### Integration Points

- **Development Workflow**: No changes needed (developers continue using F5 debug)
- **Packaging Workflow**: Automatic - `vscode:prepublish` hook runs before packaging
- **CI/CD Pipeline**: Compatible - prepublish hook works in automated environments
- **Testing**: Requires validation step for VSIX functionality

## Scope

### In Scope (This Fix)

1. Add `vscode:prepublish` npm lifecycle hook
2. Add `clean` script with `rimraf` dependency
3. Create `build:clean` script combining clean + build
4. Update packaging workflow to use clean builds
5. Test new VSIX to verify binary resolution works
6. Document the fix and prevention mechanism

### Out of Scope (Future Work)

1. CI/CD pipeline implementation (Phase 3 - long-term)
2. VSIX functionality testing automation (Phase 2 - next sprint)
3. Extension bundling with esbuild (optimization, not required for fix)
4. Build verification scripts (unnecessary with prepublish hook)

## Fix Strategy

**Approach**: Implement industry-standard `vscode:prepublish` hook following official VS Code extension guidelines.

**Rationale**: 
- Automated and impossible to bypass
- Zero developer friction
- Works in CI/CD pipelines
- Minimal implementation effort (~30 minutes)
- Follows community best practices

## Related Documentation

- **Investigation**: `_bugs/binary-execution-failure-9009/investigation/`
- **Research**: `_bugs/binary-execution-failure-9009/research/`
- **Development Practices**: `.cursor/rules/development_practices.mdc`
- **Project Patterns**: `docs/AI_CONTEXT/AI_CONTEXT_PATTERNS.md`
