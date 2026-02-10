# Background

This task creates integration tests to verify end-to-end binary execution flow works correctly. This ensures all components work together: binary resolution, PythonClient execution, and extension activation. This depends on all previous implementation tasks (Tasks 01-07).

# This Task

1. Create `tests/integration/binary-execution.test.ts`:

2. Implement integration test cases:

   - Test extension activates with binary:
     - Create mock extension context with extension path
     - Resolve binary path using `resolveBinaryPath()`
     - Create `PythonClient` with binary path
     - Verify `PythonClient` instantiated correctly
   
   - Test binary execution:
     - Build binary for current platform (if not exists, skip test)
     - Resolve binary path from test extension context
     - Create `PythonClient` with binary path
     - Spawn service and send parse request
     - Verify JSON-RPC response received
     - Verify graph data structure correct
     - Stop service cleanup
   
   - Test protocol compatibility:
     - Compare binary execution vs Python command execution
     - Verify identical JSON-RPC protocol
     - Verify identical graph output format
     - Verify identical error handling
   
   - Test fallback behavior:
     - Test with binary path set to `null`
     - Verify falls back to Python command
     - Verify same functionality (if Python available)
     - Verify warning logged (if applicable)

3. Setup test infrastructure:
   - Create test extension context mock
   - Setup binary path resolution for tests
   - Handle platform-specific test skipping
   - Cleanup after tests

4. Add test utilities:
   - Helper to create test extension context
   - Helper to resolve test binary path
   - Helper to send test JSON-RPC requests
   - Helper to validate graph responses

**Acceptance Criteria**:
- Integration tests created
- Tests compile successfully
- Tests verify end-to-end flow
- Tests handle platform-specific scenarios
- Tests verify protocol compatibility
- Tests verify fallback behavior

# Testing Needed

This task IS the integration test writing task. After writing tests, verify:

1. Test execution:
   - Run integration tests: `pnpm test tests/integration`
   - Verify tests pass (if binary available)
   - Verify tests skip gracefully (if binary not available)

2. Test coverage:
   - Verify all integration scenarios covered
   - Verify error cases tested
   - Verify fallback behavior tested

3. Manual validation:
   - Run extension with binary
   - Verify AST visualization works
   - Verify no errors in output channel
