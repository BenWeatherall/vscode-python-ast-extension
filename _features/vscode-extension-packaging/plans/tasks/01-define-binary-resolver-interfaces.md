# Task Plan: Define Binary Resolver Interfaces

## Overview

This task establishes the foundation for binary resolution functionality by defining TypeScript interfaces and type definitions for the binary resolver module. Following TDD and models-first principles, this task creates the contracts before any implementation code. This is a pure interface definition task with no dependencies on other tasks.

**Purpose**: Create type-safe interfaces that define how the extension will detect platforms, resolve binary paths, and validate binary files. These interfaces will be implemented in subsequent tasks and used throughout the extension for binary execution.

**Scope**: Single file creation (`src/binaryResolver.ts`) with function signatures, type definitions, and module-level documentation. No implementation code, no tests (tests will be written in the next task after interfaces are defined).

## Files to Create/Modify

### New Files

1. **`src/binaryResolver.ts`**
   - **Purpose**: Define all binary resolver interfaces and type exports
   - **Content**:
     - Module-level JSDoc comment explaining purpose and usage
     - `getPlatformBinaryName()` function signature
     - `resolveBinaryPath(extensionPath: string)` function signature
     - `validateBinary(binaryPath: string)` function signature
     - Type exports: `Platform`, `Architecture`, `BinaryName`
     - Export statements for all functions and types

### No Modifications

- No existing files need modification
- No test files created (tests deferred to next task)

## Test Strategy

**No tests needed at this stage** - This task only defines interfaces. Tests will be written in task `02-write-binary-resolver-tests.md` after interfaces are defined.

**Rationale**: Following TDD principles, we define interfaces first (this task), then write tests that use those interfaces (next task), then implement the functions (task 03). This ensures tests compile and can reference the function signatures before implementation.

## Implementation Order

### Step 1: Create Module File Structure

1. Create `src/binaryResolver.ts` file
2. Add module-level JSDoc comment:
   ```typescript
   /**
    * Binary resolver module for platform detection and binary path resolution.
    * 
    * This module provides functions to:
    * - Map Node.js platform/architecture to binary filenames
    * - Resolve absolute paths to Python service binaries from extension context
    * - Validate binary file existence
    * 
    * @module binaryResolver
    */
   ```

### Step 2: Define Type Exports

Add type definitions at the top of the file (before function signatures):

```typescript
/**
 * Supported Node.js platforms for binary resolution.
 */
export type Platform = "win32" | "linux" | "darwin";

/**
 * Supported CPU architectures for binary resolution.
 */
export type Architecture = "x64" | "arm64";

/**
 * Supported binary filenames.
 */
export type BinaryName =
  | "python_service-win-x64.exe"
  | "python_service-linux-x64"
  | "python_service-darwin-arm64"
  | "python_service-darwin-x64";
```

### Step 3: Define `getPlatformBinaryName()` Function Signature

Add function signature with JSDoc:

```typescript
/**
 * Maps Node.js platform and architecture to binary filename.
 * 
 * Platform mapping:
 * - `win32` + `x64` → `"python_service-win-x64.exe"`
 * - `linux` + `x64` → `"python_service-linux-x64"`
 * - `darwin` + `arm64` → `"python_service-darwin-arm64"`
 * - `darwin` + `x64` → `"python_service-darwin-x64"`
 * - Other combinations → `null`
 * 
 * @returns Binary filename (e.g., "python_service-win-x64.exe") or null if platform/architecture unsupported
 */
export function getPlatformBinaryName(): string | null;
```

**Note**: Function signature only, no implementation body.

### Step 4: Define `resolveBinaryPath()` Function Signature

Add function signature with JSDoc:

```typescript
/**
 * Resolves absolute path to Python service binary from extension installation directory.
 * 
 * This function:
 * 1. Calls `getPlatformBinaryName()` to determine filename for current platform
 * 2. Constructs path: `path.join(extensionPath, "bin", binaryName)`
 * 3. Validates file existence using `fs.existsSync()`
 * 
 * @param extensionPath - Extension installation directory (from ExtensionContext.extensionPath)
 * @returns Absolute binary path or null if binary not found or platform unsupported
 */
export function resolveBinaryPath(extensionPath: string): string | null;
```

**Note**: Function signature only, no implementation body. Import statements for `path` and `fs` are not needed yet (will be added during implementation).

### Step 5: Define `validateBinary()` Function Signature

Add function signature with JSDoc:

```typescript
/**
 * Validates that binary file exists and is accessible.
 * 
 * This function checks file existence using `fs.existsSync()`. It does not check
 * executable permissions (handled by spawn during execution).
 * 
 * @param binaryPath - Absolute path to binary file
 * @returns True if binary exists and is accessible, false otherwise
 */
export function validateBinary(binaryPath: string): boolean;
```

**Note**: Function signature only, no implementation body.

### Step 6: Verify File Structure

Ensure file structure matches:

```typescript
/**
 * Module-level JSDoc
 */

export type Platform = ...;
export type Architecture = ...;
export type BinaryName = ...;

export function getPlatformBinaryName(): string | null;
export function resolveBinaryPath(extensionPath: string): string | null;
export function validateBinary(binaryPath: string): boolean;
```

## Validation Steps

After completing implementation:

1. **TypeScript Compilation**:
   ```bash
   pnpm run compile
   ```
   - Should succeed without errors
   - File should compile as valid TypeScript module

2. **Type Checking**:
   - Verify all exported types are properly defined
   - Verify function signatures have correct parameter and return types
   - Verify no implementation code present (function bodies should be empty or missing)

3. **Export Verification**:
   - Verify all three functions are exported
   - Verify all three types are exported
   - Verify module can be imported: `import { getPlatformBinaryName, resolveBinaryPath, validateBinary, Platform, Architecture, BinaryName } from "./binaryResolver"`

4. **Documentation Verification**:
   - Verify module-level JSDoc comment exists
   - Verify each function has JSDoc comment with `@param` and `@returns` tags
   - Verify type definitions have JSDoc comments

5. **Interface Completeness**:
   - Verify `getPlatformBinaryName()` signature matches task requirements
   - Verify `resolveBinaryPath()` signature matches task requirements (single `extensionPath` parameter)
   - Verify `validateBinary()` signature matches task requirements (single `binaryPath` parameter)
   - Verify all platform mappings documented in JSDoc

## Documentation Updates

### Code Documentation

- **Module-level JSDoc**: Explains purpose, usage, and responsibilities
- **Function JSDoc**: Each function has complete documentation with:
  - Purpose description
  - Parameter descriptions (`@param` tags)
  - Return value descriptions (`@returns` tags)
  - Platform mapping details (for `getPlatformBinaryName()`)
  - Behavior notes (for `resolveBinaryPath()` and `validateBinary()`)

### No External Documentation Updates

- No README updates needed (interfaces are internal)
- No AI_CONTEXT updates needed (will be updated after implementation)
- No planning document updates needed

## Acceptance Criteria

- ✅ TypeScript compilation succeeds (`pnpm run compile`)
- ✅ All function signatures defined with proper types
- ✅ All type definitions exported (`Platform`, `Architecture`, `BinaryName`)
- ✅ No implementation code (interfaces only)
- ✅ Module-level JSDoc comment present
- ✅ Function-level JSDoc comments present with `@param` and `@returns`
- ✅ File can be imported without errors
- ✅ All exports match task requirements

## Dependencies

**No dependencies** - This is the first task in the feature pipeline and establishes the foundation for binary resolution.

## Next Steps

After this task completes:

1. **Task 02**: Write tests for binary resolver using the interfaces defined here
2. **Task 03**: Implement the functions according to the interfaces and tests

## Notes

- **No implementation**: This task is purely interface definition. Function bodies should not be implemented.
- **Type safety**: All types must be properly defined to enable type checking in subsequent tasks.
- **Documentation**: JSDoc comments are critical as they serve as the contract specification for implementers.
- **Platform mapping**: The platform mapping logic is documented but not implemented. Implementation will use `process.platform` and `process.arch` to determine the binary name.
