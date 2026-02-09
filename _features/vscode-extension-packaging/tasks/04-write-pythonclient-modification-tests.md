# Background

This task writes tests for PythonClient modifications to support binary execution. Following TDD, tests are written before modifying PythonClient. This task depends on Task 03 (binary resolver implemented) as PythonClient will use binary path resolution.

# This Task

1. Modify `src/__tests__/pythonClient.test.ts`:

2. Add constructor tests:
   - Test accepts binary path: Create `PythonClient` with binary path, verify path stored internally (if exposed for testing)
   - Test accepts null binary path: Create `PythonClient` with `null`, verify falls back to Python command
   - Test accepts undefined binary path: Create `PythonClient` with `undefined`, verify falls back to Python command

3. Add spawn service tests:
   - Test spawns binary when path provided:
     - Create `PythonClient` with binary path
     - Call `spawnService()`
     - Verify `spawn()` called with binary path and empty args array `[]`
     - Verify stdio configuration unchanged: `{ stdio: ["pipe", "pipe", "pipe"] }`
   
   - Test spawns Python command when path not provided:
     - Create `PythonClient` without binary path
     - Call `spawnService()`
     - Verify `spawn()` called with `"python"` and `["-m", "python_service"]` args
     - Verify stdio configuration unchanged
   
   - Test protocol compatibility:
     - Verify JSON-RPC communication unchanged
     - Verify `parseAST()` behavior unchanged
     - Verify message handling unchanged

4. Update existing mocks:
   - Update `spawn` mocks to handle binary path vs Python command
   - Verify spawn called with correct command and args based on binary path presence
   - Ensure process events (spawn, error, exit) work for both paths

5. Add edge case tests:
   - Test binary path provided but binary execution fails
   - Test fallback behavior when binary path invalid

**Acceptance Criteria**:
- All new test cases defined
- Tests compile successfully
- Tests fail initially (PythonClient not yet modified)
- Mock strategy updated for binary execution
- Protocol compatibility tests included

# Testing Needed

This task IS the test writing task. The tests written here will validate the PythonClient modifications in Task 05.
