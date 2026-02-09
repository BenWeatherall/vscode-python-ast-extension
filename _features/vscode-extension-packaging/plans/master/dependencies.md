# Dependencies and Requirements

## External Dependencies

### Node.js Dependencies

#### `@vscode/vsce` (Dev Dependency)

**Purpose**: VS Code extension packaging tool

**Version**: `^2.x.x` (latest stable)

**Installation**:
```bash
pnpm add -D @vscode/vsce
```

**Usage**:
- CLI command: `vsce package`
- Generates `.vsix` file from `package.json` and project files
- Reads `.vscodeignore` for file exclusions

**Documentation**: https://github.com/microsoft/vscode-vsce

**License**: MIT

---

### Python Dependencies

#### PyInstaller (Build Dependency)

**Purpose**: Python-to-executable bundler

**Version**: `>=5.0.0` (latest stable)

**Installation**:
```bash
# Via uv (recommended)
uv pip install pyinstaller

# Via pip
pip install pyinstaller
```

**Optional**: Add to `pyproject.toml`:
```toml
[project.optional-dependencies]
build = ["pyinstaller>=5.0.0"]
```

**Usage**:
- CLI command: `pyinstaller [options] script.py`
- Creates standalone executables with bundled Python interpreter
- Supports Windows, macOS, Linux

**Documentation**: https://pyinstaller.org/

**License**: GPL-2.0 (with commercial licensing available)

**System Requirements**:
- Python 3.8+ (we use 3.12, compatible)
- No additional system dependencies for basic usage on Windows
- macOS/Linux may require system libraries (handled by PyInstaller)

---

## Internal Dependencies

### Extension Host Modules

#### `src/binaryResolver.ts` → `src/pythonClient.ts`

**Dependency Type**: Import dependency

**Usage**: `PythonClient` imports binary resolver types (if needed)

**Impact**: Low - Type imports only, no runtime dependency

---

#### `src/binaryResolver.ts` → `src/extension.ts`

**Dependency Type**: Import dependency

**Usage**: `extension.ts` imports `resolveBinaryPath()` function

**Impact**: Medium - Required for binary resolution during activation

---

#### `src/extension.ts` → `src/pythonClient.ts`

**Dependency Type**: Import dependency

**Usage**: `extension.ts` creates `PythonClient` instance

**Impact**: High - Core extension functionality

---

### Build Scripts

#### `scripts/build-binaries.js` → PyInstaller

**Dependency Type**: External tool dependency

**Usage**: Build script spawns PyInstaller CLI

**Impact**: High - Required for binary builds

**Requirements**:
- PyInstaller installed in Python environment
- Python environment accessible from Node.js script
- `python_service` package importable

---

## System Requirements

### Development Environment

**Operating Systems**:
- Windows 10+ (x64) - Primary target
- macOS (ARM64, x64) - Future support
- Linux (x64) - Future support

**Node.js**:
- Version compatible with VS Code 1.80+ (follow VS Code engine)
- Typically Node.js 18+ or 20+

**Python**:
- Python 3.12+ (per project rules)
- `uv` package manager (recommended)
- PyInstaller installed in Python environment

**Build Tools**:
- TypeScript compiler (`tsc`)
- esbuild (for webview bundling)
- PyInstaller CLI

---

### Runtime Environment (Packaged Extension)

**VS Code**:
- Version 1.80.0 or higher (per `package.json` engines)

**Operating Systems**:
- Windows x64 (initial support)
- macOS ARM64/x64 (future)
- Linux x64 (future)

**Python**:
- **Not Required** - Binaries bundle Python interpreter

---

## Dependency Installation

### Initial Setup

**Python Dependencies**:
```bash
# Install PyInstaller (if not in pyproject.toml)
uv pip install pyinstaller

# Or add to pyproject.toml and install
uv sync --extra build
```

**Node.js Dependencies**:
```bash
# Install all dependencies including @vscode/vsce
pnpm install
```

### CI/CD Environment

**Python Setup**:
1. Install Python 3.12+
2. Install `uv` package manager
3. Install project dependencies: `uv sync`
4. Install PyInstaller: `uv pip install pyinstaller`

**Node.js Setup**:
1. Install Node.js 18+ or 20+
2. Install `pnpm`: `npm install -g pnpm`
3. Install dependencies: `pnpm install`

**Build Steps**:
1. Build Python binaries: `pnpm run build:python-binaries`
2. Build extension: `pnpm run build`
3. Package VSIX: `pnpm run vscode:package`

---

## Dependency Versions

### Locked Versions

**Node.js**:
- `@vscode/vsce`: `^2.x.x` (follow latest stable)

**Python**:
- `pyinstaller`: `>=5.0.0` (follow latest stable)

### Version Constraints

**Minimum Versions**:
- VS Code API: `^1.80.0` (per `package.json` engines)
- Python: `3.12` (per project rules)
- Node.js: Compatible with VS Code engine

**Maximum Versions**:
- No maximum constraints (follow latest stable)

---

## Optional Dependencies

### Development Tools

**PyInstaller Spec File** (`python_service/pyinstaller.spec`):
- Optional advanced configuration
- Used for fine-tuning binary builds
- Not required for basic usage

**Icon Asset** (`images/icon.png`):
- Optional extension icon
- Recommended for marketplace publishing
- Not required for basic packaging

---

## Dependency Conflicts

### Known Issues

**None Currently Identified**

### Resolution Strategy

If conflicts arise:
1. Check PyInstaller compatibility with Python version
2. Verify VS Code API compatibility with extension host
3. Update dependency versions to compatible ranges

---

## Build Dependencies

### Required for Binary Builds

1. **Python Environment**:
   - Python 3.12+ installed
   - Virtual environment activated (`.venv`)
   - `python_service` package importable

2. **PyInstaller**:
   - Installed in Python environment
   - Accessible via `pyinstaller` command (or `python -m PyInstaller`)

3. **Build Script**:
   - `scripts/build-binaries.js` executable
   - Node.js runtime available

### Required for VSIX Packaging

1. **Extension Build**:
   - TypeScript compiled to `out/`
   - Webview bundled to `out/media/`

2. **Binaries Built**:
   - Platform-specific binaries in `bin/` directory

3. **VS Code Packaging Tool**:
   - `@vscode/vsce` installed
   - `publisher` field in `package.json`

---

## Runtime Dependencies

### Extension Runtime

**VS Code API**:
- Provided by VS Code host
- No installation required

**Node.js Modules**:
- Bundled with extension (no external dependencies at runtime)

**Python Service**:
- Bundled as binary (no Python installation required)

---

## Dependency Management

### Python Dependencies

**Management Tool**: `uv` (recommended) or `pip`

**Configuration**: `pyproject.toml`

**Installation**:
```bash
# Development dependencies
uv sync

# Build dependencies (if in optional-dependencies)
uv sync --extra build

# Or install PyInstaller directly
uv pip install pyinstaller
```

### Node.js Dependencies

**Management Tool**: `pnpm` (per project rules)

**Configuration**: `package.json`

**Installation**:
```bash
pnpm install
```

**Lock File**: `package-lock.json` (generated by npm/pnpm)

---

## Dependency Updates

### Update Strategy

**Node.js Dependencies**:
- Update `package.json` version ranges
- Run `pnpm install` to update lock file
- Test extension build and packaging

**Python Dependencies**:
- Update `pyproject.toml` version constraints
- Run `uv sync` to update environment
- Test binary builds

### Update Frequency

- **Security Updates**: Immediately
- **Feature Updates**: As needed for new functionality
- **Major Versions**: Test compatibility before updating

---

## References

- **PyInstaller Installation**: https://pyinstaller.org/en/stable/installation.html
- **VS Code Packaging**: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- **uv Documentation**: https://github.com/astral-sh/uv
- **pnpm Documentation**: https://pnpm.io/
