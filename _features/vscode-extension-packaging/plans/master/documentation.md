# Documentation Requirements

## Overview

This document outlines all documentation that needs to be created or updated for the VS Code extension packaging feature. Documentation follows project standards: concise, developer-focused, and practical.

## Code Documentation

### Binary Resolver (`src/binaryResolver.ts`)

**Required Documentation**:

1. **Module-Level Docstring**:
   - Purpose: Platform detection and binary path resolution
   - Usage: Imported by extension activation

2. **Function Docstrings** (Google style):

```typescript
/**
 * Maps Node.js platform and architecture to binary filename.
 * 
 * @returns Binary filename (e.g., "python_service-win-x64.exe") or null if unsupported
 */
export function getPlatformBinaryName(): string | null;

/**
 * Resolves absolute path to Python service binary from extension installation directory.
 * 
 * @param extensionPath - Extension installation directory (from ExtensionContext.extensionPath)
 * @returns Absolute binary path or null if binary not found or platform unsupported
 */
export function resolveBinaryPath(extensionPath: string): string | null;

/**
 * Validates that binary file exists and is accessible.
 * 
 * @param binaryPath - Absolute path to binary file
 * @returns True if binary exists and is accessible, false otherwise
 */
export function validateBinary(binaryPath: string): boolean;
```

---

### PythonClient Modifications (`src/pythonClient.ts`)

**Required Documentation**:

1. **Constructor Parameter**:

```typescript
/**
 * Creates a new PythonClient instance.
 * 
 * @param binaryPath - Optional path to Python service binary. If provided, 
 *                     binary will be used instead of "python -m python_service".
 *                     If null or undefined, falls back to Python command.
 */
constructor(binaryPath?: string | null);
```

2. **Spawn Service Method** (update existing docstring):

```typescript
/**
 * Spawns the Python service process (binary or Python command).
 * 
 * Uses binary path if provided, otherwise falls back to "python -m python_service".
 * Maintains identical JSON-RPC stdio protocol regardless of execution method.
 * 
 * @throws Error if spawn fails or process exits with non-zero code
 */
async spawnService(): Promise<void>;
```

---

### Extension Activation (`src/extension.ts`)

**Required Documentation**:

1. **Activation Function** (update existing docstring):

```typescript
/**
 * Activates the extension and sets up binary resolution.
 * 
 * Resolves Python service binary path from extension context. If binary not found
 * (development mode), falls back to system Python command and logs warning.
 * 
 * @param context - VS Code extension context
 */
export function activate(context: vscode.ExtensionContext): void;
```

---

### Build Script (`scripts/build-binaries.js`)

**Required Documentation**:

1. **File-Level Comment**:

```javascript
/**
 * Build script for Python service binaries using PyInstaller.
 * 
 * Detects current platform and architecture, then invokes PyInstaller
 * to create platform-specific executables in bin/ directory.
 * 
 * Usage: node scripts/build-binaries.js
 * 
 * Requirements:
 * - PyInstaller installed in Python environment
 * - python_service package importable
 */
```

2. **Function Comments**:

```javascript
/**
 * Builds Python service binary for current platform.
 * 
 * Detects platform/arch, constructs PyInstaller command, and spawns build process.
 * Validates output binary exists after build completes.
 * 
 * @throws Error if platform unsupported or build fails
 */
function buildBinary() {
  // ...
}
```

---

## Project Documentation

### README.md Updates

**Section: Installation**

**Current** (update):
```markdown
## Installation

### For End Users

Install the extension from VS Code marketplace or install from `.vsix` file:

1. Download the `.vsix` file
2. Open VS Code
3. Go to Extensions view
4. Click "..." menu → "Install from VSIX..."
5. Select the `.vsix` file

The extension includes bundled Python service binaries, so no Python installation is required.

### For Developers

1. Clone the repository
2. Run `./install.sh` to set up environment
3. Install PyInstaller: `uv pip install pyinstaller`
4. Build binaries: `pnpm run build:python-binaries`
5. Build extension: `pnpm run build`
```

**Section: Building**

**Add**:
```markdown
## Building

### Build Python Service Binaries

```bash
# Build binary for current platform
pnpm run build:python-binaries
```

This creates a platform-specific executable in `bin/` directory:
- Windows: `bin/python_service-win-x64.exe`
- Linux: `bin/python_service-linux-x64`
- macOS: `bin/python_service-darwin-arm64` or `bin/python_service-darwin-x64`

**Requirements**:
- Python 3.12+ with PyInstaller installed
- `python_service` package importable

### Build Extension

```bash
# Build TypeScript and webview bundle
pnpm run build
```

### Package VSIX

```bash
# Create VSIX package
pnpm run vscode:package
```

This creates `<name>-<version>.vsix` file ready for distribution.

**Requirements**:
- Binaries built (run `build:python-binaries` first)
- Extension built (run `build` first)
- `publisher` field set in `package.json`
```

**Section: Platform Support**

**Add**:
```markdown
## Platform Support

### Supported Platforms

- **Windows x64**: Fully supported (initial release)
- **macOS ARM64**: Planned
- **macOS x64**: Planned
- **Linux x64**: Planned

### Unsupported Platforms

If your platform is not supported, the extension will show a clear error message
with platform support information. In development mode, the extension falls back
to using system Python (`python -m python_service`).
```

**Section: Development**

**Update**:
```markdown
## Development

### Development Workflow

1. **Setup**: Run `./install.sh` to create virtual environment and install dependencies
2. **Development Mode**: Extension uses `python -m python_service` (no binary required)
3. **Build Binaries**: Run `pnpm run build:python-binaries` to test binary builds
4. **Build Extension**: Run `pnpm run build` to compile TypeScript and bundle webview
5. **Package**: Run `pnpm run vscode:package` to create `.vsix` file

### Binary Build Process

Binaries are built using PyInstaller:
- Single-file executables (`--onefile`)
- Includes Python 3.12 interpreter
- Includes `python_service` package and dependencies
- Output: `bin/python_service-{platform}-{arch}[.exe]`

### Testing

```bash
# Run all tests
pnpm test
python -m pytest tests/ -v

# Run integration tests (requires binary built)
pnpm test tests/integration
```
```

---

## Developer Documentation

### Binary Build Guide (Optional)

**File**: `docs/binary-build.md` (optional, if detailed guide needed)

**Content**:
- PyInstaller installation
- Build process details
- Platform-specific considerations
- Troubleshooting common issues
- Adding new platform support

**Recommendation**: Only create if build process becomes complex or issues arise.

---

### Packaging Guide (Optional)

**File**: `docs/packaging.md` (optional, if detailed guide needed)

**Content**:
- VSIX packaging workflow
- `.vscodeignore` configuration
- VSIX contents validation
- Publishing to marketplace (if applicable)

**Recommendation**: Only create if packaging workflow becomes complex.

---

## Code Comments

### Inline Comments

**Where Needed**:
- Complex platform detection logic
- Binary path construction
- Fallback behavior explanations
- Error handling rationale

**Example**:
```typescript
// Map Node.js platform names to our binary naming convention
// win32 -> win, darwin -> darwin, linux -> linux
const platformMap = {
  win32: { name: "win", ext: ".exe" },
  // ...
};
```

---

## API Documentation

### Public API

**Binary Resolver**:
- Export all public functions
- Document return types and null cases
- Document platform support matrix

**PythonClient**:
- Document constructor parameter
- Document spawn behavior changes
- Document protocol compatibility

---

## Changelog Updates

**File**: `CHANGELOG.md` (if exists) or add to README

**Entry**:
```markdown
## [Unreleased]

### Added
- VS Code extension packaging support (`.vsix`)
- Python service binary bundling with PyInstaller
- Platform-specific binary resolution
- Development mode fallback to system Python
- `.vscodeignore` for packaging exclusions

### Changed
- `PythonClient` now accepts optional binary path parameter
- Extension activation resolves binary path from extension context

### Fixed
- (None)

### Removed
- (None)
```

---

## Documentation Standards

### Style Guide

1. **Conciseness**: Keep documentation concise and focused
2. **Code Examples**: Include practical code examples
3. **Developer-Focused**: Write for developers, not end users (for technical docs)
4. **Google Docstrings**: Use Google-style docstrings for Python/TypeScript
5. **Markdown**: Use Markdown for all documentation files

### File Organization

- **README.md**: High-level overview, installation, usage
- **Code Comments**: Inline comments for complex logic
- **Docstrings**: Function/method documentation
- **Optional Docs**: Detailed guides in `docs/` directory if needed

---

## Documentation Review Checklist

Before marking documentation complete:

- [ ] All new functions have docstrings
- [ ] README.md updated with installation instructions
- [ ] README.md updated with build/packaging workflow
- [ ] README.md updated with platform support information
- [ ] Code comments added for complex logic
- [ ] Changelog updated (if applicable)
- [ ] All documentation follows project style guide
- [ ] Documentation reviewed for accuracy

---

## References

- **Google Docstring Style**: https://google.github.io/styleguide/pyguide.html#38-comments-and-docstrings
- **Markdown Guide**: https://www.markdownguide.org/
- **VS Code Extension Documentation**: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
