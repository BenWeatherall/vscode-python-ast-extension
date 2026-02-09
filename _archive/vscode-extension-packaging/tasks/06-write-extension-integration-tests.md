# Background

This task writes tests for extension activation integration with binary resolution. Following TDD, tests are written before modifying extension.ts. This task depends on Tasks 03 and 05 (binary resolver and PythonClient implemented).

# This Task

1. Modify `src/__tests__/extension.test.ts`:

2. Add activation tests:
   - Test resolves binary path:
     - Mock `ExtensionContext` with `extensionPath`
     - Mock `resolveBinaryPath()` to return binary path
     - Call `activate()`
     - Verify `resolveBinaryPath()` called with `context.extensionPath`
     - Verify `PythonClient` constructor called with binary path
   
   - Test handles missing binary:
     - Mock `resolveBinaryPath()` to return `null`
     - Call `activate()`
     - Verify warning logged to output channel
     - Verify `PythonClient` created with `null` path
     - Verify activation continues (doesn't throw)
   
   - Test handles unsupported platform:
     - Mock `resolveBinaryPath()` to return `null` (unsupported platform)
     - Call `activate()`
     - Verify activation continues gracefully
     - Verify fallback to Python command

3. Setup mocks:
   - Mock `resolveBinaryPath()` function from binary resolver
   - Mock `PythonClient` constructor
   - Mock VS Code API using existing `__mocks__/vscodeMock.ts`
   - Mock output channel for logging verification

4. Add integration test cases:
   - Test binary path passed through activation flow
   - Test error handling for binary resolution failures
   - Test logging behavior for development mode fallback

**Acceptance Criteria**:
- All new test cases defined
- Tests compile successfully
- Tests fail initially (extension not yet modified)
- Mock strategy covers all activation scenarios
- Error handling tests included

# Testing Needed

This task IS the test writing task. The tests written here will validate the extension modifications in Task 07.
