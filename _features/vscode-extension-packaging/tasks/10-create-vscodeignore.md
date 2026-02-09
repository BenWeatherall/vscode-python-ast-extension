# Background

This task creates `.vscodeignore` file to exclude development artifacts from VSIX packaging while including runtime files. This ensures the VSIX contains only necessary files and remains reasonably sized. This task has no code dependencies.

# This Task

1. Create `.vscodeignore` file in project root:

2. Add exclusion patterns (gitignore-like format):

   - Development environments:
     - `.venv/`
     - `**/.venv/`
     - `**/__pycache__/`
   
   - Test files:
     - `tests/`
     - `**/*.test.ts`
     - `**/*.test.py`
     - `**/__tests__/`
   
   - Development tools:
     - `.cursor/`
     - `.git/`
     - `.github/`
   
   - Build artifacts (keep `out/`):
     - `**/*.map` (source maps)
     - `.build/` (PyInstaller work directories)
   
   - Source files (keep only compiled):
     - `src/` (TypeScript source, keep `out/`)
     - `webview-ui/src/` (React source, keep bundled output)
     - `python_service/` (Python source, binaries in `bin/`)
   
   - Node modules:
     - `node_modules/`
   
   - Documentation and planning:
     - `docs/` (optional, may include README.md)
     - `_features/`
     - `_archive/`

3. Ensure inclusion (via absence from .vscodeignore):
   - `out/` directory (compiled extension)
   - `bin/` directory (Python service binaries)
   - `package.json` (extension manifest)
   - `README.md` (documentation)

**Acceptance Criteria**:
- `.vscodeignore` file created
- All exclusion patterns correct
- Runtime files not excluded
- File follows gitignore-like format
- Patterns tested (will be validated in Task 12)

# Testing Needed

This task creates configuration. Validation happens in Task 12 (VSIX packaging test) where we verify:
- VSIX contains `out/` directory
- VSIX contains `bin/` directory
- VSIX excludes `.venv/`, `tests/`, `src/`, etc.
- VSIX size reasonable (< 100MB)
