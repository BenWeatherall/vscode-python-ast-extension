# Implementation Approach

## Implementation Order

Following TDD and models-first principles, implementation proceeds in this order:

1. **Models & Interfaces** - Define binary resolution interfaces and types
2. **Tests** - Write tests for binary resolver and PythonClient modifications
3. **Binary Resolver** - Implement platform detection and path resolution
4. **PythonClient Modification** - Update to accept and use binary path
5. **Extension Integration** - Wire binary resolution into activation
6. **Build Scripts** - Create PyInstaller build orchestration
7. **Packaging Configuration** - Add VSIX packaging setup
8. **Integration Testing** - Verify end-to-end flow

## Step-by-Step Implementation

### Step 1: Define Models & Interfaces

**Files to Create**:
- `src/binaryResolver.ts` - Interface definitions and type exports

**Changes**:
- Define `getPlatformBinaryName()` function signature
- Define `resolveBinaryPath()` function signature
- Define `validateBinary()` function signature
- Export platform/architecture type definitions
- Export binary name type definitions

**Dependencies**: None

**Validation**: TypeScript compilation succeeds

---

### Step 2: Write Binary Resolver Tests

**Files to Create**:
- `src/__tests__/binaryResolver.test.ts`

**Test Cases**:
1. `getPlatformBinaryName()` returns correct filename for Windows x64
2. `getPlatformBinaryName()` returns correct filename for Linux x64
3. `getPlatformBinaryName()` returns correct filename for macOS ARM64
4. `getPlatformBinaryName()` returns correct filename for macOS x64
5. `getPlatformBinaryName()` returns null for unsupported platform
6. `resolveBinaryPath()` constructs correct path from extension path
7. `resolveBinaryPath()` returns null for unsupported platform
8. `resolveBinaryPath()` returns null if binary file doesn't exist
9. `validateBinary()` returns true for existing file
10. `validateBinary()` returns false for non-existent file

**Dependencies**: Step 1 (interfaces defined)

**Validation**: Tests compile but fail (implementation not yet written)

---

### Step 3: Implement Binary Resolver

**Files to Modify**:
- `src/binaryResolver.ts` - Implement all functions

**Implementation Details**:

**`getPlatformBinaryName()`**:
```typescript
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

**`resolveBinaryPath()`**:
```typescript
import * as path from "path";
import * as fs from "fs";

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

**`validateBinary()`**:
```typescript
import * as fs from "fs";

export function validateBinary(binaryPath: string): boolean {
  return fs.existsSync(binaryPath);
}
```

**Dependencies**: Step 2 (tests written)

**Validation**: All tests pass

---

### Step 4: Write PythonClient Modification Tests

**Files to Modify**:
- `src/__tests__/pythonClient.test.ts`

**Test Cases to Add**:
1. `PythonClient` constructor accepts binary path parameter
2. `spawnService()` spawns binary when binary path provided
3. `spawnService()` spawns Python command when binary path is null
4. `spawnService()` spawns Python command when binary path is undefined
5. Binary execution uses empty args array
6. Python command execution uses `["-m", "python_service"]` args
7. Protocol compatibility maintained (JSON-RPC unchanged)

**Mock Updates**:
- Update spawn mocks to handle binary path vs Python command
- Verify spawn called with correct command and args

**Dependencies**: Step 3 (binary resolver implemented)

**Validation**: Tests compile but fail (PythonClient not yet modified)

---

### Step 5: Modify PythonClient

**Files to Modify**:
- `src/pythonClient.ts`

**Changes**:

**Constructor**:
```typescript
export class PythonClient {
  private process: ChildProcess | null = null;
  private binaryPath: string | null = null;

  constructor(binaryPath?: string | null) {
    this.binaryPath = binaryPath || null;
  }
  // ...
}
```

**`spawnService()`**:
```typescript
async spawnService(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Use binary if available, fallback to python -m python_service
    const command = this.binaryPath || "python";
    const args = this.binaryPath ? [] : ["-m", "python_service"];
    
    const proc = spawn(command, args, {
      stdio: ["pipe", "pipe", "pipe"],
    });
    
    // ... rest of implementation unchanged
  });
}
```

**Dependencies**: Step 4 (tests written)

**Validation**: All tests pass

---

### Step 6: Write Extension Integration Tests

**Files to Modify**:
- `src/__tests__/extension.test.ts`

**Test Cases to Add**:
1. `activate()` resolves binary path from extension context
2. `activate()` passes binary path to `PythonClient` constructor
3. `activate()` logs warning if binary not found (development mode)
4. `activate()` continues activation even if binary not found
5. `activate()` handles unsupported platform gracefully

**Mock Updates**:
- Mock `vscode.ExtensionContext` with `extensionPath`
- Mock `resolveBinaryPath()` function
- Verify `PythonClient` constructor called with binary path

**Dependencies**: Step 5 (PythonClient modified)

**Validation**: Tests compile but fail (extension not yet modified)

---

### Step 7: Modify Extension Activation

**Files to Modify**:
- `src/extension.ts`

**Changes**:

**Import**:
```typescript
import { resolveBinaryPath } from "./binaryResolver";
```

**`activate()`**:
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

**Dependencies**: Step 6 (tests written)

**Validation**: All tests pass

---

### Step 8: Create Build Scripts

**Files to Create**:
- `scripts/build-binaries.js`

**Implementation**:

```javascript
const { spawn } = require("child_process");
const { platform, arch } = process;
const path = require("path");
const fs = require("fs");

const platformMap = {
  win32: { name: "win", ext: ".exe" },
  linux: { name: "linux", ext: "" },
  darwin: { name: "darwin", ext: "" },
};

const archMap = {
  x64: "x64",
  arm64: "arm64",
};

function buildBinary() {
  const plat = platformMap[platform];
  const archName = archMap[arch];

  if (!plat) {
    console.error(`Unsupported platform: ${platform}`);
    process.exit(1);
  }

  const binaryName = `python_service-${plat.name}-${archName}${plat.ext}`;
  const binDir = path.join(process.cwd(), "bin");

  // Ensure bin directory exists
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  const args = [
    "--onefile",
    "--name",
    binaryName,
    "--distpath",
    binDir,
    "--workpath",
    path.join(process.cwd(), ".build", `pyinstaller-${plat.name}-${archName}`),
    "--clean",
    "--hidden-import",
    "pydantic",
    "python_service/__main__.py",
  ];

  console.log(`Building binary: ${binaryName}`);
  console.log(`Command: pyinstaller ${args.join(" ")}`);

  const proc = spawn("pyinstaller", args, {
    stdio: "inherit",
    shell: platform === "win32",
  });

  proc.on("close", (code) => {
    if (code !== 0) {
      console.error(`PyInstaller failed with code ${code}`);
      process.exit(code);
    }

    const binaryPath = path.join(binDir, binaryName);
    if (!fs.existsSync(binaryPath)) {
      console.error(`Binary not found at expected path: ${binaryPath}`);
      process.exit(1);
    }

    console.log(`Binary built successfully: ${binaryPath}`);
  });
}

buildBinary();
```

**Dependencies**: PyInstaller installed in Python environment

**Validation**: Script executes and creates binary in `bin/` directory

---

### Step 9: Add Package.json Configuration

**Files to Modify**:
- `package.json`

**Changes**:

**Add Publisher**:
```json
{
  "publisher": "your-publisher-name"
}
```

**Add Scripts**:
```json
{
  "scripts": {
    "build:python-binaries": "node scripts/build-binaries.js",
    "vscode:package": "vsce package"
  }
}
```

**Add Dev Dependency**:
```json
{
  "devDependencies": {
    "@vscode/vsce": "^2.x.x"
  }
}
```

**Dependencies**: None

**Validation**: `pnpm install` succeeds, scripts available

---

### Step 10: Create .vscodeignore

**Files to Create**:
- `.vscodeignore`

**Content**:
```
# Development environments
.venv/
**/.venv/
**/__pycache__/

# Test files
tests/
**/*.test.ts
**/*.test.py
**/__tests__/

# Development tools
.cursor/
.git/
.github/

# Build artifacts (keep out/)
**/*.map
.build/

# Source files (keep only compiled)
src/
webview-ui/src/
python_service/

# Node modules
node_modules/

# Documentation (optional, include README.md)
docs/
_features/
_archive/
```

**Dependencies**: None

**Validation**: File created, patterns correct

---

### Step 11: Test Binary Build

**Actions**:
1. Install PyInstaller: `uv pip install pyinstaller` or `pip install pyinstaller`
2. Run build script: `pnpm run build:python-binaries`
3. Verify binary created in `bin/` directory
4. Test binary execution: Run binary directly and verify it accepts JSON-RPC input

**Dependencies**: Step 8 (build script), Step 9 (package.json)

**Validation**: Binary exists, executes, and responds to JSON-RPC requests

---

### Step 12: Test VSIX Packaging

**Actions**:
1. Ensure binaries built: `pnpm run build:python-binaries`
2. Build extension: `pnpm run build`
3. Package VSIX: `pnpm run vscode:package`
4. Inspect VSIX contents: Extract `.vsix` (it's a zip) and verify:
   - `out/` directory included
   - `bin/` directory included with binaries
   - Development artifacts excluded
   - `package.json` included

**Dependencies**: Step 9 (package.json), Step 10 (.vscodeignore)

**Validation**: VSIX created, contains expected files, excludes dev artifacts

---

### Step 13: Integration Testing

**Files to Create**:
- `tests/integration/binary-execution.test.ts`

**Test Cases**:
1. Extension activates with binary path resolved
2. PythonClient spawns binary successfully
3. Binary responds to JSON-RPC parse requests
4. Graph data returned correctly from binary
5. Fallback to Python command works if binary not found

**Dependencies**: All previous steps

**Validation**: All integration tests pass

---

## File Modification Summary

### New Files
- `src/binaryResolver.ts` - Binary resolution logic
- `scripts/build-binaries.js` - Build orchestration script
- `.vscodeignore` - VSIX packaging exclusions
- `src/__tests__/binaryResolver.test.ts` - Binary resolver tests

### Modified Files
- `src/pythonClient.ts` - Accept binary path, modify spawn
- `src/extension.ts` - Resolve binary path during activation
- `package.json` - Add publisher, scripts, dev dependencies
- `src/__tests__/pythonClient.test.ts` - Update mocks for binary execution
- `src/__tests__/extension.test.ts` - Add binary resolution tests

## Implementation Dependencies

1. **Binary Resolver** → No dependencies
2. **PythonClient** → Depends on binary resolver (imports types)
3. **Extension** → Depends on binary resolver and PythonClient
4. **Build Scripts** → Depends on PyInstaller installation
5. **Packaging** → Depends on all above components

## Code Organization

### Binary Resolver Module (`src/binaryResolver.ts`)

- **Single Responsibility**: Platform detection and path resolution only
- **Pure Functions**: No side effects, deterministic output
- **Error Handling**: Returns `null` (not throws) for errors
- **Type Safety**: Full TypeScript type coverage

### Build Script (`scripts/build-binaries.js`)

- **Single Responsibility**: PyInstaller invocation only
- **Platform Detection**: Uses Node.js `process.platform/arch`
- **Error Handling**: Exits with non-zero code on failure
- **Output Validation**: Verifies binary exists after build

## Dependency Injection Points

1. **Binary Path** → Injected into `PythonClient` constructor
2. **Extension Path** → Injected into `resolveBinaryPath()` function
3. **File System** → Used via Node.js `fs` module (not mocked in production)

## Validation Steps

After each step:
1. **TypeScript Compilation**: `pnpm run compile` succeeds
2. **Tests Pass**: `pnpm test` passes for modified tests
3. **Linting**: `ruff check` and TypeScript linting pass
4. **Manual Testing**: Verify functionality manually if applicable

## References

- **PyInstaller Usage**: https://pyinstaller.org/en/stable/usage.html
- **VS Code Packaging**: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- **Node.js child_process**: https://nodejs.org/api/child_process.html
