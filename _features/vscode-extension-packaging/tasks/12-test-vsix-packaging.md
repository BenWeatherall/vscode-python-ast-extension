# Background

This task validates VSIX packaging works correctly and produces a valid `.vsix` file with correct contents. This depends on Tasks 09 (package.json), 10 (.vscodeignore), and 11 (binaries built). This is the final packaging validation step.

# This Task

1. Ensure prerequisites:
   - Binaries built: `pnpm run build:python-binaries` (from Task 11)
   - Extension built: `pnpm run build` (TypeScript + webview)
   - `publisher` field set in `package.json`

2. Package VSIX:
   - Run `pnpm run vscode:package`
   - Verify command executes successfully
   - Verify `.vsix` file created: `<name>-<version>.vsix`

3. Inspect VSIX contents:
   - Extract `.vsix` (it's a zip file)
   - Verify `out/` directory included (compiled extension)
   - Verify `bin/` directory included with binaries
   - Verify `package.json` included
   - Verify `README.md` included (if desired)
   - Verify development artifacts excluded:
     - No `.venv/` directory
     - No `tests/` directory
     - No `src/` directory (source files)
     - No `node_modules/` directory
     - No `.build/` directory

4. Verify VSIX size:
   - Check `.vsix` file size reasonable (< 100MB)
   - Note actual size for documentation

5. Test VSIX installation (optional):
   - Install `.vsix` in clean VS Code instance: `code --install-extension <name>-<version>.vsix`
   - Verify extension activates
   - Verify binary execution works
   - Verify AST visualization works
   - Verify no system Python required

**Acceptance Criteria**:
- VSIX created successfully
- VSIX contains all runtime files
- VSIX excludes development artifacts
- VSIX size reasonable
- VSIX installs and works correctly (if tested)

# Testing Needed

This task IS a validation/testing task. Perform manual testing:

1. Packaging validation:
   - Run packaging command
   - Verify VSIX created
   - Verify filename correct

2. Contents validation:
   - Extract and inspect VSIX
   - Verify inclusions and exclusions
   - Document findings

3. Installation validation (optional):
   - Install VSIX in clean environment
   - Verify extension works
   - Verify no Python required
