# Background

This task modifies extension activation to resolve binary path and pass it to PythonClient. Following TDD, implementation should make all tests from Task 06 pass. This task depends on Tasks 03, 05, and 06.

# This Task

1. Modify `src/extension.ts`:

2. Add import:
   - `import { resolveBinaryPath } from "./binaryResolver"`

3. Modify `activate()` function:
   - Resolve binary path: `const binaryPath = resolveBinaryPath(context.extensionPath)`
   - Add conditional logging:
     - If `!binaryPath`, log warning to output channel: "Warning: Python service binary not found, using system Python"
     - Use existing `getOutputChannel()` function for logging
   - Update PythonClient instantiation: `pythonClient = new PythonClient(binaryPath)`
   - Keep all other activation logic unchanged (command registration, file watchers, etc.)

4. Update function docstring:
   - Document binary resolution behavior
   - Document development mode fallback
   - Document error handling

5. Ensure error handling:
   - Activation continues even if binary not found (development mode)
   - Clear warning message for developers
   - No exceptions thrown for missing binaries

**Acceptance Criteria**:
- All tests from Task 06 pass
- TypeScript compilation succeeds
- Binary path resolved correctly during activation
- Warning logged when binary not found
- Activation continues successfully in all scenarios
- Code follows project patterns

# Testing Needed

Tests are already written in Task 06. This task implements the code to make those tests pass. After implementation, verify:
- All extension tests pass: `pnpm test extension.test.ts`
- TypeScript compilation succeeds
- Manual test: Verify activation works with binary (if available)
- Manual test: Verify activation works without binary (development mode)
