# Background

This task writes comprehensive tests for the binary resolver module following TDD principles. The tests are written before implementation to define expected behavior. This task depends on Task 01 (interfaces defined) and will guide the implementation in Task 03.

# This Task

1. Create `src/__tests__/binaryResolver.test.ts` with test suite:

2. Test `getPlatformBinaryName()` function:
   - Test Windows x64: Mock `process.platform = "win32"`, `process.arch = "x64"`, expect `"python_service-win-x64.exe"`
   - Test Linux x64: Mock `process.platform = "linux"`, `process.arch = "x64"`, expect `"python_service-linux-x64"`
   - Test macOS ARM64: Mock `process.platform = "darwin"`, `process.arch = "arm64"`, expect `"python_service-darwin-arm64"`
   - Test macOS x64: Mock `process.platform = "darwin"`, `process.arch = "x64"`, expect `"python_service-darwin-x64"`
   - Test unsupported platform: Mock unsupported platform/arch, expect `null`

3. Test `resolveBinaryPath()` function:
   - Test valid path resolution: Mock `fs.existsSync()` returns `true`, verify correct path construction
   - Test unsupported platform: Mock `getPlatformBinaryName()` returns `null`, expect `null`
   - Test binary not found: Mock `fs.existsSync()` returns `false`, expect `null`
   - Test path construction: Verify `path.join()` called with correct arguments, verify absolute path returned

4. Test `validateBinary()` function:
   - Test file exists: Mock `fs.existsSync()` returns `true`, expect `true`
   - Test file not found: Mock `fs.existsSync()` returns `false`, expect `false`

5. Setup mocks:
   - Mock `fs` module using Jest
   - Mock `process.platform` and `process.arch` per test
   - Use real `path` module (deterministic)

**Acceptance Criteria**:
- All test cases defined
- Tests compile successfully
- Tests fail initially (implementation not yet written)
- Mock strategy clearly defined
- Test coverage includes all function signatures and edge cases

# Testing Needed

This task IS the test writing task. The tests written here will validate the implementation in Task 03.
