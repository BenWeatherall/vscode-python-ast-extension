# Background

This task defines the interfaces and type definitions for the binary resolver module. Following TDD and models-first principles, we define the contracts before implementation. This task has no dependencies and establishes the foundation for binary resolution functionality.

# This Task

1. Create `src/binaryResolver.ts` with interface definitions:
   - Define `getPlatformBinaryName()` function signature:
     - Returns: `string | null`
     - Purpose: Maps Node.js platform/architecture to binary filename
     - Platform mapping:
       - `win32` + `x64` → `"python_service-win-x64.exe"`
       - `linux` + `x64` → `"python_service-linux-x64"`
       - `darwin` + `arm64` → `"python_service-darwin-arm64"`
       - `darwin` + `x64` → `"python_service-darwin-x64"`
       - Other combinations → `null`
   
   - Define `resolveBinaryPath(extensionPath: string)` function signature:
     - Parameters: `extensionPath: string` (extension installation directory)
     - Returns: `string | null` (absolute binary path or null)
     - Purpose: Resolves absolute path to Python service binary
   
   - Define `validateBinary(binaryPath: string)` function signature:
     - Parameters: `binaryPath: string` (absolute path to binary)
     - Returns: `boolean`
     - Purpose: Validates binary file exists and is accessible

2. Export type definitions:
   - Platform type: `type Platform = "win32" | "linux" | "darwin"`
   - Architecture type: `type Architecture = "x64" | "arm64"`
   - Binary name type: Union of supported binary names

3. Add module-level JSDoc comment explaining purpose and usage

**Acceptance Criteria**:
- TypeScript compilation succeeds
- All function signatures defined with proper types
- Type definitions exported
- No implementation code (interfaces only)

# Testing Needed

No tests needed at this stage - this task only defines interfaces. Tests will be written in the next task after interfaces are defined.
