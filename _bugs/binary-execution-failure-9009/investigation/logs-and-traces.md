# Logs and Traces

## Error Stack Trace

```
[2026-02-10T12:20:01.120Z] ERROR: Failed to parse AST for d:\Code\python-vis\tests\test_placeholder.py
  Error: Service unavailable: process exited with code 9009
  Stack trace:
    at ChildProcess.onExit (pythonClient.js:105:24)
    at ChildProcess.emit (node:events:xxx)
    at Process.ChildProcess._handle.onexit (node:internal/child_process:xxx)
```

## Code Location of Error

The error originates from the `onExit` handler in `PythonClient.spawnService()`:

```javascript
// pythonClient.js:100-106
const onExit = (code) => {
    if (settled) return;
    cleanup();
    this.process = null;
    reject(new Error(`Service unavailable: process exited with code ${code}`));
};
```

This handler is attached during the spawn process initialization:

```javascript
// pythonClient.js:27-46
async spawnService() {
    return new Promise((resolve, reject) => {
        const command = this.binaryPath || "python";
        const args = this.binaryPath ? [] : ["-m", "python_service"];
        
        const proc = spawn(command, args, {
            stdio: ["pipe", "pipe", "pipe"],
        });
        
        this.process = proc;
        
        proc.on("spawn", () => resolve());
        proc.on("error", (err) => {
            this.process = null;
            reject(new Error(`Failed to spawn Python service: ${err.message}`));
        });
        proc.on("exit", (code) => {
            this.process = null;
            if (code !== null && code !== 0) {
                reject(new Error(`Python service exited with code ${code}`));
            }
        });
    });
}
```

## Binary Resolution Investigation

### Workspace Compiled Code (Current)

File: `out/extension.js` (MD5: `0AE99766249BF4B6BB62A505774D8B6F`)

```javascript
// Lines 172-185
function activate(context) {
    let binaryPath = null;
    try {
        binaryPath = (0, binaryResolver_1.resolveBinaryPath)(context.extensionPath);
    }
    catch {
        // Binary resolution failed, continue with null (development mode fallback)
        binaryPath = null;
    }
    if (!binaryPath) {
        const channel = getOutputChannel();
        channel.appendLine("Warning: Python service binary not found, using system Python");
    }
    pythonClient = new pythonClient_1.PythonClient(binaryPath);
    // ... rest of activation
}
```

**Key Points**:
- Imports `binaryResolver_1` (line 9)
- Calls `resolveBinaryPath()` with extension path
- Passes resolved `binaryPath` to `PythonClient` constructor
- Logs warning if binary not found

### VSIX Packaged Code (Stale)

File: `.vsix-extracted/extension/out/extension.js` (MD5: `567032C82D6B7BF78979DAC2D6F2B61E`)

```javascript
// Lines 158-159
function activate(context) {
    pythonClient = new pythonClient_1.PythonClient();
    // ... rest of activation
}
```

**Key Points**:
- Does NOT import `binaryResolver` module
- Does NOT call `resolveBinaryPath()`
- Creates `PythonClient()` with NO arguments
- Missing entire binary resolution logic (13 lines of code)

## PythonClient Behavior with No Binary Path

When `PythonClient` is constructed without arguments:

```javascript
// pythonClient.js:15-18
constructor(binaryPath) {
    this.process = null;
    this.binaryPath = binaryPath || null;  // Sets to null when undefined
}
```

Then during `spawnService()`:

```javascript
// pythonClient.js:29-30
const command = this.binaryPath || "python";  // Falls back to "python"
const args = this.binaryPath ? [] : ["-m", "python_service"];  // Uses module syntax
```

**Result**: Attempts to execute `python -m python_service`

## Why This Fails

The packaged VSIX excludes Python source code per `.vscodeignore`:

```
# Line 30
python_service/
```

When the extension tries to run `python -m python_service`, the Python interpreter cannot find the `python_service` module because:
1. The module source code is not included in the VSIX
2. The module is not installed in the system Python environment
3. The binary should have been used instead

## Exit Code 9009 Analysis

Exit code 9009 is a Windows CMD.EXE error meaning:
- "The program is not recognized as an internal or external command"
- Typically occurs when a command/file path cannot be found

In this context, it likely occurs when:
1. Node.js spawn executes `python -m python_service`
2. Python interpreter starts successfully
3. Python attempts to load module `python_service`
4. Python cannot find the module (not in PYTHONPATH, not installed, not in package)
5. Python or the shell subprocess exits with error code 9009

## VSIX Package Contents Verification

Files extracted from `python-ast-visualization-0.1.0.vsix`:

```
extension/bin/python_service-win-x64.exe     ✓ Present (~14.8 MB)
extension/out/binaryResolver.js              ✓ Present (compiled)
extension/out/pythonClient.js                ✓ Present (compiled)
extension/out/extension.js                   ✗ STALE (missing binary resolution)
extension/python_service/                    ✗ Excluded (as intended)
```

## File Hash Comparison

| File | Workspace Hash | VSIX Hash | Match |
|------|----------------|-----------|-------|
| `out/extension.js` | `0AE99766249BF4B6BB62A505774D8B6F` | `567032C82D6B7BF78979DAC2D6F2B61E` | ✗ |

The hashes are different, confirming the VSIX contains an older version of the compiled code.
