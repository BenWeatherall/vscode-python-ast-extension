# VS Code Extension Packaging & Python Service Binaries

## Executive Summary

This plan enables the Python AST Visualization project to be distributed as an installable VS Code extension (`.vsix`) while bundling the Python AST service as native binaries. The goal is that end users can install the extension without managing a separate Python environment, while developers retain a clear, testable Python codebase in `python_service/`.

## Purpose

- Produce a `.vsix` using standard VS Code tooling (`@vscode/vsce`).
- Treat the Python AST service as part of the extension's runtime tooling.
- Bundle platform-specific Python service executables so the extension does not depend on a system Python install at runtime.

## High-Level Objectives

1. **VSIX Packaging**: Make the existing extension build (`out/extension.js`, `out/media/*`) packageable via `vsce package`.
2. **Binary Python Service**: Compile `python_service` into self-contained executables for supported platforms.
3. **Extension Integration**: Update the extension host to launch the bundled binaries instead of `python -m python_service`.
4. **Packaging Layout**: Ensure binaries and runtime assets are included in the `.vsix`, while dev-only artifacts are excluded.

## VS Code Packaging Requirements

- Use `@vscode/vsce` (local dev dependency) to create `.vsix` artifacts.
- `package.json` must include:
  - `name`, `displayName`, `version`, `description`
  - `publisher`
  - `engines.vscode`
  - `activationEvents`, `contributes`
  - `main: "./out/extension.js"`
- Build pipeline:
  - `pnpm run build` → TypeScript + webview bundle into `out/`.
  - `pnpm run vscode:package` → `vsce package` to create `<name>-<version>.vsix`.

## Python Service Packaging Strategy

### Rationale

The current implementation spawns the Python service with:

- `spawn("python", ["-m", "python_service"], ...)`

This requires:

- A compatible Python (3.12+) on the user machine.
- The `python_service` package importable in that environment.

To simplify installation, the extension will instead ship **prebuilt binaries** for the Python service inside the `.vsix`.

### Binary Build Strategy

- Use a Python bundler (e.g. PyInstaller, Nuitka, or similar) to produce self-contained executables from `python_service/`.
- Target at least the primary supported platforms (e.g. Windows x64; optionally macOS and Linux variants).
- Output directory and naming convention (example):
  - `bin/python_service-win-x64.exe`
  - `bin/python_service-linux-x64`
  - `bin/python_service-darwin-arm64`
- Add a Node/PNPM script for developers:
  - `pnpm run build:python-binaries` → rebuilds all `bin/python_service-*` artifacts using the chosen bundler.

The bundler choice and exact CLI flags will be defined in a separate, implementation-focused task once the initial plan is approved.

## Extension Integration Changes

### Binary Path Resolution

- Use the extension install path (via `vscode.ExtensionContext.extensionPath` or `vscode.extensions.getExtension`) to resolve the binary root (`<extensionPath>/bin`).
- Implement a small helper to map `process.platform` / `process.arch` to binary names:
  - `win32` + `x64` → `python_service-win-x64.exe`
  - `darwin` + `arm64` → `python_service-darwin-arm64`
  - `linux` + `x64` → `python_service-linux-x64`
  - Unsupported combinations should produce a clear error.

### PythonClient Adaptation

- Current behavior in `PythonClient.spawnService`:
  - `spawn("python", ["-m", "python_service"], { stdio: ["pipe", "pipe", "pipe"] })`
- New behavior:
  - Accept a resolved binary path (e.g. via constructor injection or setter).
  - Spawn the binary directly:
    - `spawn(binaryPath, [], { stdio: ["pipe", "pipe", "pipe"] })`
- Maintain the existing JSON-over-stdio protocol so the rest of the TypeScript code does not change.
- Error handling:
  - If binary resolution fails for the current platform, surface a user-facing error and log details to the extension output channel.

## Packaging Layout and .vscodeignore

### Goals

- Keep the `.vsix` small and focused.
- Include everything needed at runtime (JS + webview assets + Python binaries).
- Exclude local environments, caches, and tests.

### Key Rules

- **Include**:
  - `out/**` (compiled extension host and webview bundle).
  - `bin/**` (Python service binaries and any required support files).
  - `python_service/**` only if required by the chosen bundler (otherwise may be excluded to reduce size).
- **Exclude** (via `.vscodeignore`):
  - `.venv/**`, `**/.venv/**`, `**/__pycache__/**`
  - `tests/**`, `**/*.test.ts`
  - `.cursor/**`, `.git/**`, `.github/**`
  - Local docs, CI configs, and any large data sets not needed at runtime.

After the first packaging run, inspect the resulting `.vsix` (zip) to confirm:

- All expected binaries exist under `bin/`.
- No unintended large artifacts (e.g. virtualenvs, node_modules) are included.

## Manifest & Tooling Changes

- `package.json`:
  - Add a top-level `publisher` field.
  - Add `@vscode/vsce` to `devDependencies`.
  - Add a packaging script:
    - `"vscode:package": "vsce package"`
  - Optionally add:
    - `"icon": "images/icon.png"` and an icon asset for better marketplace/extension UX.
- Developer workflow for releases:
  1. `pnpm install` (or `./install.sh`).
  2. `pnpm run build:python-binaries` (build native Python service binaries).
  3. `pnpm run build` (TypeScript + webview).
  4. `pnpm run vscode:package` (produce `.vsix`).

## Constraints and Considerations

- **Platform Support**:
  - Must be explicit about which OS/architecture combinations are supported by the binary builds.
  - Unsupported platforms should degrade gracefully with a clear message.
- **Security / Policy**:
  - Some environments restrict execution of bundled binaries.
  - Documentation should call this out so teams can plan exceptions or alternative workflows if needed.
- **Testing**:
  - Keep the Python code in `python_service/` fully testable as-is (unit + integration tests).
  - Add tests for:
    - Platform-to-binary-name mapping.
    - Handling unavailable or failing binaries (error messaging and logging).

## Documentation Impact

- **README**:
  - Add a short section explaining that the installed extension uses bundled Python service binaries.
  - List supported platforms and any important caveats.
- **Developer Docs** (optional in `docs/` or `_features` tasks):
  - Detail the concrete steps and tools required to rebuild the binaries:
    - Required Python toolchain and bundler.
    - Commands to add a new platform target.

## Next Steps

1. Implement the `package.json` changes and introduce `@vscode/vsce`.
2. Create and tune `.vscodeignore` to match the packaging goals.
3. Implement or select the Python bundling approach and produce initial `bin/python_service-*` binaries.
4. Update `PythonClient` (and activation wiring) to spawn the platform-specific binaries.
5. Run end-to-end validation by:
   - Building the extension and binaries.
   - Packaging the `.vsix`.
   - Installing it on a clean VS Code instance and verifying AST visualization works without a system Python installation.

