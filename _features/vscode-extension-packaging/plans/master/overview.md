# Implementation Plan Overview

## Executive Summary

This plan enables the Python AST Visualization VS Code extension to be packaged and distributed as a `.vsix` file with bundled Python service binaries. The goal is to eliminate the runtime dependency on a system Python installation, allowing end users to install and use the extension without managing Python environments.

## Purpose

The feature accomplishes:

1. **VSIX Packaging**: Configure the extension for standard VS Code packaging using `@vscode/vsce`
2. **Binary Python Service**: Bundle the Python AST service as platform-specific executables using PyInstaller
3. **Extension Integration**: Update the extension host to use bundled binaries instead of `python -m python_service`
4. **Packaging Layout**: Ensure binaries and runtime assets are included in `.vsix` while excluding development artifacts

## High-Level Objectives

1. **VSIX Packaging**: Make the extension packageable via `vsce package` with all required manifest fields
2. **Binary Build Pipeline**: Create build scripts to generate platform-specific Python service executables
3. **Binary Resolution**: Implement platform detection and binary path resolution from extension context
4. **PythonClient Adaptation**: Modify `PythonClient` to spawn binaries instead of Python command
5. **Packaging Configuration**: Create `.vscodeignore` to exclude dev artifacts and include runtime files
6. **Developer Workflow**: Establish clear build and packaging workflow for releases

## Success Criteria

- ✅ Extension packages successfully as `.vsix` using `vsce package`
- ✅ Python service binaries are built for supported platforms (Windows x64 initially)
- ✅ Extension resolves and executes platform-specific binaries correctly
- ✅ Extension falls back gracefully to `python -m python_service` in development mode
- ✅ `.vsix` contains only runtime artifacts (no `.venv`, tests, source maps, etc.)
- ✅ Installed extension works without system Python installation
- ✅ All tests pass with binary execution path
- ✅ Clear error messages for unsupported platforms

## Key Requirements

### Functional Requirements

1. **VSIX Packaging**: Extension must include `publisher` field and packaging scripts
2. **Binary Build**: PyInstaller must produce single-file executables for each platform
3. **Platform Detection**: Extension must detect platform/architecture and resolve correct binary
4. **Binary Execution**: Extension must spawn binaries directly (no Python command)
5. **Development Fallback**: Extension must fall back to Python command if binary not found
6. **Error Handling**: Clear error messages for missing binaries or unsupported platforms

### Non-Functional Requirements

1. **Binary Size**: Binaries should be reasonable size (< 50MB per platform)
2. **Build Time**: Binary builds should complete in reasonable time (< 5 minutes)
3. **VSIX Size**: Final `.vsix` should be reasonable (< 100MB total)
4. **Cross-Platform**: Support Windows x64 initially, expandable to macOS/Linux
5. **Maintainability**: Build scripts should be clear and well-documented
6. **Testability**: All components must be testable with dependency injection

## Constraints

1. **PyInstaller**: Selected as bundling tool (mature, well-documented, cross-platform)
2. **Platform Support**: Initial target is Windows x64; macOS/Linux support added incrementally
3. **VS Code API**: Must use `ExtensionContext.extensionPath` for binary resolution
4. **Protocol Compatibility**: Binary must maintain identical JSON-RPC stdio protocol
5. **Python Version**: Binaries must bundle Python 3.12+ interpreter
6. **Build Environment**: Binary builds require Python environment with PyInstaller

## Relationship to Existing Systems

This feature modifies existing systems:

1. **`package.json`**: Adds `publisher`, `@vscode/vsce`, and build scripts
2. **`src/pythonClient.ts`**: Modifies `spawnService()` to accept binary path
3. **`src/extension.ts`**: Adds binary resolution during activation
4. **`src/__tests__/pythonClient.test.ts`**: Updates mocks for binary execution
5. **Build Pipeline**: Adds `build:python-binaries` script

This feature adds new systems:

1. **`src/binaryResolver.ts`**: Platform detection and binary path resolution
2. **`scripts/build-binaries.js`**: Node.js script to orchestrate PyInstaller builds
3. **`bin/` directory**: Stores platform-specific binaries
4. **`.vscodeignore`**: Excludes development artifacts from VSIX

## Architecture Pattern

The implementation follows a **Binary Resolution Pattern**:

- **Binary Resolver**: Maps platform/architecture to binary filenames
- **Extension Context**: Provides extension installation path
- **PythonClient**: Accepts binary path via dependency injection
- **Fallback Strategy**: Uses Python command if binary unavailable (development mode)

## Implementation Phases

1. **Phase 1: Configuration** - Add `publisher`, `@vscode/vsce`, and `.vscodeignore`
2. **Phase 2: Binary Build** - Create PyInstaller build scripts and test binary creation
3. **Phase 3: Binary Resolution** - Implement `binaryResolver.ts` with platform detection
4. **Phase 4: PythonClient Integration** - Modify `PythonClient` to accept binary path
5. **Phase 5: Extension Integration** - Wire binary resolution into `extension.ts` activation
6. **Phase 6: Testing** - Update tests for binary execution path
7. **Phase 7: Packaging** - Test VSIX creation and installation

## Dependencies

- **Node.js**: `@vscode/vsce` for VSIX packaging
- **Python**: PyInstaller for binary bundling
- **Build Tools**: Node.js scripts for build orchestration

## Testing Strategy

- **TDD Approach**: Write tests before implementation code
- **Models First**: Define binary resolution interfaces before implementation
- **Black Box Testing**: Validate functionality, not internal behavior
- **Integration Tests**: Verify binary execution and protocol compatibility
- **Packaging Tests**: Validate VSIX contents and installation

## Documentation Requirements

- **README.md**: Update installation and developer workflow sections
- **Code Documentation**: Google-style docstrings for binary resolution functions
- **Developer Documentation**: Binary build process and platform support

## Next Steps

After plan approval, proceed with:
1. Task decomposition via `task-list` command
2. Implementation following TDD practices
3. Continuous validation against success criteria
