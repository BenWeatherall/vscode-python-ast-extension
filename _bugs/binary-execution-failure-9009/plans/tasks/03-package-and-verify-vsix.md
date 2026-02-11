# Task Implementation Plan: Package and Verify VSIX

## Overview

This task creates a new VSIX package using the validated build system from Tasks 01-02, then systematically verifies that the packaged extension contains current compiled code (not stale artifacts). This is the critical validation step that confirms the fix addresses the root cause.

**Contribution to Fix**: Verifies that the `vscode:prepublish` hook successfully prevents stale artifacts from being packaged. Confirms the packaged VSIX contains the same compiled code as the workspace, including binary resolution logic that was missing in the original buggy VSIX.

**Dependencies**: 
- Task 01 complete (rimraf and build scripts installed)
- Task 02 complete (build system validated)

**Task Type**: Black box verification (tests observable outcomes - file contents, hashes, patterns)

## Files to Create/Modify

### No Code Changes Required

This task does not modify source code. It packages and verifies the extension.

### Files to Create

1. **`python-ast-visualization-0.1.0.vsix`** (new package)
   - Location: `d:\Code\python-vis\python-ast-visualization-0.1.0.vsix`
   - Created by: `pnpm run vscode:package`
   - Purpose: Fresh VSIX with current compiled code

2. **`.vsix-extracted-test/`** (temporary extraction)
   - Location: `d:\Code\python-vis\.vsix-extracted-test\`
   - Created by: `Expand-Archive` (PowerShell)
   - Purpose: Extract VSIX contents for verification
   - **Note**: Different from `.vsix-extracted/` used in investigation (preserve original for reference)

### Files to Inspect/Verify

1. **Workspace compiled code**:
   - `out/extension.js` - Current compiled TypeScript
   - `out/media/webview.js` - Current bundled webview
   - `out/media/webview.css` - Current bundled styles

2. **VSIX packaged code**:
   - `.vsix-extracted-test/extension/out/extension.js` - Packaged TypeScript
   - `.vsix-extracted-test/extension/out/media/webview.js` - Packaged webview
   - `.vsix-extracted-test/extension/out/media/webview.css` - Packaged styles

3. **Binary files**:
   - `bin/python_service-win-x64.exe` - Python service binary
   - `.vsix-extracted-test/extension/bin/python_service-win-x64.exe` - Packaged binary

4. **Console output**: Observe prepublish hook execution during packaging

## Test Strategy

**Testing Approach**: Validation-based black box testing with hash comparison and pattern matching

This task follows investigation methodology documented in `investigation/logs-and-traces.md`:
- File hash comparison confirms code freshness
- Pattern matching confirms binary resolution logic present
- Directory structure verification confirms packaging correctness

### Test Coverage

- ✅ **Prepublish hook execution** (Test 1)
- ✅ **VSIX structure integrity** (Test 2)
- ✅ **Code freshness verification** (Test 3 - hash comparison)
- ✅ **Binary resolution logic presence** (Test 4 - pattern matching)
- ✅ **Binary file inclusion** (Test 5 - file existence)

### Tests NOT Included

- ❌ VSIX installation and functionality (deferred to Task 04)
- ❌ Full regression testing (deferred to Task 05)
- ❌ Internal build process behavior (already validated in Task 02)

This task focuses ONLY on VSIX packaging correctness and content verification.

### Black Box Testing Principles

All tests follow black box principles:
1. **Observable outcomes**: Test file hashes, pattern presence, file existence
2. **Can fail**: All tests can detect failures (stale code, missing logic, broken packaging)
3. **Behavior, not internals**: Test what is packaged, not how prepublish works
4. **Clear criteria**: Each test has explicit pass/fail conditions

## Implementation Order

Execute these steps sequentially. **Stop and investigate if any test fails before proceeding.**

### Step 1: Pre-Test Environment Verification

**Purpose**: Ensure Tasks 01-02 completed successfully and environment is ready for packaging

**Actions**:
1. Verify build system functional
2. Verify workspace has current compiled code
3. Clean up any previous test artifacts

**Commands**:
```powershell
# Verify build scripts exist
pnpm run  # Should list clean, build:clean, vscode:prepublish

# Ensure workspace has fresh compiled code
pnpm run build:clean

# Verify workspace output files exist
Test-Path out/extension.js       # Should return True
Test-Path out/media/webview.js   # Should return True
Test-Path bin/python_service-win-x64.exe  # Should return True

# Remove old test artifacts if they exist
Remove-Item -Recurse -Force .vsix-extracted-test -ErrorAction SilentlyContinue

# Remove old VSIX if it exists (we'll create a fresh one)
Remove-Item python-ast-visualization-0.1.0.vsix -ErrorAction SilentlyContinue
```

**Expected Output**:
- All three scripts listed in `pnpm run`
- Build completes successfully
- All workspace files exist

**Pass Criteria**:
- ✅ Build scripts registered
- ✅ Workspace `out/` directory exists with current code
- ✅ Binary file exists in workspace
- ✅ Old test artifacts removed
- ✅ No build errors

**Fail Actions**:
- If scripts missing: Return to Task 01
- If build fails: Return to Task 02, diagnose build issues
- If binary missing: Run `pnpm run build:python-binaries`

---

### Step 2: Test 1 - Package VSIX with Prepublish Hook

**Purpose**: Create fresh VSIX package and verify prepublish hook executed automatically

**Black Box Principle**: Tests observable behavior (hook executes, VSIX created), not packaging internals

**Setup**:
1. Start from clean state (no `out/` directory)
2. Remove any existing VSIX file
3. Package will trigger prepublish hook automatically

**Execution**:
```powershell
# Start from clean state to prove prepublish works
pnpm run clean

# Verify clean state
Test-Path out/  # Should return False

# Package extension (should trigger prepublish automatically)
pnpm run vscode:package

# Verify VSIX created and out/ recreated by prepublish
Test-Path python-ast-visualization-0.1.0.vsix  # Should return True
Test-Path out/extension.js                     # Should return True
```

**Expected Console Output**:
```
> vscode:package
> vsce package

> vscode:prepublish (automatically triggered)
> npm run build:clean

> clean
> rimraf out

> build
> compile
[TypeScript compilation messages...]
> bundle-webview
[esbuild bundling messages...]
[Tailwind CSS processing messages...]

Executing prepublish script 'npm run build:clean'...
Done. Packaged: python-ast-visualization-0.1.0.vsix (X files, Y MB)
```

**Key Observations**:
1. Console shows prepublish hook execution
2. Build output appears BEFORE packaging starts
3. VSIX created successfully

**Pass Criteria**:
- ✅ Started from clean state (no `out/` directory)
- ✅ Console shows prepublish hook execution
- ✅ Console shows build steps (clean → compile → bundle)
- ✅ Build steps appear BEFORE packaging message
- ✅ VSIX file created
- ✅ `out/extension.js` exists (proving prepublish ran)
- ✅ No errors during build or packaging

**Fail Scenarios & Actions**:

| Scenario | Symptoms | Action |
|----------|----------|--------|
| **Hook doesn't run** | No build output, `out/` doesn't exist | Verify script name is `vscode:prepublish` (return to Task 01) |
| **Build fails** | Errors in console, VSIX not created | Diagnose build errors (return to Task 02) |
| **Packaging fails** | VSCE errors, VSIX not created | Check VSCE version, verify package.json validity |
| **VSIX exists but out/ missing** | Hook didn't run | Investigate prepublish hook configuration |

**Recovery Procedure**:
```powershell
# If packaging fails, check VSCE version
pnpm list @vscode/vsce  # Should be 3.7.1+

# Test prepublish hook manually
pnpm run vscode:prepublish

# Verify package.json valid
Get-Content package.json | ConvertFrom-Json

# Check for VSCE errors
pnpm run vscode:package 2>&1 | Out-String
```

---

### Step 3: Test 2 - Extract VSIX and Verify Structure

**Purpose**: Extract VSIX contents for inspection and verify basic structure integrity

**Black Box Principle**: Tests observable outcome (extraction succeeds, structure valid), not ZIP internals

**Background**: VSIX files are ZIP archives. We extract to verify contents without installing.

**Execution**:
```powershell
# Extract VSIX to test directory
Expand-Archive python-ast-visualization-0.1.0.vsix .vsix-extracted-test -Force

# Verify extraction succeeded
Test-Path .vsix-extracted-test/extension/  # Should return True

# Verify key directory structure
Test-Path .vsix-extracted-test/extension/out/           # Should return True
Test-Path .vsix-extracted-test/extension/out/media/    # Should return True
Test-Path .vsix-extracted-test/extension/bin/          # Should return True

# Verify manifest files
Test-Path .vsix-extracted-test/extension/package.json  # Should return True
```

**Expected Output**:
- Extraction completes without errors
- All key directories exist
- Manifest files present

**Pass Criteria**:
- ✅ Extraction completed successfully
- ✅ `extension/` directory exists
- ✅ `extension/out/` directory exists
- ✅ `extension/out/media/` directory exists
- ✅ `extension/bin/` directory exists
- ✅ `extension/package.json` exists
- ✅ No extraction errors

**Fail Scenarios & Actions**:

| Scenario | Symptoms | Action |
|----------|----------|--------|
| **Extraction fails** | Expand-Archive errors | Check VSIX file not corrupted, verify disk space |
| **Missing directories** | Key paths don't exist | VSIX packaging broken, investigate VSCE configuration |
| **Corrupted VSIX** | ZIP format errors | Delete VSIX, clean build, re-package |

**Recovery Procedure**:
```powershell
# If extraction fails, verify VSIX integrity
Get-FileHash python-ast-visualization-0.1.0.vsix -Algorithm SHA256

# Try extracting with different method
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory(
  "python-ast-visualization-0.1.0.vsix",
  ".vsix-extracted-test"
)

# If still fails, recreate VSIX
Remove-Item python-ast-visualization-0.1.0.vsix
pnpm run clean
pnpm run vscode:package
```

---

### Step 4: Test 3 - Verify Packaged Code Matches Workspace Code

**Purpose**: Confirm VSIX contains same compiled code as workspace (file hash comparison)

**Black Box Principle**: Tests observable outcome (hashes match), not compilation internals

**Background**: This is the **PRIMARY TEST** that confirms the bug fix. Original issue was file hash mismatch:
- Original workspace hash: `0AE99766249BF4B6BB62A505774D8B6F` (current code)
- Original VSIX hash: `567032C82D6B7BF78979DAC2D6F2B61E` (stale code)

New VSIX **must** match current workspace hash, proving no stale artifacts packaged.

**Execution**:
```powershell
# Calculate workspace extension.js hash
$workspaceHash = (Get-FileHash out/extension.js -Algorithm MD5).Hash
Write-Host "Workspace extension.js: $workspaceHash" -ForegroundColor Cyan

# Calculate VSIX extension.js hash
$vsixHash = (Get-FileHash .vsix-extracted-test/extension/out/extension.js -Algorithm MD5).Hash
Write-Host "VSIX extension.js: $vsixHash" -ForegroundColor Cyan

# Compare hashes
if ($workspaceHash -eq $vsixHash) {
    Write-Host "✅ PASS: Hashes match - VSIX contains current code" -ForegroundColor Green
    Write-Host "Hash: $workspaceHash" -ForegroundColor Green
} else {
    Write-Host "❌ FAIL: Hashes do not match - VSIX contains stale code" -ForegroundColor Red
    Write-Host "Workspace: $workspaceHash" -ForegroundColor Yellow
    Write-Host "VSIX: $vsixHash" -ForegroundColor Yellow
}

# Optional: Verify webview files too
$workspaceWebviewHash = (Get-FileHash out/media/webview.js -Algorithm MD5).Hash
$vsixWebviewHash = (Get-FileHash .vsix-extracted-test/extension/out/media/webview.js -Algorithm MD5).Hash

Write-Host "`nWebview verification:" -ForegroundColor Cyan
Write-Host "Workspace webview.js: $workspaceWebviewHash" -ForegroundColor Cyan
Write-Host "VSIX webview.js: $vsixWebviewHash" -ForegroundColor Cyan

if ($workspaceWebviewHash -eq $vsixWebviewHash) {
    Write-Host "✅ PASS: Webview hashes match" -ForegroundColor Green
} else {
    Write-Host "❌ FAIL: Webview hashes do not match" -ForegroundColor Red
}
```

**Expected Output**:
```
Workspace extension.js: [CURRENT_HASH]
VSIX extension.js: [CURRENT_HASH]
✅ PASS: Hashes match - VSIX contains current code
Hash: [CURRENT_HASH]

Webview verification:
Workspace webview.js: [WEBVIEW_HASH]
VSIX webview.js: [WEBVIEW_HASH]
✅ PASS: Webview hashes match
```

**Pass Criteria**:
- ✅ Workspace `extension.js` hash calculated successfully
- ✅ VSIX `extension.js` hash calculated successfully
- ✅ **Hashes match exactly** (confirms fresh code packaged)
- ✅ Webview hashes match (confirms complete build)
- ✅ No file access errors

**Critical**: If hashes don't match, the bug fix has FAILED. This means prepublish hook didn't work or stale artifacts remain.

**Fail Scenarios & Actions**:

| Scenario | Symptoms | Action |
|----------|----------|--------|
| **Hashes don't match** | Different MD5 values | **CRITICAL**: Prepublish hook failed, investigate Task 01-02 |
| **Workspace file missing** | File not found error | Build didn't run, return to Step 1 |
| **VSIX file missing** | File not found error | Extraction failed, return to Test 2 |
| **Hash matches old buggy hash** | Hash equals `567032C82D6B7BF78979DAC2D6F2B61E` | Stale artifacts still present, investigate |

**Recovery Procedure (Critical - If Hashes Don't Match)**:
```powershell
# This is a CRITICAL failure - prepublish hook didn't prevent stale artifacts

# Step 1: Verify prepublish hook exists
Get-Content package.json | Select-String "vscode:prepublish"

# Step 2: Test hook manually
pnpm run vscode:prepublish

# Step 3: Calculate hash after manual prepublish
$manualHash = (Get-FileHash out/extension.js -Algorithm MD5).Hash
Write-Host "After manual prepublish: $manualHash"

# Step 4: If manual prepublish produces correct hash, packaging is broken
# If manual prepublish still produces wrong hash, build is broken

# Step 5: Clean everything and rebuild from scratch
Remove-Item -Recurse -Force out/
Remove-Item -Recurse -Force node_modules/
Remove-Item python-ast-visualization-0.1.0.vsix -ErrorAction SilentlyContinue
pnpm install
pnpm run build:clean
$cleanHash = (Get-FileHash out/extension.js -Algorithm MD5).Hash
Write-Host "After clean rebuild: $cleanHash"

# Step 6: If clean rebuild works, re-package
pnpm run clean
pnpm run vscode:package

# Step 7: Re-extract and re-test
Remove-Item -Recurse -Force .vsix-extracted-test
Expand-Archive python-ast-visualization-0.1.0.vsix .vsix-extracted-test -Force
$newVsixHash = (Get-FileHash .vsix-extracted-test/extension/out/extension.js -Algorithm MD5).Hash
Write-Host "New VSIX hash: $newVsixHash"

# If still doesn't match, escalate to investigation phase
```

**Investigation Commands (If Recovery Fails)**:
```powershell
# Compare file contents directly (see differences)
Compare-Object `
  (Get-Content out/extension.js) `
  (Get-Content .vsix-extracted-test/extension/out/extension.js)

# Check file timestamps
(Get-Item out/extension.js).LastWriteTime
(Get-Item .vsix-extracted-test/extension/out/extension.js).LastWriteTime

# Check if workspace file is the stale one (not VSIX)
$workspaceHash = (Get-FileHash out/extension.js -Algorithm MD5).Hash
if ($workspaceHash -eq "567032C82D6B7BF78979DAC2D6F2B61E") {
    Write-Host "⚠️ WARNING: Workspace contains OLD stale code!" -ForegroundColor Yellow
    Write-Host "This means the source files haven't been updated since investigation" -ForegroundColor Yellow
}
```

---

### Step 5: Test 4 - Verify Binary Resolution Logic Present

**Purpose**: Confirm packaged code includes binary resolution logic (missing in original buggy VSIX)

**Black Box Principle**: Tests observable outcome (patterns present), not code internals

**Background**: Original buggy VSIX lacked:
- `binaryResolver` import
- `resolveBinaryPath()` function call

Investigation found workspace code had both patterns. New VSIX **must** contain both.

**Execution**:
```powershell
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test 4: Binary Resolution Logic Verification" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Search for binaryResolver import in VSIX
$binaryResolverMatches = Select-String -Path .vsix-extracted-test/extension/out/extension.js -Pattern "binaryResolver" -AllMatches
$binaryResolverCount = if ($binaryResolverMatches) { $binaryResolverMatches.Matches.Count } else { 0 }
Write-Host "Binary Resolver references: $binaryResolverCount" -ForegroundColor Cyan

# Search for resolveBinaryPath call in VSIX
$resolvePathMatches = Select-String -Path .vsix-extracted-test/extension/out/extension.js -Pattern "resolveBinaryPath" -AllMatches
$resolvePathCount = if ($resolvePathMatches) { $resolvePathMatches.Matches.Count } else { 0 }
Write-Host "ResolveBinaryPath references: $resolvePathCount" -ForegroundColor Cyan

# Evaluate results
if ($binaryResolverCount -gt 0 -and $resolvePathCount -gt 0) {
    Write-Host "`n✅ PASS: Binary resolution logic present in VSIX" -ForegroundColor Green
    Write-Host "   - binaryResolver: $binaryResolverCount references" -ForegroundColor Green
    Write-Host "   - resolveBinaryPath: $resolvePathCount references" -ForegroundColor Green
} else {
    Write-Host "`n❌ FAIL: Binary resolution logic missing in VSIX" -ForegroundColor Red
    if ($binaryResolverCount -eq 0) {
        Write-Host "   - Missing: binaryResolver import" -ForegroundColor Red
    }
    if ($resolvePathCount -eq 0) {
        Write-Host "   - Missing: resolveBinaryPath() call" -ForegroundColor Red
    }
}

# Optional: Verify patterns in workspace too (should match)
Write-Host "`nWorkspace verification (for reference):" -ForegroundColor Cyan
$workspaceBinaryResolver = (Select-String -Path out/extension.js -Pattern "binaryResolver" -AllMatches).Matches.Count
$workspaceResolvePath = (Select-String -Path out/extension.js -Pattern "resolveBinaryPath" -AllMatches).Matches.Count
Write-Host "Workspace binaryResolver: $workspaceBinaryResolver references" -ForegroundColor Cyan
Write-Host "Workspace resolveBinaryPath: $workspaceResolvePath references" -ForegroundColor Cyan

if ($workspaceBinaryResolver -eq $binaryResolverCount -and $workspaceResolvePath -eq $resolvePathCount) {
    Write-Host "✅ Pattern counts match between workspace and VSIX" -ForegroundColor Green
} else {
    Write-Host "⚠️ WARNING: Pattern counts differ (investigate if Test 3 passed)" -ForegroundColor Yellow
}
```

**Expected Output**:
```
========================================
Test 4: Binary Resolution Logic Verification
========================================

Binary Resolver references: 2
ResolveBinaryPath references: 1

✅ PASS: Binary resolution logic present in VSIX
   - binaryResolver: 2 references
   - resolveBinaryPath: 1 references

Workspace verification (for reference):
Workspace binaryResolver: 2 references
Workspace resolveBinaryPath: 1 references
✅ Pattern counts match between workspace and VSIX
```

**Pass Criteria**:
- ✅ `binaryResolver` pattern found (count > 0)
- ✅ `resolveBinaryPath` pattern found (count > 0)
- ✅ Pattern counts match between workspace and VSIX
- ✅ No file access errors

**Fail Scenarios & Actions**:

| Scenario | Symptoms | Action |
|----------|----------|--------|
| **Patterns missing in VSIX** | Count = 0 for one or both | **CRITICAL**: Stale code packaged, return to Test 3 recovery |
| **Patterns in workspace but not VSIX** | Workspace > 0, VSIX = 0 | Hash comparison should have caught this, investigate |
| **Patterns missing in both** | Both workspace and VSIX = 0 | Source code issue, verify `src/extension.ts` has binary resolution |

**Recovery Procedure (If Patterns Missing)**:
```powershell
# Step 1: Verify patterns exist in TypeScript source
Select-String -Path src/extension.ts -Pattern "binaryResolver"
Select-String -Path src/extension.ts -Pattern "resolveBinaryPath"
# Should find both patterns

# Step 2: If missing from source, investigate source code changes
# This means binary resolution feature was removed or refactored

# Step 3: If present in source, recompile and verify workspace
pnpm run compile
$compiled = Select-String -Path out/extension.js -Pattern "binaryResolver"
if ($compiled) {
    Write-Host "✅ Compilation produces binary resolution logic"
} else {
    Write-Host "❌ TypeScript compilation not including binary resolution"
    Write-Host "Check tsconfig.json and build configuration"
}

# Step 4: If workspace now has patterns, re-package and re-test
pnpm run clean
pnpm run vscode:package
# Return to Test 2 (extraction)
```

**Context Verification (For Understanding)**:
```powershell
# View actual code snippets (first few matches)
Write-Host "`nCode snippet from VSIX (binaryResolver):" -ForegroundColor Yellow
Select-String -Path .vsix-extracted-test/extension/out/extension.js -Pattern "binaryResolver" -Context 0,1 | Select-Object -First 2

Write-Host "`nCode snippet from VSIX (resolveBinaryPath):" -ForegroundColor Yellow
Select-String -Path .vsix-extracted-test/extension/out/extension.js -Pattern "resolveBinaryPath" -Context 1,1 | Select-Object -First 1
```

---

### Step 6: Test 5 - Verify Binary File Included

**Purpose**: Confirm Python service binary included in VSIX (sanity check)

**Black Box Principle**: Tests observable outcome (file exists), not packaging logic

**Background**: Binary inclusion was NOT the original bug (it was always included), but we verify anyway to ensure packaging is complete.

**Execution**:
```powershell
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test 5: Binary File Inclusion Verification" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if binary exists in VSIX
$binaryPath = ".vsix-extracted-test/extension/bin/python_service-win-x64.exe"
$binaryExists = Test-Path $binaryPath

if ($binaryExists) {
    Write-Host "✅ PASS: Binary file included in VSIX" -ForegroundColor Green
    
    # Show binary details
    $binaryInfo = Get-Item $binaryPath
    $binarySizeMB = [math]::Round($binaryInfo.Length / 1MB, 2)
    Write-Host "   - Path: bin/python_service-win-x64.exe" -ForegroundColor Green
    Write-Host "   - Size: $binarySizeMB MB" -ForegroundColor Green
    Write-Host "   - Modified: $($binaryInfo.LastWriteTime)" -ForegroundColor Green
    
    # Optional: Compare with workspace binary
    $workspaceBinaryPath = "bin/python_service-win-x64.exe"
    if (Test-Path $workspaceBinaryPath) {
        $workspaceBinaryInfo = Get-Item $workspaceBinaryPath
        $workspaceSizeMB = [math]::Round($workspaceBinaryInfo.Length / 1MB, 2)
        
        if ($binaryInfo.Length -eq $workspaceBinaryInfo.Length) {
            Write-Host "   - ✅ Size matches workspace binary" -ForegroundColor Green
        } else {
            Write-Host "   - ⚠️ Size differs from workspace ($workspaceSizeMB MB)" -ForegroundColor Yellow
            Write-Host "     (This may be normal if workspace binary was rebuilt)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "❌ FAIL: Binary file missing from VSIX" -ForegroundColor Red
    Write-Host "   Expected path: $binaryPath" -ForegroundColor Red
    
    # List what's actually in bin/ directory
    Write-Host "`n   Contents of .vsix-extracted-test/extension/bin/:" -ForegroundColor Yellow
    if (Test-Path .vsix-extracted-test/extension/bin/) {
        Get-ChildItem .vsix-extracted-test/extension/bin/ | ForEach-Object { 
            Write-Host "   - $($_.Name)" -ForegroundColor Yellow 
        }
    } else {
        Write-Host "   (bin/ directory does not exist)" -ForegroundColor Red
    }
}
```

**Expected Output**:
```
========================================
Test 5: Binary File Inclusion Verification
========================================

✅ PASS: Binary file included in VSIX
   - Path: bin/python_service-win-x64.exe
   - Size: X.XX MB
   - Modified: 2026-02-XX XX:XX:XX
   - ✅ Size matches workspace binary
```

**Pass Criteria**:
- ✅ Binary file exists at `.vsix-extracted-test/extension/bin/python_service-win-x64.exe`
- ✅ Binary file size > 0 bytes (not empty)
- ✅ File size reasonable (should be several MB for PyInstaller bundle)

**Fail Scenarios & Actions**:

| Scenario | Symptoms | Action |
|----------|----------|--------|
| **Binary missing from VSIX** | File not found | Check `.vscodeignore`, verify binary not excluded |
| **Binary exists in workspace** | Workspace has it, VSIX doesn't | `.vscodeignore` excluding binary, fix exclusion pattern |
| **Binary missing from workspace** | Neither has it | Build binary: `pnpm run build:python-binaries` |
| **bin/ directory missing** | Directory not in VSIX | Packaging configuration issue, check VSCE setup |

**Recovery Procedure (If Binary Missing)**:
```powershell
# Step 1: Check if binary exists in workspace
if (Test-Path bin/python_service-win-x64.exe) {
    Write-Host "✅ Binary exists in workspace"
    
    # Step 2: Check .vscodeignore exclusions
    Write-Host "`nChecking .vscodeignore for binary exclusions..."
    Get-Content .vscodeignore | Select-String "bin"
    
    # If bin/ is excluded, this is the problem
    # Remove bin/ exclusion from .vscodeignore (or add !bin/*.exe to include)
    
} else {
    Write-Host "❌ Binary missing from workspace - building binary"
    
    # Step 3: Build binary
    pnpm run build:python-binaries
    
    # Verify binary created
    if (Test-Path bin/python_service-win-x64.exe) {
        Write-Host "✅ Binary built successfully"
    } else {
        Write-Host "❌ Binary build failed - check build script"
    }
}

# Step 4: Re-package with binary
pnpm run vscode:package

# Step 5: Re-extract and verify
Remove-Item -Recurse -Force .vsix-extracted-test
Expand-Archive python-ast-visualization-0.1.0.vsix .vsix-extracted-test -Force
Test-Path .vsix-extracted-test/extension/bin/python_service-win-x64.exe
```

---

### Step 7: Post-Test Summary and Documentation

**Purpose**: Summarize all test results and prepare for Task 04

**Actions**:
1. Review all test results
2. Generate summary report
3. Document results for reference
4. Confirm environment ready for Task 04

**Summary Report Script**:
```powershell
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TASK 03: VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test results tracking (set these based on actual test outcomes)
$test1Pass = Test-Path python-ast-visualization-0.1.0.vsix
$test2Pass = Test-Path .vsix-extracted-test/extension/
$test3Pass = $false  # Set to $true if hashes matched
$test4Pass = $false  # Set to $true if patterns found
$test5Pass = Test-Path .vsix-extracted-test/extension/bin/python_service-win-x64.exe

# Calculate workspace hash for display
$workspaceHash = (Get-FileHash out/extension.js -Algorithm MD5).Hash
$vsixHash = (Get-FileHash .vsix-extracted-test/extension/out/extension.js -Algorithm MD5).Hash
$test3Pass = ($workspaceHash -eq $vsixHash)

# Check patterns for display
$binaryResolverCount = (Select-String -Path .vsix-extracted-test/extension/out/extension.js -Pattern "binaryResolver" -AllMatches).Matches.Count
$resolvePathCount = (Select-String -Path .vsix-extracted-test/extension/out/extension.js -Pattern "resolveBinaryPath" -AllMatches).Matches.Count
$test4Pass = ($binaryResolverCount -gt 0 -and $resolvePathCount -gt 0)

# Display results
Write-Host "Test Results:" -ForegroundColor White
Write-Host "-------------" -ForegroundColor White

$statusIcon1 = if ($test1Pass) { "✅" } else { "❌" }
Write-Host "$statusIcon1 Test 1: Package VSIX with Prepublish Hook" -ForegroundColor $(if ($test1Pass) { "Green" } else { "Red" })

$statusIcon2 = if ($test2Pass) { "✅" } else { "❌" }
Write-Host "$statusIcon2 Test 2: Extract VSIX and Verify Structure" -ForegroundColor $(if ($test2Pass) { "Green" } else { "Red" })

$statusIcon3 = if ($test3Pass) { "✅" } else { "❌" }
Write-Host "$statusIcon3 Test 3: Verify Code Freshness (Hash Match)" -ForegroundColor $(if ($test3Pass) { "Green" } else { "Red" })
Write-Host "     Workspace: $workspaceHash" -ForegroundColor Cyan
Write-Host "     VSIX:      $vsixHash" -ForegroundColor Cyan

$statusIcon4 = if ($test4Pass) { "✅" } else { "❌" }
Write-Host "$statusIcon4 Test 4: Binary Resolution Logic Present" -ForegroundColor $(if ($test4Pass) { "Green" } else { "Red" })
Write-Host "     binaryResolver: $binaryResolverCount references" -ForegroundColor Cyan
Write-Host "     resolveBinaryPath: $resolvePathCount references" -ForegroundColor Cyan

$statusIcon5 = if ($test5Pass) { "✅" } else { "❌" }
Write-Host "$statusIcon5 Test 5: Binary File Included" -ForegroundColor $(if ($test5Pass) { "Green" } else { "Red" })

Write-Host "`n" -ForegroundColor White

# Overall result
$allPassed = $test1Pass -and $test2Pass -and $test3Pass -and $test4Pass -and $test5Pass

if ($allPassed) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ ALL TESTS PASSED - TASK 03 COMPLETE" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "`nThe VSIX package contains current compiled code with binary resolution logic." -ForegroundColor Green
    Write-Host "Ready to proceed to Task 04 (VSIX functionality testing).`n" -ForegroundColor Green
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "❌ SOME TESTS FAILED - INVESTIGATE" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "`nDo NOT proceed to Task 04 until all tests pass." -ForegroundColor Red
    Write-Host "Review failure scenarios and recovery procedures above.`n" -ForegroundColor Red
}

# Reference information
Write-Host "Reference Information:" -ForegroundColor Cyan
Write-Host "---------------------" -ForegroundColor Cyan
Write-Host "VSIX File: python-ast-visualization-0.1.0.vsix" -ForegroundColor White
Write-Host "VSIX Size: $([math]::Round((Get-Item python-ast-visualization-0.1.0.vsix).Length / 1MB, 2)) MB" -ForegroundColor White
Write-Host "Extraction Dir: .vsix-extracted-test/" -ForegroundColor White
Write-Host "`n"

Write-Host "Original Bug Reference (Investigation):" -ForegroundColor Cyan
Write-Host "--------------------------------------" -ForegroundColor Cyan
Write-Host "Original stale VSIX hash: 567032C82D6B7BF78979DAC2D6F2B61E" -ForegroundColor Yellow
Write-Host "Original workspace hash:  0AE99766249BF4B6BB62A505774D8B6F" -ForegroundColor Yellow
Write-Host "New VSIX hash:           $vsixHash" -ForegroundColor White
Write-Host "`n"

if ($test3Pass) {
    Write-Host "✅ New VSIX hash matches workspace (bug fixed!)" -ForegroundColor Green
} else {
    Write-Host "⚠️ New VSIX hash differs from workspace (investigate)" -ForegroundColor Yellow
}
```

**Expected Output (Success)**:
```
========================================
TASK 03: VERIFICATION SUMMARY
========================================

Test Results:
-------------
✅ Test 1: Package VSIX with Prepublish Hook
✅ Test 2: Extract VSIX and Verify Structure
✅ Test 3: Verify Code Freshness (Hash Match)
     Workspace: [CURRENT_HASH]
     VSIX:      [CURRENT_HASH]
✅ Test 4: Binary Resolution Logic Present
     binaryResolver: 2 references
     resolveBinaryPath: 1 references
✅ Test 5: Binary File Included

========================================
✅ ALL TESTS PASSED - TASK 03 COMPLETE
========================================

The VSIX package contains current compiled code with binary resolution logic.
Ready to proceed to Task 04 (VSIX functionality testing).
```

**Pass Criteria (Overall)**:
- ✅ All 5 tests passed
- ✅ No errors during any test
- ✅ Summary report generated
- ✅ Environment ready for Task 04

**If Any Test Failed**:
1. Do NOT proceed to Step 7 summary
2. Do NOT proceed to Task 04
3. Investigate failure using recovery procedures
4. Fix underlying issue
5. Restart from Step 1 (clean environment)
6. Only generate summary report when ALL tests pass

---

## Validation Steps

Validation steps are embedded in the implementation order above (Steps 2-6). Each test includes its own pass/fail criteria and verification commands.

### Quick Validation Commands (For Reference)

**Complete validation sequence** (run after all tests):
```powershell
# Test 1: VSIX created
Test-Path python-ast-visualization-0.1.0.vsix  # Should return True

# Test 2: VSIX extracted
Test-Path .vsix-extracted-test/extension/  # Should return True

# Test 3: Hashes match
$ws = (Get-FileHash out/extension.js -Algorithm MD5).Hash
$vx = (Get-FileHash .vsix-extracted-test/extension/out/extension.js -Algorithm MD5).Hash
$ws -eq $vx  # Should return True

# Test 4: Patterns present
(Select-String -Path .vsix-extracted-test/extension/out/extension.js -Pattern "binaryResolver").Length -gt 0
(Select-String -Path .vsix-extracted-test/extension/out/extension.js -Pattern "resolveBinaryPath").Length -gt 0
# Both should return True

# Test 5: Binary included
Test-Path .vsix-extracted-test/extension/bin/python_service-win-x64.exe  # Should return True
```

## Common Pitfalls to Avoid

### Pitfall 1: Not Starting from Clean State

**Problem**: Running packaging without cleaning `out/` directory first

**Impact**: Can't verify prepublish hook works (may use existing files instead of rebuilding)

**Prevention**: Step 2 explicitly runs `pnpm run clean` before packaging

---

### Pitfall 2: Ignoring Console Output

**Problem**: Only checking if VSIX file created, not observing prepublish hook execution

**Impact**: Miss that prepublish didn't run (VSIX may exist from previous run)

**Prevention**: Test 1 explicitly checks for prepublish hook output in console

---

### Pitfall 3: Using Same Extraction Directory as Investigation

**Problem**: Extracting to `.vsix-extracted/` (same directory used in investigation)

**Impact**: May compare against old buggy VSIX instead of new one

**Prevention**: Use `.vsix-extracted-test/` for this task (preserves original for reference)

---

### Pitfall 4: Accepting Close-Enough Hashes

**Problem**: "Hashes are similar" or "only a few characters different"

**Impact**: ANY hash difference means files are different (100% wrong, not partially wrong)

**Prevention**: Test 3 requires EXACT hash match (no approximations)

---

### Pitfall 5: Skipping Pattern Verification

**Problem**: "Test 3 passed (hashes match), so we don't need Test 4"

**Impact**: Miss opportunity to verify specific fix (binary resolution logic)

**Prevention**: Run all 5 tests even if Test 3 passes (comprehensive verification)

---

### Pitfall 6: Not Comparing with Investigation Findings

**Problem**: Not checking if new hash matches the expected current hash from investigation

**Impact**: May miss that workspace code reverted or changed unexpectedly

**Prevention**: Reference investigation hashes in Test 3 for context

---

### Pitfall 7: Testing Beyond Scope

**Problem**: Trying to install or run VSIX in this task

**Impact**: Scope creep, mixing packaging verification with functionality testing

**Prevention**: This task ONLY verifies packaging correctness. Functionality testing is Task 04.

---

### Pitfall 8: Deleting Test Artifacts Too Early

**Problem**: Cleaning up `.vsix-extracted-test/` before Task 04

**Impact**: Task 04 may want to reference extracted files

**Prevention**: Keep artifacts until Task 05 cleanup phase (document in success criteria)

---

## Rollback Procedure

### This Task: No Source Code Rollback Needed

**Rationale**: This task does not modify source code or configuration. It only packages and verifies.

**If Tests Fail**: Investigate and fix the underlying issue (likely in Tasks 01-02), then re-run this task.

### If Packaging Corrupted

**Scenario**: VSIX file corrupted or packaging process broken

**Actions**:
1. Delete VSIX file
2. Clean build artifacts
3. Rebuild from scratch
4. Re-package

```powershell
# Clean everything
Remove-Item python-ast-visualization-0.1.0.vsix -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .vsix-extracted-test -ErrorAction SilentlyContinue
pnpm run clean

# Rebuild
pnpm run build:clean

# Verify build output
Test-Path out/extension.js

# Re-package
pnpm run vscode:package

# Re-test from Step 2
```

### If Build System Issues Found

**Scenario**: Tests reveal Tasks 01-02 didn't work correctly

**Actions**:
1. Document specific failure
2. Return to failed task (01 or 02)
3. Fix issue
4. Re-validate that task
5. Return to Task 03 and restart from Step 1

**Example**: If prepublish hook doesn't run:
1. Return to Task 01, verify `vscode:prepublish` script exists
2. Check script name is exactly `vscode:prepublish` (colon, not underscore)
3. Re-run Task 02 validation
4. Return to Task 03 Step 1

## Documentation Updates

### This Task: Scratchpad Only

**Update**: `.cursor/scratchpad.md`

**Content to Add**:
```markdown
**Task 03 Plan Created**: `_bugs/binary-execution-failure-9009/plans/tasks/03-package-and-verify-vsix.md`

**Task 03 Execution Status**:
- ✅ Test 1: Package VSIX with Prepublish Hook - PASS
- ✅ Test 2: Extract VSIX and Verify Structure - PASS
- ✅ Test 3: Verify Code Freshness (Hash Match) - PASS
  - Workspace hash: [HASH]
  - VSIX hash: [HASH]
  - ✅ Hashes match
- ✅ Test 4: Binary Resolution Logic Present - PASS
  - binaryResolver: X references
  - resolveBinaryPath: Y references
- ✅ Test 5: Binary File Included - PASS

**Overall**: Task 03 COMPLETE - Ready for Task 04

**Artifacts Created**:
- python-ast-visualization-0.1.0.vsix (new package)
- .vsix-extracted-test/ (extraction for verification)

**Critical Finding**: New VSIX contains current compiled code with binary resolution logic (bug fix confirmed at packaging level)
```

### No User-Facing Documentation Yet

**Rationale**: User-facing documentation (README, CHANGELOG) only updated after complete fix validated (Task 05 complete).

**Deferred to Task 05**:
- README.md updates
- CHANGELOG.md entry
- Release notes

### Artifacts to Preserve

**Keep for Task 04**:
- `python-ast-visualization-0.1.0.vsix` - Will be installed and tested
- `.vsix-extracted-test/` - May be referenced for debugging

**Keep for Investigation Reference**:
- `.vsix-extracted/` - Original buggy VSIX extraction (from investigation)

**Do NOT Delete** until Task 05 (cleanup phase).

## Success Criteria

Task 03 is considered complete when ALL of the following are true:

**Environment Validation**:
- ✅ Build system functional (Tasks 01-02 complete)
- ✅ Workspace has current compiled code
- ✅ Binary file exists in workspace

**Test 1 - Package with Prepublish**:
- ✅ Started from clean state (no `out/` directory)
- ✅ `pnpm run vscode:package` completed successfully
- ✅ Console showed prepublish hook execution
- ✅ Console showed build steps before packaging
- ✅ VSIX file created
- ✅ `out/` directory recreated by prepublish
- ✅ No errors during build or packaging

**Test 2 - Extract and Verify Structure**:
- ✅ VSIX extracted successfully to `.vsix-extracted-test/`
- ✅ `extension/` directory exists
- ✅ `extension/out/` directory exists
- ✅ `extension/out/media/` directory exists
- ✅ `extension/bin/` directory exists
- ✅ `extension/package.json` exists
- ✅ No extraction errors

**Test 3 - Code Freshness (CRITICAL)**:
- ✅ Workspace `extension.js` hash calculated
- ✅ VSIX `extension.js` hash calculated
- ✅ **Hashes match exactly** (confirms fresh code packaged)
- ✅ Webview `webview.js` hashes match
- ✅ No file access errors
- ✅ Hash does NOT match old buggy hash (`567032C82D6B7BF78979DAC2D6F2B61E`)

**Test 4 - Binary Resolution Logic (CRITICAL)**:
- ✅ `binaryResolver` pattern found in VSIX (count > 0)
- ✅ `resolveBinaryPath` pattern found in VSIX (count > 0)
- ✅ Pattern counts match between workspace and VSIX
- ✅ No file access errors

**Test 5 - Binary File Inclusion**:
- ✅ Binary file exists at `.vsix-extracted-test/extension/bin/python_service-win-x64.exe`
- ✅ Binary file size > 0 bytes
- ✅ File size reasonable (several MB)

**Documentation**:
- ✅ Scratchpad updated with plan location and test results
- ✅ Test summary generated

**Overall**:
- ✅ All 5 tests passed
- ✅ No failures or anomalies
- ✅ Artifacts preserved for Task 04
- ✅ Environment ready for Task 04

## Risk Assessment

**Overall Risk**: LOW TO MEDIUM

### Risk 1: Hash Mismatch (Code Not Fresh)

**Probability**: Low (if Tasks 01-02 validated correctly)  
**Impact**: CRITICAL (bug fix failed, must investigate)  
**Mitigation**: 
- Comprehensive recovery procedures in Test 3
- Clear diagnostics for identifying cause
- Escalation path to investigation phase

### Risk 2: Prepublish Hook Doesn't Run

**Probability**: Very Low (Task 02 validated hook)  
**Impact**: High (stale code packaged)  
**Mitigation**: 
- Test 1 explicitly observes console output
- Recovery procedure tests hook manually
- Clear indicators in console when hook runs

### Risk 3: VSIX Extraction Fails

**Probability**: Very Low  
**Impact**: Medium (blocks verification)  
**Mitigation**: 
- PowerShell Expand-Archive is reliable
- Alternative extraction method documented
- Recovery procedure includes re-packaging

### Risk 4: Patterns Present But Code Still Broken

**Probability**: Very Low (hash match would detect this)  
**Impact**: Medium (would be caught in Task 04)  
**Mitigation**: 
- Test 3 (hash match) is primary validation
- Test 4 (patterns) is supplementary confirmation
- Task 04 will test actual functionality

### Risk 5: Binary Missing from VSIX

**Probability**: Very Low (binary always included in investigation)  
**Impact**: Low (easy to fix, clear error in Task 04)  
**Mitigation**: 
- Test 5 catches this issue
- Recovery procedure includes building binary
- `.vscodeignore` check documented

## Time Estimate

**Estimated Duration**: 15-20 minutes

**Breakdown**:
- Step 1 (Pre-test verification): 2 minutes
- Step 2 (Test 1 - Package): 3 minutes (includes packaging time)
- Step 3 (Test 2 - Extract): 1 minute
- Step 4 (Test 3 - Hash compare): 2 minutes
- Step 5 (Test 4 - Pattern search): 2 minutes
- Step 6 (Test 5 - Binary check): 1 minute
- Step 7 (Summary report): 2 minutes
- Documentation: 2 minutes

**Contingency**: +15 minutes for troubleshooting if Test 3 fails (hash mismatch)

**Notes**:
- Packaging time depends on project size (typically 30-60 seconds)
- Hash calculation is very fast (< 1 second per file)
- Pattern matching may take 2-3 seconds for large files
- If Test 3 fails, investigation may take significantly longer

**Total with Contingency**: 35 minutes maximum

## Next Task

After completing this task and verifying all success criteria:

**Proceed to**: Task 04 - Test VSIX Functionality

**File**: `_bugs/binary-execution-failure-9009/tasks/04-test-vsix-functionality.md`

**Dependencies**: Task 04 requires:
- Task 01 complete (build scripts)
- Task 02 complete (build validation)
- Task 03 complete (VSIX packaged and verified)
- VSIX file exists: `python-ast-visualization-0.1.0.vsix`

**What Task 04 Will Do**:
- Install VSIX in VS Code
- Test "Visualize AST" command on Python file
- Verify no exit code 9009 error
- Confirm extension functionality end-to-end
- Validate that the bug is actually fixed (user perspective)

**Note**: Task 03 verifies packaging correctness (file hashes, patterns). Task 04 verifies the packaged extension actually works (functionality testing).

---

## Appendix: Investigation Reference

### Original Bug Hashes (From Investigation)

**Original Buggy VSIX** (`.vsix-extracted/extension/out/extension.js`):
- Hash: `567032C82D6B7BF78979DAC2D6F2B61E`
- Status: Stale code, missing binary resolution logic

**Workspace During Investigation** (`out/extension.js`):
- Hash: `0AE99766249BF4B6BB62A505774D8B6F`
- Status: Current code, includes binary resolution logic

**Expected After Fix**:
- New VSIX hash should match current workspace hash
- If workspace code hasn't changed since investigation, new VSIX hash should be `0AE99766249BF4B6BB62A505774D8B6F`
- If workspace code has changed (new features/fixes), hash will be different but **must** match current workspace

**Key Point**: The absolute hash value doesn't matter. What matters is VSIX hash **matches** workspace hash.

### Binary Resolution Patterns (From Investigation)

**Patterns Present in Workspace** (during investigation):
- `const binaryResolver_1 = require("./binaryResolver");` - Import statement
- `binaryResolver_1.resolveBinaryPath(context)` - Function call
- Full code span: ~13 lines in `activate()` function

**Patterns Missing in Buggy VSIX**:
- No `binaryResolver` import
- No `resolveBinaryPath()` call
- Old code: `new PythonClient()` with no arguments

**Expected After Fix**:
- Both patterns present in new VSIX
- Pattern counts match between workspace and VSIX
- Code logic identical between workspace and VSIX

---

## Appendix: PowerShell Script (Complete Test Suite)

For convenience, here's a complete PowerShell script that runs all tests:

```powershell
# Task 03: Complete VSIX Verification Test Suite
# This script runs all 5 verification tests and generates a summary report

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TASK 03: PACKAGE AND VERIFY VSIX" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Pre-Test Verification
Write-Host "Step 1: Pre-Test Environment Verification" -ForegroundColor Yellow
Write-Host "-----------------------------------------`n" -ForegroundColor Yellow

Write-Host "Cleaning and rebuilding workspace..." -ForegroundColor White
pnpm run build:clean

Write-Host "`nCleaning old test artifacts..." -ForegroundColor White
Remove-Item -Recurse -Force .vsix-extracted-test -ErrorAction SilentlyContinue
Remove-Item python-ast-visualization-0.1.0.vsix -ErrorAction SilentlyContinue

Write-Host "✅ Pre-test verification complete`n" -ForegroundColor Green

# Test 1: Package VSIX
Write-Host "`nTest 1: Package VSIX with Prepublish Hook" -ForegroundColor Yellow
Write-Host "------------------------------------------`n" -ForegroundColor Yellow

Write-Host "Starting from clean state..." -ForegroundColor White
pnpm run clean

Write-Host "`nPackaging extension (watch for prepublish hook)..." -ForegroundColor White
pnpm run vscode:package

$test1Pass = Test-Path python-ast-visualization-0.1.0.vsix
if ($test1Pass) {
    Write-Host "`n✅ Test 1 PASSED: VSIX created successfully" -ForegroundColor Green
} else {
    Write-Host "`n❌ Test 1 FAILED: VSIX not created" -ForegroundColor Red
    exit 1
}

# Test 2: Extract VSIX
Write-Host "`nTest 2: Extract VSIX and Verify Structure" -ForegroundColor Yellow
Write-Host "------------------------------------------`n" -ForegroundColor Yellow

Write-Host "Extracting VSIX..." -ForegroundColor White
Expand-Archive python-ast-visualization-0.1.0.vsix .vsix-extracted-test -Force

$test2Pass = Test-Path .vsix-extracted-test/extension/
if ($test2Pass) {
    Write-Host "✅ Test 2 PASSED: VSIX extracted successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Test 2 FAILED: Extraction failed" -ForegroundColor Red
    exit 1
}

# Test 3: Hash Comparison
Write-Host "`nTest 3: Verify Code Freshness (Hash Comparison)" -ForegroundColor Yellow
Write-Host "------------------------------------------------`n" -ForegroundColor Yellow

$workspaceHash = (Get-FileHash out/extension.js -Algorithm MD5).Hash
$vsixHash = (Get-FileHash .vsix-extracted-test/extension/out/extension.js -Algorithm MD5).Hash

Write-Host "Workspace extension.js: $workspaceHash" -ForegroundColor Cyan
Write-Host "VSIX extension.js:      $vsixHash" -ForegroundColor Cyan

$test3Pass = ($workspaceHash -eq $vsixHash)
if ($test3Pass) {
    Write-Host "`n✅ Test 3 PASSED: Hashes match - VSIX contains current code" -ForegroundColor Green
} else {
    Write-Host "`n❌ Test 3 FAILED: Hashes do not match - VSIX contains stale code" -ForegroundColor Red
    Write-Host "THIS IS CRITICAL - Bug fix has failed!" -ForegroundColor Red
    exit 1
}

# Test 4: Pattern Verification
Write-Host "`nTest 4: Binary Resolution Logic Verification" -ForegroundColor Yellow
Write-Host "---------------------------------------------`n" -ForegroundColor Yellow

$binaryResolverMatches = Select-String -Path .vsix-extracted-test/extension/out/extension.js -Pattern "binaryResolver" -AllMatches
$binaryResolverCount = if ($binaryResolverMatches) { $binaryResolverMatches.Matches.Count } else { 0 }

$resolvePathMatches = Select-String -Path .vsix-extracted-test/extension/out/extension.js -Pattern "resolveBinaryPath" -AllMatches
$resolvePathCount = if ($resolvePathMatches) { $resolvePathMatches.Matches.Count } else { 0 }

Write-Host "binaryResolver references:    $binaryResolverCount" -ForegroundColor Cyan
Write-Host "resolveBinaryPath references: $resolvePathCount" -ForegroundColor Cyan

$test4Pass = ($binaryResolverCount -gt 0 -and $resolvePathCount -gt 0)
if ($test4Pass) {
    Write-Host "`n✅ Test 4 PASSED: Binary resolution logic present" -ForegroundColor Green
} else {
    Write-Host "`n❌ Test 4 FAILED: Binary resolution logic missing" -ForegroundColor Red
    exit 1
}

# Test 5: Binary File
Write-Host "`nTest 5: Binary File Inclusion Verification" -ForegroundColor Yellow
Write-Host "-------------------------------------------`n" -ForegroundColor Yellow

$test5Pass = Test-Path .vsix-extracted-test/extension/bin/python_service-win-x64.exe
if ($test5Pass) {
    $binaryInfo = Get-Item .vsix-extracted-test/extension/bin/python_service-win-x64.exe
    $binarySizeMB = [math]::Round($binaryInfo.Length / 1MB, 2)
    Write-Host "✅ Test 5 PASSED: Binary file included ($binarySizeMB MB)" -ForegroundColor Green
} else {
    Write-Host "❌ Test 5 FAILED: Binary file missing" -ForegroundColor Red
    exit 1
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "✅ Test 1: Package VSIX with Prepublish Hook" -ForegroundColor Green
Write-Host "✅ Test 2: Extract VSIX and Verify Structure" -ForegroundColor Green
Write-Host "✅ Test 3: Verify Code Freshness (Hash Match)" -ForegroundColor Green
Write-Host "✅ Test 4: Binary Resolution Logic Present" -ForegroundColor Green
Write-Host "✅ Test 5: Binary File Included" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✅ ALL TESTS PASSED - TASK 03 COMPLETE" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "The VSIX package contains current compiled code with binary resolution logic." -ForegroundColor White
Write-Host "Ready to proceed to Task 04 (VSIX functionality testing).`n" -ForegroundColor White
```

Save this as `_bugs/binary-execution-failure-9009/verify-vsix.ps1` for reusability.
