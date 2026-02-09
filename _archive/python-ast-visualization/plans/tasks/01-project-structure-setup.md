# Task Plan: 01-project-structure-setup

## Overview

Create foundational project structure and configuration files for the Python AST visualization feature. Establishes build system, dependency management, and development environment for Python, Node.js, and VS Code extension.

## Files to Create/Modify

| File | Action |
|------|--------|
| `pyproject.toml` | Create – Python 3.12, pydantic, dev deps, ruff, mypy config |
| `package.json` | Create – VS Code extension, TypeScript, Rete.js, React, Tailwind |
| `install.sh` | Create – uv venv, activate, pip install, pytest |
| `.vscode/launch.json` | Create – Extension development host |
| `.vscode/tasks.json` | Create – TypeScript compile, webview bundle, test tasks |

## Test Strategy

No unit tests for config files. Manual validation only:
1. Run `install.sh` → verify venv, Python deps, Node deps
2. Launch extension via launch.json → verify activation
3. Run build tasks → verify TypeScript compiles, webview bundles

## Implementation Order

1. Create `pyproject.toml` with [project], [tool.ruff], [tool.mypy]
2. Create `package.json` with extension manifest, scripts, dependencies
3. Create `install.sh` (cross-platform: detect OS, use `uv`)
4. Create `.vscode/launch.json` with Extension Development Host
5. Create `.vscode/tasks.json` with compile, bundle-webview, test tasks

## Validation Steps

- `install.sh` executes successfully
- `.venv` created
- `uv pip install -e .` succeeds
- `pnpm install` succeeds
- Extension debugs via launch configuration

## Documentation Updates

None (foundation task).
