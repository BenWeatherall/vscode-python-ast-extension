# Selected Solution

## Overview

**Selected Tool:** PyInstaller

**Rationale:** PyInstaller is the most mature, well-documented, and widely-used Python bundling tool. It provides the best balance of ease of use, reliability, and cross-platform support for this project.

---

## PyInstaller Details

### Library Information

- **Name:** PyInstaller
- **Version:** Latest stable (5.x as of 2024)
- **License:** GPL-2.0 (with commercial licensing available)
- **Repository:** https://github.com/pyinstaller/pyinstaller
- **Documentation:** https://pyinstaller.org/
- **API Reference:** https://pyinstaller.org/en/stable/usage.html

### Installation

**Via pip/uv:**
```bash
# Add to pyproject.toml [project.optional-dependencies]
# build = ["pyinstaller>=5.0.0"]

# Or install directly:
uv pip install pyinstaller
# or
pip install pyinstaller
```

**Requirements:**
- Python 3.8+ (we use 3.12, compatible)
- No additional system dependencies for basic usage
- Platform-specific: Windows (no extra tools), macOS/Linux (may need system libraries)

---

## Interfaces and Modules

### Command-Line Interface

**Primary Interface:** `pyinstaller` command-line tool

**Basic Syntax:**
```bash
pyinstaller [options] script.py
```

**Key Options for Our Use Case:**

| Option | Description | Example |
|--------|-------------|---------|
| `--onefile` | Create single executable file | Required |
| `--name` | Output executable name | `--name python_service-win-x64` |
| `--distpath` | Output directory | `--distpath bin` |
| `--workpath` | Temporary build directory | `--workpath .build/pyinstaller` |
| `--clean` | Clean cache before building | Recommended |
| `--hidden-import` | Force include module | `--hidden-import pydantic` |
| `--exclude-module` | Exclude module | `--exclude-module tkinter` |
| `--add-data` | Include data files | Not needed for our case |

### Python API (Optional)

PyInstaller also provides a Python API for programmatic builds:

```python
import PyInstaller.__main__

PyInstaller.__main__.run([
    '--onefile',
    '--name', 'python_service-win-x64',
    '--distpath', 'bin',
    'python_service/__main__.py'
])
```

**Recommendation:** Use CLI for simplicity; Python API if we need programmatic control.

---

## Implementation Approach

### Build Command Structure

**Windows x64:**
```bash
pyinstaller \
  --onefile \
  --name python_service-win-x64 \
  --distpath bin \
  --workpath .build/pyinstaller-win-x64 \
  --clean \
  --hidden-import pydantic \
  python_service/__main__.py
```

**Linux x64:**
```bash
pyinstaller \
  --onefile \
  --name python_service-linux-x64 \
  --distpath bin \
  --workpath .build/pyinstaller-linux-x64 \
  --clean \
  --hidden-import pydantic \
  python_service/__main__.py
```

**macOS ARM64:**
```bash
pyinstaller \
  --onefile \
  --name python_service-darwin-arm64 \
  --distpath bin \
  --workpath .build/pyinstaller-darwin-arm64 \
  --clean \
  --hidden-import pydantic \
  python_service/__main__.py
```

**macOS x64:**
```bash
pyinstaller \
  --onefile \
  --name python_service-darwin-x64 \
  --distpath bin \
  --workpath .build/pyinstaller-darwin-x64 \
  --clean \
  --hidden-import pydantic \
  python_service/__main__.py
```

### Build Script Integration

**Option 1: Direct npm/pnpm script (Simple)**

Add to `package.json`:
```json
{
  "scripts": {
    "build:python-binaries": "pyinstaller --onefile --name python_service-win-x64 --distpath bin --clean --hidden-import pydantic python_service/__main__.py",
    "build:python-binaries:win": "...",
    "build:python-binaries:linux": "...",
    "build:python-binaries:darwin": "..."
  }
}
```

**Limitation:** Platform-specific, requires separate scripts per platform.

**Option 2: Node.js orchestration script (Recommended)**

Create `scripts/build-binaries.js`:
```javascript
const { spawn } = require('child_process');
const { platform, arch } = process;

const platformMap = {
  'win32': { name: 'win', ext: '.exe' },
  'linux': { name: 'linux', ext: '' },
  'darwin': { name: 'darwin', ext: '' }
};

const archMap = {
  'x64': 'x64',
  'arm64': 'arm64'
};

function buildBinary() {
  const plat = platformMap[platform];
  const archName = archMap[arch];
  
  if (!plat) {
    console.error(`Unsupported platform: ${platform}`);
    process.exit(1);
  }
  
  const binaryName = `python_service-${plat.name}-${archName}${plat.ext}`;
  
  const args = [
    '--onefile',
    '--name', binaryName,
    '--distpath', 'bin',
    '--workpath', `.build/pyinstaller-${plat.name}-${archName}`,
    '--clean',
    '--hidden-import', 'pydantic',
    'python_service/__main__.py'
  ];
  
  const proc = spawn('pyinstaller', args, { stdio: 'inherit' });
  
  proc.on('close', (code) => {
    if (code !== 0) {
      console.error(`PyInstaller failed with code ${code}`);
      process.exit(code);
    }
    console.log(`Binary built: bin/${binaryName}`);
  });
}

buildBinary();
```

**Usage:**
```json
{
  "scripts": {
    "build:python-binaries": "node scripts/build-binaries.js"
  }
}
```

**Option 3: Python build script (Alternative)**

Create `scripts/build_binaries.py`:
```python
import subprocess
import sys
import platform

def build_binary():
    plat = platform.system().lower()
    arch = platform.machine().lower()
    
    platform_map = {
        'windows': ('win', '.exe'),
        'linux': ('linux', ''),
        'darwin': ('darwin', '')
    }
    
    arch_map = {
        'x86_64': 'x64',
        'amd64': 'x64',
        'arm64': 'arm64',
        'aarch64': 'arm64'
    }
    
    plat_name, ext = platform_map.get(plat, (None, None))
    arch_name = arch_map.get(arch, arch)
    
    if not plat_name:
        print(f"Unsupported platform: {plat}")
        sys.exit(1)
    
    binary_name = f"python_service-{plat_name}-{arch_name}{ext}"
    
    cmd = [
        'pyinstaller',
        '--onefile',
        '--name', binary_name,
        '--distpath', 'bin',
        '--workpath', f'.build/pyinstaller-{plat_name}-{arch_name}',
        '--clean',
        '--hidden-import', 'pydantic',
        'python_service/__main__.py'
    ]
    
    result = subprocess.run(cmd)
    if result.returncode != 0:
        sys.exit(result.returncode)
    
    print(f"Binary built: bin/{binary_name}")

if __name__ == '__main__':
    build_binary()
```

**Recommendation:** Use Option 2 (Node.js script) for consistency with existing build tooling (pnpm/npm scripts).

---

## Configuration Files

### PyInstaller Spec File (Optional)

For advanced configuration, create `python_service/pyinstaller.spec`:

```python
# -*- mode: python ; coding: utf-8 -*-

a = Analysis(
    ['__main__.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=['pydantic'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['tkinter', 'matplotlib', 'numpy'],  # Exclude unused modules
    noarchive=False,
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='python_service-win-x64',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,  # Compress executable (optional)
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,  # Keep console for stdio
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
```

**Usage with spec file:**
```bash
pyinstaller python_service/pyinstaller.spec --distpath bin --workpath .build/pyinstaller-win-x64
```

**Recommendation:** Start with CLI flags; use spec file if we need advanced optimization or platform-specific tweaks.

---

## Expected Output

### Binary Characteristics

**File Structure:**
- Single executable file (onefile mode)
- Includes Python 3.12 interpreter
- Includes Python standard library (minimal, auto-detected)
- Includes `pydantic` and dependencies
- Includes `python_service` package code

**File Sizes (Estimated):**
- Windows x64: ~15-25MB
- Linux x64: ~12-20MB
- macOS ARM64: ~15-25MB
- macOS x64: ~15-25MB

**Execution:**
- Binary runs independently (no Python installation required)
- Accepts JSON-RPC-like requests via stdin
- Outputs JSON responses via stdout
- Protocol identical to `python -m python_service`

---

## Integration with Extension

### Binary Path Resolution

**Implementation in `src/binaryResolver.ts`:**

```typescript
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function getPlatformBinaryName(): string | null {
  const platform = process.platform;
  const arch = process.arch;
  
  const platformMap: Record<string, Record<string, string>> = {
    'win32': {
      'x64': 'python_service-win-x64.exe',
      'ia32': null, // Not supported
    },
    'linux': {
      'x64': 'python_service-linux-x64',
      'arm64': 'python_service-linux-arm64',
    },
    'darwin': {
      'x64': 'python_service-darwin-x64',
      'arm64': 'python_service-darwin-arm64',
    },
  };
  
  return platformMap[platform]?.[arch] || null;
}

export function resolveBinaryPath(extensionPath: string): string | null {
  const binaryName = getPlatformBinaryName();
  if (!binaryName) {
    return null;
  }
  
  const binaryPath = path.join(extensionPath, 'bin', binaryName);
  
  if (!fs.existsSync(binaryPath)) {
    return null;
  }
  
  return binaryPath;
}
```

### PythonClient Modification

**Update `src/pythonClient.ts`:**

```typescript
export class PythonClient {
  private process: ChildProcess | null = null;
  private binaryPath: string | null = null;

  constructor(binaryPath?: string | null) {
    this.binaryPath = binaryPath || null;
  }

  async spawnService(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Use binary if available, fallback to python -m python_service
      const command = this.binaryPath || 'python';
      const args = this.binaryPath ? [] : ['-m', 'python_service'];
      
      const proc = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // ... rest of implementation unchanged
    });
  }
}
```

**Update `src/extension.ts`:**

```typescript
export function activate(context: vscode.ExtensionContext): void {
  const binaryPath = resolveBinaryPath(context.extensionPath);
  
  if (!binaryPath) {
    // Log warning but continue (development mode fallback)
    const channel = getOutputChannel();
    channel.appendLine('Warning: Python service binary not found, using system Python');
  }
  
  pythonClient = new PythonClient(binaryPath);
  
  // ... rest of activation unchanged
}
```

---

## Testing Strategy

### Unit Tests

1. **Binary resolution tests:**
   - Test `getPlatformBinaryName()` for all supported platforms
   - Test `resolveBinaryPath()` with mock extension context
   - Test error handling for unsupported platforms

2. **PythonClient tests:**
   - Test spawn with binary path
   - Test fallback to Python command
   - Verify protocol compatibility (unchanged)

### Integration Tests

1. **Binary execution tests:**
   - Build binary for current platform
   - Execute binary with test input
   - Verify JSON-RPC protocol works
   - Verify AST parsing produces correct output

2. **End-to-end tests:**
   - Build extension with binaries
   - Package `.vsix`
   - Install in clean VS Code instance
   - Verify extension works without Python installation

### Build Validation

1. **Binary size checks:**
   - Verify binaries are reasonable size (< 50MB)
   - Check for unnecessary dependencies

2. **VSIX contents validation:**
   - Verify `bin/` directory included
   - Verify correct binaries for each platform
   - Verify no development artifacts included

---

## Troubleshooting

### Common Issues

**1. PyInstaller fails to detect pydantic:**
- **Solution:** Use `--hidden-import pydantic` flag
- **Alternative:** Create hook file if needed

**2. Binary too large:**
- **Solution:** Use `--exclude-module` to remove unused stdlib modules
- **Example:** `--exclude-module tkinter --exclude-module matplotlib`

**3. Binary fails to execute:**
- **Check:** Verify binary was built for correct platform
- **Check:** Verify all dependencies included
- **Debug:** Use `--debug` flag during build

**4. Antivirus flags binary:**
- **Solution:** Sign binary (Windows) or document known false positive
- **Note:** Common with PyInstaller, usually false positive

**5. Binary not found in extension:**
- **Check:** Verify `.vscodeignore` doesn't exclude `bin/`
- **Check:** Verify binary path resolution logic
- **Check:** Verify extension context path is correct

---

## References

- **PyInstaller Documentation:** https://pyinstaller.org/
- **Usage Guide:** https://pyinstaller.org/en/stable/usage.html
- **Spec File Format:** https://pyinstaller.org/en/stable/spec-files.html
- **Common Issues:** https://pyinstaller.org/en/stable/when-things-go-wrong.html
- **GitHub Repository:** https://github.com/pyinstaller/pyinstaller
- **Changelog:** https://github.com/pyinstaller/pyinstaller/blob/develop/CHANGES.rst

---

## Next Steps

1. **Add PyInstaller to dependencies:**
   - Add to `pyproject.toml` optional dependencies
   - Document installation in README

2. **Create build script:**
   - Implement Node.js build script (`scripts/build-binaries.js`)
   - Add `build:python-binaries` to `package.json`

3. **Implement binary resolution:**
   - Create `src/binaryResolver.ts`
   - Update `PythonClient` to accept binary path
   - Update `extension.ts` to resolve and inject binary path

4. **Test binary creation:**
   - Build binary for current platform
   - Verify binary executes correctly
   - Verify protocol compatibility

5. **Update packaging:**
   - Create `.vscodeignore`
   - Add `@vscode/vsce` and packaging script
   - Test `.vsix` creation and installation
