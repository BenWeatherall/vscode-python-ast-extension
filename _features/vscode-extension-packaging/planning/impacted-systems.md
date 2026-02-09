# Impacted Systems

## Overview

This document identifies the existing components that will be modified to support VS Code extension packaging with bundled Python service binaries.

## Impacted Modules

### 1. `package.json`

**Current State:**
- Contains extension metadata (`name`, `displayName`, `version`, `description`)
- Missing `publisher` field (required for VSIX packaging)
- Missing `@vscode/vsce` dev dependency
- Missing packaging script (`vscode:package`)
- Missing Python binary build script (`build:python-binaries`)

**Changes Required:**
- Add `publisher` field (e.g., `"publisher": "your-publisher-name"`)
- Add `@vscode/vsce` to `devDependencies`
- Add `"vscode:package": "vsce package"` script
- Add `"build:python-binaries"` script (implementation depends on selected bundler)
- Optionally add `icon` field and icon asset path

**Impact Level:** Medium - Configuration changes only, no code logic changes

---

### 2. `src/pythonClient.ts`

**Current State:**
- `PythonClient.spawnService()` hardcodes `spawn("python", ["-m", "python_service"], ...)`
- No mechanism to resolve or inject binary paths
- No platform detection logic

**Changes Required:**
- Add constructor parameter or setter for binary path resolution
- Modify `spawnService()` to accept resolved binary path instead of hardcoded `"python"` command
- Add platform-to-binary-name mapping helper function
- Update error handling to provide clear messages for unsupported platforms
- Maintain backward compatibility for development (fallback to `python -m python_service` if binary not found)

**Impact Level:** High - Core functionality change, requires careful testing

**Key Methods to Modify:**
- `spawnService()`: Change spawn command from `python -m python_service` to direct binary execution
- Add new helper: `resolveBinaryPath(context: vscode.ExtensionContext): string | null`
- Add new helper: `getPlatformBinaryName(): string | null`

---

### 3. `src/extension.ts`

**Current State:**
- `activate()` creates `PythonClient` instance without any configuration
- No access to extension context path for binary resolution

**Changes Required:**
- Pass `vscode.ExtensionContext` to `PythonClient` constructor or use setter
- Resolve binary path during activation (or lazily on first spawn)
- Handle binary resolution failures gracefully with user-facing error messages
- Log binary resolution details to output channel for debugging

**Impact Level:** Medium - Integration point changes, error handling additions

**Key Functions to Modify:**
- `activate()`: Resolve binary path and configure `PythonClient`
- Error handling: Add checks for binary availability before spawning

---

### 4. `src/__tests__/pythonClient.test.ts`

**Current State:**
- Tests mock `spawn` with `"python"` command and `["-m", "python_service"]` args
- Tests verify exact spawn arguments match current implementation

**Changes Required:**
- Update mocks to expect binary path instead of `"python"` command
- Add tests for platform-to-binary-name mapping
- Add tests for binary resolution failures
- Add tests for unsupported platform error handling
- Maintain existing protocol tests (JSON-RPC communication unchanged)

**Impact Level:** Medium - Test updates required, no new test infrastructure needed

---

### 5. Build Pipeline (`package.json` scripts)

**Current State:**
- `build`: Compiles TypeScript and bundles webview
- No Python binary build step
- No VSIX packaging step

**Changes Required:**
- Add `build:python-binaries` script (calls Python bundler)
- Add `vscode:package` script (calls `vsce package`)
- Update developer workflow documentation
- Ensure build order: binaries → TypeScript → webview → package

**Impact Level:** Low - New scripts only, no code changes

---

### 6. `.vscodeignore` (New File)

**Current State:**
- File does not exist
- VS Code packaging will include all files by default

**Changes Required:**
- Create `.vscodeignore` file
- Exclude development artifacts:
  - `.venv/**`, `**/.venv/**`
  - `**/__pycache__/**`
  - `tests/**`, `**/*.test.ts`
  - `.cursor/**`, `.git/**`, `.github/**`
  - `node_modules/**` (if not already excluded)
  - Large data files, CI configs, local docs
- Include runtime artifacts:
  - `out/**` (compiled extension)
  - `bin/**` (Python service binaries)
  - `python_service/**` (only if bundler requires source)

**Impact Level:** Low - New configuration file

---

### 7. Documentation (`README.md`)

**Current State:**
- Installation instructions assume system Python 3.12+ is required
- No mention of bundled binaries or packaging

**Changes Required:**
- Update installation section to note bundled binaries (for installed extension)
- Add developer section explaining binary build process
- Document supported platforms
- Add packaging workflow instructions
- Update troubleshooting section with binary-related issues

**Impact Level:** Low - Documentation updates only

---

## Unchanged Components

The following components remain **unchanged**:

- **`python_service/`**: Python code remains identical; bundler wraps it, but source code doesn't change
- **`webview-ui/`**: No changes to React/TypeScript webview code
- **`src/conversion.ts`**: Graph conversion logic unchanged
- **`src/types.ts`**: Type definitions unchanged
- **Python service protocol**: JSON-RPC-like stdio protocol remains identical
- **Test infrastructure**: Python and TypeScript test frameworks unchanged

---

## Testing Impact

**New Test Requirements:**
- Platform detection and binary name mapping
- Binary resolution from extension context
- Error handling for missing/unsupported binaries
- Binary execution (integration tests)
- VSIX package contents validation

**Modified Test Requirements:**
- `PythonClient` spawn tests must account for binary path instead of Python command
- Mock setup changes for spawn calls

**Unchanged Test Requirements:**
- JSON-RPC protocol tests (communication unchanged)
- Graph conversion tests
- Webview message handling tests
- Python service unit tests

---

## Migration Considerations

**Development Workflow:**
- Developers can still use `python -m python_service` directly for testing
- Binary build is optional during development (fallback to Python command)
- Binary build required only for packaging/release

**Backward Compatibility:**
- Extension should gracefully fall back to `python -m python_service` if binary not found (development mode)
- Production `.vsix` packages will always use binaries (no Python dependency)

**Platform Support:**
- Initial release may target Windows x64 only
- macOS and Linux support can be added incrementally
- Unsupported platforms should show clear error messages
