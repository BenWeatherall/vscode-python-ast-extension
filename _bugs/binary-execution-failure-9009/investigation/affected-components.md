# Affected Components

## Primary Components

### 1. Extension Build/Package Process

**Location**: `package.json`, build scripts, compilation pipeline

**Issue**: The VSIX packaging process captured stale compiled JavaScript code that predates the binary resolution implementation.

**Affected Scripts**:
- `package.json` → `"build"` script (compilation)
- `package.json` → `"vscode:package"` script (VSIX packaging)

**Expected Behavior**:
1. Run `pnpm run build` to compile TypeScript → JavaScript
2. Run `pnpm run vscode:package` to package the VSIX
3. VSIX should contain the latest compiled code from `out/`

**Actual Behavior**:
- VSIX contains outdated `out/extension.js` that lacks binary resolution logic
- Compilation may not have been run before packaging
- Or `out/` directory contained stale files from a previous build

### 2. Extension Activation (`extension.ts` / `extension.js`)

**Source File**: `src/extension.ts`
**Compiled File (Workspace)**: `out/extension.js` ✓ Correct
**Compiled File (VSIX)**: `.vsix-extracted/extension/out/extension.js` ✗ Stale

**Issue**: The packaged extension.js lacks the `activate()` function implementation that resolves the binary path.

**Missing Code in VSIX** (lines 172-185 of workspace version):
```typescript
let binaryPath: string | null = null;
try {
  binaryPath = resolveBinaryPath(context.extensionPath);
} catch {
  binaryPath = null;
}

if (!binaryPath) {
  const channel = getOutputChannel();
  channel.appendLine("Warning: Python service binary not found, using system Python");
}

pythonClient = new PythonClient(binaryPath);
```

**Current VSIX Code** (line 159):
```javascript
pythonClient = new pythonClient_1.PythonClient();  // No binary path!
```

**Impact**:
- `PythonClient` is instantiated without binary path argument
- Falls back to executing `python -m python_service`
- Fails because `python_service` module is not in the package

### 3. PythonClient (`pythonClient.ts`)

**File**: `src/pythonClient.ts`

**Behavior**: This component is working correctly in both versions. The issue is that it's being called incorrectly.

**Fallback Logic** (lines 31-32):
```typescript
constructor(binaryPath?: string | null) {
  this.binaryPath = binaryPath || null;
}
```

When `binaryPath` is `undefined`, it defaults to `null`, triggering the fallback to `python -m python_service`.

**Impact**: The fallback mechanism works as designed, but it's being invoked unintentionally due to missing argument in activate().

### 4. Binary Resolver (`binaryResolver.ts`)

**File**: `src/binaryResolver.ts`

**Behavior**: This component is working correctly. The binary resolution logic correctly:
- Detects platform and architecture
- Constructs the correct binary path
- Validates file existence
- Returns the path to `bin/python_service-win-x64.exe`

**Issue**: This module is NOT being called in the VSIX version because the compiled `extension.js` lacks the import and function call.

### 5. Binary File (`bin/python_service-win-x64.exe`)

**File**: `bin/python_service-win-x64.exe` (~14.8 MB)

**Status**: ✓ Correctly included in VSIX package

**Verification**:
```
.vsix-extracted/extension/bin/python_service-win-x64.exe
```

The binary is present and properly packaged, but never executed due to the stale activation code.

## Secondary Components (Not Affected)

### Python Service Module (`python_service/`)

**Status**: ✓ Correctly excluded from VSIX (as intended by design)

This is working as designed. The Python source code should NOT be in the VSIX; only the compiled binary should be included.

### Webview UI

**Status**: ✓ Not affected

The webview never receives data because the service fails before parsing.

### Configuration Files

**Status**: ✓ Not affected

- `.vscodeignore` - Working correctly, excludes Python source
- `package.json` - Scripts are defined correctly
- `tsconfig.json` - TypeScript compilation settings are correct

## Root Cause Component

**Primary Root Cause**: Build/Compilation Process

The issue is NOT in the code logic but in the build artifact management:

1. **Stale Build Artifacts**: The `out/` directory contained outdated compiled JavaScript at the time of packaging
2. **Missing Pre-Package Build**: The packaging script did not automatically recompile TypeScript before creating the VSIX
3. **No Build Verification**: No checks to ensure compiled code matches source code before packaging

## Impact Scope

**Runtime Impact**: 100% - Extension completely non-functional when installed from VSIX

**Affected Scenarios**:
- ✗ Installing extension from VSIX file
- ✓ Running extension in development mode (F5 debug) - works correctly
- ✓ Running extension from source with `pnpm run watch` - works correctly

**User-Facing Impact**: Any user installing the VSIX cannot use the extension.
