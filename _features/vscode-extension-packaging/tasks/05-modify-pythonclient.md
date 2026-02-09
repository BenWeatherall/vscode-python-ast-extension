# Background

This task modifies PythonClient to accept and use binary path for spawning the Python service. Following TDD, implementation should make all tests from Task 04 pass. This task depends on Tasks 03 and 04.

# This Task

1. Modify `src/pythonClient.ts`:

2. Update constructor:
   - Add optional `binaryPath?: string | null` parameter
   - Store binary path in private field: `private binaryPath: string | null = null`
   - Set `this.binaryPath = binaryPath || null` in constructor
   - Add Google-style docstring explaining parameter and fallback behavior

3. Modify `spawnService()` method:
   - Determine command: `const command = this.binaryPath || "python"`
   - Determine args: `const args = this.binaryPath ? [] : ["-m", "python_service"]`
   - Update spawn call: `spawn(command, args, { stdio: ["pipe", "pipe", "pipe"] })`
   - Keep all other spawn logic unchanged (stdio handling, process events, error handling)
   - Update method docstring to document binary vs Python command behavior

4. Ensure protocol compatibility:
   - Verify JSON-RPC stdio protocol unchanged
   - Verify `parseAST()` method unchanged
   - Verify message handling unchanged
   - No changes to communication layer

5. Maintain backward compatibility:
   - Default behavior (no binary path) uses `python -m python_service`
   - Existing code paths unchanged if binary path not provided

**Acceptance Criteria**:
- All tests from Task 04 pass
- TypeScript compilation succeeds
- Binary execution works when path provided
- Python command execution works when path not provided
- Protocol compatibility maintained
- Code follows project patterns

# Testing Needed

Tests are already written in Task 04. This task implements the code to make those tests pass. After implementation, verify:
- All PythonClient tests pass: `pnpm test pythonClient.test.ts`
- TypeScript compilation succeeds
- Manual test: Verify binary execution works (if binary available)
- Manual test: Verify Python command fallback works
