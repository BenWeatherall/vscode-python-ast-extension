# Similar Issues and Patterns

## Overview

This document catalogs known patterns, recurring errors, and related fixes that are similar to the stale build artifact issue identified in bug `binary-execution-failure-9009`.

---

## Pattern: Stale Compiled Output in Packaging

### Description

Extensions package outdated compiled JavaScript because the packaging script doesn't automatically recompile source files before creating the VSIX.

### Manifestations

1. **Development Mode Works, VSIX Fails**: Code works when running from source (F5 debug) but fails when installed from VSIX
2. **File Hash Mismatch**: Compiled files in VSIX differ from workspace compiled files
3. **Missing Features**: Features present in source code are absent in VSIX behavior
4. **Exit Code 9009**: Windows-specific error when binary/executable not found or cannot be executed

### Root Cause

- No build dependency in packaging script
- Manual workflow assumes developer remembers to build before packaging
- No validation or timestamp checking

### Known Occurrences

**This Project**:
- Binary resolution feature added to `src/extension.ts`
- Developer tested in development mode (compiled on-the-fly)
- VSIX packaged without running `pnpm run build` first
- VSIX contained old `out/extension.js` without binary resolution logic

### Related Bugs

None documented in this project yet, but this is the first instance of this pattern.

---

## Pattern: Missing Pre-Publishing Automation

### Description

Build systems that lack automated pre-packaging steps rely on manual workflows, which are error-prone.

### Industry Examples

**Common Scenario**: Projects with separate `build` and `package` scripts where developers:
1. Make code changes
2. Test in development mode
3. Forget to build before packaging
4. Package stale artifacts

**Solution Pattern**: Use npm lifecycle hooks (`vscode:prepublish`, `prepack`) to automate builds before packaging.

### Why This Happens

- Developers focus on code changes and testing
- Development mode (watch mode, hot reload) provides immediate feedback
- Packaging is infrequent, so muscle memory for workflow doesn't develop
- No warnings or errors when packaging stale code

### Prevention

- Automated pre-packaging hooks
- CI/CD pipelines that always build from clean state
- Build scripts that clean output directory before building

---

## Pattern: PNPM + VSCE Compatibility Issues

### Description

VSCE's dependency resolution fails with pnpm because VSCE uses `npm list` which doesn't work with pnpm's symlink structure.

### Symptoms

- `vsce package` fails with dependency resolution errors
- "Cannot find module" errors in packaged extension
- Missing dependencies in VSIX

### Solutions

1. **Bundle dependencies**: Use esbuild/webpack to bundle all dependencies
2. **Use `--no-dependencies` flag**: Skip VSCE's dependency resolution
3. **Switch to npm/yarn**: Use different package manager (not ideal)

### Applicability to Our Bug

**Status**: Not directly related to our current bug, but relevant for future packaging work.

**Current State**: We use pnpm and haven't encountered this issue yet because:
- Extension code doesn't bundle dependencies (uses TypeScript compilation only)
- Dependencies are resolved at runtime from `node_modules/`
- We haven't used `--no-dependencies` flag yet

**Future Consideration**: If we migrate to bundled extension code (recommended for optimization), we'll need `--no-dependencies`.

---

## Pattern: Exit Code 9009 (Windows)

### Description

Windows-specific error code indicating a command or executable cannot be found or executed.

### Common Causes

1. **Binary Not Found**: Path to executable is incorrect or file doesn't exist
2. **Missing DLL Dependencies**: Required runtime dependencies not available
3. **Incorrect Path Separators**: Unix-style paths on Windows
4. **Permission Issues**: Executable lacks execute permission (rare on Windows)
5. **Architecture Mismatch**: 32-bit binary on 64-bit system without compatibility layer

### In Our Context

**Specific Cause**: PythonClient fell back to `python -m python_service` because binary path was not provided. The `python_service` module was excluded from VSIX (intentionally), so Python couldn't find it, resulting in exit code 9009.

**Fix**: Ensure binary path is provided (requires current compiled code with binary resolution logic).

### Similar Issues in Extension Development

**Typical Scenario**: Extensions that spawn child processes often encounter this when:
- Binary path resolution fails
- Binary excluded from package
- Environment variable missing
- Working directory incorrect

**Prevention**: Always use absolute paths for spawned executables and verify binary is included in VSIX.

---

## Pattern: Source-Artifact Synchronization

### Description

Disconnect between source code and compiled/built artifacts due to manual build processes.

### Symptoms

1. **"It works on my machine"**: Developer's environment has correct artifacts, but VSIX/package doesn't
2. **Feature regressions**: Recent changes missing in distributed version
3. **Hash mismatches**: Compiled files differ between environments

### Solutions

1. **Clean Builds**: Always build from clean state in CI/CD
2. **Build Verification**: Check timestamps, hashes, or version markers
3. **Automated Builds**: Use pre-packaging hooks to ensure fresh builds
4. **Build Markers**: Embed build timestamp or Git commit hash in compiled output

### Application

**Current Issue**: Classic source-artifact synchronization problem where `src/extension.ts` was updated but `out/extension.js` was not.

**Prevention Strategy**:
1. Use `vscode:prepublish` to auto-build before packaging
2. Add clean step to build script
3. Consider hash validation in CI/CD

---

## Pattern: Feature Implementation Without Packaging Validation

### Description

New features added and tested in development mode but not validated in packaged form before release.

### Example from Our Project

**Feature**: Binary resolution (vscode-extension-packaging feature)
**Implementation**: Tasks 01-13 in `_archive/vscode-extension-packaging/`
**Testing**: Integration tests in development mode passed
**Packaging Validation**: Task 12 validated VSIX creation but didn't test VSIX functionality
**Gap**: VSIX functionality testing skipped because packaging script issue was not caught

### Lesson Learned

**Testing Phases Should Include**:
1. Unit tests (code level)
2. Integration tests (development mode)
3. **Packaging tests** (VSIX creation)
4. **Distribution tests** (install and test VSIX functionality)

**Our Gap**: We stopped at step 3. Task 12 verified VSIX could be created and contained correct files, but didn't install and test the VSIX.

### Recommendation

Add task or workflow step:
- **"Test VSIX Installation and Functionality"**
- Install VSIX in clean VS Code environment
- Execute all commands and verify behavior
- Compare with development mode behavior

---

## Pattern: .vscodeignore Misconfigurations

### Description

Incorrect `.vscodeignore` rules can cause:
- **Over-exclusion**: Required files excluded, extension fails at runtime
- **Under-exclusion**: Unnecessary files included, bloating VSIX size
- **Stale artifact inclusion**: Compiled outputs included but source excluded (our case)

### Common Mistakes

1. **Excluding runtime dependencies**: `node_modules/` excluded but dependencies not bundled
2. **Including source and compiled**: Both `src/` and `out/` included, wasting space
3. **Missing compiled outputs**: Excluding `out/` by mistake
4. **No binary exclusions**: Dev binaries or debug artifacts included

### Our Configuration (Correct)

From `.vscodeignore`:
- ✓ Excludes source files (`src/`, `python_service/`)
- ✓ Includes compiled outputs (`out/` implicitly kept)
- ✓ Includes binaries (`bin/` implicitly kept)
- ✓ Excludes dev artifacts (tests, docs, cache)

**Analysis**: Our `.vscodeignore` is correctly configured. The issue is not what we include/exclude, but that we included *stale* compiled output.

---

## Historical Context from Our Codebase

### CHANGELOG.md Analysis

**Related Entries**:

1. **VSIX Packaging Validation** (CHANGELOG.md, lines 9-11):
   - Verified package creation ✓
   - Verified contents inspection ✓
   - Verified size ✓
   - **Gap**: Did not verify VSIX *functionality*

2. **Integration Tests** (CHANGELOG.md, lines 6-8):
   - Tests run in development environment
   - Binary execution flow tested
   - Protocol compatibility tested
   - **Gap**: Tests not run against installed VSIX

### Past Fixes

**Pre-existing test bugs** (CHANGELOG.md, lines 38-40):
- Mock editors missing `uri` property
- Incorrect auto-refresh expectations
- Error-handling test file type
- App loading text assertion

**Pattern**: Tests were fixed during implementation. This shows we have a culture of fixing broken tests (per development_practices.mdc). We should extend this to VSIX validation testing.

---

## Known Anti-Patterns to Avoid

### Anti-Pattern 1: Incremental Builds for Packaging

**Problem**: Relying on incremental builds (TypeScript watch mode) for packaging can include stale artifacts.

**Solution**: Always clean before building for packaging.

### Anti-Pattern 2: Manual Multi-Step Workflows

**Problem**: Workflows requiring multiple manual steps (build, build binaries, package) are error-prone.

**Solution**: Combine into single script or use automation (CI/CD, pre-publish hooks).

### Anti-Pattern 3: Testing Only in Development Mode

**Problem**: Development mode behavior can differ from packaged extension behavior.

**Solution**: Always test packaged VSIX before release.

### Anti-Pattern 4: No Build Validation

**Problem**: Packaging scripts that assume artifacts are up-to-date without verification.

**Solution**: Add timestamp checks, hash validation, or pre-packaging hooks.

---

## Recurring Themes

1. **Manual Workflows Are Error-Prone**: Every manual step is an opportunity for human error
2. **Development ≠ Production**: Testing only in development mode is insufficient
3. **Automation Prevents Errors**: Pre-packaging hooks and CI/CD eliminate manual steps
4. **Validation Over Assumptions**: Don't assume artifacts are correct; validate them

---

## Cross-References

- Root Cause: `_bugs/binary-execution-failure-9009/investigation/root-cause-hypothesis.md`
- Internal Documentation: `_bugs/binary-execution-failure-9009/research/internal-documentation.md`
- External Research: `_bugs/binary-execution-failure-9009/research/external-research.md`
- Development Practices: `.cursor/rules/development_practices.mdc`
- CHANGELOG: `CHANGELOG.md`
