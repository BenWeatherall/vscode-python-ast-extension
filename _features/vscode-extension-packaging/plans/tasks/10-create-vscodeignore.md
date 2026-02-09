# Per-Task Implementation Plan: Create .vscodeignore

## Overview

This task creates a `.vscodeignore` file in the project root to exclude development artifacts, source files, and build artifacts from VSIX packaging while ensuring runtime files (`out/`, `bin/`, `package.json`, `README.md`) are included. This ensures the VSIX package contains only necessary files and remains reasonably sized for distribution.

**Context within feature**: This task is part of the VSIX packaging configuration phase. It works in conjunction with Task 9 (package.json configuration) and precedes Task 12 (VSIX packaging test) where the exclusion patterns will be validated.

**Dependencies**: None. This task has no code dependencies and can be executed independently.

## Files to Create/Modify

### New Files

- **`.vscodeignore`** (project root)
  - Create new file with gitignore-like exclusion patterns
  - Format: One pattern per line, comments with `#`
  - Purpose: Control which files are excluded from VSIX packaging

## Test Strategy

**No unit tests required for this task**. The `.vscodeignore` file is a configuration file that will be validated in Task 12 (VSIX packaging test) where we will:
- Verify VSIX contains `out/` directory
- Verify VSIX contains `bin/` directory  
- Verify VSIX excludes `.venv/`, `tests/`, `src/`, etc.
- Verify VSIX size is reasonable (< 100MB)

**Validation approach**: Manual inspection and Task 12 integration test will validate the patterns work correctly.

## Implementation Order

### Step 1: Create .vscodeignore File

**File**: `.vscodeignore`

**Content Structure**:

The file should follow gitignore-like syntax with the following exclusion patterns organized by category:

1. **Development environments**:
   - `.venv/` - Python virtual environment
   - `**/.venv/` - Virtual environments in subdirectories
   - `**/__pycache__/` - Python bytecode cache directories

2. **Test files**:
   - `tests/` - Test directory
   - `**/*.test.ts` - TypeScript test files
   - `**/*.test.py` - Python test files
   - `**/__tests__/` - Test directories

3. **Development tools**:
   - `.cursor/` - Cursor IDE configuration
   - `.git/` - Git repository metadata
   - `.github/` - GitHub workflows and templates

4. **Build artifacts** (keep `out/`):
   - `**/*.map` - Source map files
   - `.build/` - PyInstaller work directories

5. **Source files** (keep only compiled):
   - `src/` - TypeScript source (keep `out/` which contains compiled JS)
   - `webview-ui/src/` - React source (keep bundled output in `out/media/`)
   - `python_service/` - Python source (keep binaries in `bin/`)

6. **Node modules**:
   - `node_modules/` - Node.js dependencies

7. **Documentation and planning**:
   - `docs/` - Project documentation (optional exclusion, may include README.md)
   - `_features/` - Feature planning documents
   - `_archive/` - Archived planning documents

**Important inclusions** (via absence from .vscodeignore):
- `out/` - Compiled extension code (must be included)
- `bin/` - Python service binaries (must be included)
- `package.json` - Extension manifest (must be included)
- `README.md` - Extension documentation (must be included)
- `webview-ui/index.html` - Webview HTML entry point (must be included)
- `webview-ui/media/` - Bundled webview assets (must be included, if exists)

**Implementation Details**:

```gitignore
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

# Documentation and planning
docs/
_features/
_archive/
```

**File Location**: Project root (`d:\Code\python-vis\.vscodeignore`)

**Formatting**:
- Use Unix-style line endings (LF) for cross-platform compatibility
- One pattern per line
- Comments start with `#`
- Patterns follow gitignore syntax (glob patterns)

**Validation**:
- File created successfully
- Patterns follow gitignore syntax
- No syntax errors (will be validated by `vsce` during packaging)

## Validation Steps

After implementation:

1. **File Existence**:
   - Verify `.vscodeignore` exists in project root
   - Verify file is readable

2. **Pattern Validation**:
   - Review patterns match requirements from task document
   - Verify all exclusion categories covered
   - Verify runtime files (`out/`, `bin/`, `package.json`, `README.md`) are NOT excluded

3. **Syntax Validation**:
   - File follows gitignore-like format
   - No invalid patterns
   - Comments properly formatted

4. **Integration Validation** (deferred to Task 12):
   - VSIX packaging test will verify:
     - VSIX contains `out/` directory
     - VSIX contains `bin/` directory
     - VSIX excludes `.venv/`, `tests/`, `src/`, etc.
     - VSIX size reasonable (< 100MB)

## Documentation Updates

**No documentation updates required** for this task. The `.vscodeignore` file is self-documenting with comments, and VSIX packaging workflow will be documented in Task 12.

## Acceptance Criteria Verification

- ✅ `.vscodeignore` file created in project root
- ✅ All exclusion patterns correct (development environments, tests, dev tools, build artifacts, source files, node modules, docs/planning)
- ✅ Runtime files not excluded (`out/`, `bin/`, `package.json`, `README.md`)
- ✅ File follows gitignore-like format
- ✅ Patterns will be tested in Task 12 (VSIX packaging test)

## Notes

- **Pattern Matching**: `.vscodeignore` uses the same pattern matching as `.gitignore`. Patterns are relative to the project root.
- **Inclusion vs Exclusion**: Files are included by default. Only patterns in `.vscodeignore` are excluded. To ensure inclusion, simply don't list the file/directory.
- **Order Matters**: Patterns are evaluated in order. More specific patterns should come after general patterns.
- **Testing**: This configuration file will be validated during Task 12 when we test VSIX packaging. No unit tests needed for the file itself.
- **Cross-Platform**: Use forward slashes in patterns (they work on all platforms). Avoid platform-specific patterns unless necessary.

## References

- **VS Code Packaging Documentation**: https://code.visualstudio.com/api/working-with-extensions/publishing-extension#advanced-usage
- **Gitignore Pattern Syntax**: https://git-scm.com/docs/gitignore#_pattern_format
- **Master Plan**: `_features/vscode-extension-packaging/plans/master/implementation.md` (Step 10)
