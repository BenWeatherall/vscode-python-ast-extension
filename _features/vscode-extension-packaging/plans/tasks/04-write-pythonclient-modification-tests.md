# Per-Task Implementation Plan: Write PythonClient Modification Tests

## Overview

This task writes comprehensive tests for `PythonClient` modifications to support binary execution. Following TDD principles, these tests are written **before** modifying `PythonClient` (Task 05), ensuring the implementation meets the requirements. The tests validate that `PythonClient` can accept a binary path, spawn binaries instead of Python commands, and maintain protocol compatibility.

**Task Context**: This task depends on Task 03 (binary resolver implemented) as the tests will reference binary path resolution patterns, though the tests themselves mock binary paths directly.

## Files to Modify

### Primary File
- **`src/__tests__/pythonClient.test.ts`**: Add new test suites for binary execution support

## Test Strategy

### Test Organization

Tests are organized into logical suites:
1. **Constructor Tests**: Validate binary path parameter handling
2. **Spawn Service Tests**: Validate binary vs Python command spawning
3. **Protocol Compatibility Tests**: Ensure JSON-RPC communication unchanged
4. **Edge Case Tests**: Handle error scenarios and fallback behavior

### Mock Strategy

- **`child_process.spawn`**: Already mocked in existing tests; extend mocks to handle binary path scenarios
- **Process Events**: Use existing `createMockProcess()` helper; verify spawn called with correct command/args
- **Binary Path**: Pass binary paths directly to constructor (no need to mock `binaryResolver` in these tests)

## Implementation Order

### Step 1: Add Constructor Test Suite

**Location**: `src/__tests__/pythonClient.test.ts`

**Test Cases**:

1. **`accepts_binary_path_parameter`**:
   - Create `PythonClient` with binary path string: `new PythonClient("/path/to/binary.exe")`
   - Verify constructor succeeds (no error thrown)
   - Note: Binary path storage is internal; if not exposed, verify via spawn behavior in later tests

2. **`accepts_null_binary_path`**:
   - Create `PythonClient` with `null`: `new PythonClient(null)`
   - Verify constructor succeeds
   - Verify falls back to Python command (validated in spawn tests)

3. **`accepts_undefined_binary_path`**:
   - Create `PythonClient` with `undefined`: `new PythonClient(undefined)`
   - Verify constructor succeeds
   - Verify falls back to Python command (validated in spawn tests)

4. **`accepts_no_arguments`**:
   - Create `PythonClient` with no arguments: `new PythonClient()`
   - Verify constructor succeeds
   - Verify falls back to Python command (validated in spawn tests)

**Implementation**:
```typescript
describe("constructor", () => {
  it("accepts binary path parameter", () => {
    const client = new PythonClient("/path/to/binary.exe");
    expect(client).toBeInstanceOf(PythonClient);
  });

  it("accepts null binary path", () => {
    const client = new PythonClient(null);
    expect(client).toBeInstanceOf(PythonClient);
  });

  it("accepts undefined binary path", () => {
    const client = new PythonClient(undefined);
    expect(client).toBeInstanceOf(PythonClient);
  });

  it("accepts no arguments", () => {
    const client = new PythonClient();
    expect(client).toBeInstanceOf(PythonClient);
  });
});
```

**Validation**: Tests compile but fail (PythonClient constructor doesn't accept parameter yet)

---

### Step 2: Add Spawn Service Test Suite

**Location**: `src/__tests__/pythonClient.test.ts`

**Test Cases**:

1. **`spawns_binary_when_path_provided`**:
   - Create `PythonClient` with binary path: `new PythonClient("/path/to/binary.exe")`
   - Call `spawnService()`
   - Verify `spawn()` called with:
     - Command: `"/path/to/binary.exe"`
     - Args: `[]` (empty array)
     - Stdio: `{ stdio: ["pipe", "pipe", "pipe"] }`

2. **`spawns_python_command_when_path_not_provided`**:
   - Create `PythonClient` without binary path: `new PythonClient(null)`
   - Call `spawnService()`
   - Verify `spawn()` called with:
     - Command: `"python"`
     - Args: `["-m", "python_service"]`
     - Stdio: `{ stdio: ["pipe", "pipe", "pipe"] }`

3. **`spawns_python_command_when_path_undefined`**:
   - Create `PythonClient` with `undefined`: `new PythonClient(undefined)`
   - Call `spawnService()`
   - Verify `spawn()` called with `"python"` and `["-m", "python_service"]`

4. **`spawns_python_command_when_no_arguments`**:
   - Create `PythonClient()` with no arguments
   - Call `spawnService()`
   - Verify `spawn()` called with `"python"` and `["-m", "python_service"]`

**Implementation**:
```typescript
describe("spawnService", () => {
  describe("with binary path", () => {
    it("spawns binary when path provided", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc as never);

      const client = new PythonClient("/path/to/binary.exe");
      await client.spawnService();

      expect(mockSpawn).toHaveBeenCalledWith(
        "/path/to/binary.exe",
        [],
        expect.objectContaining({
          stdio: ["pipe", "pipe", "pipe"],
        })
      );
    });
  });

  describe("without binary path", () => {
    it("spawns Python command when path not provided", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc as never);

      const client = new PythonClient(null);
      await client.spawnService();

      expect(mockSpawn).toHaveBeenCalledWith(
        "python",
        ["-m", "python_service"],
        expect.objectContaining({
          stdio: ["pipe", "pipe", "pipe"],
        })
      );
    });

    it("spawns Python command when path undefined", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc as never);

      const client = new PythonClient(undefined);
      await client.spawnService();

      expect(mockSpawn).toHaveBeenCalledWith(
        "python",
        ["-m", "python_service"],
        expect.objectContaining({
          stdio: ["pipe", "pipe", "pipe"],
        })
      );
    });

    it("spawns Python command when no arguments", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc as never);

      const client = new PythonClient();
      await client.spawnService();

      expect(mockSpawn).toHaveBeenCalledWith(
        "python",
        ["-m", "python_service"],
        expect.objectContaining({
          stdio: ["pipe", "pipe", "pipe"],
        })
      );
    });
  });
});
```

**Validation**: Tests compile but fail (PythonClient doesn't accept binary path parameter yet)

---

### Step 3: Add Protocol Compatibility Test Suite

**Location**: `src/__tests__/pythonClient.test.ts`

**Test Cases**:

1. **`protocol_compatibility_binary_execution`**:
   - Create `PythonClient` with binary path
   - Spawn service and send parse request
   - Verify JSON-RPC request format unchanged (same as existing tests)
   - Verify response parsing unchanged
   - Verify graph conversion unchanged

2. **`protocol_compatibility_python_command`**:
   - Create `PythonClient` without binary path
   - Spawn service and send parse request
   - Verify JSON-RPC request format unchanged
   - Verify response parsing unchanged
   - Verify graph conversion unchanged

3. **`parseAST_behavior_unchanged_with_binary`**:
   - Use binary path client
   - Call `parseAST("def hello(): pass")`
   - Verify graph structure matches expected format
   - Verify conversion from Python JSON (snake_case) to TypeScript (camelCase) works

4. **`parseAST_behavior_unchanged_without_binary`**:
   - Use Python command client
   - Call `parseAST("def hello(): pass")`
   - Verify graph structure matches expected format
   - Verify conversion works correctly

**Implementation**:
```typescript
describe("protocol compatibility", () => {
  it("maintains JSON-RPC protocol with binary execution", async () => {
    const mockProc = createMockProcess();
    mockSpawn.mockReturnValue(mockProc as never);

    const client = new PythonClient("/path/to/binary.exe");
    await client.spawnService();

    const pythonGraph = {
      nodes: [
        {
          id: "n1",
          label: "FunctionDef",
          inputs: {},
          outputs: { body: {} },
          data: { ast_type: "FunctionDef", lineno: 1 },
        },
      ],
      connections: [],
    };

    const parsePromise = client.parseAST("def hello(): pass");
    mockProc.sendResponse({ result: pythonGraph });

    const graph = await parsePromise;
    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0].data.astType).toBe("FunctionDef");
    expect(graph.nodes[0].data.lineno).toBe(1);
  });

  it("maintains JSON-RPC protocol with Python command", async () => {
    const mockProc = createMockProcess();
    mockSpawn.mockReturnValue(mockProc as never);

    const client = new PythonClient(null);
    await client.spawnService();

    const pythonGraph = {
      nodes: [
        {
          id: "n1",
          label: "FunctionDef",
          inputs: {},
          outputs: { body: {} },
          data: { ast_type: "FunctionDef", lineno: 1 },
        },
      ],
      connections: [],
    };

    const parsePromise = client.parseAST("def hello(): pass");
    mockProc.sendResponse({ result: pythonGraph });

    const graph = await parsePromise;
    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0].data.astType).toBe("FunctionDef");
  });
});
```

**Validation**: Tests compile but fail (PythonClient doesn't support binary path yet)

---

### Step 4: Add Edge Case Test Suite

**Location**: `src/__tests__/pythonClient.test.ts`

**Test Cases**:

1. **`handles_binary_execution_failure`**:
   - Create `PythonClient` with binary path
   - Mock `spawn()` to trigger "error" event (binary not found or not executable)
   - Call `spawnService()`
   - Verify error is thrown with appropriate message

2. **`handles_binary_exit_error`**:
   - Create `PythonClient` with binary path
   - Spawn service successfully
   - Trigger process exit with non-zero code
   - Verify error handling works (same as existing exit error tests)

3. **`handles_empty_binary_path_string`**:
   - Create `PythonClient` with empty string: `new PythonClient("")`
   - Call `spawnService()`
   - Verify behavior (should fall back to Python command or handle gracefully)

**Implementation**:
```typescript
describe("edge cases", () => {
  it("handles binary execution failure", async () => {
    const mockProc = createMockProcess();
    mockSpawn.mockReturnValue(mockProc as never);

    const client = new PythonClient("/path/to/nonexistent.exe");
    
    // Mock spawn error event
    mockProc.on.mockImplementation((event: string, callback: (err: Error) => void) => {
      if (event === "error") {
        setTimeout(() => callback(new Error("ENOENT: no such file or directory")), 0);
      }
      return mockProc;
    });

    await expect(client.spawnService()).rejects.toThrow(/Failed to spawn|ENOENT/);
  });

  it("handles binary exit error", async () => {
    const mockProc = createMockProcess();
    mockSpawn.mockReturnValue(mockProc as never);

    const client = new PythonClient("/path/to/binary.exe");
    await client.spawnService();

    const parsePromise = client.parseAST("x = 1");
    mockProc.triggerExit(1);

    await expect(parsePromise).rejects.toThrow(/service|unavailable|exit|error/i);
  });

  it("handles empty binary path string", async () => {
    const mockProc = createMockProcess();
    mockSpawn.mockReturnValue(mockProc as never);

    const client = new PythonClient("");
    await client.spawnService();

    // Should fall back to Python command or handle empty string appropriately
    // Implementation decision: empty string treated as falsy, falls back to Python
    expect(mockSpawn).toHaveBeenCalledWith(
      "python",
      ["-m", "python_service"],
      expect.objectContaining({
        stdio: ["pipe", "pipe", "pipe"],
      })
    );
  });
});
```

**Validation**: Tests compile but fail (PythonClient doesn't support binary path yet)

---

### Step 5: Update Existing Test Mocks

**Location**: `src/__tests__/pythonClient.test.ts`

**Changes**:
- Review existing tests to ensure they still work with new constructor signature
- Update tests that create `PythonClient` to explicitly pass `null` or `undefined` if needed
- Ensure all existing tests continue to pass (they should, as constructor will accept optional parameter)

**Implementation**:
- No changes needed if constructor parameter is optional
- If any tests break, update them to pass `null` or `undefined` explicitly

**Validation**: All existing tests still compile and pass (or fail appropriately if PythonClient modified)

---

## Validation Steps

### Compilation Validation
1. Run TypeScript compilation: `pnpm run compile`
2. Verify no TypeScript errors related to new tests
3. Verify test file compiles successfully

### Test Execution Validation
1. Run tests: `pnpm test pythonClient.test.ts`
2. Verify all new tests **fail** (as expected, since PythonClient not yet modified)
3. Verify existing tests still pass (or update if needed)
4. Verify test output shows clear failure messages indicating missing functionality

### Test Coverage Validation
1. Review test coverage to ensure:
   - Constructor parameter handling covered
   - Binary spawning path covered
   - Python command fallback covered
   - Protocol compatibility covered
   - Edge cases covered

### Mock Validation
1. Verify mocks correctly simulate:
   - Binary path spawning (empty args)
   - Python command spawning (with args)
   - Process events (spawn, error, exit)
   - Stdio communication

## Documentation Updates

### Code Documentation
- No code documentation needed (tests are self-documenting)
- Ensure test descriptions clearly indicate what is being tested

### Test Comments
- Add comments to complex test cases explaining expected behavior
- Document any assumptions about binary path handling (e.g., empty string treated as falsy)

## Dependencies

### Prerequisites
- **Task 03**: Binary resolver implemented (for understanding binary path patterns, though tests mock paths directly)
- **Existing Tests**: `pythonClient.test.ts` exists and has working mocks

### No Dependencies On
- **Task 05**: PythonClient modifications (tests written first, implementation comes next)

## Acceptance Criteria

- ✅ All new test cases defined and implemented
- ✅ Tests compile successfully (`pnpm run compile` passes)
- ✅ Tests fail initially (PythonClient not yet modified) - **This is expected and correct**
- ✅ Mock strategy updated to handle binary execution scenarios
- ✅ Protocol compatibility tests included
- ✅ Edge case tests included (binary execution failure, empty path)
- ✅ Existing tests still pass (or updated if needed)
- ✅ Test descriptions are clear and descriptive

## Notes

### Test Failure Expectations

**Important**: These tests are written following TDD principles. They **should fail** initially because:
- `PythonClient` constructor doesn't accept `binaryPath` parameter yet
- `spawnService()` doesn't check for binary path yet
- Implementation comes in Task 05

This is the correct TDD workflow: write tests first, then implement to make them pass.

### Mock Strategy Notes

- Tests mock `spawn` directly, not `binaryResolver`
- Binary paths are passed directly to constructor (no need to mock resolver)
- Process events are mocked using existing `createMockProcess()` helper
- Stdio communication is mocked using existing patterns

### Protocol Compatibility

The tests verify that binary execution maintains identical JSON-RPC protocol:
- Same request format: `{ method: "parse", params: { sourceCode: "..." } }`
- Same response format: `{ result: PythonReteGraph }` or `{ error: { code, message } }`
- Same conversion: Python JSON (snake_case) → TypeScript (camelCase)
- Same error handling: Errors thrown with appropriate messages

### Empty String Handling

Decision: Empty string `""` should be treated as falsy and fall back to Python command. This is consistent with JavaScript truthiness and simplifies implementation.

## References

- **Master Plan**: `_features/vscode-extension-packaging/plans/master/implementation.md` (Step 4)
- **Master Plan**: `_features/vscode-extension-packaging/plans/master/testing.md` (PythonClient Tests section)
- **Master Plan**: `_features/vscode-extension-packaging/plans/master/interfaces.md` (PythonClient Interface Modifications)
- **Existing Tests**: `src/__tests__/pythonClient.test.ts`
- **PythonClient Implementation**: `src/pythonClient.ts`
- **TDD Practices**: `@.cursor/rules/development_practices.mdc`
