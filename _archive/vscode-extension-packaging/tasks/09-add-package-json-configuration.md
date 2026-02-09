# Background

This task adds VSIX packaging configuration to package.json, including publisher field, @vscode/vsce dependency, and build scripts. This enables VSIX packaging via `vsce package`. This task has no code dependencies.

# This Task

1. Modify `package.json`:

2. Add `publisher` field:
   - Add top-level `"publisher"` field (required for VSIX packaging)
   - Use appropriate publisher name (e.g., `"your-publisher-name"`)

3. Add scripts:
   - `"build:python-binaries": "node scripts/build-binaries.js"`: Build Python service binaries
   - `"vscode:package": "vsce package"`: Package extension as VSIX

4. Add dev dependency:
   - `"@vscode/vsce": "^2.x.x"` in `devDependencies`
   - Use latest stable version

5. Verify existing fields:
   - Ensure `name`, `displayName`, `version`, `description` present
   - Ensure `engines.vscode` present
   - Ensure `main: "./out/extension.js"` present
   - Ensure `activationEvents` and `contributes` present

**Acceptance Criteria**:
- `publisher` field added
- Scripts added and functional
- `@vscode/vsce` added to devDependencies
- `pnpm install` succeeds
- Scripts available via `pnpm run`

# Testing Needed

1. Manual test: Install dependencies:
   - Run `pnpm install`
   - Verify `@vscode/vsce` installed
   - Verify no errors

2. Manual test: Verify scripts:
   - Run `pnpm run build:python-binaries` (should work if PyInstaller installed)
   - Run `pnpm run vscode:package` (will fail without binaries, but command should exist)

3. Validation: Verify package.json structure:
   - JSON syntax valid
   - All required fields present
   - Scripts reference correct commands
