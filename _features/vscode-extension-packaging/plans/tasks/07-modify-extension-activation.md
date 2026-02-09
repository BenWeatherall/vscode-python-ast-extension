# Per-Task Implementation Plan: Modify Extension Activation

## Overview

This task modifies `src/extension.ts` to integrate binary path resolution into extension activation. The extension will resolve the Python service binary path from the extension context and pass it to `PythonClient`. If the binary is not found (development mode), a warning is logged and activation continues with the Python command fallback. Following TDD principles, the tests for this functionality were written in Task 06; this task implements the code to make those tests pass.

**Task Context**: This task depends on Tasks 03 (binary resolver implemented), 05 (PythonClient modified to accept binary path), and 06 (extension integration tests written). The implementation follows the test specifications from Task 06.

## Files to Modify

### Primary File
- **`src/extension.ts`**: Modify `activate()` function to resolve binary path and pass to PythonClient

## Test Strategy

### Existing Tests (from Task 06)

Tests are already written in `src/__tests__/extension.test.ts`. This task implements the code to make those tests pass:

1. **`activate_resolves_binary_path`**: Verifies `resolveBinaryPath()` is called with `context.extensionPath`
2. **`activate_passes_binary_path_to_pythonclient`**: Verifies `PythonClient` constructor called with resolved binary path
3. **`activate_logs_warning_if_binary_not_found`**: Verifies warning logged to output channel when binary not found
4. **`activate_continues_without_binary`**: Verifies activation succeeds even if binary not found
5. **`activate_handles_unsupported_platform`**: Verifies graceful handling of unsupported platforms

### Test Validation

After implementation:
- Run tests: `pnpm test extension.test.ts`
- Verify all tests from Task 06 pass
- Verify TypeScript compilation succeeds
- Verify no regressions in existing functionality

## Implementation Order

### Step 1: Add Import Statement

**Location**: `src/extension.ts` (top of file, after existing imports)

**Change**:
```typescript
import { resolveBinaryPath } from "./binaryResolver";
```

**Placement**: Add after line 5 (after `import type { ReteGraph } from "./types";`)

**Validation**: TypeScript compilation succeeds, import resolves correctly

---

### Step 2: Modify `activate()` Function - Binary Path Resolution

**Location**: `src/extension.ts` - `activate()` function (line 178)

**Change**: Add binary path resolution at the start of `activate()` function, before `PythonClient` instantiation.

**Implementation**:
```typescript
export function activate(context: vscode.ExtensionContext): void {
  // Resolve binary path from extension context
  const binaryPath = resolveBinaryPath(context.extensionPath);
  
  // ... rest of function continues
}
```

**Placement**: Insert immediately after function signature, before line 179 (`pythonClient = new PythonClient();`)

**Validation**: TypeScript compilation succeeds, binary path resolved correctly

---

### Step 3: Add Conditional Warning Logging

**Location**: `src/extension.ts` - `activate()` function (after binary path resolution)

**Change**: Add conditional logging when binary not found.

**Implementation**:
```typescript
export function activate(context: vscode.ExtensionContext): void {
  // Resolve binary path from extension context
  const binaryPath = resolveBinaryPath(context.extensionPath);
  
  if (!binaryPath) {
    // Log warning but continue (development mode fallback)
    const channel = getOutputChannel();
    channel.appendLine(
      "Warning: Python service binary not found, using system Python"
    );
  }
  
  // ... rest of function continues
}
```

**Placement**: Insert after binary path resolution, before `PythonClient` instantiation

**Validation**: 
- Warning logged when binary not found
- No error thrown (activation continues)
- Uses existing `getOutputChannel()` function

---

### Step 4: Update PythonClient Instantiation

**Location**: `src/extension.ts` - `activate()` function (line 179)

**Change**: Modify `PythonClient` instantiation to pass binary path parameter.

**Before**:
```typescript
pythonClient = new PythonClient();
```

**After**:
```typescript
pythonClient = new PythonClient(binaryPath);
```

**Placement**: Replace line 179

**Validation**: 
- `PythonClient` receives binary path (or `null` if not found)
- TypeScript compilation succeeds
- No other activation logic changed

---

### Step 5: Update Function Docstring

**Location**: `src/extension.ts` - `activate()` function docstring (line 173)

**Change**: Update docstring to document binary resolution behavior, development mode fallback, and error handling.

**Current Docstring**:
```typescript
/**
 * Activates the extension.
 * Creates PythonClient instance, registers the 'python-ast.visualize' command,
 * and sets up auto-refresh on file save.
 * @param context - VS Code extension context for subscriptions.
 */
```

**Updated Docstring**:
```typescript
/**
 * Activates the extension.
 * 
 * Resolves Python service binary path from extension context and passes it to PythonClient.
 * If binary not found (development mode), logs warning and falls back to system Python.
 * Creates PythonClient instance, registers the 'python-ast.visualize' command,
 * and sets up auto-refresh on file save.
 * 
 * Binary Resolution:
 * - Attempts to resolve platform-specific binary from extension bin/ directory
 * - Falls back to "python -m python_service" if binary not found
 * - Logs warning to output channel in development mode (binary not found)
 * 
 * Error Handling:
 * - Activation continues even if binary not found (graceful fallback)
 * - No exceptions thrown for missing binaries or unsupported platforms
 * 
 * @param context - VS Code extension context for subscriptions.
 */
```

**Placement**: Replace existing docstring (lines 173-177)

**Validation**: Docstring accurately describes behavior, follows Google style

---

### Step 6: Verify Activation Logic Unchanged

**Location**: `src/extension.ts` - `activate()` function (after PythonClient instantiation)

**Change**: Ensure all other activation logic remains unchanged:
- Command registration (`python-ast.visualize`)
- File watcher subscription (`onDidSaveTextDocument`)
- Context subscriptions

**Validation**: 
- No other code modified
- All existing functionality preserved
- Command registration unchanged
- Auto-refresh unchanged

---

## Validation Steps

### Compilation Validation
1. Run TypeScript compilation: `pnpm run compile`
2. Verify no TypeScript errors
3. Verify import resolves correctly (`binaryResolver` module exists)
4. Verify `PythonClient` constructor accepts `binaryPath` parameter

### Test Execution Validation
1. Run extension tests: `pnpm test extension.test.ts`
2. Verify all tests from Task 06 pass:
   - `activate_resolves_binary_path` passes
   - `activate_passes_binary_path_to_pythonclient` passes
   - `activate_logs_warning_if_binary_not_found` passes
   - `activate_continues_without_binary` passes
   - `activate_handles_unsupported_platform` passes
3. Verify no regressions in existing tests

### Functional Validation
1. **Manual Test - With Binary**:
   - Ensure binary exists in `bin/` directory (if available)
   - Activate extension in VS Code
   - Verify no warning logged
   - Verify PythonClient uses binary (check via logs or process inspection)

2. **Manual Test - Without Binary (Development Mode)**:
   - Remove or rename binary in `bin/` directory
   - Activate extension in VS Code
   - Verify warning logged to Output channel: "Warning: Python service binary not found, using system Python"
   - Verify activation succeeds
   - Verify PythonClient falls back to Python command

3. **Manual Test - Unsupported Platform**:
   - Test on unsupported platform (if possible) or mock `resolveBinaryPath` to return `null`
   - Verify graceful handling (no exceptions)
   - Verify warning logged
   - Verify activation succeeds

### Code Quality Validation
1. Run linting: `pnpm run lint` (if configured)
2. Verify code follows project patterns:
   - Uses existing `getOutputChannel()` function
   - Follows error handling patterns (no exceptions for missing binary)
   - Maintains activation flow structure
3. Verify docstring follows Google style

## Documentation Updates

### Code Documentation
- **Function Docstring**: Updated `activate()` docstring documents binary resolution behavior
- **Inline Comments**: Added comment explaining binary resolution step

### No Additional Documentation Needed
- Binary resolver already documented (Task 03)
- PythonClient modifications already documented (Task 05)
- Extension integration tests already documented (Task 06)

## Dependencies

### Prerequisites
- **Task 03**: Binary resolver implemented (`src/binaryResolver.ts` exists, `resolveBinaryPath()` function available)
- **Task 05**: PythonClient modified to accept binary path parameter (`constructor(binaryPath?: string | null)`)
- **Task 06**: Extension integration tests written (tests exist in `src/__tests__/extension.test.ts`)

### No Dependencies On
- **Task 08+**: Build scripts, packaging configuration (not required for activation logic)

## Acceptance Criteria

- ✅ Import statement added: `import { resolveBinaryPath } from "./binaryResolver"`
- ✅ Binary path resolved in `activate()`: `const binaryPath = resolveBinaryPath(context.extensionPath)`
- ✅ Warning logged when binary not found: Uses `getOutputChannel()` and logs "Warning: Python service binary not found, using system Python"
- ✅ PythonClient instantiation updated: `pythonClient = new PythonClient(binaryPath)`
- ✅ Function docstring updated: Documents binary resolution, development mode fallback, error handling
- ✅ All tests from Task 06 pass: `pnpm test extension.test.ts` passes
- ✅ TypeScript compilation succeeds: `pnpm run compile` passes
- ✅ Activation continues successfully in all scenarios: With binary, without binary, unsupported platform
- ✅ No regressions: Existing functionality unchanged (command registration, auto-refresh)
- ✅ Code follows project patterns: Uses existing functions, follows error handling patterns

## Notes

### Error Handling Strategy

**Key Principle**: Activation must never fail due to missing binaries. This enables development mode where binaries may not be built yet.

**Implementation**:
- `resolveBinaryPath()` returns `null` (not throws) for missing binaries
- Extension logs warning but continues activation
- `PythonClient` receives `null` and falls back to Python command
- No exceptions thrown for missing binaries or unsupported platforms

### Development Mode Fallback

The extension gracefully handles development scenarios:
- Binary not built yet → Falls back to `python -m python_service`
- Unsupported platform → Falls back to Python command
- Binary missing from package → Falls back to Python command

This ensures developers can work on the extension without building binaries first.

### Warning Message

The warning message is logged to the Output channel (not shown as error dialog) because:
- It's informational, not an error
- Development mode is expected behavior
- Users can check Output channel if needed
- Doesn't interrupt workflow

### Binary Path Flow

1. **Activation**: `activate(context)` called by VS Code
2. **Resolution**: `resolveBinaryPath(context.extensionPath)` called
3. **Result**: Returns `string | null` (binary path or null)
4. **Logging**: If `null`, log warning to output channel
5. **Injection**: Pass binary path to `PythonClient` constructor
6. **Fallback**: `PythonClient` uses binary if provided, Python command if `null`

### Testing Considerations

Tests from Task 06 mock:
- `resolveBinaryPath()` function (to control return values)
- `vscode.ExtensionContext` (to provide `extensionPath`)
- `PythonClient` constructor (to verify binary path passed)

Implementation must work with these mocks and real VS Code API.

## References

- **Master Plan**: `_features/vscode-extension-packaging/plans/master/implementation.md` (Step 7)
- **Master Plan**: `_features/vscode-extension-packaging/plans/master/testing.md` (Extension Integration Tests section)
- **Task 06**: `_features/vscode-extension-packaging/tasks/06-write-extension-integration-tests.md`
- **Task 05**: `_features/vscode-extension-packaging/tasks/05-modify-pythonclient.md`
- **Task 03**: `_features/vscode-extension-packaging/tasks/03-implement-binary-resolver.md`
- **Extension Implementation**: `src/extension.ts`
- **Binary Resolver**: `src/binaryResolver.ts`
- **PythonClient**: `src/pythonClient.ts`
- **Extension Tests**: `src/__tests__/extension.test.ts`
- **TDD Practices**: `@.cursor/rules/development_practices.mdc`