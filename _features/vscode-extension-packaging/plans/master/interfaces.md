# Interface Definitions

## Overview

This document defines all public interfaces, function signatures, data models, and contracts for the VS Code extension packaging feature. All interfaces follow TypeScript type hints and enable clear contracts between components.

## Binary Resolver Interfaces (`src/binaryResolver.ts`)

### Platform Binary Name Mapping

```typescript
/**
 * Maps Node.js platform and architecture to binary filename.
 * 
 * @returns Binary filename (e.g., "python_service-win-x64.exe") or null if unsupported
 */
export function getPlatformBinaryName(): string | null;
```

**Platform Mapping**:
- `win32` + `x64` → `"python_service-win-x64.exe"`
- `linux` + `x64` → `"python_service-linux-x64"`
- `darwin` + `arm64` → `"python_service-darwin-arm64"`
- `darwin` + `x64` → `"python_service-darwin-x64"`
- Other combinations → `null`

### Binary Path Resolution

```typescript
/**
 * Resolves absolute path to Python service binary from extension installation directory.
 * 
 * @param extensionPath - Extension installation directory (from ExtensionContext.extensionPath)
 * @returns Absolute binary path or null if binary not found or platform unsupported
 */
export function resolveBinaryPath(extensionPath: string): string | null;
```

**Behavior**:
- Calls `getPlatformBinaryName()` to determine filename
- Constructs path: `path.join(extensionPath, "bin", binaryName)`
- Validates file existence using `fs.existsSync()`
- Returns `null` if platform unsupported or file not found

### Binary Validation

```typescript
/**
 * Validates that binary file exists and is accessible.
 * 
 * @param binaryPath - Absolute path to binary file
 * @returns True if binary exists and is accessible, false otherwise
 */
export function validateBinary(binaryPath: string): boolean;
```

**Behavior**:
- Checks file existence using `fs.existsSync()`
- Returns `true` if file exists, `false` otherwise
- Does not check executable permissions (handled by spawn)

## PythonClient Interface Modifications (`src/pythonClient.ts`)

### Constructor Modification

**Before**:
```typescript
export class PythonClient {
  constructor() {
    // ...
  }
}
```

**After**:
```typescript
export class PythonClient {
  private binaryPath: string | null = null;

  /**
   * Creates a new PythonClient instance.
   * 
   * @param binaryPath - Optional path to Python service binary. If provided, 
   *                     binary will be used instead of "python -m python_service".
   *                     If null or undefined, falls back to Python command.
   */
  constructor(binaryPath?: string | null) {
    this.binaryPath = binaryPath || null;
  }
}
```

### Spawn Service Modification

**Before**:
```typescript
async spawnService(): Promise<void> {
  const proc = spawn("python", ["-m", "python_service"], {
    stdio: ["pipe", "pipe", "pipe"],
  });
  // ...
}
```

**After**:
```typescript
async spawnService(): Promise<void> {
  // Use binary if available, fallback to python -m python_service
  const command = this.binaryPath || "python";
  const args = this.binaryPath ? [] : ["-m", "python_service"];
  
  const proc = spawn(command, args, {
    stdio: ["pipe", "pipe", "pipe"],
  });
  // ... rest of implementation unchanged
}
```

**Protocol Compatibility**: Binary execution maintains identical JSON-RPC stdio protocol. No changes to `parseAST()` or communication logic.

## Extension Activation Interface (`src/extension.ts`)

### Activation Function Modification

**Before**:
```typescript
export function activate(context: vscode.ExtensionContext): void {
  pythonClient = new PythonClient();
  // ...
}
```

**After**:
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
  
  pythonClient = new PythonClient(binaryPath);
  // ... rest of activation unchanged
}
```

## Build Script Interface (`scripts/build-binaries.js`)

### Build Binary Function

```typescript
/**
 * Builds Python service binary for specified platform and architecture.
 * 
 * @param platform - Target platform ("win32", "linux", "darwin")
 * @param arch - Target architecture ("x64", "arm64")
 * @returns Promise that resolves when build completes successfully
 * @throws Error if build fails or platform unsupported
 */
async function buildBinary(
  platform: string,
  arch: string
): Promise<void>;
```

**Behavior**:
- Maps platform/arch to binary name using naming convention
- Constructs PyInstaller command with platform-specific flags
- Spawns PyInstaller process and waits for completion
- Validates output binary exists
- Throws error on failure

### Build All Binaries Function

```typescript
/**
 * Builds Python service binaries for all supported platforms.
 * 
 * @returns Promise that resolves when all builds complete successfully
 * @throws Error if any build fails
 */
async function buildAllBinaries(): Promise<void>;
```

**Behavior**:
- Iterates through supported platform/arch combinations
- Calls `buildBinary()` for each combination
- Collects errors and reports failures
- Returns when all builds succeed

### Platform Detection

```typescript
/**
 * Detects current platform and architecture.
 * 
 * @returns Object with platform and arch, or null if unsupported
 */
function detectPlatform(): { platform: string; arch: string } | null;
```

**Behavior**:
- Reads `process.platform` and `process.arch`
- Maps to supported platform names
- Returns `null` if platform unsupported

## Package.json Interface Modifications

### New Fields

```json
{
  "publisher": "your-publisher-name",
  "scripts": {
    "build:python-binaries": "node scripts/build-binaries.js",
    "vscode:package": "vsce package"
  },
  "devDependencies": {
    "@vscode/vsce": "^2.x.x"
  }
}
```

### Script Contracts

**`build:python-binaries`**:
- Builds binary for current platform
- Outputs to `bin/` directory
- Fails if PyInstaller not available or build fails

**`vscode:package`**:
- Packages extension as `.vsix` file
- Requires `publisher` field in `package.json`
- Excludes files listed in `.vscodeignore`
- Outputs `<name>-<version>.vsix` in project root

## .vscodeignore Interface

### File Format

Gitignore-like patterns, one per line:

```
# Development environments
.venv/
**/.venv/
**/__pycache__/

# Test files
tests/
**/*.test.ts
**/*.test.py

# Development tools
.cursor/
.git/
.github/

# Build artifacts (keep out/)
**/*.map
.build/

# Node modules (if not already excluded)
node_modules/

# Source files (keep only compiled)
src/
webview-ui/src/
python_service/
```

### Inclusion Rules

**Always Include**:
- `out/` - Compiled extension and webview bundle
- `bin/` - Python service binaries
- `package.json` - Extension manifest
- `README.md` - Extension documentation

**Conditionally Include**:
- `python_service/` - Only if PyInstaller requires source (typically excluded)

## Error Interfaces

### Unsupported Platform Error

```typescript
interface UnsupportedPlatformError {
  platform: string;
  arch: string;
  supportedPlatforms: Array<{ platform: string; arch: string }>;
  message: string;
}
```

**Message Format**: "Platform {platform}/{arch} is not supported. Supported platforms: {list}"

### Binary Not Found Error

```typescript
interface BinaryNotFoundError {
  expectedPath: string;
  platform: string;
  arch: string;
  message: string;
}
```

**Message Format**: "Python service binary not found at {expectedPath} for platform {platform}/{arch}"

### Build Error

```typescript
interface BuildError {
  platform: string;
  arch: string;
  pyinstallerOutput: string;
  message: string;
}
```

**Message Format**: "Failed to build binary for {platform}/{arch}: {pyinstallerOutput}"

## Type Definitions

### Platform Type

```typescript
type Platform = "win32" | "linux" | "darwin";
```

### Architecture Type

```typescript
type Architecture = "x64" | "arm64";
```

### Binary Name Type

```typescript
type BinaryName = 
  | "python_service-win-x64.exe"
  | "python_service-linux-x64"
  | "python_service-darwin-arm64"
  | "python_service-darwin-x64";
```

## Interface Contracts

### Binary Resolver Contract

1. **Platform Detection**: Must correctly map Node.js platform/arch to binary names
2. **Path Resolution**: Must construct valid absolute paths from extension path
3. **Validation**: Must accurately detect file existence
4. **Error Handling**: Must return `null` (not throw) for unsupported platforms

### PythonClient Contract

1. **Binary Execution**: Must spawn binary with empty args array if binary path provided
2. **Fallback**: Must fall back to Python command if binary path is null/undefined
3. **Protocol Compatibility**: Must maintain identical JSON-RPC stdio protocol
4. **Error Handling**: Must handle binary execution failures gracefully

### Build Script Contract

1. **Platform Detection**: Must correctly detect current platform or accept parameters
2. **PyInstaller Invocation**: Must invoke PyInstaller with correct flags
3. **Output Validation**: Must verify binary exists after build
4. **Error Reporting**: Must provide clear error messages on failure

## Dependencies Between Interfaces

1. **Extension → Binary Resolver**: Extension calls `resolveBinaryPath()` during activation
2. **Extension → PythonClient**: Extension passes binary path to `PythonClient` constructor
3. **PythonClient → Binary**: PythonClient spawns binary if path provided
4. **Build Script → PyInstaller**: Build script invokes PyInstaller CLI
5. **VSIX → .vscodeignore**: VSIX packaging reads `.vscodeignore` for exclusions

## References

- **VS Code Extension API**: https://code.visualstudio.com/api/references/vscode-api
- **Node.js child_process**: https://nodejs.org/api/child_process.html
- **PyInstaller CLI**: https://pyinstaller.org/en/stable/usage.html
