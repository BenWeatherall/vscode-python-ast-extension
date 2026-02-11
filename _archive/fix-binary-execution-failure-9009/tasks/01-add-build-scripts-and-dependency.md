# Background

The root cause of the binary execution failure (exit code 9009) is that the VSIX package contains stale compiled JavaScript that predates the binary resolution feature implementation. The packaging workflow does not automatically recompile TypeScript before creating the VSIX.

The fix is to implement the industry-standard `vscode:prepublish` npm lifecycle hook that VSCE automatically executes before packaging. This hook will run a clean build, ensuring no stale artifacts are included.

This task adds the necessary scripts and dependency to package.json to support automated clean builds.

**Dependencies**: None (first task in sequence)

# This Task

Modify `package.json` to add build automation scripts and the rimraf dependency:

## Files to Modify

1. **package.json**
   - Add `rimraf` to `devDependencies` section (version `^5.0.0`)
   - Add three new scripts to `scripts` section:
     - `clean`: `rimraf out` - Removes output directory
     - `build:clean`: `npm run clean && npm run build` - Clean build from scratch
     - `vscode:prepublish`: `npm run build:clean` - Lifecycle hook run by VSCE before packaging
   - Maintain alphabetical ordering within script groups

## Specific Implementation Steps

1. Open `package.json`

2. Add `rimraf` to `devDependencies`:
   - Insert `"rimraf": "^5.0.0"` in alphabetical order
   - Place after `"jest-environment-jsdom"` and before `"ts-jest"`

3. Add new scripts to `scripts` section:
   - Insert `"clean": "rimraf out"` after `"bundle-webview"` (alphabetical order)
   - Insert `"build:clean": "npm run clean && npm run build"` after `"build:python-binaries"`
   - Insert `"vscode:prepublish": "npm run build:clean"` after `"vscode:package"`

4. Save file

5. Run `pnpm install` to install rimraf dependency

## Acceptance Criteria

- ✅ `rimraf` added to devDependencies with version `^5.0.0`
- ✅ `clean` script added: `rimraf out`
- ✅ `build:clean` script added: `npm run clean && npm run build`
- ✅ `vscode:prepublish` script added: `npm run build:clean`
- ✅ Scripts maintain alphabetical ordering
- ✅ `pnpm install` completes successfully
- ✅ `pnpm list rimraf` shows rimraf installed

# Testing Needed

Since this task only modifies package.json configuration, testing is validation-based:

## Validation Tests

1. **Verify rimraf installation**:
   ```powershell
   pnpm list rimraf
   # Should show: rimraf 5.0.x
   ```

2. **Verify pnpm-lock.yaml updated**:
   - Check that `pnpm-lock.yaml` contains rimraf entries
   - Confirms dependency tree updated correctly

3. **Verify no syntax errors**:
   ```powershell
   pnpm run --help
   # Should list all scripts without errors
   ```

## Notes

- This task does NOT test script functionality - that is Task 02
- This task only verifies the configuration changes are correct
- The `vscode:prepublish` hook will be tested in Task 02 when we verify the build system
