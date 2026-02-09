# Test Strategy

## Testing Approach

Following TDD principles and project development practices:

1. **Tests First**: Write tests before implementation code
2. **Models First**: Define interfaces before implementation
3. **Black Box Testing**: Validate functionality, not internal behavior
4. **Dependency Injection**: Mock external dependencies (file system, spawn)
5. **Integration Tests**: Verify end-to-end binary execution flow

## Test Organization

### Unit Tests

**Location**: `src/__tests__/`

**Files**:
- `binaryResolver.test.ts` - Binary resolver unit tests
- `pythonClient.test.ts` - PythonClient modification tests
- `extension.test.ts` - Extension integration tests

### Integration Tests

**Location**: `tests/integration/`

**Files**:
- `binary-execution.test.ts` - End-to-end binary execution tests

## Binary Resolver Tests (`src/__tests__/binaryResolver.test.ts`)

### Test Cases

#### `getPlatformBinaryName()` Tests

1. **Windows x64**:
   - Mock `process.platform = "win32"`, `process.arch = "x64"`
   - Expect: `"python_service-win-x64.exe"`

2. **Linux x64**:
   - Mock `process.platform = "linux"`, `process.arch = "x64"`
   - Expect: `"python_service-linux-x64"`

3. **macOS ARM64**:
   - Mock `process.platform = "darwin"`, `process.arch = "arm64"`
   - Expect: `"python_service-darwin-arm64"`

4. **macOS x64**:
   - Mock `process.platform = "darwin"`, `process.arch = "x64"`
   - Expect: `"python_service-darwin-x64"`

5. **Unsupported Platform**:
   - Mock `process.platform = "unsupported"`, `process.arch = "x64"`
   - Expect: `null`

#### `resolveBinaryPath()` Tests

6. **Valid Path Resolution**:
   - Mock `fs.existsSync()` returns `true`
   - Call with `extensionPath = "/path/to/extension"`
   - Expect: `"/path/to/extension/bin/python_service-win-x64.exe"`

7. **Unsupported Platform**:
   - Mock `getPlatformBinaryName()` returns `null`
   - Expect: `null` (regardless of file existence)

8. **Binary Not Found**:
   - Mock `fs.existsSync()` returns `false`
   - Call with valid extension path
   - Expect: `null`

9. **Path Construction**:
   - Verify `path.join()` called with correct arguments
   - Verify absolute path returned

#### `validateBinary()` Tests

10. **File Exists**:
    - Mock `fs.existsSync()` returns `true`
    - Expect: `true`

11. **File Not Found**:
    - Mock `fs.existsSync()` returns `false`
    - Expect: `false`

### Mock Strategy

- **File System**: Mock `fs.existsSync()` using Jest mocks
- **Path Module**: Use real `path` module (deterministic)
- **Process**: Mock `process.platform` and `process.arch` per test

### Test Implementation Example

```typescript
import { getPlatformBinaryName, resolveBinaryPath, validateBinary } from "../binaryResolver";
import * as fs from "fs";

jest.mock("fs");

describe("binaryResolver", () => {
  describe("getPlatformBinaryName", () => {
    it("returns correct filename for Windows x64", () => {
      Object.defineProperty(process, "platform", { value: "win32" });
      Object.defineProperty(process, "arch", { value: "x64" });
      
      expect(getPlatformBinaryName()).toBe("python_service-win-x64.exe");
    });
    
    // ... more tests
  });
  
  describe("resolveBinaryPath", () => {
    it("constructs correct path when binary exists", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      Object.defineProperty(process, "platform", { value: "win32" });
      Object.defineProperty(process, "arch", { value: "x64" });
      
      const result = resolveBinaryPath("/path/to/extension");
      
      expect(result).toBe("/path/to/extension/bin/python_service-win-x64.exe");
      expect(fs.existsSync).toHaveBeenCalledWith(result);
    });
    
    // ... more tests
  });
});
```

## PythonClient Tests (`src/__tests__/pythonClient.test.ts`)

### Test Cases

#### Constructor Tests

1. **Accepts Binary Path**:
   - Create `PythonClient` with binary path
   - Verify binary path stored internally

2. **Accepts Null Binary Path**:
   - Create `PythonClient` with `null`
   - Verify falls back to Python command

3. **Accepts Undefined Binary Path**:
   - Create `PythonClient` with `undefined`
   - Verify falls back to Python command

#### Spawn Service Tests

4. **Spawns Binary When Path Provided**:
   - Create `PythonClient` with binary path
   - Call `spawnService()`
   - Verify `spawn()` called with binary path and empty args

5. **Spawns Python Command When Path Not Provided**:
   - Create `PythonClient` without binary path
   - Call `spawnService()`
   - Verify `spawn()` called with `"python"` and `["-m", "python_service"]`

6. **Protocol Compatibility**:
   - Verify stdio configuration unchanged
   - Verify JSON-RPC communication unchanged
   - Verify `parseAST()` behavior unchanged

### Mock Strategy

- **child_process.spawn**: Mock using Jest mocks
- **Process Events**: Mock `spawn` events (`spawn`, `error`, `exit`)
- **Stdio Streams**: Mock stdin/stdout/stderr streams

### Test Implementation Example

```typescript
import { PythonClient } from "../pythonClient";
import { spawn } from "child_process";

jest.mock("child_process");

describe("PythonClient", () => {
  describe("constructor", () => {
    it("accepts binary path parameter", () => {
      const client = new PythonClient("/path/to/binary.exe");
      // Verify binary path stored (if exposed for testing)
    });
  });
  
  describe("spawnService", () => {
    it("spawns binary when path provided", async () => {
      const mockSpawn = spawn as jest.Mock;
      const mockProcess = {
        stdin: { write: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === "spawn") callback();
        }),
      };
      mockSpawn.mockReturnValue(mockProcess);
      
      const client = new PythonClient("/path/to/binary.exe");
      await client.spawnService();
      
      expect(spawn).toHaveBeenCalledWith(
        "/path/to/binary.exe",
        [],
        expect.objectContaining({ stdio: ["pipe", "pipe", "pipe"] })
      );
    });
    
    it("spawns Python command when path not provided", async () => {
      // Similar test with null binary path
      // Verify spawn called with "python" and ["-m", "python_service"]
    });
  });
});
```

## Extension Tests (`src/__tests__/extension.test.ts`)

### Test Cases

#### Activation Tests

1. **Resolves Binary Path**:
   - Mock `ExtensionContext` with `extensionPath`
   - Mock `resolveBinaryPath()` to return path
   - Call `activate()`
   - Verify `PythonClient` created with binary path

2. **Handles Missing Binary**:
   - Mock `resolveBinaryPath()` to return `null`
   - Call `activate()`
   - Verify warning logged to output channel
   - Verify `PythonClient` created with `null` path

3. **Handles Unsupported Platform**:
   - Mock `resolveBinaryPath()` to return `null` (unsupported platform)
   - Call `activate()`
   - Verify activation continues (doesn't throw)

### Mock Strategy

- **VS Code API**: Use existing `__mocks__/vscodeMock.ts`
- **Binary Resolver**: Mock `resolveBinaryPath()` function
- **PythonClient**: Mock constructor or verify instantiation

### Test Implementation Example

```typescript
import { activate } from "../extension";
import * as vscode from "vscode";
import { resolveBinaryPath } from "../binaryResolver";

jest.mock("../binaryResolver");
jest.mock("../pythonClient");

describe("extension", () => {
  describe("activate", () => {
    it("resolves binary path and passes to PythonClient", () => {
      const mockContext = {
        extensionPath: "/path/to/extension",
        // ... other context properties
      } as vscode.ExtensionContext;
      
      (resolveBinaryPath as jest.Mock).mockReturnValue("/path/to/binary.exe");
      
      activate(mockContext);
      
      expect(resolveBinaryPath).toHaveBeenCalledWith("/path/to/extension");
      // Verify PythonClient constructor called with binary path
    });
  });
});
```

## Integration Tests (`tests/integration/binary-execution.test.ts`)

### Test Cases

1. **Binary Execution End-to-End**:
   - Build binary for current platform (if not exists)
   - Resolve binary path from test extension context
   - Create `PythonClient` with binary path
   - Spawn service and send parse request
   - Verify JSON-RPC response received
   - Verify graph data structure correct

2. **Protocol Compatibility**:
   - Compare binary execution vs Python command execution
   - Verify identical JSON-RPC protocol
   - Verify identical graph output format

3. **Fallback Behavior**:
   - Test with binary path set to `null`
   - Verify falls back to Python command
   - Verify same functionality

### Test Setup

- **Binary Build**: Ensure binary exists before tests (or build in setup)
- **Extension Context**: Create mock extension context with test path
- **File System**: Use real file system (integration test)

### Test Implementation Example

```typescript
import { PythonClient } from "../../src/pythonClient";
import { resolveBinaryPath } from "../../src/binaryResolver";
import * as path from "path";

describe("Binary Execution Integration", () => {
  it("executes binary and receives response", async () => {
    const extensionPath = path.join(__dirname, "../../");
    const binaryPath = resolveBinaryPath(extensionPath);
    
    if (!binaryPath) {
      // Skip test if binary not available (development mode)
      return;
    }
    
    const client = new PythonClient(binaryPath);
    await client.spawnService();
    
    const sourceCode = "def hello(): pass";
    const graph = await client.parseAST(sourceCode);
    
    expect(graph).toBeDefined();
    expect(graph.nodes).toBeInstanceOf(Array);
    expect(graph.connections).toBeInstanceOf(Array);
    
    await client.stopService();
  });
});
```

## Build Script Tests

### Manual Testing

Build scripts are tested manually:

1. **Platform Detection**:
   - Run script on different platforms
   - Verify correct binary name generated

2. **PyInstaller Invocation**:
   - Run script with PyInstaller installed
   - Verify PyInstaller called with correct arguments
   - Verify binary created in `bin/` directory

3. **Error Handling**:
   - Run script without PyInstaller installed
   - Verify clear error message
   - Verify non-zero exit code

## VSIX Packaging Tests

### Manual Testing

1. **VSIX Creation**:
   - Run `pnpm run vscode:package`
   - Verify `.vsix` file created
   - Verify filename matches `<name>-<version>.vsix`

2. **VSIX Contents**:
   - Extract `.vsix` (it's a zip file)
   - Verify `out/` directory included
   - Verify `bin/` directory included with binaries
   - Verify development artifacts excluded (`.venv`, `tests/`, etc.)

3. **VSIX Installation**:
   - Install `.vsix` in clean VS Code instance
   - Verify extension activates
   - Verify binary execution works
   - Verify AST visualization works

## Test Coverage Goals

- **Binary Resolver**: 100% coverage (pure functions, easy to test)
- **PythonClient Modifications**: 100% coverage of new code paths
- **Extension Integration**: 100% coverage of binary resolution logic
- **Integration Tests**: At least one end-to-end test per platform

## Test Execution

### Unit Tests

```bash
# Run all TypeScript tests
pnpm test

# Run specific test file
pnpm test binaryResolver.test.ts
```

### Integration Tests

```bash
# Run integration tests (requires binary built)
pnpm test tests/integration
```

### Manual Testing

```bash
# Build binary
pnpm run build:python-binaries

# Build extension
pnpm run build

# Package VSIX
pnpm run vscode:package

# Install VSIX (manual step)
code --install-extension <name>-<version>.vsix
```

## Test Data

### Test Python Code Samples

Use existing test samples from `tests/python_service/`:
- Simple function definitions
- Class definitions
- Expressions and statements
- Complex nested structures

### Test Extension Contexts

Create mock extension contexts:
- Valid extension path
- Path with binary present
- Path without binary (development mode)
- Unsupported platform scenarios

## References

- **Jest Documentation**: https://jestjs.io/docs/getting-started
- **VS Code Extension Testing**: https://code.visualstudio.com/api/working-with-extensions/testing-extension
- **TDD Best Practices**: See `@.cursor/rules/development_practices.mdc`
