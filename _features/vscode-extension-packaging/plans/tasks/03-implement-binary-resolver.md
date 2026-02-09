# Per-Task Implementation Plan: Implement Binary Resolver

## Overview

This task implements the binary resolver module (`src/binaryResolver.ts`) based on the interfaces defined in Task 01 and tests written in Task 02. Following TDD principles, the implementation must make all existing tests pass. The binary resolver provides platform detection, binary path resolution, and binary validation functionality required for the VS Code extension to locate and execute platform-specific Python service binaries.

**Key Objectives**:
- Implement `getPlatformBinaryName()` to map Node.js platform/architecture to binary filenames
- Implement `resolveBinaryPath()` to construct and validate absolute binary paths from extension context
- Implement `validateBinary()` to check binary file existence
- Ensure all functions return `null` (not throw) for unsupported platforms or missing files
- Add proper Google-style docstrings for all exported functions

## Files to Create/Modify

### Files to Modify

1. **`src/binaryResolver.ts`** (created in Task 01, interfaces only)
   - Implement `getPlatformBinaryName()` function body
   - Implement `resolveBinaryPath()` function body
   - Implement `validateBinary()` function body
   - Add imports: `import * as path from "path"` and `import * as fs from "fs"`
   - Add Google-style docstrings to all functions
   - Ensure all functions are exported

### Files Already Created (No Changes)

- `src/__tests__/binaryResolver.test.ts` (created in Task 02)
  - Tests are already written and should pass after implementation

## Test Strategy

### Existing Tests (Task 02)

Tests are already written in `src/__tests__/binaryResolver.test.ts`. The implementation must make these tests pass:

**Test Coverage**:
1. `getPlatformBinaryName()` tests:
   - Windows x64 → `"python_service-win-x64.exe"`
   - Linux x64 → `"python_service-linux-x64"`
   - macOS ARM64 → `"python_service-darwin-arm64"`
   - macOS x64 → `"python_service-darwin-x64"`
   - Unsupported platform → `null`

2. `resolveBinaryPath()` tests:
   - Valid path resolution (file exists)
   - Unsupported platform handling
   - Binary not found handling
   - Path construction verification

3. `validateBinary()` tests:
   - File exists → `true`
   - File not found → `false`

**Mock Strategy** (already set up in tests):
- `fs.existsSync()` mocked via Jest
- `process.platform` and `process.arch` mocked per test
- `path` module used directly (deterministic)

### Test Execution Order

1. Run tests before implementation: `pnpm test binaryResolver.test.ts` (should fail)
2. Implement functions incrementally, running tests after each function
3. Verify all tests pass: `pnpm test binaryResolver.test.ts`
4. Verify TypeScript compilation: `pnpm run compile`

## Implementation Order

### Step 1: Add Required Imports

**File**: `src/binaryResolver.ts`

Add imports at the top of the file:
```typescript
import * as path from "path";
import * as fs from "fs";
```

**Validation**: TypeScript compilation succeeds

---

### Step 2: Implement `getPlatformBinaryName()`

**File**: `src/binaryResolver.ts`

**Implementation**:
- Read `process.platform` and `process.arch`
- Create platform/architecture mapping object:
  - `win32` + `x64` → `"python_service-win-x64.exe"`
  - `linux` + `x64` → `"python_service-linux-x64"`
  - `darwin` + `arm64` → `"python_service-darwin-arm64"`
  - `darwin` + `x64` → `"python_service-darwin-x64"`
- Return mapped filename or `null` for unsupported combinations
- Add Google-style docstring

**Example Implementation**:
```typescript
/**
 * Maps Node.js platform and architecture to binary filename.
 * 
 * @returns Binary filename (e.g., "python_service-win-x64.exe") or null if platform unsupported
 */
export function getPlatformBinaryName(): string | null {
  const platform = process.platform;
  const arch = process.arch;
  
  const platformMap: Record<string, Record<string, string>> = {
    win32: {
      x64: "python_service-win-x64.exe",
    },
    linux: {
      x64: "python_service-linux-x64",
    },
    darwin: {
      arm64: "python_service-darwin-arm64",
      x64: "python_service-darwin-x64",
    },
  };
  
  return platformMap[platform]?.[arch] || null;
}
```

**Validation**:
- Run tests: `pnpm test binaryResolver.test.ts --testNamePattern="getPlatformBinaryName"`
- All `getPlatformBinaryName()` tests should pass
- TypeScript compilation succeeds

---

### Step 3: Implement `resolveBinaryPath()`

**File**: `src/binaryResolver.ts`

**Implementation**:
- Call `getPlatformBinaryName()` to get binary filename
- Return `null` if platform unsupported (binary name is `null`)
- Construct path using `path.join(extensionPath, "bin", binaryName)`
- Validate file exists using `fs.existsSync(binaryPath)`
- Return absolute path if exists, `null` otherwise
- Add Google-style docstring

**Example Implementation**:
```typescript
/**
 * Resolves absolute path to Python service binary from extension installation directory.
 * 
 * @param extensionPath - Extension installation directory (from ExtensionContext.extensionPath)
 * @returns Absolute binary path or null if binary not found or platform unsupported
 */
export function resolveBinaryPath(extensionPath: string): string | null {
  const binaryName = getPlatformBinaryName();
  if (!binaryName) {
    return null;
  }
  
  const binaryPath = path.join(extensionPath, "bin", binaryName);
  
  if (!fs.existsSync(binaryPath)) {
    return null;
  }
  
  return binaryPath;
}
```

**Validation**:
- Run tests: `pnpm test binaryResolver.test.ts --testNamePattern="resolveBinaryPath"`
- All `resolveBinaryPath()` tests should pass
- TypeScript compilation succeeds

---

### Step 4: Implement `validateBinary()`

**File**: `src/binaryResolver.ts`

**Implementation**:
- Check file existence using `fs.existsSync(binaryPath)`
- Return `true` if exists, `false` otherwise
- Add Google-style docstring

**Example Implementation**:
```typescript
/**
 * Validates that binary file exists and is accessible.
 * 
 * @param binaryPath - Absolute path to binary file
 * @returns True if binary exists and is accessible, false otherwise
 */
export function validateBinary(binaryPath: string): boolean {
  return fs.existsSync(binaryPath);
}
```

**Validation**:
- Run tests: `pnpm test binaryResolver.test.ts --testNamePattern="validateBinary"`
- All `validateBinary()` tests should pass
- TypeScript compilation succeeds

---

### Step 5: Verify All Tests Pass

**Actions**:
1. Run full test suite: `pnpm test binaryResolver.test.ts`
2. Verify all tests pass (should be 10+ test cases)
3. Verify no TypeScript errors: `pnpm run compile`
4. Verify linting passes (if configured)

**Validation**:
- All tests pass
- No TypeScript compilation errors
- Code follows project patterns (see `@.cursor/rules/development_practices.mdc`)

---

### Step 6: Verify Function Exports

**File**: `src/binaryResolver.ts`

**Verification**:
- Ensure all three functions are exported (`export function`)
- Verify no other exports exist (unless type definitions from Task 01)
- Check that imports work correctly from other modules

**Validation**:
- TypeScript compilation succeeds
- No unused exports warnings

## Validation Steps

### Compilation Validation

```bash
# TypeScript compilation
pnpm run compile

# Should succeed with no errors
```

### Test Validation

```bash
# Run binary resolver tests
pnpm test binaryResolver.test.ts

# Expected: All tests pass
# - getPlatformBinaryName() tests (5 test cases)
# - resolveBinaryPath() tests (4 test cases)
# - validateBinary() tests (2 test cases)
```

### Functional Validation

1. **Platform Detection**:
   - Verify `getPlatformBinaryName()` returns correct filename for current platform
   - Verify returns `null` for unsupported platforms (if testing on unsupported platform)

2. **Path Resolution**:
   - Create test `bin/` directory with mock binary
   - Verify `resolveBinaryPath()` returns correct absolute path
   - Verify returns `null` when binary doesn't exist

3. **Binary Validation**:
   - Verify `validateBinary()` returns `true` for existing file
   - Verify returns `false` for non-existent file

### Code Quality Validation

```bash
# Linting (if configured)
ruff check . --fix  # Python linting (not applicable here)
# TypeScript linting via pnpm (if configured)

# Type checking
pnpm run compile  # Already verified above
```

## Documentation Updates

### Code Documentation

- **Google-style docstrings**: All three functions must have complete docstrings with:
  - Function purpose description
  - `@param` tags for parameters (if any)
  - `@returns` tag describing return value

### No External Documentation Updates Required

- No README updates needed (binary resolver is internal implementation detail)
- No API documentation updates needed (functions are internal to extension)
- No user-facing documentation changes required

## Dependencies

### Prerequisites

- **Task 01**: Interfaces defined in `src/binaryResolver.ts` (function signatures exist)
- **Task 02**: Tests written in `src/__tests__/binaryResolver.test.ts` (tests exist and should fail initially)

### No Blocking Dependencies

- This task can proceed independently once Tasks 01 and 02 are complete
- No dependencies on other feature tasks

## Error Handling Requirements

### Return `null` (Not Throw)

Per acceptance criteria and project patterns:
- **Unsupported platforms**: Return `null`, do not throw
- **Missing binaries**: Return `null`, do not throw
- **Invalid paths**: Return `null` (handled by `fs.existsSync()` returning `false`)

### Error Handling Pattern

```typescript
// Correct: Return null for errors
if (!binaryName) {
  return null;  // ✅
}

// Incorrect: Throw exceptions
if (!binaryName) {
  throw new Error("Unsupported platform");  // ❌
}
```

## Implementation Notes

### Platform Mapping Strategy

- Use nested `Record<string, Record<string, string>>` for type-safe platform/arch mapping
- Access via optional chaining: `platformMap[platform]?.[arch] || null`
- Ensures type safety while handling unsupported combinations gracefully

### Path Construction

- Use `path.join()` for cross-platform path construction
- Ensures correct path separators on Windows (`\`) vs Unix (`/`)
- Returns absolute path when `extensionPath` is absolute

### File System Access

- Use `fs.existsSync()` for synchronous file existence check
- Appropriate for extension activation (blocking is acceptable)
- No async/await needed for this use case

### Type Safety

- All functions have explicit return types (`string | null`, `boolean`)
- TypeScript will enforce correct usage
- No `any` types used

## Acceptance Criteria Checklist

- [ ] All tests from Task 02 pass
- [ ] TypeScript compilation succeeds
- [ ] Functions return correct values for all test cases
- [ ] Error handling returns `null` (not throws) for unsupported platforms
- [ ] Code follows project patterns (see `@.cursor/rules/development_practices.mdc`)
- [ ] Google-style docstrings added to all functions
- [ ] Required imports added (`path`, `fs`)
- [ ] All functions exported correctly

## References

- **Master Plan**: `_features/vscode-extension-packaging/plans/master/implementation.md` (Step 3)
- **Interfaces**: `_features/vscode-extension-packaging/plans/master/interfaces.md` (Binary Resolver Interfaces)
- **Test Strategy**: `_features/vscode-extension-packaging/plans/master/testing.md` (Binary Resolver Tests)
- **Project Patterns**: `docs/AI_CONTEXT/AI_CONTEXT_PATTERNS.md`
- **Development Practices**: `.cursor/rules/development_practices.mdc`
