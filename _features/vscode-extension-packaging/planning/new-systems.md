# New Systems

## Overview

This document identifies new components, modules, and functionality that will be added to support VS Code extension packaging with bundled Python service binaries.

## New Modules

### 1. Binary Path Resolution Module (`src/binaryResolver.ts`)

**Purpose:** Resolve platform-specific Python service binary paths from extension installation directory.

**Responsibilities:**
- Map `process.platform` and `process.arch` to binary filenames
- Resolve absolute binary path from extension context
- Validate binary file existence
- Provide clear error messages for unsupported platforms

**Key Functions:**
```typescript
/**
 * Maps Node.js platform/arch to binary filename.
 * @returns Binary filename or null if platform unsupported
 */
function getPlatformBinaryName(): string | null

/**
 * Resolves absolute path to Python service binary.
 * @param extensionPath - Extension installation directory
 * @returns Absolute binary path or null if not found/unsupported
 */
function resolveBinaryPath(extensionPath: string): string | null

/**
 * Checks if binary exists and is executable.
 * @param binaryPath - Absolute path to binary
 * @returns True if binary exists and is accessible
 */
function validateBinary(binaryPath: string): boolean
```

**Dependencies:**
- `vscode` (for `ExtensionContext`)
- `fs` (for file existence checks)
- `path` (for path resolution)

**Testing Requirements:**
- Unit tests for platform mapping (all supported combinations)
- Unit tests for path resolution
- Unit tests for unsupported platform handling
- Integration tests with mock extension context

---

### 2. Python Binary Build Scripts

**Purpose:** Build platform-specific Python service executables using selected bundler.

**Location:** `package.json` scripts + optional build configuration files

**Responsibilities:**
- Invoke Python bundler (PyInstaller/Nuitka/etc.) with correct flags
- Build binaries for all supported platforms (or current platform)
- Output binaries to `bin/` directory with consistent naming
- Handle bundler-specific configuration

**Script Structure:**
```json
{
  "scripts": {
    "build:python-binaries": "node scripts/build-binaries.js",
    "build:python-binaries:win": "...",
    "build:python-binaries:linux": "...",
    "build:python-binaries:darwin": "..."
  }
}
```

**Build Output:**
- `bin/python_service-win-x64.exe` (Windows)
- `bin/python_service-linux-x64` (Linux)
- `bin/python_service-darwin-arm64` (macOS ARM)
- `bin/python_service-darwin-x64` (macOS Intel)

**Dependencies:**
- Python bundler (PyInstaller/Nuitka) installed in Python environment
- Python 3.12+ with `python_service` package importable
- Platform-specific build tools (if required by bundler)

**Testing Requirements:**
- Verify binaries are created in correct location
- Verify binary naming convention
- Verify binaries are executable
- Verify binaries produce correct output for test inputs

---

### 3. VSIX Packaging Configuration

**Purpose:** Configure VS Code extension packaging via `@vscode/vsce`.

**Components:**

**A. `package.json` additions:**
- `publisher` field (required)
- `@vscode/vsce` dev dependency
- `vscode:package` script

**B. `.vscodeignore` file:**
- Exclusion rules for development artifacts
- Inclusion rules for runtime artifacts

**C. Optional icon asset:**
- `images/icon.png` (128x128 or 256x256 recommended)
- Referenced in `package.json` `icon` field

**Dependencies:**
- `@vscode/vsce` npm package
- VS Code extension manifest compliance

**Testing Requirements:**
- Verify `.vsix` contains expected files (`out/`, `bin/`)
- Verify `.vsix` excludes development artifacts
- Verify `.vsix` size is reasonable (< 50MB target)
- Verify `.vsix` installs correctly in VS Code

---

### 4. Build Orchestration Script (Optional)

**Purpose:** Coordinate multi-platform binary builds and packaging workflow.

**Location:** `scripts/build-binaries.js` or `scripts/build-binaries.ts`

**Responsibilities:**
- Detect current platform or accept platform argument
- Invoke Python bundler with platform-specific flags
- Handle build errors and provide clear feedback
- Verify build outputs

**Key Functions:**
```typescript
/**
 * Builds Python service binary for specified platform.
 * @param platform - Target platform (win32, linux, darwin)
 * @param arch - Target architecture (x64, arm64)
 */
async function buildBinary(platform: string, arch: string): Promise<void>

/**
 * Builds binaries for all supported platforms.
 */
async function buildAllBinaries(): Promise<void>
```

**Dependencies:**
- Node.js `child_process` for spawning bundler
- Python bundler CLI available in PATH or virtual environment

**Testing Requirements:**
- Verify script detects platform correctly
- Verify script invokes bundler with correct arguments
- Verify script handles build failures gracefully

---

### 5. Platform Support Module (Optional)

**Purpose:** Centralize platform detection and support matrix.

**Location:** `src/platformSupport.ts` (if needed beyond `binaryResolver.ts`)

**Responsibilities:**
- Define supported platform/architecture combinations
- Provide platform detection utilities
- Generate user-friendly error messages for unsupported platforms

**Key Data Structures:**
```typescript
interface SupportedPlatform {
  platform: string;
  arch: string;
  binaryName: string;
}

const SUPPORTED_PLATFORMS: SupportedPlatform[] = [
  { platform: "win32", arch: "x64", binaryName: "python_service-win-x64.exe" },
  // ...
];
```

**Dependencies:**
- `process.platform` and `process.arch`
- `binaryResolver.ts` (if separate module)

**Testing Requirements:**
- Unit tests for all supported platform combinations
- Unit tests for unsupported platform detection
- Unit tests for error message generation

---

## New Directories

### `bin/`

**Purpose:** Store platform-specific Python service binaries.

**Contents:**
- `python_service-win-x64.exe`
- `python_service-linux-x64`
- `python_service-darwin-arm64`
- `python_service-darwin-x64`

**Inclusion in `.vsix`:**
- All files in `bin/` are included in packaged extension
- Binaries are platform-specific; only one will be used per installation

**Git Handling:**
- Option 1: Commit binaries to repository (simpler, larger repo)
- Option 2: Add `bin/**` to `.gitignore`, build during CI/CD (cleaner, requires build step)

**Recommendation:** Add to `.gitignore`; build binaries during release process or CI/CD.

---

### `scripts/` (Optional)

**Purpose:** Build and packaging utility scripts.

**Contents:**
- `build-binaries.js` or `build-binaries.ts` (if Node.js orchestration needed)
- Other build utilities as needed

**Dependencies:**
- Node.js runtime
- Access to Python bundler

---

## New Dependencies

### Node.js Dependencies

**`@vscode/vsce`** (dev dependency):
- VS Code extension packaging tool
- CLI: `vsce package`
- Generates `.vsix` files from `package.json` and project files

**Installation:**
```bash
pnpm add -D @vscode/vsce
```

---

### Python Dependencies

**Python Bundler** (selected from research):
- **PyInstaller** (recommended): `pip install pyinstaller`
- **Nuitka** (alternative): `pip install nuitka`
- **cx_Freeze** (alternative): `pip install cx-freeze`

**Installation:**
- Add to `pyproject.toml` `[project.optional-dependencies]` under `dev` or new `build` group
- Or install globally: `uv pip install pyinstaller`

---

## New Workflows

### Developer Build Workflow

**Current:**
1. `pnpm install`
2. `pnpm run build`

**New:**
1. `pnpm install`
2. `pnpm run build:python-binaries` (optional for dev, required for release)
3. `pnpm run build`
4. `pnpm run vscode:package` (for release)

---

### CI/CD Packaging Workflow

**New pipeline step:**
1. Install Python dependencies (including bundler)
2. Build Python binaries for all supported platforms
3. Build TypeScript extension
4. Package `.vsix` using `vsce package`
5. Upload `.vsix` artifact

---

## New Configuration Files

### `.vscodeignore`

**Purpose:** Exclude files from VSIX package.

**Format:** Gitignore-like patterns, one per line.

**Key Exclusions:**
- Development environments (`.venv/`)
- Test files (`tests/`, `**/*.test.ts`)
- Source maps (`**/*.map`)
- Git/Cursor metadata (`.git/`, `.cursor/`)
- CI/CD configs (`.github/`)

**Key Inclusions:**
- Compiled extension (`out/`)
- Python binaries (`bin/`)
- Python service source (if bundler requires)

---

### Bundler Configuration Files

**PyInstaller:** `python_service/pyinstaller.spec` (optional)
- Custom spec file for advanced configuration
- Defines entry point, data files, hidden imports

**Nuitka:** `python_service/nuitka.yml` or CLI flags
- Configuration for compilation options
- Platform-specific settings

**Note:** Configuration approach depends on selected bundler.

---

## Integration Points

### Extension Activation

**New flow:**
1. Extension activates
2. Resolve binary path from extension context
3. Configure `PythonClient` with binary path (or fallback to Python command)
4. Continue with existing activation logic

### Binary Execution

**New flow:**
1. `PythonClient.spawnService()` called
2. Use resolved binary path instead of `python -m python_service`
3. Spawn binary directly: `spawn(binaryPath, [], { stdio: ... })`
4. Communication protocol unchanged (JSON-RPC over stdio)

---

## Error Handling

### New Error Scenarios

1. **Binary not found:**
   - Error: "Python service binary not found for platform {platform}/{arch}"
   - Fallback: Use `python -m python_service` if in development mode
   - User message: Clear error with platform support information

2. **Unsupported platform:**
   - Error: "Platform {platform}/{arch} is not supported"
   - User message: List supported platforms and suggest alternatives

3. **Binary execution failure:**
   - Error: "Failed to execute Python service binary"
   - Logging: Detailed error to output channel
   - User message: Generic service error with troubleshooting steps

4. **VSIX packaging failure:**
   - Error: Missing required fields in `package.json`
   - Error: Binary files missing from `bin/`
   - Build script should validate before packaging

---

## Documentation Updates

### New Documentation Files

1. **`docs/packaging.md`** (optional):
   - Detailed packaging workflow
   - Platform-specific build instructions
   - Troubleshooting packaging issues

2. **`docs/binary-build.md`** (optional):
   - Python bundler configuration
   - Adding new platform support
   - Binary size optimization

### Updated Documentation

- **`README.md`**: Installation, developer workflow, platform support
- **Developer docs**: Build process, release process
