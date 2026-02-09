# Per-Task Implementation Plan: Add Package.json Configuration

## Overview

This task adds VSIX packaging configuration to `package.json`, including the `publisher` field (required for VSIX packaging), `@vscode/vsce` dev dependency, and build scripts for Python binary builds and VSIX packaging. This enables the extension to be packaged as a `.vsix` file using `vsce package`. This task has no code dependencies and can be implemented independently.

**Context within feature**: This task is Step 9 in the implementation sequence. It follows the build script creation (task 08) and precedes `.vscodeignore` creation (task 10). The `publisher` field and `@vscode/vsce` dependency are prerequisites for VSIX packaging, while the scripts enable the packaging workflow. This task is independent of TypeScript code changes but configures the packaging infrastructure.

## Files to Create/Modify

### Modified Files

1. **`package.json`**
   - Add `publisher` field (top-level, required for VSIX)
   - Add `build:python-binaries` script
   - Add `vscode:package` script
   - Add `@vscode/vsce` to `devDependencies`
   - Verify existing required fields are present

## Test Strategy

Per `testing.md` strategy, package.json configuration is validated manually (not via unit tests):

### Manual Test Cases

1. **Dependency Installation Test**:
   - Run `pnpm install`
   - Verify `@vscode/vsce` installed successfully
   - Verify no installation errors
   - Verify package-lock.json updated

2. **Script Availability Test**:
   - Run `pnpm run build:python-binaries` (should work if PyInstaller installed)
   - Run `pnpm run vscode:package` (will fail without binaries, but command should exist)
   - Verify scripts listed in `pnpm run` output

3. **Package.json Validation Test**:
   - Verify JSON syntax valid (no parse errors)
   - Verify `publisher` field present
   - Verify all required VSIX fields present (`name`, `displayName`, `version`, `description`, `engines.vscode`, `main`, `activationEvents`, `contributes`)
   - Verify scripts reference correct commands

4. **VSIX Packaging Test** (after binaries built):
   - Run `pnpm run build` (compile extension)
   - Run `pnpm run build:python-binaries` (build binaries)
   - Run `pnpm run vscode:package` (package VSIX)
   - Verify `.vsix` file created
   - Verify filename matches `<name>-<version>.vsix` pattern

### Test Execution

```bash
# Install dependencies
pnpm install

# Verify scripts available
pnpm run build:python-binaries --help  # Should show script exists
pnpm run vscode:package --help         # Should show vsce help

# Validate package.json structure
node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))"
```

## Implementation Order

### Step 1: Verify Existing Required Fields

**File**: `package.json`

**Action**: Review current `package.json` and verify these fields exist:
- `name`: Present (currently `"python-ast-visualization"`)
- `displayName`: Present (currently `"Python AST Visualization"`)
- `version`: Present (currently `"0.1.0"`)
- `description`: Present (currently `"Visualize Python Abstract Syntax Trees as interactive node-based graphs"`)
- `engines.vscode`: Present (currently `"^1.80.0"`)
- `main`: Present (currently `"./out/extension.js"`)
- `activationEvents`: Present (currently `["onCommand:python-ast.visualize"]`)
- `contributes`: Present (currently contains `commands` array)

**Validation**: All required fields confirmed present

---

### Step 2: Add Publisher Field

**File**: `package.json`

**Action**: Add `publisher` field at top level (after `description`, before `engines`)

**Implementation**:
```json
{
  "name": "python-ast-visualization",
  "displayName": "Python AST Visualization",
  "version": "0.1.0",
  "description": "Visualize Python Abstract Syntax Trees as interactive node-based graphs",
  "publisher": "your-publisher-name",
  "engines": {
    "vscode": "^1.80.0"
  },
  ...
}
```

**Publisher Name Selection**:
- Use appropriate publisher identifier (lowercase, alphanumeric, hyphens allowed)
- Examples: `"your-publisher-name"`, `"your-org"`, `"your-name"`
- Must be unique if publishing to VS Code Marketplace
- For now, use placeholder: `"your-publisher-name"` (will be updated before publishing)

**Validation**: `publisher` field added, JSON syntax valid

---

### Step 3: Add Build Scripts

**File**: `package.json`

**Action**: Add two new scripts to `scripts` section:
- `build:python-binaries`: Invokes build script from task 08
- `vscode:package`: Invokes VSIX packaging command

**Implementation**:
```json
{
  "scripts": {
    "compile": "tsc -p .",
    "watch": "tsc -p . -w",
    "build": "npm run compile && npm run bundle-webview",
    "bundle-webview": "esbuild webview-ui/src/index.tsx --bundle --outfile=out/media/webview.js --format=iife --global-name=webviewBundle && npx tailwindcss -i webview-ui/src/index.css -o out/media/webview.css -c webview-ui/tailwind.config.js --minify",
    "build:python-binaries": "node scripts/build-binaries.js",
    "vscode:package": "vsce package",
    "test": "jest",
    "test:python": "python -m pytest tests/ -v"
  }
}
```

**Script Details**:
- `build:python-binaries`: Executes `scripts/build-binaries.js` (created in task 08)
- `vscode:package`: Executes `vsce package` CLI command (from `@vscode/vsce`)

**Validation**: Scripts added, JSON syntax valid

---

### Step 4: Add @vscode/vsce Dev Dependency

**File**: `package.json`

**Action**: Add `@vscode/vsce` to `devDependencies` section

**Implementation**:
```json
{
  "devDependencies": {
    "esbuild": "^0.24.0",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@types/jest": "^29.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@vscode/vsce": "^2.24.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^30.2.0",
    "ts-jest": "^29.0.0",
    "typescript": "^5.0.0"
  }
}
```

**Version Selection**:
- Use `^2.24.0` or latest stable `^2.x.x` version
- Check latest version: `npm view @vscode/vsce version`
- Use caret range (`^2.x.x`) to allow patch and minor updates

**Placement**: Add in alphabetical order within `devDependencies` (after `@types/react-dom`, before `jest`)

**Validation**: Dependency added, JSON syntax valid

---

### Step 5: Verify Complete package.json Structure

**File**: `package.json`

**Checklist**:
- [ ] `publisher` field present (top-level)
- [ ] `build:python-binaries` script present
- [ ] `vscode:package` script present
- [ ] `@vscode/vsce` in `devDependencies`
- [ ] All existing required fields still present
- [ ] JSON syntax valid (no trailing commas, proper quotes)
- [ ] Scripts reference correct commands

**Validation**: All components added, structure complete

---

### Step 6: Install Dependencies

**Action**: Run `pnpm install` to install `@vscode/vsce`

**Command**:
```bash
pnpm install
```

**Expected Output**:
- `@vscode/vsce` installed successfully
- `package-lock.json` updated
- No errors

**Validation**: Dependencies installed successfully

---

## Validation Steps

After implementation:

1. **JSON Syntax Validation**:
   ```bash
   node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))"
   ```
   - Should exit with code 0 (no parse errors)

2. **Dependency Installation**:
   ```bash
   pnpm install
   ```
   - Should install `@vscode/vsce` successfully
   - Should update `package-lock.json`
   - Should not produce errors

3. **Script Availability**:
   ```bash
   pnpm run build:python-binaries --help
   pnpm run vscode:package --help
   ```
   - First command should execute build script (may fail if PyInstaller not installed, but command should exist)
   - Second command should show `vsce` help output

4. **VSIX Packaging** (after binaries built):
   ```bash
   # Build extension
   pnpm run build
   
   # Build binaries (if PyInstaller installed)
   pnpm run build:python-binaries
   
   # Package VSIX
   pnpm run vscode:package
   ```
   - Should create `.vsix` file in project root
   - Filename should match `<name>-<version>.vsix` pattern (e.g., `python-ast-visualization-0.1.0.vsix`)

5. **Field Verification**:
   ```bash
   node -e "const pkg = require('./package.json'); console.log('Publisher:', pkg.publisher); console.log('Scripts:', Object.keys(pkg.scripts));"
   ```
   - Should output publisher name and list of scripts including new ones

## Documentation Updates

### Code Documentation

- **No code documentation needed**: `package.json` is a configuration file, not code

### Project Documentation

No updates required to README.md or other docs at this stage. Documentation will be added in later tasks (task 13: integration testing may document packaging workflow).

## Dependencies

### Prerequisites

- **Node.js**: Required for `pnpm install` (already available)
- **pnpm**: Required for package management (already configured per project rules)

### Code Dependencies

- **None**: This task only modifies `package.json`, no TypeScript code changes

### Task Dependencies

- **Task 08 (Create Build Scripts)**: `build:python-binaries` script references `scripts/build-binaries.js` created in task 08
  - **Impact**: Low - Script will fail gracefully if file doesn't exist yet
  - **Note**: Task 08 should be completed before testing `build:python-binaries` script

### Runtime Dependencies

- **@vscode/vsce**: Required for `vscode:package` script
  - Installed via `pnpm install` (this task)
  - Provides `vsce` CLI command

## Error Handling Details

### JSON Syntax Errors

- **Detection**: `pnpm install` or JSON parsing will fail
- **Action**: Fix JSON syntax (trailing commas, missing quotes, etc.)
- **Prevention**: Use JSON validator before committing

### Missing Publisher Field

- **Detection**: `vsce package` will fail with error: "Missing required field: publisher"
- **Action**: Add `publisher` field to `package.json`
- **Prevention**: Verify field present before packaging

### Script Command Not Found

- **Detection**: `pnpm run <script>` fails with "command not found"
- **Action**: Verify script name matches exactly, verify command exists
- **Prevention**: Test scripts after adding them

### Dependency Installation Failure

- **Detection**: `pnpm install` fails with error
- **Action**: Check network connectivity, verify package name/version correct
- **Prevention**: Use stable version ranges, verify package exists on npm

## Implementation Notes

### Publisher Field Guidelines

1. **Naming Convention**:
   - Lowercase letters, numbers, hyphens only
   - Must be unique if publishing to VS Code Marketplace
   - Examples: `"your-publisher-name"`, `"your-org"`, `"your-name"`
   - Cannot contain spaces or special characters

2. **Placeholder Value**:
   - Use `"your-publisher-name"` as placeholder
   - Update to actual publisher name before publishing
   - Can be changed later without breaking functionality

### Script Naming Conventions

1. **Build Scripts**:
   - Use `build:` prefix for build-related scripts
   - `build:python-binaries` follows existing `build` script pattern
   - Clear, descriptive names

2. **VSIX Scripts**:
   - Use `vscode:` prefix for VS Code-specific scripts
   - `vscode:package` follows VS Code extension conventions
   - Alternative names: `package`, `vsix:package` (current name preferred)

### Dependency Version Management

1. **Version Range**:
   - Use `^2.24.0` or `^2.x.x` for `@vscode/vsce`
   - Allows patch and minor updates
   - Prevents breaking changes from major version updates

2. **Version Updates**:
   - Check latest version: `npm view @vscode/vsce version`
   - Update version range if needed
   - Test packaging after version updates

### Script Execution Order

For complete packaging workflow:
1. `pnpm run build` - Compile TypeScript and bundle webview
2. `pnpm run build:python-binaries` - Build Python service binaries
3. `pnpm run vscode:package` - Package extension as VSIX

**Note**: Scripts can be run independently, but all three are needed for complete VSIX package.

## References

- **VS Code Packaging Guide**: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- **@vscode/vsce Documentation**: https://github.com/microsoft/vscode-vsce
- **package.json Schema**: https://code.visualstudio.com/api/references/extension-manifest
- **Master Plan**: `_features/vscode-extension-packaging/plans/master/implementation.md` Step 9
- **Task Document**: `_features/vscode-extension-packaging/tasks/09-add-package-json-configuration.md`
