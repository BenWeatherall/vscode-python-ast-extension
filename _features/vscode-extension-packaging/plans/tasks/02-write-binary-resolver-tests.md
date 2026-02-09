# Per-Task Implementation Plan: Write Binary Resolver Tests

## Overview

This task creates comprehensive unit tests for the binary resolver module (`src/binaryResolver.ts`) following TDD principles. The tests define expected behavior for platform detection, binary path resolution, and binary validation before implementation. This task depends on Task 01 (interfaces defined) and guides the implementation in Task 03.

## Files to Create/Modify

### New Files

- **`src/__tests__/binaryResolver.test.ts`** - Complete test suite for binary resolver module

### Dependencies

- **Task 01**: `src/binaryResolver.ts` with interface definitions must exist
- **Jest configuration**: `jest.config.js` already configured for TypeScript tests
- **Mock utilities**: No additional mocks needed beyond Jest built-ins

## Test Strategy

### TDD Approach

Following project development practices:
1. **Tests First**: Write all test cases before implementation
2. **Black Box Testing**: Validate function outputs, not internal implementation
3. **Mock External Dependencies**: Mock `fs.existsSync()` and `process.platform/arch`
4. **Valid Tests**: All tests must be able to fail (will fail until Task 03 implementation)

### Test Organization

Structure tests using Jest `describe` blocks:
- `describe("getPlatformBinaryName", ...)` - Platform detection tests
- `describe("resolveBinaryPath", ...)` - Path resolution tests
- `describe("validateBinary", ...)` - Binary validation tests

### Mock Strategy

- **File System**: Mock `fs.existsSync()` using `jest.mock("fs")`
- **Process**: Mock `process.platform` and `process.arch` per test using `Object.defineProperty`
- **Path Module**: Use real `path` module (deterministic, no mocking needed)

## Implementation Order

### Step 1: Create Test File Structure

1. Create `src/__tests__/binaryResolver.test.ts`
2. Add imports:
   - Import functions from `../binaryResolver` (will fail until Task 03)
   - Import `fs` for mocking
   - Import `path` for path construction verification
3. Set up Jest mocks:
   - Mock `fs` module at module level
   - Configure mock return values per test

### Step 2: Write `getPlatformBinaryName()` Tests

Test all platform/architecture combinations:

1. **Windows x64**:
   - Mock `process.platform = "win32"`, `process.arch = "x64"`
   - Call `getPlatformBinaryName()`
   - Expect: `"python_service-win-x64.exe"`

2. **Linux x64**:
   - Mock `process.platform = "linux"`, `process.arch = "x64"`
   - Call `getPlatformBinaryName()`
   - Expect: `"python_service-linux-x64"`

3. **macOS ARM64**:
   - Mock `process.platform = "darwin"`, `process.arch = "arm64"`
   - Call `getPlatformBinaryName()`
   - Expect: `"python_service-darwin-arm64"`

4. **macOS x64**:
   - Mock `process.platform = "darwin"`, `process.arch = "x64"`
   - Call `getPlatformBinaryName()`
   - Expect: `"python_service-darwin-x64"`

5. **Unsupported Platform**:
   - Mock `process.platform = "unsupported"`, `process.arch = "x64"`
   - Call `getPlatformBinaryName()`
   - Expect: `null`

6. **Unsupported Architecture**:
   - Mock `process.platform = "win32"`, `process.arch = "arm32"` (or other unsupported)
   - Call `getPlatformBinaryName()`
   - Expect: `null`

**Implementation Notes**:
- Use `Object.defineProperty(process, "platform", { value: "...", writable: true, configurable: true })` for mocking
- Use `Object.defineProperty(process, "arch", { value: "...", writable: true, configurable: true })` for mocking
- Reset mocks in `beforeEach` or `afterEach` if needed (may require careful handling)

### Step 3: Write `resolveBinaryPath()` Tests

Test path resolution with various scenarios:

1. **Valid Path Resolution**:
   - Mock `process.platform = "win32"`, `process.arch = "x64"`
   - Mock `fs.existsSync()` to return `true`
   - Call `resolveBinaryPath("/path/to/extension")`
   - Expect: `"/path/to/extension/bin/python_service-win-x64.exe"` (or platform-specific path)
   - Verify `fs.existsSync()` called with constructed path

2. **Unsupported Platform**:
   - Mock `process.platform = "unsupported"`, `process.arch = "x64"`
   - Call `resolveBinaryPath("/path/to/extension")`
   - Expect: `null` (regardless of file existence)
   - Verify `fs.existsSync()` not called (early return)

3. **Binary Not Found**:
   - Mock `process.platform = "win32"`, `process.arch = "x64"`
   - Mock `fs.existsSync()` to return `false`
   - Call `resolveBinaryPath("/path/to/extension")`
   - Expect: `null`
   - Verify `fs.existsSync()` called with constructed path

4. **Path Construction Verification**:
   - Mock `process.platform = "linux"`, `process.arch = "x64"`
   - Mock `fs.existsSync()` to return `true`
   - Call `resolveBinaryPath("/usr/local/ext")`
   - Expect: `"/usr/local/ext/bin/python_service-linux-x64"`
   - Verify path uses `path.join()` correctly (absolute path, correct segments)

5. **Different Extension Paths**:
   - Test with Windows-style path: `"C:\\Users\\Extension"`
   - Test with Unix-style path: `"/home/user/extension"`
   - Test with relative path (should still work if resolved to absolute)
   - Verify correct path construction for each

**Implementation Notes**:
- Mock `fs.existsSync` per test: `(fs.existsSync as jest.Mock).mockReturnValue(true/false)`
- Use `path.join()` expectations to verify correct path construction
- Test both absolute and relative extension paths

### Step 4: Write `validateBinary()` Tests

Test binary validation:

1. **File Exists**:
   - Mock `fs.existsSync()` to return `true`
   - Call `validateBinary("/path/to/binary.exe")`
   - Expect: `true`
   - Verify `fs.existsSync()` called with provided path

2. **File Not Found**:
   - Mock `fs.existsSync()` to return `false`
   - Call `validateBinary("/path/to/binary.exe")`
   - Expect: `false`
   - Verify `fs.existsSync()` called with provided path

3. **Different Binary Paths**:
   - Test Windows path: `"C:\\bin\\python_service-win-x64.exe"`
   - Test Unix path: `"/usr/local/bin/python_service-linux-x64"`
   - Test macOS path: `"/Applications/python_service-darwin-arm64"`
   - Verify function handles all path formats correctly

**Implementation Notes**:
- Simple function, straightforward tests
- Focus on verifying `fs.existsSync()` is called correctly
- Test with various path formats

### Step 5: Add Test Setup and Teardown

1. Add `beforeEach` hook:
   - Clear all Jest mocks: `jest.clearAllMocks()`
   - Reset `fs.existsSync` mock return value
   - Optionally reset `process.platform` and `process.arch` if needed

2. Add `afterEach` hook (if needed):
   - Restore original `process.platform` and `process.arch` values
   - Clean up any test-specific mocks

**Implementation Notes**:
- Be careful with `process.platform/arch` mocking - may need to restore original values
- Consider using `jest.spyOn` for `process` properties if `Object.defineProperty` causes issues

### Step 6: Verify Test Compilation

1. Run TypeScript compilation: `pnpm run compile`
2. Verify no compilation errors (except missing implementation in `binaryResolver.ts`)
3. Run tests: `pnpm test binaryResolver.test.ts`
4. Verify all tests fail with appropriate error messages (implementation not found)

## Test Implementation Details

### Mock Setup Pattern

```typescript
import * as fs from "fs";
import * as path from "path";
import { getPlatformBinaryName, resolveBinaryPath, validateBinary } from "../binaryResolver";

jest.mock("fs");

describe("binaryResolver", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPlatformBinaryName", () => {
    it("returns correct filename for Windows x64", () => {
      Object.defineProperty(process, "platform", {
        value: "win32",
        writable: true,
        configurable: true,
      });
      Object.defineProperty(process, "arch", {
        value: "x64",
        writable: true,
        configurable: true,
      });

      expect(getPlatformBinaryName()).toBe("python_service-win-x64.exe");
    });

    // ... more tests
  });

  describe("resolveBinaryPath", () => {
    it("constructs correct path when binary exists", () => {
      Object.defineProperty(process, "platform", {
        value: "win32",
        writable: true,
        configurable: true,
      });
      Object.defineProperty(process, "arch", {
        value: "x64",
        writable: true,
        configurable: true,
      });

      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result = resolveBinaryPath("/path/to/extension");

      expect(result).toBe("/path/to/extension/bin/python_service-win-x64.exe");
      expect(fs.existsSync).toHaveBeenCalledWith(result);
    });

    // ... more tests
  });

  describe("validateBinary", () => {
    it("returns true when file exists", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result = validateBinary("/path/to/binary.exe");

      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith("/path/to/binary.exe");
    });

    // ... more tests
  });
});
```

### Process Mocking Considerations

**Option 1: Object.defineProperty** (Recommended):
- Direct property assignment
- May need `writable: true, configurable: true`
- Reset in `afterEach` if tests interfere with each other

**Option 2: jest.spyOn**:
- `const platformSpy = jest.spyOn(process, "platform", "get").mockReturnValue("win32")`
- Cleaner cleanup with `platformSpy.mockRestore()`
- May require different syntax for `arch`

**Option 3: Test Isolation**:
- Run tests in separate processes if mocking causes issues
- Use `jest.isolateModules()` if needed

### File System Mocking

```typescript
jest.mock("fs", () => ({
  existsSync: jest.fn(),
}));

// In tests:
(fs.existsSync as jest.Mock).mockReturnValue(true);
(fs.existsSync as jest.Mock).mockReturnValue(false);
```

## Validation Steps

### Compilation Validation

1. **TypeScript Compilation**:
   ```bash
   pnpm run compile
   ```
   - Should succeed (interfaces exist from Task 01)
   - May show warnings about unused imports (acceptable)

2. **Test Compilation**:
   ```bash
   pnpm test --no-coverage binaryResolver.test.ts
   ```
   - Tests should compile successfully
   - Tests should fail with "function not implemented" or similar errors

### Test Execution Validation

1. **Run Tests**:
   ```bash
   pnpm test binaryResolver.test.ts
   ```
   - All tests should fail (implementation not yet written)
   - Error messages should indicate missing implementation
   - No test should pass (validates tests can fail)

2. **Test Coverage** (after Task 03):
   - After implementation, verify 100% coverage of binary resolver functions
   - All test cases should pass

### Code Quality Validation

1. **Linting**:
   ```bash
   # TypeScript linting (if configured)
   pnpm run lint
   ```
   - No linting errors
   - Follow project code style

2. **Test Structure**:
   - Tests organized in logical `describe` blocks
   - Each test has clear description
   - Mocks properly set up and cleaned up

## Acceptance Criteria

- [ ] Test file `src/__tests__/binaryResolver.test.ts` created
- [ ] All test cases for `getPlatformBinaryName()` implemented (5-6 tests)
- [ ] All test cases for `resolveBinaryPath()` implemented (5 tests)
- [ ] All test cases for `validateBinary()` implemented (3 tests)
- [ ] Mock strategy clearly defined and implemented
- [ ] Tests compile successfully
- [ ] Tests fail initially (implementation not yet written)
- [ ] Test structure follows project conventions (Jest, describe blocks)
- [ ] All edge cases covered (unsupported platforms, missing files, etc.)

## Dependencies

### Prerequisites

- **Task 01**: `src/binaryResolver.ts` with interface definitions must exist
- **Jest**: Configured in `jest.config.js` (already exists)
- **TypeScript**: Compiler configured (already exists)

### Blocking

- **Task 03**: Implementation cannot proceed until tests are written (TDD)

## Documentation Updates

No documentation updates needed for this task. Test file serves as documentation of expected behavior.

## Notes

### Process Mocking Challenges

Mocking `process.platform` and `process.arch` can be tricky:
- `Object.defineProperty` may not work in all Jest environments
- Consider using `jest.spyOn` if `Object.defineProperty` fails
- May need to reset values between tests to avoid interference
- Test isolation may require separate test processes

### Path Handling

- Use `path.join()` in expectations to handle cross-platform paths correctly
- Test both Windows (`C:\`) and Unix (`/`) path formats
- Verify absolute paths are returned (not relative)

### Mock Cleanup

- Always clear mocks in `beforeEach` to avoid test interference
- Consider restoring original `process` values in `afterEach` if needed
- Use `jest.clearAllMocks()` for `fs` mocks

## References

- **Master Plan Testing**: `_features/vscode-extension-packaging/plans/master/testing.md`
- **Master Plan Interfaces**: `_features/vscode-extension-packaging/plans/master/interfaces.md`
- **Project Patterns**: `docs/AI_CONTEXT/AI_CONTEXT_PATTERNS.md`
- **Jest Documentation**: https://jestjs.io/docs/getting-started
- **Task 01**: `_features/vscode-extension-packaging/tasks/01-define-binary-resolver-interfaces.md`
