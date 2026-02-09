# Per-Task Implementation Plan: Create Build Scripts

## Overview

This task creates the Node.js build script (`scripts/build-binaries.js`) that orchestrates PyInstaller builds for platform-specific Python service binaries. The script enables developers to build binaries for their platform, which will be bundled into the VSIX package for distribution. This script has no code dependencies but requires PyInstaller to be installed in the Python environment.

**Context within feature**: This task is Step 8 in the implementation sequence. It follows the binary resolver implementation (tasks 01-03) and PythonClient/extension integration (tasks 04-07), and precedes packaging configuration tasks (09-10). The build script is independent of TypeScript code but produces artifacts (`bin/` directory) that the extension will consume.

## Files to Create/Modify

### New Files

1. **`scripts/build-binaries.js`**
   - Node.js script (CommonJS format)
   - Platform detection and PyInstaller orchestration
   - Binary validation and error handling
   - File-level JSDoc documentation

### Directory Structure

- **`scripts/`** directory will be created (does not exist yet)
- **`bin/`** directory will be created by the script if it doesn't exist

## Test Strategy

Per `testing.md` strategy, build scripts are tested manually (not via unit tests):

### Manual Test Cases

1. **Platform Detection Test**:
   - Run script on Windows x64
   - Verify platform detection works correctly
   - Verify binary name generated: `python_service-win-x64.exe`
   - Verify PyInstaller invoked with correct arguments

2. **Binary Creation Test**:
   - Run script successfully
   - Verify binary created: `bin/python_service-win-x64.exe`
   - Verify binary is executable
   - Verify binary size reasonable (< 50MB)

3. **Error Handling Test**:
   - Run script without PyInstaller installed
   - Verify clear error message displayed
   - Verify non-zero exit code

4. **Binary Validation Test**:
   - Run script successfully
   - Verify binary exists at expected path after build
   - Verify script exits with error if binary not found

### Test Execution

```bash
# Ensure PyInstaller installed
uv pip install pyinstaller
# or
pip install pyinstaller

# Run build script
node scripts/build-binaries.js

# Verify binary created
ls bin/python_service-win-x64.exe  # Windows
# or
ls bin/python_service-linux-x64    # Linux
```

## Implementation Order

### Step 1: Create Scripts Directory Structure

**Action**: Ensure `scripts/` directory exists

**Validation**: Directory exists at project root

---

### Step 2: Create Build Script File with Platform Detection

**File**: `scripts/build-binaries.js`

**Implementation**:

1. **Add file-level JSDoc comment**:
   ```javascript
   /**
    * Build script for Python service binaries using PyInstaller.
    * 
    * This script detects the current platform and architecture, then invokes
    * PyInstaller to create a single-file executable for the Python AST service.
    * 
    * Usage: node scripts/build-binaries.js
    * 
    * Requirements:
    * - PyInstaller installed in Python environment
    * - python_service package importable (for PyInstaller to analyze)
    * 
    * Output:
    * - Binary created in bin/ directory with naming convention:
    *   python_service-{platform}-{arch}[.exe]
    */
   ```

2. **Add require statements**:
   ```javascript
   const { spawn } = require("child_process");
   const path = require("path");
   const fs = require("fs");
   const { platform, arch } = process;
   ```

3. **Implement platform mapping**:
   ```javascript
   const platformMap = {
     win32: { name: "win", ext: ".exe" },
     linux: { name: "linux", ext: "" },
     darwin: { name: "darwin", ext: "" },
   };
   
   const archMap = {
     x64: "x64",
     arm64: "arm64",
   };
   ```

4. **Implement platform detection function**:
   ```javascript
   function detectPlatform() {
     const plat = platformMap[platform];
     const archName = archMap[arch];
     
     if (!plat) {
       console.error(`Unsupported platform: ${platform}`);
       console.error(`Supported platforms: ${Object.keys(platformMap).join(", ")}`);
       process.exit(1);
     }
     
     if (!archName) {
       console.error(`Unsupported architecture: ${arch}`);
       console.error(`Supported architectures: ${Object.keys(archMap).join(", ")}`);
       process.exit(1);
     }
     
     return { platform: plat, arch: archName };
   }
   ```

**Validation**: Script file created, platform detection logic implemented

---

### Step 3: Implement Binary Build Function

**File**: `scripts/build-binaries.js`

**Implementation**:

1. **Implement binary name construction**:
   ```javascript
   function buildBinary() {
     const { platform: plat, arch: archName } = detectPlatform();
     
     const binaryName = `python_service-${plat.name}-${archName}${plat.ext}`;
     const binDir = path.join(process.cwd(), "bin");
   ```

2. **Ensure bin directory exists**:
   ```javascript
     // Ensure bin directory exists
     if (!fs.existsSync(binDir)) {
       fs.mkdirSync(binDir, { recursive: true });
       console.log(`Created directory: ${binDir}`);
     }
   ```

3. **Construct PyInstaller command arguments**:
   ```javascript
     const workDir = path.join(process.cwd(), ".build", `pyinstaller-${plat.name}-${archName}`);
     
     const args = [
       "--onefile",                    // Single-file executable
       "--name", binaryName,           // Output binary name
       "--distpath", binDir,           // Output directory
       "--workpath", workDir,          // Temporary build directory
       "--clean",                      // Clean build artifacts
       "--hidden-import", "pydantic",  // Include pydantic dependency
       "python_service/__main__.py",   // Entry point
     ];
   ```

4. **Log build information**:
   ```javascript
     console.log(`Building binary: ${binaryName}`);
     console.log(`Platform: ${platform} (${plat.name}), Architecture: ${arch} (${archName})`);
     console.log(`Output directory: ${binDir}`);
     console.log(`Command: pyinstaller ${args.join(" ")}`);
   ```

**Validation**: Binary build function structure complete

---

### Step 4: Implement PyInstaller Process Spawning

**File**: `scripts/build-binaries.js`

**Implementation**:

1. **Spawn PyInstaller process**:
   ```javascript
     const proc = spawn("pyinstaller", args, {
       stdio: "inherit",                    // Forward stdout/stderr to console
       shell: platform === "win32",        // Windows requires shell
       cwd: process.cwd(),                 // Run from project root
     });
   ```

2. **Handle process errors**:
   ```javascript
     proc.on("error", (error) => {
       console.error(`Failed to spawn PyInstaller: ${error.message}`);
       console.error(`Make sure PyInstaller is installed: pip install pyinstaller`);
       process.exit(1);
     });
   ```

**Validation**: Process spawning implemented with error handling

---

### Step 5: Implement Build Validation

**File**: `scripts/build-binaries.js`

**Implementation**:

1. **Wait for process completion**:
   ```javascript
     proc.on("close", (code) => {
       if (code !== 0) {
         console.error(`PyInstaller failed with exit code ${code}`);
         console.error(`Check the output above for details`);
         process.exit(code);
       }
   ```

2. **Verify binary exists**:
   ```javascript
       const binaryPath = path.join(binDir, binaryName);
       if (!fs.existsSync(binaryPath)) {
         console.error(`Binary not found at expected path: ${binaryPath}`);
         console.error(`PyInstaller may have failed silently`);
         process.exit(1);
       }
   ```

3. **Log success**:
   ```javascript
       const stats = fs.statSync(binaryPath);
       const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
       console.log(`✓ Binary built successfully: ${binaryPath}`);
       console.log(`  Size: ${sizeMB} MB`);
     });
   }
   ```

**Validation**: Build validation logic complete

---

### Step 6: Add Main Execution

**File**: `scripts/build-binaries.js`

**Implementation**:

```javascript
// Main execution
if (require.main === module) {
  buildBinary();
}
```

**Validation**: Script can be executed directly

---

### Step 7: Verify Script Completeness

**File**: `scripts/build-binaries.js`

**Checklist**:
- [ ] File-level JSDoc comment present
- [ ] Platform detection implemented
- [ ] Binary name construction correct
- [ ] Bin directory creation handled
- [ ] PyInstaller arguments correct
- [ ] Process spawning with Windows shell handling
- [ ] Error handling for spawn failures
- [ ] Exit code validation
- [ ] Binary existence validation
- [ ] Success logging with file size

**Validation**: All components implemented

---

## Validation Steps

After implementation:

1. **Script Syntax**:
   ```bash
   node -c scripts/build-binaries.js
   ```
   - Should exit with code 0 (no syntax errors)

2. **Manual Execution** (Windows x64):
   ```bash
   # Ensure PyInstaller installed
   uv pip install pyinstaller
   
   # Run script
   node scripts/build-binaries.js
   ```
   - Should detect platform correctly
   - Should invoke PyInstaller
   - Should create `bin/python_service-win-x64.exe`
   - Should exit with code 0

3. **Error Handling**:
   ```bash
   # Temporarily rename pyinstaller or use different Python env
   # Run script
   node scripts/build-binaries.js
   ```
   - Should display clear error message
   - Should exit with non-zero code

4. **Binary Validation**:
   ```bash
   # After successful build
   ls bin/python_service-win-x64.exe
   # Should exist and be executable
   ```

## Documentation Updates

### Code Documentation

- **File-level JSDoc**: Already included in implementation
- **Function comments**: Platform detection and build functions are self-documenting (clear naming)

### Project Documentation

No updates required to README.md or other docs at this stage. Documentation will be added in later tasks (task 09: package.json configuration will add script references).

## Dependencies

### Prerequisites

- **PyInstaller**: Must be installed in Python environment
  - Installation: `uv pip install pyinstaller` or `pip install pyinstaller`
- **Python Service**: `python_service` package must be importable
  - Already satisfied if project is set up correctly

### Code Dependencies

- **None**: This script is independent of TypeScript code
- **No task dependencies**: Can be implemented independently

### Runtime Dependencies

- **Node.js**: Required to execute script (already available)
- **Python Environment**: Required for PyInstaller (already available)

## Error Handling Details

### Unsupported Platform

- **Detection**: Check `platformMap[platform]` returns undefined
- **Action**: Log error with supported platforms list, exit with code 1

### Unsupported Architecture

- **Detection**: Check `archMap[arch]` returns undefined
- **Action**: Log error with supported architectures list, exit with code 1

### PyInstaller Not Found

- **Detection**: `spawn` emits "error" event
- **Action**: Log clear error message with installation instructions, exit with code 1

### PyInstaller Build Failure

- **Detection**: Process exits with non-zero code
- **Action**: Log error with exit code, exit with same code

### Binary Not Created

- **Detection**: Binary file doesn't exist after successful PyInstaller exit
- **Action**: Log error with expected path, exit with code 1

## Implementation Notes

### Platform-Specific Considerations

1. **Windows Shell**: Must use `shell: true` option for `spawn()` on Windows
2. **File Extensions**: Windows requires `.exe` extension, Unix-like systems use no extension
3. **Path Separators**: Use `path.join()` for cross-platform path construction

### PyInstaller Arguments

- **`--onefile`**: Creates single-file executable (required for bundling)
- **`--name`**: Sets output binary name (must match naming convention)
- **`--distpath`**: Output directory (must be `bin/`)
- **`--workpath`**: Temporary build directory (can be `.build/` subdirectory)
- **`--clean`**: Cleans previous build artifacts (prevents stale files)
- **`--hidden-import pydantic`**: Ensures Pydantic is included (required dependency)

### Binary Naming Convention

- Format: `python_service-{platform}-{arch}[.exe]`
- Platform values: `win`, `linux`, `darwin`
- Architecture values: `x64`, `arm64`
- Extension: `.exe` on Windows, none on Unix-like systems

This matches the naming convention expected by `binaryResolver.ts` (from task 03).

## References

- **PyInstaller Documentation**: https://pyinstaller.org/en/stable/usage.html
- **Node.js child_process.spawn**: https://nodejs.org/api/child_process.html#child_processspawncommand-args-options
- **Master Plan**: `_features/vscode-extension-packaging/plans/master/implementation.md` Step 8
- **Task Document**: `_features/vscode-extension-packaging/tasks/08-create-build-scripts.md`
