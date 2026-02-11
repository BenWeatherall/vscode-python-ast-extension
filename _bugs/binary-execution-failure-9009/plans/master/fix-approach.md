# Fix Approach: Binary Execution Failure (9009)

## Selected Solution

**Implement `vscode:prepublish` npm lifecycle hook with clean builds**

This is Solution 1 from `research/applicable-solutions.md`, combined with Solution 3 (clean step).

## Solution Components

### Component 1: vscode:prepublish Hook

**What**: Add `vscode:prepublish` script to `package.json`

**How**: VSCE (VS Code Extension CLI) automatically executes this hook before `vsce package` or `vsce publish`

**Behavior**: When developer runs `pnpm run vscode:package`:
1. VSCE detects `vscode:prepublish` hook in package.json
2. Executes the prepublish script (clean build)
3. Waits for completion
4. Proceeds with packaging using fresh artifacts

### Component 2: Clean Build Script

**What**: Add `clean` and `build:clean` scripts

**Why**: Prevents partial stale artifacts from surviving between builds

**Implementation**:
- `clean`: Remove `out/` directory using `rimraf` (cross-platform)
- `build:clean`: Run clean, then run build (compile + bundle webview)

## Rationale: Why This Approach?

### Strengths

1. **Industry Standard**: Official VS Code extension pattern
   - Recommended in VS Code publishing documentation
   - Used by thousands of published extensions
   - Part of official VSCE workflow

2. **Automated**: Impossible to forget or bypass
   - No manual steps required
   - Works in both local and CI/CD environments
   - Zero workflow changes for developers

3. **Simple**: Minimal implementation
   - One line added to package.json for prepublish hook
   - Two lines for clean scripts
   - One dependency added (rimraf)
   - Total effort: ~30 minutes

4. **CI/CD Ready**: Works in automated pipelines
   - npm/pnpm automatically respect lifecycle hooks
   - No special CI configuration needed
   - Build scripts are idempotent

5. **Preventive**: Eliminates entire class of bugs
   - Prevents all future stale artifact issues
   - Clean builds guarantee fresh output
   - No manual verification needed

### Trade-offs

**Trade-off 1: Build Time Added to Packaging**

- **Cost**: Every package operation triggers full clean build
- **Time Impact**: ~10-15 seconds (TypeScript compile + webview bundle)
- **Mitigation**: Acceptable trade-off - packaging is infrequent operation
- **Verdict**: Benefits far outweigh cost

**Trade-off 2: Redundant Builds**

- **Scenario**: Developer manually runs `pnpm run build`, then `pnpm run vscode:package`
- **Result**: Build runs twice (manual + prepublish)
- **Mitigation**: Developer can skip manual build; prepublish guarantees freshness
- **Verdict**: Acceptable - safety over efficiency for packaging

## Why Not Alternative Approaches?

### Alternative 1: Combined Package Script

**Approach**: Create `package:full` script that runs `build && vscode:package`

**Rejected Because**:
- Still requires manual choice (developer might use wrong script)
- Not industry standard (community expects `vscode:package` to work)
- Requires documentation and training
- CI/CD pipelines might use wrong script

**Conclusion**: Adds manual step instead of removing it.

### Alternative 2: Build Verification Script

**Approach**: Add script to check timestamps/hashes before packaging

**Rejected Because**:
- High implementation complexity
- Only *detects* problem, doesn't *fix* it
- Can be fooled (touched files, clock skew)
- Requires maintenance if directory structure changes

**Conclusion**: Over-engineered solution that still requires manual intervention.

### Alternative 3: Manual Documentation

**Approach**: Document correct workflow and train developers

**Rejected Because**:
- Humans make mistakes
- Manual workflows are inherently error-prone
- Doesn't prevent the issue, only reduces likelihood
- Not scalable as team grows

**Conclusion**: Not a technical solution to a technical problem.

### Alternative 4: CI/CD Pipeline Only

**Approach**: Implement CI/CD that always builds correctly, rely on that for releases

**Rejected for Immediate Fix Because**:
- High implementation effort (Phase 3 - long-term)
- Doesn't fix local development packaging
- Developers still need to test VSIX locally
- Doesn't prevent local packaging mistakes

**Conclusion**: Excellent long-term solution, but must be combined with local automation.

## Fix Scope

### Minimal Change Approach

**Philosophy**: Fix the immediate issue with minimal code changes while following best practices.

**Changes**:
1. Add `rimraf` to devDependencies
2. Add `clean` script to package.json
3. Add `build:clean` script to package.json
4. Add `vscode:prepublish` script to package.json

**No Changes To**:
- Source code (TypeScript, Python)
- Existing build scripts (compile, build, bundle-webview)
- Development workflow (F5 debug, watch mode)
- Testing infrastructure
- CI/CD (doesn't exist yet - Phase 3)

### Files Modified

1. **package.json**: Add 3 scripts, add 1 devDependency
2. **package-lock.json** / **pnpm-lock.yaml**: Automatically updated by package manager

**Total Files Modified**: 2 (plus lock file)

## Rollback Considerations

### If Fix Fails

**Scenario**: If new VSIX still doesn't work for unexpected reasons

**Rollback Plan**:
1. Keep investigation and research documents (already done)
2. Manually compile: `pnpm run build`
3. Package: `pnpm run vscode:package`
4. Test VSIX to verify immediate functionality
5. Investigate new issue separately

**Risk**: Very low - fix addresses root cause directly

### If Build Issues Arise

**Scenario**: If clean builds cause unexpected problems

**Mitigation**:
1. `rimraf` is widely used, cross-platform tool (npm itself uses it)
2. Clean builds are safer than incremental builds
3. Watch mode unaffected (doesn't use build script)

**Rollback**: Remove `vscode:prepublish` hook temporarily, continue with manual workflow while debugging

## Validation Strategy

### Immediate Validation

1. Delete existing `out/` directory
2. Run `pnpm run vscode:package`
3. Verify `out/` was recreated
4. Extract VSIX and check `extension/out/extension.js` hash
5. Compare hash to workspace `out/extension.js` (should match)
6. Install VSIX in VS Code
7. Test "Visualize AST" command on Python file
8. Verify success (no exit code 9009 error)

### Long-term Validation

1. Future features: Test VSIX functionality before release (Phase 2)
2. CI/CD pipeline: Automate VSIX testing (Phase 3)

## Dependencies

### New Dependency: rimraf

**Package**: `rimraf` version `^5.0.0`  
**Purpose**: Cross-platform `rm -rf` (recursive delete)  
**License**: ISC  
**Maintenance**: Actively maintained, used by 100,000+ packages  
**Alternatives**: `del-cli`, `shx`, manual platform-specific scripts  
**Justification**: Industry standard, reliable, zero configuration

### Existing Dependencies

No changes to existing dependencies.

## Alignment with Project Standards

### Development Practices (.cursor/rules/development_practices.mdc)

✅ **Working Tests**: Fix must not break existing tests  
✅ **Regression Gate**: All tests must pass before fix is complete  
✅ **Valid Tests**: New validation steps must be able to fail  

### Documentation (.cursor/rules/documentation.mdc)

✅ **Concise**: Update package.json only (self-documenting)  
✅ **README**: Update if packaging workflow documented (check README.md)

### Environment (.cursor/rules/environment.mdc)

✅ **Package Management**: Use `pnpm` for Node dependencies  
✅ **Scripts**: Follow existing script naming conventions  
✅ **Testing**: Run tests before completion

## Implementation Priority

**Priority**: High (P1)  
**Urgency**: Immediate (blocks extension distribution)  
**Effort**: Low (30 minutes implementation + testing)  
**Impact**: Critical (prevents entire class of bugs)

## Success Metrics

1. ✅ New VSIX works correctly (no exit code 9009)
2. ✅ Impossible to package without fresh build
3. ✅ Zero workflow changes for developers
4. ✅ All existing tests pass
5. ✅ Clean builds complete successfully
6. ✅ Solution follows industry standards

## Next Steps After Fix

### Phase 2: Testing Enhancement (Next Sprint)

- Add VSIX functionality testing to feature workflow
- Document testing procedures
- Create testing scripts

### Phase 3: CI/CD Pipeline (Long-term)

- GitHub Actions or equivalent
- Automated testing on push
- Automated VSIX packaging on tag
- Optional marketplace publishing

**Note**: Phase 1 (this fix) must be completed and validated before proceeding to Phase 2.
