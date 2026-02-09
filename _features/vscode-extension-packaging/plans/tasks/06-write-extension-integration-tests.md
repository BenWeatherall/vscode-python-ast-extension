# Task 06: Write Extension Integration Tests

## Overview

This task writes integration tests for extension activation with binary resolution. Following TDD principles, these tests are written before modifying `extension.ts` in Task 07. The tests validate that:

1. Extension resolves binary path from `ExtensionContext` during activation
2. Binary path is passed to `PythonClient` constructor
3. Extension handles missing binary gracefully (development mode fallback)
4. Extension handles unsupported platform gracefully
5. Warning messages are logged to output channel when binary not found

This task depends on Tasks 03 and 05 (binary resolver and PythonClient modifications completed).

## Files to Create/Modify

### Modified Files

- **`src/__tests__/extension.test.ts`**:
  - Add test suite for binary resolution integration
  - Add mocks for `resolveBinaryPath()` function
  - Add mocks for `ExtensionContext` with `extensionPath` property
  - Add tests for binary path resolution flow
  - Add tests for missing binary handling
  - Add tests for unsupported platform handling
  - Add tests for output channel logging verification

## Test Strategy

### TDD Approach

Following project development practices (`@.cursor/rules/development_practices.mdc`):

1. **Write tests first**: All test cases defined before implementation
2. **Black box testing**: Validate functionality (activation succeeds, correct parameters passed), not internal implementation details
3. **Dependency injection**: Mock external dependencies (`resolveBinaryPath`, `PythonClient`, VS Code API)
4. **Valid tests**: All tests must be able to fail (will fail initially since `extension.ts` not yet modified)

### Test Organization

Add new test suite `describe("extension activation with binary resolution", ...)` to existing `extension.test.ts` file, following existing test structure patterns.

### Mock Strategy

1. **`resolveBinaryPath()` function**: Mock using `jest.mock("../binaryResolver")`
2. **`PythonClient` constructor**: Already mocked via existing `jest.mock("../pythonClient")`
3. **`ExtensionContext`**: Extend existing `createMockContext()` helper to include `extensionPath`
4. **Output channel**: Use existing `mockCreateOutputChannel` from `vscodeMock.ts`

## Implementation Order

### Step 1: Add Binary Resolver Mock

**File**: `src/__tests__/extension.test.ts`

**Changes**:
- Add `jest.mock("../binaryResolver")` at top of file
- Import `resolveBinaryPath` from binary resolver
- Create typed mock: `const mockResolveBinaryPath = resolveBinaryPath as jest.MockedFunction<typeof resolveBinaryPath>`

**Validation**: Mock is available in test scope

---

### Step 2: Extend Mock Context Helper

**File**: `src/__tests__/extension.test.ts`

**Changes**:
- Modify `createMockContext()` function to accept optional `extensionPath` parameter
- Add `extensionPath` property to returned mock context:
  ```typescript
  function createMockContext(extensionPath?: string): vscode.ExtensionContext {
    return {
      subscriptions: [],
      extensionPath: extensionPath || "/mock/extension/path",
    } as unknown as vscode.ExtensionContext;
  }
  ```

**Validation**: Mock context includes `extensionPath` property

---

### Step 3: Setup Mock Reset in beforeEach

**File**: `src/__tests__/extension.test.ts`

**Changes**:
- In existing `beforeEach()` block, add:
  ```typescript
  mockResolveBinaryPath.mockReset();
  ```

**Validation**: Mock is reset before each test

---

### Step 4: Write Test - Resolves Binary Path

**File**: `src/__tests__/extension.test.ts`

**Test Case**: `"resolves binary path and passes to PythonClient"`

**Implementation**:
```typescript
it("resolves binary path and passes to PythonClient", () => {
  const extensionPath = "/path/to/extension";
  const binaryPath = "/path/to/extension/bin/python_service-win-x64.exe";
  const context = createMockContext(extensionPath);
  
  mockResolveBinaryPath.mockReturnValue(binaryPath);
  
  activate(context);
  
  expect(mockResolveBinaryPath).toHaveBeenCalledWith(extensionPath);
  expect(MockPythonClient).toHaveBeenCalledWith(binaryPath);
});
```

**Validation**: Test compiles, fails initially (extension.ts not yet modified)

---

### Step 5: Write Test - Handles Missing Binary

**File**: `src/__tests__/extension.test.ts`

**Test Case**: `"handles missing binary gracefully"`

**Implementation**:
```typescript
it("handles missing binary gracefully", () => {
  const extensionPath = "/path/to/extension";
  const context = createMockContext(extensionPath);
  const mockOutputChannel = {
    appendLine: jest.fn(),
    show: jest.fn(),
    dispose: jest.fn(),
  };
  
  mockResolveBinaryPath.mockReturnValue(null);
  mockCreateOutputChannel.mockReturnValue(mockOutputChannel);
  
  activate(context);
  
  expect(mockResolveBinaryPath).toHaveBeenCalledWith(extensionPath);
  expect(MockPythonClient).toHaveBeenCalledWith(null);
  expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
    expect.stringMatching(/warning.*binary.*not found|using system python/i)
  );
});
```

**Validation**: Test compiles, fails initially (extension.ts not yet modified)

---

### Step 6: Write Test - Handles Unsupported Platform

**File**: `src/__tests__/extension.test.ts`

**Test Case**: `"handles unsupported platform gracefully"`

**Implementation**:
```typescript
it("handles unsupported platform gracefully", () => {
  const extensionPath = "/path/to/extension";
  const context = createMockContext(extensionPath);
  const mockOutputChannel = {
    appendLine: jest.fn(),
    show: jest.fn(),
    dispose: jest.fn(),
  };
  
  mockResolveBinaryPath.mockReturnValue(null); // Unsupported platform returns null
  mockCreateOutputChannel.mockReturnValue(mockOutputChannel);
  
  activate(context);
  
  expect(mockResolveBinaryPath).toHaveBeenCalledWith(extensionPath);
  expect(MockPythonClient).toHaveBeenCalledWith(null);
  expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
    expect.stringMatching(/warning.*binary.*not found|using system python/i)
  );
  // Verify activation continues (doesn't throw)
  expect(context.subscriptions.length).toBeGreaterThan(0);
});
```

**Validation**: Test compiles, fails initially (extension.ts not yet modified)

---

### Step 7: Write Test - Activation Continues Without Binary

**File**: `src/__tests__/extension.test.ts`

**Test Case**: `"activation continues even if binary not found"`

**Implementation**:
```typescript
it("activation continues even if binary not found", () => {
  const extensionPath = "/path/to/extension";
  const context = createMockContext(extensionPath);
  
  mockResolveBinaryPath.mockReturnValue(null);
  
  // Should not throw
  expect(() => activate(context)).not.toThrow();
  
  // Should still register command
  expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
    "python-ast.visualize",
    expect.any(Function)
  );
  
  // Should still create PythonClient (with null path)
  expect(MockPythonClient).toHaveBeenCalled();
});
```

**Validation**: Test compiles, fails initially (extension.ts not yet modified)

---

### Step 8: Write Test - Binary Path Passed Through Flow

**File**: `src/__tests__/extension.test.ts`

**Test Case**: `"binary path passed through activation flow"`

**Implementation**:
```typescript
it("binary path passed through activation flow", async () => {
  const extensionPath = "/path/to/extension";
  const binaryPath = "/path/to/extension/bin/python_service-win-x64.exe";
  const context = createMockContext(extensionPath);
  const mockParseAST = jest.fn().mockResolvedValue({ nodes: [], connections: [] });
  
  mockResolveBinaryPath.mockReturnValue(binaryPath);
  MockPythonClient.mockImplementation(() => ({
    spawnService: jest.fn().mockResolvedValue(undefined),
    parseAST: mockParseAST,
    stopService: jest.fn(),
    isServiceRunning: jest.fn().mockReturnValue(true),
  }) as unknown as PythonClient);
  
  activate(context);
  
  // Verify PythonClient created with binary path
  expect(MockPythonClient).toHaveBeenCalledWith(binaryPath);
  
  // Verify command handler still works
  const [, handler] = (vscode.commands.registerCommand as jest.Mock).mock.calls[0];
  vscode.window.activeTextEditor = createMockEditor({
    getText: () => "x = 1",
    languageId: "python",
  }) as vscode.TextEditor;
  
  await handler();
  
  expect(mockParseAST).toHaveBeenCalledWith("x = 1");
});
```

**Validation**: Test compiles, fails initially (extension.ts not yet modified)

---

### Step 9: Write Test - Error Handling for Binary Resolution Failures

**File**: `src/__tests__/extension.test.ts`

**Test Case**: `"handles binary resolution errors gracefully"`

**Implementation**:
```typescript
it("handles binary resolution errors gracefully", () => {
  const extensionPath = "/path/to/extension";
  const context = createMockContext(extensionPath);
  
  // Simulate error in resolveBinaryPath (should not happen, but test defensive coding)
  mockResolveBinaryPath.mockImplementation(() => {
    throw new Error("File system error");
  });
  
  // Should handle error gracefully (fallback to null or catch and continue)
  // This test validates that extension doesn't crash on unexpected errors
  expect(() => activate(context)).not.toThrow();
  
  // Should still create PythonClient (with null or undefined)
  expect(MockPythonClient).toHaveBeenCalled();
});
```

**Note**: This test may need adjustment based on actual error handling in `extension.ts`. If `resolveBinaryPath` is pure and never throws, this test validates defensive coding.

**Validation**: Test compiles, fails initially (extension.ts not yet modified)

---

### Step 10: Write Test - Logging Behavior for Development Mode

**File**: `src/__tests__/extension.test.ts`

**Test Case**: `"logs warning for development mode fallback"`

**Implementation**:
```typescript
it("logs warning for development mode fallback", () => {
  const extensionPath = "/path/to/extension";
  const context = createMockContext(extensionPath);
  const mockOutputChannel = {
    appendLine: jest.fn(),
    show: jest.fn(),
    dispose: jest.fn(),
  };
  
  mockResolveBinaryPath.mockReturnValue(null);
  mockCreateOutputChannel.mockReturnValue(mockOutputChannel);
  
  activate(context);
  
  // Verify warning logged
  const warningCalls = mockOutputChannel.appendLine.mock.calls.filter(
    (call) => typeof call[0] === "string" && 
    (call[0].toLowerCase().includes("warning") || 
     call[0].toLowerCase().includes("binary") ||
     call[0].toLowerCase().includes("system python"))
  );
  
  expect(warningCalls.length).toBeGreaterThan(0);
});
```

**Validation**: Test compiles, fails initially (extension.ts not yet modified)

---

## Validation Steps

### Compilation Validation

1. **TypeScript Compilation**: Run `pnpm run compile` or `tsc --noEmit`
   - Expected: Compiles successfully (tests may reference functions not yet implemented)
   - If compilation errors: Fix import paths, type definitions

### Test Execution Validation

2. **Run Tests**: Execute `pnpm test extension.test.ts`
   - Expected: All new tests fail with appropriate error messages (implementation not yet written)
   - If tests pass unexpectedly: Review test logic, ensure assertions are correct
   - If tests don't compile: Fix syntax errors, import issues

### Mock Validation

3. **Verify Mocks**: Check that all mocks are properly set up:
   - `mockResolveBinaryPath` is available and typed correctly
   - `createMockContext()` includes `extensionPath` property
   - `mockCreateOutputChannel` returns mock with `appendLine`, `show`, `dispose`
   - `MockPythonClient` can be called with binary path parameter

### Test Coverage Validation

4. **Review Test Cases**: Ensure all scenarios covered:
   - ✅ Binary path resolved successfully
   - ✅ Binary path passed to PythonClient
   - ✅ Missing binary handled gracefully
   - ✅ Unsupported platform handled gracefully
   - ✅ Activation continues without binary
   - ✅ Warning logged to output channel
   - ✅ Error handling for resolution failures

### Code Quality Validation

5. **Linting**: Run `pnpm run lint` or equivalent
   - Expected: No linting errors
   - Fix any formatting or style issues

## Dependencies

### Prerequisites

- **Task 03**: Binary resolver implemented (`src/binaryResolver.ts` exists with `resolveBinaryPath()` function)
- **Task 05**: PythonClient modified to accept binary path (`PythonClient` constructor accepts `binaryPath?: string | null`)

### Mock Dependencies

- **VS Code API**: Uses existing `__mocks__/vscodeMock.ts`
- **PythonClient**: Uses existing `jest.mock("../pythonClient")`
- **Binary Resolver**: Requires `jest.mock("../binaryResolver")` to be added

## Test Data

### Mock Extension Paths

- Valid extension path: `"/path/to/extension"`
- Binary path (Windows): `"/path/to/extension/bin/python_service-win-x64.exe"`
- Binary path (Linux): `"/path/to/extension/bin/python_service-linux-x64"`
- Binary path (macOS): `"/path/to/extension/bin/python_service-darwin-arm64"`

### Mock Contexts

- Context with extension path: `createMockContext("/path/to/extension")`
- Context with default path: `createMockContext()` (uses default mock path)

## Acceptance Criteria

- ✅ All new test cases defined in `extension.test.ts`
- ✅ Tests compile successfully (TypeScript compilation passes)
- ✅ Tests fail initially with clear error messages (extension.ts not yet modified)
- ✅ Mock strategy covers all activation scenarios:
  - Binary path resolution
  - Missing binary handling
  - Unsupported platform handling
  - Output channel logging
- ✅ Error handling tests included (defensive coding)
- ✅ Test structure follows existing patterns in `extension.test.ts`
- ✅ All mocks properly typed and reset in `beforeEach()`

## Notes

### Test Failure Expectations

These tests are written following TDD and will fail initially because:
- `extension.ts` does not yet import `resolveBinaryPath`
- `extension.ts` does not yet call `resolveBinaryPath(context.extensionPath)`
- `extension.ts` does not yet pass binary path to `PythonClient` constructor
- `extension.ts` does not yet log warning when binary not found

This is expected and validates that tests are correct (they can fail).

### Mock Implementation Details

- `resolveBinaryPath` is a pure function that returns `string | null`
- It should never throw in normal operation (returns `null` for errors)
- The test for error handling (Step 9) validates defensive coding but may need adjustment based on actual implementation

### Integration with Existing Tests

- New tests added to existing `extension.test.ts` file
- Follows existing test structure and naming conventions
- Uses existing mock helpers (`createMockContext`, `createMockEditor`)
- Extends existing `beforeEach()` setup

## Documentation Updates

No documentation updates required for this task. Documentation will be updated in Task 07 after implementation is complete.

## References

- **Master Plan**: `_features/vscode-extension-packaging/plans/master/implementation.md` (Step 6)
- **Master Plan**: `_features/vscode-extension-packaging/plans/master/testing.md` (Extension Tests section)
- **Task File**: `_features/vscode-extension-packaging/tasks/06-write-extension-integration-tests.md`
- **Test Patterns**: `docs/AI_CONTEXT/AI_CONTEXT_PATTERNS.md` (Testing & TDD section)
- **Extension Architecture**: `docs/AI_CONTEXT/AI_CONTEXT_EXTENSION_HOST.md` (Activation & Deactivation section)
- **Existing Tests**: `src/__tests__/extension.test.ts` (reference for structure and patterns)
