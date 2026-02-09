# Architecture Design

## System Architecture Overview

The VS Code extension packaging feature extends the existing sidecar architecture with binary resolution and packaging components:

```
┌─────────────────────────────────────────────────────────┐
│              VS Code Extension Package (.vsix)           │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Extension Host (TypeScript/Node.js)             │  │
│  │  - Binary resolver (platform detection)           │  │
│  │  - PythonClient (spawns binary or Python)         │  │
│  │  - Webview panel management                        │  │
│  └────┬───────────────────┬──────────────────────────┘  │
│       │                   │                              │
│       │ postMessage        │ stdio/JSON-RPC              │
│       │                   │                              │
│  ┌────▼────────┐    ┌─────▼──────────────────────────┐  │
│  │  Webview UI │    │  Python Service Binary          │  │
│  │  (React +   │    │  (PyInstaller bundle)            │  │
│  │   Rete.js)  │    │  - Python 3.12 interpreter      │  │
│  │             │    │  - python_service package        │  │
│  └─────────────┘    │  - Dependencies (pydantic)      │  │
│                     └──────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │   bin/ directory                                  │  │
│  │  - python_service-win-x64.exe                      │  │
│  │  - python_service-linux-x64                       │  │
│  │  - python_service-darwin-arm64                    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Binary Resolver (`src/binaryResolver.ts`)

**Purpose**: Platform detection and binary path resolution

**Responsibilities**:
- Map `process.platform` and `process.arch` to binary filenames
- Resolve absolute binary path from extension installation directory
- Validate binary file existence
- Provide clear error messages for unsupported platforms

**Key Functions**:
- `getPlatformBinaryName()`: Maps platform/arch to filename
- `resolveBinaryPath(extensionPath)`: Resolves absolute path
- `validateBinary(binaryPath)`: Checks file existence

**Design Patterns**:
- **Strategy Pattern**: Platform-specific binary selection
- **Dependency Injection**: Extension path injected as parameter

### 2. Build Scripts (`scripts/build-binaries.js`)

**Purpose**: Orchestrate PyInstaller builds for multiple platforms

**Responsibilities**:
- Detect current platform or accept platform argument
- Invoke PyInstaller with platform-specific flags
- Handle build errors and provide feedback
- Verify build outputs

**Key Functions**:
- `buildBinary(platform, arch)`: Build binary for specific platform
- `buildAllBinaries()`: Build binaries for all supported platforms

**Design Patterns**:
- **Command Pattern**: Encapsulates PyInstaller invocation
- **Factory Pattern**: Creates platform-specific build configurations

### 3. PythonClient Modification (`src/pythonClient.ts`)

**Purpose**: Execute Python service via binary or Python command

**Responsibilities**:
- Accept binary path via constructor injection
- Spawn binary directly if available
- Fall back to `python -m python_service` if binary unavailable
- Maintain existing JSON-RPC protocol

**Key Changes**:
- Constructor accepts optional `binaryPath` parameter
- `spawnService()` uses binary path if provided
- Protocol unchanged (stdio JSON-RPC)

**Design Patterns**:
- **Dependency Injection**: Binary path injected via constructor
- **Strategy Pattern**: Binary vs Python command selection

### 4. Extension Activation (`src/extension.ts`)

**Purpose**: Wire binary resolution into extension lifecycle

**Responsibilities**:
- Resolve binary path during activation
- Configure `PythonClient` with binary path
- Handle binary resolution failures gracefully
- Log binary resolution details

**Key Changes**:
- `activate()` resolves binary path before creating `PythonClient`
- Error handling for missing binaries (development fallback)
- Output channel logging for debugging

**Design Patterns**:
- **Dependency Injection**: Binary path injected into `PythonClient`
- **Observer Pattern**: File watchers unchanged

### 5. Packaging Configuration

**Purpose**: Configure VSIX packaging and file inclusion

**Components**:
- **`package.json`**: Adds `publisher`, `@vscode/vsce`, packaging scripts
- **`.vscodeignore`**: Excludes development artifacts
- **`bin/` directory**: Stores platform-specific binaries

**Design Patterns**:
- **Configuration Pattern**: Centralized packaging configuration

## Data Flow

### Binary Resolution Flow

1. **Extension Activation**: `activate()` receives `ExtensionContext`
2. **Platform Detection**: `getPlatformBinaryName()` maps `process.platform/arch` to filename
3. **Path Resolution**: `resolveBinaryPath()` constructs absolute path from `extensionPath`
4. **Validation**: `validateBinary()` checks file existence
5. **Client Configuration**: Binary path passed to `PythonClient` constructor
6. **Fallback**: If binary not found, `PythonClient` uses `python -m python_service`

### Binary Build Flow

1. **Developer Action**: Run `pnpm run build:python-binaries`
2. **Script Execution**: `scripts/build-binaries.js` detects platform
3. **PyInstaller Invocation**: Script spawns PyInstaller with platform-specific flags
4. **Binary Output**: PyInstaller creates executable in `bin/` directory
5. **Verification**: Script validates binary exists and is executable

### VSIX Packaging Flow

1. **Build Binaries**: `pnpm run build:python-binaries` (if not already built)
2. **Build Extension**: `pnpm run build` (TypeScript + webview)
3. **Package VSIX**: `pnpm run vscode:package` invokes `vsce package`
4. **File Inclusion**: `vsce` reads `.vscodeignore` and includes/excludes files
5. **VSIX Output**: Creates `<name>-<version>.vsix` file

## Design Principles

### 1. Separation of Concerns

- **Binary Resolver**: Platform detection only, no file I/O beyond validation
- **Build Scripts**: Build orchestration only, no extension logic
- **PythonClient**: Execution only, no platform detection
- **Extension**: Coordination only, delegates to specialized modules

### 2. Dependency Injection

- Binary path injected into `PythonClient` constructor
- Extension path injected into binary resolver functions
- All non-deterministic dependencies passed as parameters

### 3. Fallback Strategy

- Development mode: Fall back to Python command if binary unavailable
- Production mode: Binary required for packaged extension
- Clear error messages guide users

### 4. Platform Abstraction

- Binary resolver abstracts platform differences
- Build scripts handle platform-specific PyInstaller flags
- Extension code remains platform-agnostic

## Binary Naming Convention

**Format**: `python_service-{platform}-{arch}[.exe]`

**Examples**:
- Windows x64: `python_service-win-x64.exe`
- Linux x64: `python_service-linux-x64`
- macOS ARM64: `python_service-darwin-arm64`
- macOS x64: `python_service-darwin-x64`

**Mapping Rules**:
- `process.platform` → `win` | `linux` | `darwin`
- `process.arch` → `x64` | `arm64`
- Windows always includes `.exe` extension

## Platform Support Matrix

| Platform | Architecture | Binary Name | Status |
|----------|--------------|-------------|--------|
| Windows | x64 | `python_service-win-x64.exe` | Initial |
| Linux | x64 | `python_service-linux-x64` | Future |
| macOS | ARM64 | `python_service-darwin-arm64` | Future |
| macOS | x64 | `python_service-darwin-x64` | Future |

**Unsupported Platforms**: Clear error message with platform support information

## Error Handling

### Binary Resolution Errors

1. **Unsupported Platform**:
   - Error: Platform/architecture combination not supported
   - User Message: List supported platforms
   - Action: Fall back to Python command (development) or show error (production)

2. **Binary Not Found**:
   - Error: Binary file doesn't exist at resolved path
   - User Message: "Python service binary not found"
   - Action: Fall back to Python command (development) or show error (production)

3. **Binary Execution Failure**:
   - Error: Binary fails to execute (permissions, corruption)
   - User Message: Generic service error
   - Action: Log details to output channel, show user-friendly message

### Build Errors

1. **PyInstaller Not Found**:
   - Error: PyInstaller not installed or not in PATH
   - User Message: Installation instructions
   - Action: Fail build with clear instructions

2. **Build Failure**:
   - Error: PyInstaller fails to create binary
   - User Message: Build error details
   - Action: Log PyInstaller output, fail build

3. **Missing Dependencies**:
   - Error: Python dependencies not found
   - User Message: Dependency installation instructions
   - Action: Fail build with dependency list

## Integration Points

### Extension Activation

**Before**:
```typescript
pythonClient = new PythonClient();
```

**After**:
```typescript
const binaryPath = resolveBinaryPath(context.extensionPath);
pythonClient = new PythonClient(binaryPath);
```

### PythonClient Spawn

**Before**:
```typescript
spawn("python", ["-m", "python_service"], { stdio: ... })
```

**After**:
```typescript
const command = this.binaryPath || "python";
const args = this.binaryPath ? [] : ["-m", "python_service"];
spawn(command, args, { stdio: ... })
```

## References

- **PyInstaller Documentation**: https://pyinstaller.org/
- **VS Code Packaging Guide**: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- **VS Code Extension API**: https://code.visualstudio.com/api/references/vscode-api
