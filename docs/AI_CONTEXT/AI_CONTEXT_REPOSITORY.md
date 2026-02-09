## Metadata

- **Version**: 1.1
- **Last Updated**: 2026-02-09
- **Tags**: architecture, repository, components, data-flow
- **Cross-References**:
  - `AI_CONTEXT_QUICK_REFERENCE.md` - Environment, commands, troubleshooting
  - `AI_CONTEXT_PATTERNS.md` - Code organization, typing, testing patterns
  - `AI_CONTEXT_PYTHON_SERVICE.md` - Python service architecture and API
  - `AI_CONTEXT_WEBVIEW_UI.md` - Webview React + Rete.js implementation
  - `AI_CONTEXT_EXTENSION_HOST.md` - VS Code extension host integration

---

## High-Level Overview

**Goal**: Visualize Python source files as interactive AST graphs inside VS Code.

**Sidecar architecture** (three main components):

- **Python service** (`python_service/`)
  - Parses Python code using `ast` and emits a Rete.js-compatible graph in JSON form.
  - Implements a simple JSON-RPC-like protocol over stdio.
- **Extension host** (`src/`)
  - VS Code extension entry point.
  - Spawns and manages the Python service process.
  - Reads editor content, requests parsing, and forwards graphs to the webview.
  - Handles navigation requests from the graph back to source locations.
- **Webview UI** (`webview-ui/`)
  - React + Rete.js front-end rendered in a VS Code webview.
  - Renders graph nodes and connections.
  - Sends navigation and retry messages back to the extension.

---

## Directory Structure (Relevant Parts)

Simplified structure focused on runtime components:

```text
python-vis/
├── python_service/           # Python AST parsing service
│   ├── __init__.py
│   ├── __main__.py           # Entry point: python -m python_service
│   ├── parser.py             # ReteConverter (ast.NodeVisitor → ReteGraph)
│   ├── schema.py             # Pydantic models: Socket, NodeData, ReteNode, ReteConnection, ReteGraph
│   └── server.py             # ASTParseServer (stdio JSON-RPC-like server)
├── src/                      # VS Code extension host (TypeScript)
│   ├── __mocks__/            # VS Code API mocks for testing
│   │   └── vscodeMock.ts
│   ├── __tests__/            # Extension host unit tests
│   │   ├── extension.test.ts
│   │   └── pythonClient.test.ts
│   ├── extension.ts          # activate/deactivate, command registration, webview panels
│   ├── pythonClient.ts       # PythonClient (spawns python -m python_service, parseAST)
│   ├── types.ts              # TS Rete graph and message types (extension-side)
│   └── conversion.ts         # Python → TS graph conversion (snake_case ↔ camelCase)
├── webview-ui/               # Webview React + Rete.js UI
│   ├── index.html            # Webview HTML entry point
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   ├── tsconfig.json         # TypeScript configuration
│   └── src/
│       ├── __tests__/        # Webview UI unit tests
│       │   ├── App.test.tsx
│       │   ├── editor.test.ts
│       │   ├── nodes/index.test.ts
│       │   ├── styles.test.ts
│       │   └── types.test.ts
│       ├── index.tsx         # Webview entry, bootstraps <App>
│       ├── App.tsx           # Main React app, message handling and error UI
│       ├── editor.tsx        # ReteASTEditor (AST graph editor wrapper)
│       ├── types.ts          # TS Rete graph + VSCodeMessage types (webview-side)
│       ├── conversion.ts     # Python → TS graph conversion (webview-side)
│       ├── nodes/            # Node components and factory
│       │   ├── ASTNode.tsx   # Base node component
│       │   ├── BinOpNode.tsx
│       │   ├── CallNode.tsx
│       │   ├── ClassDefNode.tsx
│       │   ├── FunctionDefNode.tsx
│       │   ├── NameNode.tsx
│       │   └── index.ts       # Node component factory (getNodeComponent)
│       ├── components/
│       │   └── NodeStyles.css # Node-specific styling
│       └── index.css         # Global styles, Tailwind hooks, VS Code theme vars
├── tests/                    # Test suites (Python and TypeScript)
│   ├── python_service/       # Python service unit tests
│   │   ├── test_main.py
│   │   ├── test_parser.py
│   │   ├── test_schema.py
│   │   └── test_server.py
│   ├── integration/          # End-to-end integration tests
│   │   └── e2e/
│   │       ├── auto-refresh.test.ts
│   │       ├── communication.test.ts
│   │       ├── error-handling.test.ts
│   │       ├── navigation.test.ts
│   │       ├── performance.test.ts
│   │       └── workflow.test.ts
│   ├── performance/          # Performance benchmarks
│   │   ├── performance.test.py
│   │   └── performance.test.ts
│   ├── error-handling/       # Error handling tests
│   │   └── error-handling.test.ts
│   └── test_placeholder.py
├── .cursor/                  # Cursor IDE configuration
│   ├── agents/               # Subagent definitions
│   ├── commands/             # Custom Cursor commands
│   ├── rules/                # Project rules and conventions
│   └── skills/               # AI context writer skills
├── docs/                     # Project documentation
│   └── AI_CONTEXT/           # AI context documentation files
├── _features/                # Feature design documents
└── _archive/                 # Archived planning documents
```

---

## Component Responsibilities

### Python Service (`python_service/`)

- **`schema.py`**:
  - Defines data contracts for graphs using Pydantic:
    - `Socket`: currently empty, but reserved for future metadata.
    - `NodeData`: core information about each AST node (`ast_type`, `lineno`, `col_offset`, plus extras via `extra="allow"`).
    - `ReteNode`: node id, label, input/output sockets, data, optional position.
    - `ReteConnection`: source/target node IDs and socket names.
    - `ReteGraph`: list of nodes and connections.

- **`parser.py`**:
  - `ReteConverter(ast.NodeVisitor)`:
    - Maintains in-memory lists of `ReteNode` and `ReteConnection`.
    - Provides deterministic IDs for AST nodes (`n0`, `n1`, …) via `_get_node_id`.
    - Implements specialized visitors:
      - `visit_Module`, `visit_Expr` for top-level statements.
      - `visit_BinOp`, `visit_Name`, `visit_FunctionDef`, `visit_ClassDef`, `visit_Pass`.
      - Control flow and data nodes: `visit_Call`, `visit_If`, `visit_For`, `visit_While`, `visit_Return`, `visit_Assign`, `visit_AugAssign`, `visit_Constant`, `visit_List`, `visit_Dict`.
    - Public API:
      - `parse_to_rete(source_code: str) -> ReteGraph`: parses Python code, visits AST, returns a Pydantic graph model.

- **`server.py`**:
  - `ASTParseServer`:
    - Wraps a `ReteConverter` and exposes stdio-based JSON protocol.
    - `handle_parse_request(source_code: str) -> dict`:
      - On success: returns `{"result": ReteGraph.model_dump()}`.
      - On `SyntaxError`: returns `{"error": {"code": PARSE_ERROR_CODE, "message": formatted_message}}`.
      - On other exceptions: returns `{"error": {"code": INTERNAL_ERROR_CODE, "message": formatted_message}}`.
    - `_parse_request(line: str) -> dict | None`:
      - Validates incoming JSON line.
      - Expects `{ "method": "parse", "params": {"sourceCode": "..."} }`.
      - Also supports `source_code` as a fallback key.
    - `start_server()`:
      - Continuous loop over `sys.stdin`, reading JSON lines, writing JSON responses line-by-line.
    - `stop_server()`:
      - Gracefully stops loop via `_running` flag.

- **`__main__.py`**:
  - `main()`:
    - Instantiates `ReteConverter` and `ASTParseServer`.
    - Installs `SIGTERM` / `SIGINT` handlers that call `stop_server` and exit.
    - Starts `start_server()` loop and handles `KeyboardInterrupt`.

### Extension Host (`src/`)

- **`types.ts`**:
  - TS equivalents of Python graph types:
    - `Socket`, `NodeData`, `ReteNode`, `ReteConnection`, `ReteGraph`.
  - Message types for extension ↔ webview:
    - `VSCodeMessageOut`: `"updateGraph"` or `"error"` plus payload (sent to webview).
    - `VSCodeMessageIn`: `"navigateToSource"` plus optional node/location info (received from webview).
    - Note: Extension also sends `"loading"` messages (inline typed) and handles `"retry"` messages.

- **`conversion.ts`**:
  - Defines Python JSON shapes (`PythonNodeData`, `PythonReteNode`, `PythonReteConnection`, `PythonReteGraph`).
  - `pythonNodeDataToTs`, `pythonNodeToTs`, `pythonConnectionToTs`, `pythonGraphToTs`:
    - Convert snake_case keys (`ast_type`, `col_offset`, `source_output`) to camelCase and TS interfaces.

- **`pythonClient.ts`**:
  - `PythonClient` class:
    - `spawnService()`:
      - `spawn("python", ["-m", "python_service"], { stdio: ["pipe", "pipe", "pipe"] })`.
      - Resolves on `"spawn"` event, rejects on `"error"` or non-zero `"exit"`.
      - Stores `ChildProcess` instance.
    - `parseAST(sourceCode: string) -> Promise<ReteGraph>`:
      - Sends one JSON line per request to service stdin.
      - Reads stdout streaming; splits by `\n` into discrete responses.
      - Parses each line into `ParseResponse`, handles `result` vs `error`.
      - Converts Python graph to TS graph via `pythonGraphToTs`.
      - Handles process exit and cleans up event listeners.
    - `stopService()`:
      - Kills process, destroys stdio streams, clears listeners.
    - `isServiceRunning()`:
      - Boolean helper based on `process` and `killed` flag.

- **`extension.ts`**:
  - Global singletons:
    - `pythonClient: PythonClient | null`
    - `outputChannel: vscode.OutputChannel | null`
    - Panel registry (`Map<string, PanelEntry[]>`) keyed by document URI.
    - Debounce timers (`Map<string, Timeout>`), `DEBOUNCE_MS = 400`.
  - Logging helpers:
    - `getOutputChannel()` and `logError(message, error?)`.
  - Panel management:
    - Register/unregister panels, lookup panels by URI.
  - Auto-refresh:
    - `handleAutoRefresh(document: TextDocument)`:
      - Filters for `languageId === "python"` and `uri.scheme === "file"`.
      - Uses a debounced function per document URI to:
        - Post `"loading"` messages to all panels.
        - Ensure Python service is running (`spawnService` if not).
        - Call `parseAST` and send `"updateGraph"`.
      - On errors: logs to Output channel and sends `"error"` to panels.
  - Activation / command:
    - `activate(context)`:
      - Instantiates `PythonClient`.
      - Subscribes to `workspace.onDidSaveTextDocument` → `handleAutoRefresh`.
      - Registers `python-ast.visualize`:
        - Validates active editor and Python language.
        - Spawns service, parses current document.
        - Creates visualization panel via `createVisualizationPanel`.
        - On parse errors:
          - Categorizes message as syntax, service, or generic parse error.
          - Shows user-friendly message via `window.showErrorMessage`.
          - Posts `"error"` to any existing panels for this URI.
  - Webview panel creation:
    - `createVisualizationPanel(context, pythonClient, documentUri, initialGraph)`:
      - Creates webview panel with `id = "pythonAstVisualization"`.
      - Sets `enableScripts: true`; `localResourceRoots` empty (internally uses `__dirname/media`).
      - HTML from `getWebviewHtml`, initial graph via `sendGraphToWebview`.
      - Registers `onDidReceiveMessage` handler:
        - `"navigateToSource"` → `handleNavigateToSource`.
        - `"retry"`:
          - Re-opens document, fetches text, uses `pythonClient` to re-parse.
          - Sends `"loading"` then `"updateGraph"` or `"error"` with contextual text.
      - On disposal: unregisters panel and disposes listener.
    - `handleNavigateToSource(documentUri, lineno?, colOffset?)`:
      - Opens document, reveals location in center, sets selection.

### Webview UI (`webview-ui/`)

- **`types.ts`**:
  - Graph types mirror the extension-side types for `ReteGraph`.
  - `VSCodeMessageType` union:
    - `"updateGraph" | "error" | "navigateToSource" | "loading" | "retry"`.
  - `VSCodeMessage` payload shape used in `App.tsx` message handler.

- **`conversion.ts`**:
  - Same conversion responsibilities as `src/conversion.ts`, but used within the webview for pure TS graphs when needed.

- **`editor.tsx`**:
  - `ReteASTEditor` class implements `ASTEditor` interface:
    - `initialize(container)`:
      - Sets up `NodeEditor`, `AreaPlugin`, `ReactPlugin`, `ConnectionPlugin`.
      - Registers React node render preset using `getNodeComponent` from `nodes/index.ts`.
      - Adds selection and ordering extensions.
    - `loadGraph(graph)`:
      - Clears current graph.
      - Creates `ClassicPreset.Node` instances for each `ReteNode` with inputs/outputs and `NodeData`.
      - Applies node positions when provided.
      - Adds connections between nodes.
      - Calls `AreaExtensions.zoomAt` to fit view.
    - `clearGraph()`:
      - Clears editor and internal node data map.
    - `getGraph()`:
      - Reconstructs a `ReteGraph` snapshot of current editor state.
    - `onNodeClick(handler)`:
      - Registers callbacks for node click events triggered by wrapper around node components.

- **`nodes/`**:
  - `ASTNode.tsx`:
    - Base React component for all nodes:
      - Renders title, optional body (line/column), inputs/outputs, and optional controls.
      - Uses `Presets.classic.NodeStyles` for Rete styling.
    - Location string formatted as `"L{lineno}:{colOffset}"` when data available.
  - `BinOpNode.tsx`, `CallNode.tsx`, `ClassDefNode.tsx`, `FunctionDefNode.tsx`, `NameNode.tsx`:
    - Thin wrappers around `ASTNode` that specialize labels and body content.
  - `index.ts`:
    - `getNodeComponent(astType: string)`:
      - Maps `"BinOp" | "Call" | "ClassDef" | "FunctionDef" | "Name"` to specialized nodes.
      - Falls back to `ASTNode` for unknown types.

- **`App.tsx`**:
  - Central React component managing:
    - Graph state (`graph`), `loading`, `error`, `loadingMessage`, `editorReady`.
    - `ReteASTEditor` lifecycle via `useRef`.
    - `window.postMessage` listener:
      - `"updateGraph"`: clears error, stops loading, debounces `setGraph`.
      - `"error"`: stops loading, records error string.
      - `"loading"`: shows loading spinner with message.
    - Node click handler:
      - Sends `"navigateToSource"` with `nodeId`, `lineno`, `colOffset`.
    - Retry handling:
      - On error view’s Retry button, posts `{ type: "retry" }`.
    - Error recovery suggestions:
      - Derived from error message content (syntax, service, line/column hints).

- **Styling**:
  - `index.css`:
    - Imports `NodeStyles.css` and Tailwind layers.
    - Defines global theme surface using VS Code CSS variables.
  - `components/NodeStyles.css`:
    - Card-like styling for `.ast-node-wrapper`, hover and selection states.
    - Background and text color honor VS Code theme variables.

---

## Data Flow

### End-to-End Flow (Happy Path)

```mermaid
flowchart LR
  Editor[VS Code Editor\nPython file] -->|Command: python-ast.visualize| ExtHost
  ExtHost[Extension Host\nsrc/extension.ts] -->|spawn python -m python_service\nsend {method:'parse', sourceCode}| PySvc
  PySvc[Python Service\npython_service] -->|ReteGraph JSON\n(result)| ExtHost
  ExtHost -->|postMessage {type:'updateGraph', graph}| Webview[Webview UI\nwebview-ui]
  Webview -->|render nodes & edges| User[Developer]
  User -->|click node| Webview
  Webview -->|postMessage {type:'navigateToSource', lineno, colOffset}| ExtHost
  ExtHost -->|showTextDocument at location| Editor
```

### Auto-Refresh Flow

1. User edits a Python file and saves it.
2. `workspace.onDidSaveTextDocument` triggers `handleAutoRefresh`.
3. `handleAutoRefresh`:
   - Confirms document is a Python file on disk.
   - Uses per-URI debounce to limit parse frequency.
   - Uses `PythonClient.parseAST` to re-parse content.
4. All panels registered for that URI receive:
   - `"loading"` message.
   - Then `"updateGraph"` with latest `ReteGraph` (or `"error"` on failure).

### Error/Retry Flow

1. If Python service returns error or communication fails:
   - Extension logs details to Output channel (`logError`).
   - Extension posts `"error"` message to webview(s) with user-friendly message.
   - Extension may also show `window.showErrorMessage` for critical errors.
2. Webview shows error banner with suggestions and "Retry" button (`App.tsx` error UI).
3. On Retry:
   - Webview posts `{ type: "retry" }` message.
   - Extension `onDidReceiveMessage` handler:
     - Re-opens document via `workspace.openTextDocument`.
     - Sends `"loading"` message to webview.
     - Ensures Python service is running (`spawnService` if needed).
     - Calls `parseAST` and sends `"updateGraph"` or `"error"` based on result.

---

## Service Boundaries & Dependencies

- **Service boundaries**:
  - Python AST service is a separate process with a narrow JSON interface:
    - Only one method: `"parse"`.
    - Single input: `sourceCode: string`.
    - Output: `result: PythonReteGraph` or `error`.
  - Extension host is the integration layer:
    - Has full access to VS Code APIs and file contents.
    - Converts between Python and TypeScript representations.
  - Webview UI is pure front-end:
    - Knows nothing about the Python process or VS Code APIs directly.
    - Only communicates via `postMessage` with typed payloads.

- **Dependencies**:
  - Python:
    - Standard library: `ast`, `json`, `signal`, `sys`, `typing`.
    - Pydantic 2+ for models and validation.
  - TypeScript (Extension Host):
    - `vscode` API for VS Code integration.
    - `child_process` for spawning Python service.
    - Node.js standard libraries for process management.
  - TypeScript (Webview UI):
    - Rete.js and plugins (`rete`, `rete-area-plugin`, `rete-connection-plugin`, `rete-react-plugin`).
    - React + `react-dom/client` for UI rendering.
    - Tailwind CSS for styling (via `tailwind.config.js`).

---

## Entry Points & How to Extend

- **Add new AST node types**:
  - Extend Python side:
    - Implement `visit_<NodeType>` in `ReteConverter` to emit `ReteNode` + connections.
  - Extend webview side:
    - Add new React node component in `webview-ui/src/nodes/`.
    - Register it in `nodes/index.ts` `TYPE_MAP`.

- **Add new messages between webview and extension**:
  - Update message type unions in:
    - `webview-ui/src/types.ts` (webview side) - includes all bidirectional message types.
    - `src/types.ts` (extension side) - currently only defines `VSCodeMessageOut` and `VSCodeMessageIn`; inline types used for `"loading"` and `"retry"`.
  - Implement handling:
    - `onDidReceiveMessage` handler in `extension.ts` `createVisualizationPanel`.
    - `window.addEventListener("message", ...)` in `App.tsx` `useEffect`.
  - Ensure message payloads match on both sides (TypeScript interfaces).

- **Add additional services / commands**:
  - Define new VS Code commands in `extension.ts` using `vscode.commands.registerCommand`.
  - If they require Python processing:
    - Reuse `PythonClient` or introduce new protocol methods (and update `ASTParseServer` accordingly).

