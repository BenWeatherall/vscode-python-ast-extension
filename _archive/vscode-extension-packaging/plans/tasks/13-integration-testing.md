# Integration Testing Implementation Plan

## Overview

This task creates integration tests to verify the end-to-end binary execution flow works correctly. The tests ensure all components work together: binary resolution, PythonClient execution with binaries, and extension activation. This task depends on all previous implementation tasks (Tasks 01-12) being completed.

## Files to Create/Modify

### New Files

1. **`tests/integration/binary-execution.test.ts`**
   - Main integration test file for binary execution scenarios
   - Tests extension activation with binary resolution
   - Tests binary execution and JSON-RPC communication
   - Tests protocol compatibility between binary and Python command
   - Tests fallback behavior when binary is unavailable

2. **`tests/integration/helpers/binary-test-helpers.ts`** (optional utility file)
   - Helper functions for creating test extension contexts
   - Helper functions for resolving test binary paths
   - Helper functions for sending test JSON-RPC requests
   - Helper functions for validating graph responses
   - Platform-specific test skipping utilities

### Modified Files

None (this is a test-only task)

## Test Strategy

Following TDD principles and project development practices:

1. **Black Box Testing**: Tests validate functionality, not internal behavior
2. **Real File System**: Integration tests use real file system (not mocked) for binary path resolution
3. **Conditional Execution**: Tests skip gracefully when binaries are not available (development mode)
4. **Protocol Validation**: Tests verify JSON-RPC protocol compatibility
5. **Graph Validation**: Tests verify graph data structure correctness

## Test Cases

### Test Suite 1: Extension Activation with Binary

**Test**: `extension activates with binary path resolved`

**Steps**:
1. Create mock extension context with `extensionPath` set to test directory
2. Mock `resolveBinaryPath()` to return a valid binary path (or use real resolver if binary exists)
3. Call `activate()` with mock context
4. Verify `PythonClient` instantiated with binary path
5. Verify no errors logged to output channel

**Acceptance Criteria**:
- Extension activates successfully
- `PythonClient` receives binary path
- No warnings logged (binary found)

**Mock Strategy**:
- Mock `vscode.ExtensionContext` with `extensionPath`
- Optionally mock `resolveBinaryPath()` if binary doesn't exist in test environment
- Mock `PythonClient` constructor to verify binary path passed

---

### Test Suite 2: Binary Execution End-to-End

**Test**: `binary executes and responds to JSON-RPC requests`

**Prerequisites**:
- Binary must exist for current platform (test skips if not available)
- Binary must be executable

**Steps**:
1. Resolve binary path from test extension context (or skip if not available)
2. Create `PythonClient` with binary path
3. Call `spawnService()` and wait for spawn event
4. Send parse request via `parseAST()` with test Python code
5. Verify JSON-RPC response received
6. Verify graph data structure is correct (nodes array, connections array)
7. Verify graph contains expected AST nodes
8. Call `stopService()` to cleanup

**Test Data**:
- Use simple Python code: `"def hello(): pass"`
- Verify graph contains `FunctionDef` node
- Verify node has correct `astType`, `lineno`, `colOffset`

**Acceptance Criteria**:
- Binary spawns successfully
- JSON-RPC request sent correctly
- JSON-RPC response received and parsed
- Graph structure matches expected format
- Graph contains correct AST nodes

**Skip Logic**:
```typescript
const binaryPath = resolveBinaryPath(extensionPath);
if (!binaryPath) {
  console.log("Skipping test: binary not available for current platform");
  return;
}
```

---

### Test Suite 3: Protocol Compatibility

**Test**: `binary execution uses identical JSON-RPC protocol as Python command`

**Steps**:
1. Test with binary execution:
   - Resolve binary path (skip if not available)
   - Create `PythonClient` with binary path
   - Send parse request
   - Capture response format
2. Test with Python command execution:
   - Create `PythonClient` with `null` binary path
   - Send parse request with same source code
   - Capture response format
3. Compare responses:
   - Verify identical JSON-RPC structure
   - Verify identical graph output format
   - Verify identical error handling (if applicable)

**Test Data**:
- Use same Python code for both tests: `"x + y"`
- Verify both produce `BinOp` nodes with same structure

**Acceptance Criteria**:
- Both execution paths produce identical JSON-RPC responses
- Graph structures are identical
- Error handling is identical (test with invalid syntax)

**Skip Logic**:
- Skip Python command test if Python not available
- Skip binary test if binary not available
- If both available, run comparison test

---

### Test Suite 4: Fallback Behavior

**Test**: `extension falls back to Python command when binary not found`

**Steps**:
1. Mock `resolveBinaryPath()` to return `null`
2. Call `activate()` with mock context
3. Verify warning logged to output channel (if applicable)
4. Verify `PythonClient` created with `null` binary path
5. Verify `PythonClient` spawns Python command (not binary)
6. Verify same functionality works (if Python available)

**Mock Strategy**:
- Mock `resolveBinaryPath()` to return `null`
- Mock `PythonClient` to verify `null` passed to constructor
- Mock `spawn()` to verify Python command used

**Acceptance Criteria**:
- Extension activates successfully even without binary
- Warning logged (if applicable)
- Python command used as fallback
- Functionality works identically (if Python available)

**Skip Logic**:
- Skip if Python not available (can't test fallback)

---

### Test Suite 5: Platform-Specific Scenarios

**Test**: `tests handle platform-specific binary resolution`

**Steps**:
1. Test Windows x64:
   - Mock `process.platform = "win32"`, `process.arch = "x64"`
   - Verify binary name: `python_service-win-x64.exe`
   - Verify path resolution works
2. Test Linux x64:
   - Mock `process.platform = "linux"`, `process.arch = "x64"`
   - Verify binary name: `python_service-linux-x64`
   - Verify path resolution works
3. Test macOS ARM64:
   - Mock `process.platform = "darwin"`, `process.arch = "arm64"`
   - Verify binary name: `python_service-darwin-arm64`
   - Verify path resolution works
4. Test Unsupported Platform:
   - Mock unsupported platform
   - Verify `resolveBinaryPath()` returns `null`
   - Verify extension activates with fallback

**Acceptance Criteria**:
- Correct binary names for each platform
- Path resolution works for supported platforms
- Unsupported platforms handled gracefully

---

## Implementation Order

### Step 1: Create Test File Structure

1. Create `tests/integration/binary-execution.test.ts`
2. Set up Jest test suite structure
3. Import required modules:
   - `PythonClient` from `src/pythonClient`
   - `resolveBinaryPath` from `src/binaryResolver`
   - `activate` from `src/extension`
   - VS Code mocks from `src/__mocks__/vscodeMock`
   - `spawn` mock from `child_process`

### Step 2: Implement Test Utilities (Optional)

1. Create `tests/integration/helpers/binary-test-helpers.ts` if needed
2. Implement helper functions:
   - `createTestExtensionContext(extensionPath: string): vscode.ExtensionContext`
   - `resolveTestBinaryPath(extensionPath: string): string | null`
   - `sendTestParseRequest(client: PythonClient, sourceCode: string): Promise<ReteGraph>`
   - `validateGraphStructure(graph: ReteGraph): void`
   - `skipIfBinaryNotAvailable(binaryPath: string | null): void`

### Step 3: Write Extension Activation Test

1. Implement test: "extension activates with binary path resolved"
2. Mock extension context with `extensionPath`
3. Mock or use real `resolveBinaryPath()`
4. Call `activate()` and verify `PythonClient` instantiated correctly
5. Verify no errors logged

### Step 4: Write Binary Execution Test

1. Implement test: "binary executes and responds to JSON-RPC requests"
2. Resolve binary path (skip if not available)
3. Create `PythonClient` with binary path
4. Spawn service and send parse request
5. Verify response structure and content
6. Cleanup service

### Step 5: Write Protocol Compatibility Test

1. Implement test: "binary execution uses identical JSON-RPC protocol"
2. Test binary execution path
3. Test Python command execution path
4. Compare responses for identical structure
5. Test error handling compatibility

### Step 6: Write Fallback Behavior Test

1. Implement test: "extension falls back to Python command when binary not found"
2. Mock `resolveBinaryPath()` to return `null`
3. Verify activation continues
4. Verify `PythonClient` uses Python command
5. Verify functionality works

### Step 7: Write Platform-Specific Tests

1. Implement test: "tests handle platform-specific binary resolution"
2. Test each supported platform (Windows, Linux, macOS)
3. Test unsupported platform handling
4. Verify correct binary names and paths

### Step 8: Add Test Infrastructure

1. Add `beforeEach` setup:
   - Clear all mocks
   - Reset extension state
   - Setup default mocks
2. Add `afterEach` cleanup:
   - Stop any running services
   - Cleanup timers
   - Reset mocks

### Step 9: Add Test Data

1. Define test Python code samples:
   - Simple function: `"def hello(): pass"`
   - Binary operation: `"x + y"`
   - Class definition: `"class Test: pass"`
2. Define expected graph structures for validation

## Validation Steps

### Compilation

1. Run TypeScript compilation: `pnpm run compile`
2. Verify no compilation errors
3. Verify test file included in compilation

### Test Execution

1. Run integration tests: `pnpm test tests/integration/binary-execution.test.ts`
2. Verify tests compile successfully
3. Verify tests execute (may skip if binary not available)
4. Verify tests pass when binary available
5. Verify tests skip gracefully when binary not available

### Test Coverage

1. Verify all test scenarios covered:
   - Extension activation with binary
   - Binary execution end-to-end
   - Protocol compatibility
   - Fallback behavior
   - Platform-specific scenarios
2. Verify error cases tested:
   - Missing binary
   - Unsupported platform
   - Invalid binary execution
3. Verify edge cases tested:
   - Binary path resolution failures
   - Service spawn failures
   - JSON-RPC communication errors

### Manual Validation

1. Build binary for current platform: `pnpm run build:python-binaries`
2. Run extension in VS Code
3. Verify extension activates with binary
4. Verify AST visualization works
5. Verify no errors in output channel
6. Test with missing binary (remove from `bin/` directory)
7. Verify fallback to Python command works

## Documentation Updates

### Code Documentation

1. Add JSDoc comments to test file:
   - File-level description
   - Test suite descriptions
   - Helper function documentation

### Test Documentation

1. Document test prerequisites:
   - Binary must be built for current platform
   - Python must be available for fallback tests
2. Document skip conditions:
   - When tests skip (binary not available)
   - How to enable tests (build binary)
3. Document test data:
   - Python code samples used
   - Expected graph structures

## Dependencies

### Prerequisites

This task depends on completion of:
- **Task 01**: Binary resolver interfaces defined
- **Task 02**: Binary resolver tests written
- **Task 03**: Binary resolver implemented
- **Task 04**: PythonClient modification tests written
- **Task 05**: PythonClient modified to accept binary path
- **Task 06**: Extension integration tests written
- **Task 07**: Extension activation modified
- **Task 08**: Build scripts created
- **Task 09**: Package.json configured
- **Task 10**: .vscodeignore created
- **Task 11**: Binary build tested
- **Task 12**: VSIX packaging tested

### Runtime Dependencies

- Binary must exist in `bin/` directory for current platform (or tests skip)
- Python must be available for fallback tests (or tests skip)
- VS Code API mocks available in `src/__mocks__/vscodeMock.ts`
- Jest test framework configured

## Test Implementation Example

```typescript
/**
 * Integration test: binary execution end-to-end flow.
 */
import { PythonClient } from "../../src/pythonClient";
import { resolveBinaryPath } from "../../src/binaryResolver";
import { activate } from "../../src/extension";
import * as vscode from "vscode";
import * as path from "path";
import { spawn } from "child_process";

jest.mock("child_process");

describe("Binary Execution Integration", () => {
  let extensionPath: string;
  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    extensionPath = path.join(__dirname, "../../");
    mockContext = {
      extensionPath,
      subscriptions: [],
    } as unknown as vscode.ExtensionContext;
  });

  describe("extension activation with binary", () => {
    it("resolves binary path and passes to PythonClient", () => {
      const binaryPath = resolveBinaryPath(extensionPath);
      
      activate(mockContext);
      
      // Verify PythonClient created (check via mocks or state)
      // This depends on how PythonClient is instantiated in extension.ts
    });
  });

  describe("binary execution", () => {
    it("executes binary and receives JSON-RPC response", async () => {
      const binaryPath = resolveBinaryPath(extensionPath);
      
      if (!binaryPath) {
        console.log("Skipping test: binary not available");
        return;
      }

      const client = new PythonClient(binaryPath);
      await client.spawnService();

      const sourceCode = "def hello(): pass";
      const graph = await client.parseAST(sourceCode);

      expect(graph).toBeDefined();
      expect(graph.nodes).toBeInstanceOf(Array);
      expect(graph.connections).toBeInstanceOf(Array);
      
      const functionNodes = graph.nodes.filter(
        (n) => n.data.astType === "FunctionDef"
      );
      expect(functionNodes.length).toBeGreaterThan(0);

      client.stopService();
    });
  });

  describe("protocol compatibility", () => {
    it("binary and Python command produce identical responses", async () => {
      const binaryPath = resolveBinaryPath(extensionPath);
      const sourceCode = "x + y";

      let binaryGraph: ReteGraph | null = null;
      let pythonGraph: ReteGraph | null = null;

      // Test binary execution
      if (binaryPath) {
        const binaryClient = new PythonClient(binaryPath);
        await binaryClient.spawnService();
        binaryGraph = await binaryClient.parseAST(sourceCode);
        binaryClient.stopService();
      }

      // Test Python command execution
      try {
        const pythonClient = new PythonClient(null);
        await pythonClient.spawnService();
        pythonGraph = await pythonClient.parseAST(sourceCode);
        pythonClient.stopService();
      } catch (e) {
        // Python not available, skip comparison
        console.log("Skipping Python command test: Python not available");
        return;
      }

      if (binaryGraph && pythonGraph) {
        // Compare graph structures
        expect(binaryGraph.nodes.length).toBe(pythonGraph.nodes.length);
        expect(binaryGraph.connections.length).toBe(
          pythonGraph.connections.length
        );
      } else {
        console.log("Skipping comparison: one execution path not available");
      }
    });
  });

  describe("fallback behavior", () => {
    it("falls back to Python command when binary not found", async () => {
      // Mock resolveBinaryPath to return null
      jest.spyOn(require("../../src/binaryResolver"), "resolveBinaryPath")
        .mockReturnValue(null);

      activate(mockContext);

      // Verify PythonClient created with null path
      // Verify Python command used (check spawn calls)
    });
  });
});
```

## Notes

- **Test Isolation**: Each test should be independent and not rely on state from previous tests
- **Cleanup**: Always cleanup spawned processes and timers in `afterEach`
- **Skip Logic**: Tests should skip gracefully when prerequisites not met (binary/Python unavailable)
- **Real File System**: Integration tests use real file system for binary path resolution (not mocked)
- **Platform Detection**: Tests may need to mock `process.platform` and `process.arch` for platform-specific tests
- **Error Handling**: Tests should verify error handling works correctly (invalid binary, spawn failures, etc.)

## Acceptance Criteria

- ✅ Integration test file created: `tests/integration/binary-execution.test.ts`
- ✅ Tests compile successfully
- ✅ Tests verify end-to-end binary execution flow
- ✅ Tests handle platform-specific scenarios gracefully
- ✅ Tests verify protocol compatibility between binary and Python command
- ✅ Tests verify fallback behavior when binary not found
- ✅ Tests skip gracefully when binary not available (development mode)
- ✅ Tests cleanup resources properly (services, timers, mocks)
- ✅ Test documentation added (JSDoc comments, prerequisites, skip conditions)
