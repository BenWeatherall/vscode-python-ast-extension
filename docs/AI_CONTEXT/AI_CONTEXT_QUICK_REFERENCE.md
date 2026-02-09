## Metadata

- **Version**: 1.1
- **Last Updated**: 2026-02-09
- **Tags**: quick-reference, commands, configuration, environment, troubleshooting
- **Cross-References**:
  - `AI_CONTEXT_REPOSITORY.md` — architecture and data flow
  - `AI_CONTEXT_PATTERNS.md` — code patterns and conventions
  - `AI_CONTEXT_PYTHON_SERVICE.md` — Python service details
  - `AI_CONTEXT_WEBVIEW_UI.md` — webview UI architecture
  - `AI_CONTEXT_EXTENSION_HOST.md` — extension host details

---

## Project Summary

- **Name**: `python-vis`
- **Purpose**: VS Code extension that visualizes Python ASTs as interactive Rete.js graphs.
- **Architecture**: Sidecar model with three main components:
  - `python_service/` — Python AST parser and Rete graph producer
  - `src/` — VS Code extension host (TypeScript)
  - `webview-ui/` — React + Rete.js webview graph UI

---

## Environment & Versions

- **Python**: `>= 3.12` (strict typing, mypy strict mode)
- **Node.js**: Version compatible with VS Code 1.80+ (follow VS Code engine)
- **Package managers**:
  - **Python**: `uv` + `pyproject.toml` (`hatchling` build backend)
  - **Node**: `pnpm`
- **Core Python deps** (from `pyproject.toml`):
  - `pydantic>=2.0.0`
- **Dev Python deps**:
  - `pytest>=7.0.0`, `pytest-cov>=4.0.0`
  - `ruff>=0.1.0`
  - `mypy>=1.0.0`

---

## Key Commands (Shell)

All commands assume repository root and a configured environment (see install script).

### Setup

```bash
# Initial install (creates .venv with uv, installs Node + Python deps, runs tests)
./install.sh

# On Windows (Git Bash / WSL)
bash install.sh
```

### Python Service

```bash
# Run tests for python_service
python -m pytest tests/python_service -v

# Type checking
mypy python_service/

# Linting + formatting
ruff check . --fix
ruff format .
```

### Webview UI & Extension Host

```bash
# Install Node deps
pnpm install

# TypeScript / Node tests
pnpm test

# Compile extension (TypeScript only)
pnpm run compile

# Full build (extension + webview bundle)
pnpm run build

# Bundle webview UI separately
pnpm run bundle-webview

# Watch mode during development
pnpm run watch
```

### Quality Gates

Before committing, ensure these pass:

```bash
# Python tests (all)
python -m pytest tests -v

# TypeScript tests
pnpm test

# Python linting & formatting
ruff check . --fix
ruff format .

# Python type checking
mypy python_service/

# Extension compilation
pnpm run compile
```

---

## Runtime Entry Points

- **Python service CLI**:
  - Module: `python_service.__main__.main`
  - Invocation: `python -m python_service`
  - Behavior: Starts stdio JSON-RPC-like server (`ASTParseServer.start_server`).

- **VS Code extension**:
  - File: `src/extension.ts`
  - `activate(context: vscode.ExtensionContext)`:
    - Instantiates `PythonClient`
    - Registers command `python-ast.visualize`
    - Subscribes to `workspace.onDidSaveTextDocument` for auto-refresh
  - `deactivate()`:
    - Stops Python service and disposes resources.

- **Webview UI**:
  - File: `webview-ui/src/index.tsx`
  - Bootstraps React root with `<App getVscodeApi={...} />` and VS Code webview API.

---

## Core Interfaces & Protocols (Quick View)

### Python Service JSON Protocol

- **Request** (from extension → Python service):

```json
{
  "method": "parse",
  "params": {
    "sourceCode": "<python source code>"
  }
}
```

- **Success Response**:

```json
{
  "result": {
    "nodes": [
      {
        "id": "n0",
        "label": "FunctionDef",
        "inputs": {},
        "outputs": { "body": {} },
        "data": {
          "ast_type": "FunctionDef",
          "lineno": 1,
          "col_offset": 0,
          "name": "foo"
        },
        "position": null
      }
    ],
    "connections": []
  }
}
```

- **Error Response**:

```json
{
  "error": {
    "code": -32700,
    "message": "Syntax error: invalid syntax at line 3, column 5"
  }
}
```

See `python_service/server.py` for exact error codes and formatting.

### Extension ↔ Webview Messages

- **Extension → Webview** (`src/types.ts`, `webview-ui/src/types.ts`):
  - `type: "updateGraph"` with `graph: ReteGraph`
  - `type: "error"` with `error: string`
  - `type: "loading"` with `message?: string`

- **Webview → Extension**:
  - `type: "navigateToSource"`, `lineno?: number`, `colOffset?: number`
  - `type: "retry"` (request re-parse)

---

## Configuration & Conventions

- **Linting / style**:
  - Python:
    - `ruff` with `line-length = 100`, `target-version = "py312"`
    - `mypy` strict: `python_version = "3.12"`, `strict = true`
  - TypeScript:
    - React + Rete.js, strongly typed interfaces for graph and messages.

- **Data contracts**:
  - Python models (`python_service/schema.py`):
    - `NodeData`, `ReteNode`, `ReteConnection`, `ReteGraph` via Pydantic.
  - TypeScript equivalents:
    - `src/types.ts` and `webview-ui/src/types.ts`.
  - Conversion:
    - `src/conversion.ts` and `webview-ui/src/conversion.ts` handle snake_case ↔ camelCase.

---

## Frequently Used Imports (Cheat Sheet)

- **Python service**:

```python
from python_service.parser import ReteConverter
from python_service.server import ASTParseServer
from python_service.schema import NodeData, ReteNode, ReteConnection, ReteGraph
```

- **Extension host**:

```ts
import * as vscode from "vscode";
import { PythonClient } from "./pythonClient";
import type { ReteGraph } from "./types";
```

- **Webview UI**:

```ts
import { ReteASTEditor } from "./editor";
import type { ReteGraph, VSCodeMessage } from "./types";
```

---

## Quick Troubleshooting Hints

- **Python service not starting**:
  - Verify Python 3.12+ is installed: `python --version`
  - Check virtual environment exists: `ls .venv/` (or `.venv\Scripts\` on Windows)
  - Ensure venv is activated: `source .venv/bin/activate` (Unix) or `.venv\Scripts\activate` (Windows)
  - Test service directly: `python -m python_service` (should wait for stdin)
  - If missing, rerun `./install.sh` or `bash install.sh` (Windows)

- **No AST graph / blank webview**:
  - Confirm `python-ast.visualize` command executed on a `.py` file
  - Check extension Output channel: "Python AST Visualization" for errors
  - Verify webview bundle exists: `ls out/media/webview.js`
  - Rebuild if needed: `pnpm run build`

- **Auto-refresh not working**:
  - Ensure file is a Python document (`languageId === "python"`) with `uri.scheme === "file"`
  - Confirm a visualization panel exists for that document URI
  - Check debounce timer (400ms) hasn't been cleared

- **Parse errors / syntax errors**:
  - Check Python syntax in the source file
  - Review error message in webview (includes line/column if available)
  - Use "Retry" button in webview to re-parse after fixing code
  - Check Output channel for detailed error logs

- **Build/compilation errors**:
  - Clear build artifacts: `rm -rf out/` then `pnpm run build`
  - Ensure all Node deps installed: `pnpm install`
  - Check TypeScript version: `pnpm list typescript`
  - Verify VS Code engine compatibility: `^1.80.0` in `package.json`

- **Extension doesn't load in VS Code**:
  - Ensure VS Code version is 1.80 or higher
  - Check extension compiled: `ls out/extension.js`
  - Reload VS Code window: `Ctrl+Shift+P` → "Developer: Reload Window"
  - Check VS Code Developer Console for activation errors

