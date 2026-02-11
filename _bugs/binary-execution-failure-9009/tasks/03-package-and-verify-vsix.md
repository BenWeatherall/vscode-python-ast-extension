# Background

Tasks 01 and 02 implemented and validated the build system with `vscode:prepublish` hook. Now we need to create a new VSIX package and verify it contains current compiled code (not stale artifacts).

The original bug was caused by stale `out/extension.js` in the VSIX that lacked binary resolution logic. We must verify:
1. The VSIX contains the same compiled code as the workspace
2. The packaged code includes binary resolution logic

This verification uses file hash comparison and pattern matching per the investigation findings documented in `_bugs/binary-execution-failure-9009/investigation/logs-and-traces.md`.

**Dependencies**: Task 02 must be completed (build system must be validated)

# This Task

Package a new VSIX and verify it contains current compiled code with binary resolution logic.

## Testing Steps

### Test 1: Package Extension with Prepublish Hook

1. Delete `out/` directory to start clean: `pnpm run clean`
2. Run packaging: `pnpm run vscode:package`
3. Observe console output - prepublish hook should run first
4. Verify VSIX created: `python-ast-visualization-0.1.0.vsix`

**Expected Result**: VSIX file created with prepublish hook output visible

### Test 2: Extract VSIX Contents

VSIX files are ZIP archives. Extract to compare contents:

```powershell
# Remove old test extraction if exists
Remove-Item -Recurse -Force .vsix-extracted-test -ErrorAction SilentlyContinue

# Extract VSIX
Expand-Archive python-ast-visualization-0.1.0.vsix .vsix-extracted-test -Force
```

**Expected Result**: `.vsix-extracted-test/extension/` directory contains extension files

### Test 3: Verify Packaged Code Matches Workspace Code

**Black Box**: Tests observable outcome (file contents match)  
**Can Fail**: Yes - if prepublish doesn't run or stale artifacts remain

Calculate and compare file hashes:

```powershell
# Calculate workspace hash
$workspaceHash = (Get-FileHash out/extension.js -Algorithm MD5).Hash
Write-Host "Workspace extension.js: $workspaceHash"

# Calculate VSIX hash
$vsixHash = (Get-FileHash .vsix-extracted-test/extension/out/extension.js -Algorithm MD5).Hash
Write-Host "VSIX extension.js: $vsixHash"

# Compare
if ($workspaceHash -eq $vsixHash) {
    Write-Host "✅ PASS: Hashes match" -ForegroundColor Green
} else {
    Write-Host "❌ FAIL: Hashes do not match" -ForegroundColor Red
}
```

**Expected Result**: Hashes match exactly (confirms fresh code packaged)

**Reference**: Investigation found original VSIX hash was `567032C82D6B7BF78979DAC2D6F2B61E` (stale) vs workspace `0AE99766249BF4B6BB62A505774D8B6F` (current). New VSIX must match current workspace.

### Test 4: Verify Binary Resolution Logic Present

**Black Box**: Tests presence of required feature  
**Can Fail**: Yes - if stale code packaged

Search for binary resolution patterns in packaged code:

```powershell
# Search for binaryResolver import
$binaryResolverMatches = Select-String -Path .vsix-extracted-test/extension/out/extension.js -Pattern "binaryResolver"
Write-Host "Binary Resolver references: $($binaryResolverMatches.Count)"

# Search for resolveBinaryPath call
$resolvePathMatches = Select-String -Path .vsix-extracted-test/extension/out/extension.js -Pattern "resolveBinaryPath"
Write-Host "ResolveBinaryPath references: $($resolvePathMatches.Count)"

# Both should be present
if ($binaryResolverMatches.Count -gt 0 -and $resolvePathMatches.Count -gt 0) {
    Write-Host "✅ PASS: Binary resolution logic present" -ForegroundColor Green
} else {
    Write-Host "❌ FAIL: Binary resolution logic missing" -ForegroundColor Red
}
```

**Expected Result**: Both patterns found (confirms feature present in packaged code)

**Reference**: Investigation found original VSIX lacked both `binaryResolver` import and `resolveBinaryPath()` call, causing the extension to fall back to `python -m python_service` which failed.

### Test 5: Verify Binary File Included

Confirm the Python service binary is included in VSIX:

```powershell
Test-Path .vsix-extracted-test/extension/bin/python_service-win-x64.exe
# Should return True
```

**Expected Result**: Binary file present (this was NOT the bug, but verify anyway)

## Files Created

- `python-ast-visualization-0.1.0.vsix` - New package with current code
- `.vsix-extracted-test/` - Temporary extraction for verification

## Acceptance Criteria

- ✅ Test 1 passes: VSIX created with prepublish hook visible
- ✅ Test 2 passes: VSIX extracted successfully
- ✅ Test 3 passes: File hashes match between workspace and VSIX
- ✅ Test 4 passes: Binary resolution logic present in packaged code
- ✅ Test 5 passes: Binary file included in VSIX
- ✅ No errors during packaging or verification

## Troubleshooting

### If Hashes Don't Match (Test 3)

**Symptoms**: Workspace and VSIX extension.js have different hashes

**Possible Causes**:
- Prepublish hook didn't run (check Task 02)
- Different build artifacts used
- Build modified after packaging

**Actions**:
1. Delete VSIX: `Remove-Item python-ast-visualization-0.1.0.vsix`
2. Clean and rebuild: `pnpm run build:clean`
3. Package again: `pnpm run vscode:package`
4. Re-run hash comparison

### If Binary Resolution Logic Missing (Test 4)

**Symptoms**: Pattern searches return 0 matches

**Possible Causes**:
- Stale code still packaged (prepublish failed)
- Feature removed or refactored in source
- TypeScript compilation issue

**Actions**:
1. Check workspace code has feature: `Select-String -Path out/extension.js -Pattern "binaryResolver"`
2. If workspace lacks feature, investigate source files
3. If workspace has feature but VSIX doesn't, prepublish hook not working
4. Review Task 02 validation results

### If Binary File Missing (Test 5)

**Symptoms**: Binary file not found in VSIX

**Possible Causes**:
- Binary not built (run `pnpm run build:python-binaries`)
- `.vscodeignore` excludes binary (should NOT happen)

**Actions**:
1. Build binaries: `pnpm run build:python-binaries`
2. Check binary exists: `Test-Path bin/python_service-win-x64.exe`
3. Review `.vscodeignore` file
4. Re-package: `pnpm run vscode:package`

## Cleanup

After verification passes, clean up test extraction:

```powershell
Remove-Item -Recurse -Force .vsix-extracted-test
```

**Note**: Keep the original `.vsix-extracted/` directory from investigation for reference if desired.

# Testing Needed

This task IS the testing task - it validates VSIX packaging correctness. Tests are documented above in "Testing Steps".

All tests follow black box testing principles:
- Test observable outcomes (file hashes, pattern presence)
- Tests can fail (detect packaging issues)
- Test results, not implementation details
- Clear success/failure criteria
