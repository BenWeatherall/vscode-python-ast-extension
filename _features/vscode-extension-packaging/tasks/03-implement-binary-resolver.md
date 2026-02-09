# Background

This task implements the binary resolver module based on the interfaces defined in Task 01 and tests written in Task 02. Following TDD, implementation should make all tests pass. This task depends on Tasks 01 and 02.

# This Task

1. Implement `src/binaryResolver.ts`:

2. Implement `getPlatformBinaryName()`:
   - Read `process.platform` and `process.arch`
   - Map platform/arch combinations to binary filenames:
     - `win32` + `x64` → `"python_service-win-x64.exe"`
     - `linux` + `x64` → `"python_service-linux-x64"`
     - `darwin` + `arm64` → `"python_service-darwin-arm64"`
     - `darwin` + `x64` → `"python_service-darwin-x64"`
   - Return `null` for unsupported combinations
   - Add Google-style docstring

3. Implement `resolveBinaryPath(extensionPath: string)`:
   - Call `getPlatformBinaryName()` to get binary filename
   - Return `null` if platform unsupported
   - Construct path: `path.join(extensionPath, "bin", binaryName)`
   - Validate file exists using `fs.existsSync()`
   - Return absolute path if exists, `null` otherwise
   - Add Google-style docstring

4. Implement `validateBinary(binaryPath: string)`:
   - Check file existence using `fs.existsSync(binaryPath)`
   - Return `true` if exists, `false` otherwise
   - Add Google-style docstring

5. Add imports:
   - `import * as path from "path"`
   - `import * as fs from "fs"`

6. Ensure all functions are exported

**Acceptance Criteria**:
- All tests from Task 02 pass
- TypeScript compilation succeeds
- Functions return correct values for all test cases
- Error handling returns `null` (not throws) for unsupported platforms
- Code follows project patterns (see `@.cursor/rules/development_practices.mdc`)

# Testing Needed

Tests are already written in Task 02. This task implements the code to make those tests pass. After implementation, verify:
- All unit tests pass: `pnpm test binaryResolver.test.ts`
- TypeScript compilation succeeds: `pnpm run compile`
- Linting passes: `ruff check` (if applicable)
