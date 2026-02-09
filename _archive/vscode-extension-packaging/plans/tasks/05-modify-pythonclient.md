# Per-Task Implementation Plan: Modify PythonClient

## Overview

This task modifies `PythonClient` to accept and use a binary path for spawning the Python service. Following TDD, the implementation makes all tests from Task 04 pass. The changes enable `PythonClient` to execute a bundled binary executable instead of relying on system Python, while maintaining full backward compatibility and protocol compatibility.

**Task Context**: This task depends on Tasks 03 (binary resolver implemented) and 04 (tests written). The implementation follows the test expectations defined in Task 04, ensuring binary execution works identically to Python command execution from a protocol perspective.

## Files to Modify

### Primary File
- **`src/pythonClient.ts`**: Modify constructor and `spawnService()` method

## Test Strategy

### Tests Already Written
Tests are already written in Task 04 (`src/__tests__/pythonClient.test.ts`). This task implements the code to make those tests pass.

### Test Coverage
The implementation must satisfy:
1. **Constructor Tests**: Accept binary path, null, undefined, or no arguments
2. **Spawn Service Tests**: Spawn binary with empty args when path provided; spawn Python command when path not provided
3. **Protocol Compatibility Tests**: JSON-RPC communication unchanged
4. **Edge Case Tests**: Handle empty string, execution failures, process exit errors

## Implementation Order

### Step 1: Add Binary Path Field and Constructor Parameter

**Location**: `src/pythonClient.ts`

**Changes**:
1. Add private field: `private binaryPath: string | null = null`
2. Modify constructor to accept optional parameter: `constructor(binaryPath?: string | null)`
3. Set field: `this.binaryPath = binaryPath || null`
4. Add Google-style docstring explaining parameter and fallback behavior

**Implementation**:
```typescript
/** Client for spawning and communicating with the Python AST parse service. */
export class PythonClient {
  private process: ChildProcess | null = null;
  private binaryPath: string | null = null;

  /**
   * Creates a new PythonClient instance.
   * @param binaryPath - Optional path to Python service binary executable.
   *   If provided, the binary will be executed directly. If null, undefined, or omitted,
   *   falls back to executing `python -m python_service` using system Python.
   */
  constructor(binaryPath?: string | null) {
    this.binaryPath = binaryPath || null;
  }
  // ... rest of class
}
```

**Validation**: TypeScript compilation succeeds, constructor accepts all test cases

---

### Step 2: Modify spawnService() Method

**Location**: `src/pythonClient.ts`

**Changes**:
1. Determine command: `const command = this.binaryPath || "python"`
2. Determine args: `const args = this.binaryPath ? [] : ["-m", "python_service"]`
3. Update spawn call to use `command` and `args`
4. Keep all other spawn logic unchanged (stdio handling, process events, error handling)
5. Update method docstring to document binary vs Python command behavior

**Implementation**:
```typescript
/**
 * Spawns the Python service process using stdio for communication.
 * 
 * If a binary path was provided to the constructor, executes the binary directly.
 * Otherwise, executes `python -m python_service` using system Python.
 * 
 * @throws Error if spawn fails or process exits immediately
 */
async spawnService(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Use binary if available, fallback to python -m python_service
    const command = this.binaryPath || "python";
    const args = this.binaryPath ? [] : ["-m", "python_service"];
    
    const proc = spawn(command, args, {
      stdio: ["pipe", "pipe", "pipe"],
    });

    this.process = proc;

    proc.on("spawn", () => resolve());
    proc.on("error", (err) => {
      this.process = null;
      reject(new Error(`Failed to spawn Python service: ${err.message}`));
    });
    proc.on("exit", (code) => {
      this.process = null;
      if (code !== null && code !== 0) {
        reject(new Error(`Python service exited with code ${code}`));
      }
    });
  });
}
```

**Validation**: TypeScript compilation succeeds, spawn logic uses correct command/args

---

### Step 3: Verify Protocol Compatibility

**Location**: `src/pythonClient.ts`

**Verification Points**:
1. **`parseAST()` method**: No changes needed - protocol handled via stdio, independent of spawn command
2. **JSON-RPC format**: Unchanged - request/response format identical regardless of execution method
3. **Message handling**: Unchanged - stdout/stdin handling identical
4. **Error handling**: Unchanged - error propagation identical

**Implementation**:
- No code changes needed - verify that `parseAST()` method remains unchanged
- Verify that stdio communication works identically for binary and Python command execution

**Validation**: Protocol compatibility tests from Task 04 pass

---

### Step 4: Verify Backward Compatibility

**Location**: `src/pythonClient.ts`

**Verification Points**:
1. **Default behavior**: `new PythonClient()` uses `python -m python_service` (unchanged)
2. **Existing code paths**: All existing code that creates `PythonClient` without arguments continues to work
3. **API compatibility**: No breaking changes to public API (only addition of optional parameter)

**Implementation**:
- Verify constructor parameter is optional (defaults to `undefined`)
- Verify `spawnService()` fallback logic works correctly when `binaryPath` is null/undefined
- Ensure no changes to other methods (`parseAST()`, `stopService()`, `isServiceRunning()`)

**Validation**: All existing tests pass, backward compatibility maintained

---

### Step 5: Handle Edge Cases

**Location**: `src/pythonClient.ts`

**Edge Cases**:
1. **Empty string**: `new PythonClient("")` - should fall back to Python command (empty string is falsy)
2. **Binary execution failure**: Handled by existing `proc.on("error")` handler
3. **Binary exit error**: Handled by existing `proc.on("exit")` handler

**Implementation**:
- Empty string handling: `this.binaryPath || null` treats empty string as falsy, correctly falling back to Python command
- Error handling: Existing error handlers work for both binary and Python command execution
- No additional code needed - JavaScript truthiness handles empty string correctly

**Validation**: Edge case tests from Task 04 pass

---

## Validation Steps

### Compilation Validation
1. Run TypeScript compilation: `pnpm run compile`
2. Verify no TypeScript errors
3. Verify all type checks pass

### Test Execution Validation
1. Run tests: `pnpm test pythonClient.test.ts`
2. Verify all tests from Task 04 pass:
   - Constructor tests pass
   - Spawn service tests pass (binary and Python command paths)
   - Protocol compatibility tests pass
   - Edge case tests pass
3. Verify existing tests still pass (backward compatibility)

### Functional Validation
1. **Binary execution** (if binary available):
   - Create `PythonClient` with binary path
   - Call `spawnService()`
   - Verify binary executes successfully
   - Verify JSON-RPC communication works
2. **Python command fallback**:
   - Create `PythonClient` without binary path
   - Call `spawnService()`
   - Verify `python -m python_service` executes
   - Verify JSON-RPC communication works

### Code Quality Validation
1. Run linting: `pnpm run lint` (if available)
2. Verify code follows project patterns:
   - Google-style docstrings
   - Consistent naming conventions
   - Proper TypeScript types
3. Verify no unnecessary changes to other methods

## Documentation Updates

### Code Documentation
- **Constructor docstring**: Document `binaryPath` parameter and fallback behavior
- **`spawnService()` docstring**: Document binary vs Python command execution behavior
- Ensure docstrings follow Google-style format

### No Documentation Updates Needed
- No README updates needed (implementation detail)
- No API documentation updates needed (backward compatible change)

## Dependencies

### Prerequisites
- **Task 03**: Binary resolver implemented (provides context for binary path usage)
- **Task 04**: Tests written (defines expected behavior)

### No Dependencies On
- **Task 06**: Extension integration (PythonClient is independent)
- **Task 07**: Extension activation (PythonClient is independent)

## Acceptance Criteria

- ✅ All tests from Task 04 pass
- ✅ TypeScript compilation succeeds
- ✅ Binary execution works when path provided
- ✅ Python command execution works when path not provided
- ✅ Protocol compatibility maintained (JSON-RPC unchanged)
- ✅ Backward compatibility maintained (existing code paths unchanged)
- ✅ Code follows project patterns (docstrings, naming, types)
- ✅ Edge cases handled (empty string, execution failures)

## Implementation Notes

### Binary Path Handling

**Truthiness Logic**:
- `null` → falsy → fallback to Python command
- `undefined` → falsy → fallback to Python command
- `""` (empty string) → falsy → fallback to Python command
- `"/path/to/binary.exe"` → truthy → use binary

**Implementation**: `this.binaryPath || null` correctly handles all cases:
- `undefined` → `null`
- `null` → `null`
- `""` → `null` (empty string is falsy)
- `"/path/to/binary.exe"` → `"/path/to/binary.exe"`

### Spawn Command Logic

**Binary Path Provided**:
```typescript
const command = this.binaryPath;  // e.g., "/path/to/binary.exe"
const args = [];                  // Empty - binary is self-contained
```

**Binary Path Not Provided**:
```typescript
const command = "python";         // System Python
const args = ["-m", "python_service"];  // Module execution
```

### Protocol Compatibility

The JSON-RPC protocol is **completely independent** of how the process is spawned:
- **Request format**: Identical regardless of execution method
- **Response format**: Identical regardless of execution method
- **Stdio communication**: Identical regardless of execution method
- **Error handling**: Identical regardless of execution method

No changes to `parseAST()` or communication logic are needed.

### Backward Compatibility

The changes are **fully backward compatible**:
- Constructor parameter is optional (defaults to `undefined`)
- Default behavior unchanged: `new PythonClient()` → `python -m python_service`
- All existing methods unchanged: `parseAST()`, `stopService()`, `isServiceRunning()`
- All existing code paths continue to work without modification

## References

- **Master Plan**: `_features/vscode-extension-packaging/plans/master/implementation.md` (Step 5)
- **Master Plan**: `_features/vscode-extension-packaging/plans/master/architecture.md` (PythonClient Modification section)
- **Task 04 Plan**: `_features/vscode-extension-packaging/plans/tasks/04-write-pythonclient-modification-tests.md`
- **Task 04 Tests**: `src/__tests__/pythonClient.test.ts`
- **PythonClient Implementation**: `src/pythonClient.ts`
- **Project Patterns**: `@docs/AI_CONTEXT/AI_CONTEXT_PATTERNS.md`
- **TDD Practices**: `@.cursor/rules/development_practices.mdc`
