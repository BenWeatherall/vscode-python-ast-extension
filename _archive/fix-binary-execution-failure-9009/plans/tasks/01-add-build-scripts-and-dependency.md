# Task Implementation Plan: Add Build Scripts and Dependency

## Overview

This task adds the foundational infrastructure for automated clean builds by modifying `package.json` to include:
1. The `rimraf` dependency for cross-platform directory deletion
2. Three new npm scripts that enable clean builds and automatic pre-packaging compilation

This is the first task in the bug fix sequence and has no dependencies on other tasks.

**Contribution to Fix**: Establishes the build automation mechanism that prevents stale artifacts from being packaged into VSIX files. The `vscode:prepublish` lifecycle hook will be automatically executed by VSCE before every package operation.

## Files to Create/Modify

### File: `package.json`

**Location**: `d:\Code\python-vis\package.json`

**Changes Required**: 2 sections to modify

#### Change 1: Add rimraf to devDependencies

**Section**: `devDependencies` object

**Current State** (lines 52-65):
```json
"devDependencies": {
  "esbuild": "^0.24.0",
  "@testing-library/jest-dom": "^6.9.1",
  "@testing-library/react": "^16.3.2",
  "@types/jest": "^29.0.0",
  "@types/node": "^20.0.0",
  "@types/react": "^18.0.0",
  "@types/react-dom": "^18.0.0",
  "@vscode/vsce": "^3.7.1",
  "jest": "^29.0.0",
  "jest-environment-jsdom": "^30.2.0",
  "ts-jest": "^29.0.0",
  "typescript": "^5.0.0"
}
```

**After Modification**:
```json
"devDependencies": {
  "esbuild": "^0.24.0",
  "@testing-library/jest-dom": "^6.9.1",
  "@testing-library/react": "^16.3.2",
  "@types/jest": "^29.0.0",
  "@types/node": "^20.0.0",
  "@types/react": "^18.0.0",
  "@types/react-dom": "^18.0.0",
  "@vscode/vsce": "^3.7.1",
  "jest": "^29.0.0",
  "jest-environment-jsdom": "^30.2.0",
  "rimraf": "^5.0.0",
  "ts-jest": "^29.0.0",
  "typescript": "^5.0.0"
}
```

**Insertion Point**: After `"jest-environment-jsdom": "^30.2.0",` and before `"ts-jest": "^29.0.0",`

**Rationale**: Alphabetical ordering within devDependencies

#### Change 2: Add build automation scripts

**Section**: `scripts` object

**Current State** (lines 30-38):
```json
"scripts": {
  "compile": "tsc -p .",
  "watch": "tsc -p . -w",
  "build": "npm run compile && npm run bundle-webview",
  "bundle-webview": "esbuild webview-ui/src/index.tsx --bundle --outfile=out/media/webview.js --format=iife --global-name=webviewBundle && npx tailwindcss -i webview-ui/src/index.css -o out/media/webview.css -c webview-ui/tailwind.config.js --minify",
  "build:python-binaries": "node scripts/build-binaries.js",
  "vscode:package": "vsce package",
  "test": "jest",
  "test:python": "python -m pytest tests/ -v"
}
```

**After Modification**:
```json
"scripts": {
  "build": "npm run compile && npm run bundle-webview",
  "build:clean": "npm run clean && npm run build",
  "build:python-binaries": "node scripts/build-binaries.js",
  "bundle-webview": "esbuild webview-ui/src/index.tsx --bundle --outfile=out/media/webview.js --format=iife --global-name=webviewBundle && npx tailwindcss -i webview-ui/src/index.css -o out/media/webview.css -c webview-ui/tailwind.config.js --minify",
  "clean": "rimraf out",
  "compile": "tsc -p .",
  "test": "jest",
  "test:python": "python -m pytest tests/ -v",
  "vscode:package": "vsce package",
  "vscode:prepublish": "npm run build:clean",
  "watch": "tsc -p . -w"
}
```

**New Scripts Added**:
1. `"clean": "rimraf out"` - Removes the entire `out/` directory
2. `"build:clean": "npm run clean && npm run build"` - Performs clean build (delete + compile + bundle)
3. `"vscode:prepublish": "npm run build:clean"` - Lifecycle hook automatically executed by VSCE before packaging

**Script Ordering**: Alphabetical (matches existing convention in the project)

### File: `pnpm-lock.yaml` (Auto-generated)

**Location**: `d:\Code\python-vis\pnpm-lock.yaml`

**Changes**: Automatically updated by `pnpm install`

**Expected Changes**:
- New entry for `rimraf@^5.0.0` in dependency tree
- Updated integrity hashes
- Updated dependency graph

**Action Required**: None (file updates automatically during installation)

## Test Strategy

**Testing Approach**: Validation-based testing

Since this task only modifies configuration files (not code logic), we cannot write traditional unit tests. Instead, we validate the changes through:

1. **Dependency Installation Validation**: Verify rimraf installs correctly
2. **Configuration Syntax Validation**: Verify package.json is valid JSON with no syntax errors
3. **Script Listing Validation**: Verify npm/pnpm recognizes all scripts

**No Functional Testing**: Script functionality testing is deferred to Task 02 per separation of concerns.

## Implementation Order

Follow these steps sequentially:

### Step 1: Backup Current Configuration (Safety)

**Action**: Create backup of current `package.json`

**Commands**:
```powershell
Copy-Item package.json package.json.backup
```

**Purpose**: Enable quick rollback if needed

**Success Indicator**: `package.json.backup` file exists

### Step 2: Modify package.json - Add rimraf Dependency

**Action**: Add `"rimraf": "^5.0.0"` to `devDependencies`

**Tool**: Use StrReplace to insert the line

**Exact Change**:
- **Old String** (to find unique location):
```json
  "jest-environment-jsdom": "^30.2.0",
  "ts-jest": "^29.0.0",
```

- **New String** (with rimraf added):
```json
  "jest-environment-jsdom": "^30.2.0",
  "rimraf": "^5.0.0",
  "ts-jest": "^29.0.0",
```

**Verification**: Read package.json and confirm rimraf entry exists

### Step 3: Modify package.json - Add Build Scripts

**Action**: Replace entire `scripts` section with alphabetically ordered version including new scripts

**Tool**: Use StrReplace to replace the entire scripts object

**Exact Change**:
- **Old String** (entire scripts section):
```json
  "scripts": {
    "compile": "tsc -p .",
    "watch": "tsc -p . -w",
    "build": "npm run compile && npm run bundle-webview",
    "bundle-webview": "esbuild webview-ui/src/index.tsx --bundle --outfile=out/media/webview.js --format=iife --global-name=webviewBundle && npx tailwindcss -i webview-ui/src/index.css -o out/media/webview.css -c webview-ui/tailwind.config.js --minify",
    "build:python-binaries": "node scripts/build-binaries.js",
    "vscode:package": "vsce package",
    "test": "jest",
    "test:python": "python -m pytest tests/ -v"
  },
```

- **New String** (with new scripts added and alphabetically sorted):
```json
  "scripts": {
    "build": "npm run compile && npm run bundle-webview",
    "build:clean": "npm run clean && npm run build",
    "build:python-binaries": "node scripts/build-binaries.js",
    "bundle-webview": "esbuild webview-ui/src/index.tsx --bundle --outfile=out/media/webview.js --format=iife --global-name=webviewBundle && npx tailwindcss -i webview-ui/src/index.css -o out/media/webview.css -c webview-ui/tailwind.config.js --minify",
    "clean": "rimraf out",
    "compile": "tsc -p .",
    "test": "jest",
    "test:python": "python -m pytest tests/ -v",
    "vscode:package": "vsce package",
    "vscode:prepublish": "npm run build:clean",
    "watch": "tsc -p . -w"
  },
```

**Verification**: Read package.json and confirm all three new scripts exist

### Step 4: Install rimraf Dependency

**Action**: Run pnpm install to add rimraf to node_modules

**Command**:
```powershell
pnpm install
```

**Expected Output**:
- "Progress: resolved X, reused Y, downloaded Z"
- "dependencies: +1" (or similar indicating new package)
- No error messages

**Success Indicator**: Command exits with code 0

### Step 5: Verify rimraf Installation

**Action**: Confirm rimraf package is installed and available

**Command**:
```powershell
pnpm list rimraf
```

**Expected Output**:
```
python-ast-visualization@0.1.0 D:\Code\python-vis
└── rimraf@5.0.x
```

**Success Indicator**: rimraf shows version 5.0.x (or latest 5.x)

### Step 6: Verify pnpm-lock.yaml Updated

**Action**: Confirm lock file contains rimraf entries

**Command**:
```powershell
Select-String -Path pnpm-lock.yaml -Pattern "rimraf" -Context 0,2
```

**Expected Output**: Multiple matches showing rimraf package entries

**Success Indicator**: At least one match found

### Step 7: Verify Script Registration

**Action**: Confirm pnpm recognizes all scripts without errors

**Command**:
```powershell
pnpm run
```

**Expected Output**: List of available scripts including:
- `clean`
- `build:clean`
- `vscode:prepublish`

**Success Indicator**: All three new scripts appear in the list, no JSON parsing errors

## Validation Steps

Execute these validation checks after implementation:

### Validation 1: Dependency Verification

**Command**:
```powershell
pnpm list rimraf
```

**Pass Criteria**: 
- ✅ Shows `rimraf@5.0.x` under project dependencies
- ✅ No error messages

**Fail Criteria**:
- ❌ "No matches found"
- ❌ Version mismatch (not 5.x)

### Validation 2: Lock File Verification

**Command**:
```powershell
Test-Path pnpm-lock.yaml
(Select-String -Path pnpm-lock.yaml -Pattern "rimraf").Count -gt 0
```

**Pass Criteria**:
- ✅ pnpm-lock.yaml exists
- ✅ Contains rimraf entries
- ✅ File modified timestamp is recent

**Fail Criteria**:
- ❌ Lock file not updated
- ❌ No rimraf entries

### Validation 3: Script Syntax Verification

**Command**:
```powershell
pnpm run
```

**Pass Criteria**:
- ✅ No JSON parsing errors
- ✅ All scripts listed
- ✅ Three new scripts present:
  - `clean`
  - `build:clean`
  - `vscode:prepublish`

**Fail Criteria**:
- ❌ JSON syntax error
- ❌ Missing scripts
- ❌ Script registration errors

### Validation 4: Configuration Integrity

**Command**:
```powershell
Get-Content package.json | ConvertFrom-Json | Format-List
```

**Pass Criteria**:
- ✅ Valid JSON (no parsing errors)
- ✅ All original properties preserved
- ✅ New entries present in correct locations

**Fail Criteria**:
- ❌ JSON parsing fails
- ❌ Original properties missing
- ❌ Malformed JSON structure

## Common Pitfalls to Avoid

### Pitfall 1: Incorrect Script Naming

**Problem**: Using underscores instead of colons in script names

**Example**: `vscode_prepublish` instead of `vscode:prepublish`

**Impact**: VSCE will NOT recognize the lifecycle hook (colon is required)

**Prevention**: Double-check script name is exactly `vscode:prepublish`

### Pitfall 2: Incorrect Alphabetical Ordering

**Problem**: Not maintaining alphabetical order in scripts or dependencies

**Impact**: Inconsistent with project conventions, harder to maintain

**Prevention**: Verify alphabetical order after modifications

### Pitfall 3: JSON Syntax Errors

**Problem**: Missing commas, trailing commas, or incorrect quotes

**Example**: Missing comma after adding rimraf entry

**Impact**: package.json becomes invalid, all npm/pnpm commands fail

**Prevention**: Validate JSON syntax after each change

### Pitfall 4: Wrong rimraf Version

**Problem**: Using rimraf v4 or v6 instead of v5

**Impact**: May have breaking API changes or missing features

**Prevention**: Explicitly specify `^5.0.0` (caret allows 5.x.x)

### Pitfall 5: Not Running pnpm install

**Problem**: Modifying package.json but forgetting to run `pnpm install`

**Impact**: rimraf not actually installed, clean script will fail

**Prevention**: Always run `pnpm install` after modifying dependencies

### Pitfall 6: Testing Script Functionality

**Problem**: Trying to test script functionality in this task

**Impact**: Scope creep, mixing configuration changes with functional testing

**Prevention**: This task ONLY verifies configuration changes. Functional testing is Task 02.

## Rollback Procedure

If any step fails, follow this rollback procedure:

### Rollback Step 1: Restore Backup

**Condition**: If JSON syntax errors or breaking changes occur

**Action**:
```powershell
Copy-Item package.json.backup package.json -Force
```

**Verification**: Confirm package.json restored

### Rollback Step 2: Clean pnpm Cache

**Condition**: If dependency installation corrupted

**Action**:
```powershell
Remove-Item node_modules -Recurse -Force
Remove-Item pnpm-lock.yaml -Force
pnpm install
```

**Verification**: Clean installation completes successfully

### Rollback Step 3: Verify Clean State

**Command**:
```powershell
pnpm run
pnpm test
```

**Verification**: Original functionality works correctly

## Documentation Updates

### This Task: No Documentation Updates

**Rationale**: This task only modifies internal configuration. User-facing documentation updates are NOT required until the full fix is validated.

**Deferred to Later Tasks**:
- README.md updates (if any) - after Task 04 (VSIX validation)
- CHANGELOG.md entry - after Task 05 (regression testing complete)
- Developer documentation - after full bug fix validation

### Future Documentation Needs

After the complete bug fix is validated (all 5 tasks complete):

1. **README.md** (if packaging workflow documented):
   - Note that `vscode:package` automatically runs clean builds
   - Developers no longer need to manually run build before packaging

2. **CHANGELOG.md**:
   - Add entry: "Fixed: Extension fails with exit code 9009 when installed from VSIX"
   - Add entry: "Added: Automated clean builds before packaging via vscode:prepublish hook"

3. **.cursor/scratchpad.md**:
   - Update with task completion status
   - Record plan location

## Success Criteria

Task 01 is considered complete when ALL of the following are true:

- ✅ `package.json` contains `"rimraf": "^5.0.0"` in devDependencies
- ✅ `package.json` contains `"clean": "rimraf out"` in scripts
- ✅ `package.json` contains `"build:clean": "npm run clean && npm run build"` in scripts
- ✅ `package.json` contains `"vscode:prepublish": "npm run build:clean"` in scripts
- ✅ Scripts maintain alphabetical ordering
- ✅ `pnpm install` completes successfully (exit code 0)
- ✅ `pnpm list rimraf` shows rimraf version 5.x.x
- ✅ `pnpm-lock.yaml` contains rimraf entries
- ✅ `pnpm run` lists all scripts without errors
- ✅ `package.json` is valid JSON (no syntax errors)
- ✅ All original package.json content preserved
- ✅ Backup file created (`package.json.backup`)

## Risk Assessment

**Overall Risk**: LOW

### Risk 1: Dependency Installation Failure

**Probability**: Very Low  
**Impact**: Low (easy rollback)  
**Mitigation**: rimraf is a mature, stable package used by 100,000+ npm packages

### Risk 2: JSON Syntax Error

**Probability**: Low  
**Impact**: Medium (breaks all npm commands until fixed)  
**Mitigation**: 
- Use automated tools (StrReplace) for modifications
- Validate JSON after each change
- Maintain backup for quick rollback

### Risk 3: Script Name Typo

**Probability**: Low  
**Impact**: High (hook won't work, bug not fixed)  
**Mitigation**: 
- Exact string matching in implementation
- Validation step checks script names
- Task 02 will test functionality

### Risk 4: Version Incompatibility

**Probability**: Very Low  
**Impact**: Low (rimraf API stable across 5.x)  
**Mitigation**: Specify `^5.0.0` to lock to 5.x major version

## Time Estimate

**Estimated Duration**: 5-10 minutes

**Breakdown**:
- Backup package.json: 30 seconds
- Modify devDependencies: 2 minutes
- Modify scripts section: 2 minutes
- Run pnpm install: 1-2 minutes
- Validation checks: 2-3 minutes
- Documentation: 1 minute

**Contingency**: +5 minutes for troubleshooting if issues arise

## Next Task

After completing this task and verifying all success criteria:

**Proceed to**: Task 02 - Validate Build System

**File**: `_bugs/binary-execution-failure-9009/tasks/02-validate-build-system.md`

**Dependency**: Task 02 requires Task 01 to be fully complete and validated
