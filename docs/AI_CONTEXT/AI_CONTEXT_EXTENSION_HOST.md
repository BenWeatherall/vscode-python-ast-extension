## Metadata

- **Version**: 1.0
- **Last Updated**: 2026-02-09
- **Tags**: extension-host, vscode, integration, typescript
- **Cross-References**:
  - `AI_CONTEXT_REPOSITORY.md` - Overall architecture and component relationships
  - `AI_CONTEXT_QUICK_REFERENCE.md` - Environment, commands, troubleshooting
  - `AI_CONTEXT_PATTERNS.md` - Code organization, typing, testing patterns
  - `AI_CONTEXT_PYTHON_SERVICE.md` - Python service JSON protocol and models
  - `AI_CONTEXT_WEBVIEW_UI.md` - Webview React + Rete.js implementation

---

## Module Overview

The `src/` directory contains the VS Code extension host that bridges VS Code, the Python AST parsing service, and the webview UI.

**Key modules**:

- **`extension.ts`**: Extension entry point (`activate`, `deactivate`), command registration, webview panel lifecycle, auto-refresh orchestration, error logging
- **`pythonClient.ts`**: `PythonClient` class that spawns and communicates with `python -m python_service` via stdio JSON protocol
- **`types.ts`**: TypeScript interfaces for Rete graph structures (`ReteGraph`, `ReteNode`, `ReteConnection`, `NodeData`) and message contracts (`VSCodeMessageOut`, `VSCodeMessageIn`)
- **`conversion.ts`**: Conversion utilities between Python JSON (snake_case) and TypeScript types (camelCase): `pythonGraphToTs`, `pythonNodeDataToTs`, `pythonNodeToTs`, `pythonConnectionToTs`

---

## Activation & Deactivation

### `activate(context: ExtensionContext)`

On extension activation:

1. **Resolves binary path and creates `PythonClient` singleton**:
   ```typescript
   let binaryPath: string | null = null;
   try {
     binaryPath = resolveBinaryPath(context.extensionPath);
   } catch {
     binaryPath = null;
   }
   if (!binaryPath) {
     getOutputChannel().appendLine("Warning: ...");
   }
   pythonClient = new PythonClient(binaryPath);
   ```
   - Resolves platform-specific binary from extension `bin/` directory
   - Catches errors gracefully (development mode fallback)
   - Logs warning to Output channel if binary not found
   - Passes resolved path (or `null`) to `PythonClient`

2. **Registers `python-ast.visualize` command**:
   - Validates active editor exists and is a Python file
   - Spawns Python service if not running (`spawnService()`)
   - Parses current document content (`parseAST(sourceCode)`)
   - Creates visualization panel via `createVisualizationPanel()`
   - On parse errors:
     - Categorizes error (syntax, service, generic)
     - Logs to Output channel (`logError()`)
     - Shows user-friendly message (`window.showErrorMessage()`)
     - Sends `"error"` message to any existing panels for the document URI

3. **Subscribes to file save events**:
   ```typescript
   workspace.onDidSaveTextDocument((doc) => handleAutoRefresh(doc))
   ```
   - Auto-refresh triggers on Python file saves (debounced per URI)

### `deactivate()`

On deactivation:

- Clears panel registry (`panelRegistry.clear()`)
- Clears all debounce timers
- Stops Python service (`pythonClient.stopService()`)
- Disposes Output channel
- Resets singletons to `null`

---

## PythonClient Lifecycle (`pythonClient.ts`)

### Constructor

```typescript
constructor(binaryPath?: string | null)
```

- Accepts optional path to a bundled binary executable
- If `binaryPath` is provided (truthy string), `spawnService()` executes the binary directly
- If `null`, `undefined`, empty string, or omitted, falls back to `python -m python_service`
- Stored internally as `private readonly binaryPath: string | null`

### `spawnService(): Promise<void>`

Spawns the Python service process. Command depends on constructor configuration:

- **Binary path provided**: `spawn(binaryPath, [], { stdio: ["pipe", "pipe", "pipe"] })`
- **No binary path**: `spawn("python", ["-m", "python_service"], { stdio: ["pipe", "pipe", "pipe"] })`

- Resolves on `"spawn"` event
- Rejects on `"error"` or non-zero `"exit"` events
- Stores `ChildProcess` instance in `this.process`

### `parseAST(sourceCode: string): Promise<ReteGraph>`

Sends a parse request and waits for response:

1. **Validates service is running**: Throws if `process` or stdio streams are null
2. **Sends JSON-RPC-like request**:
   ```typescript
   {
     method: "parse",
     params: { sourceCode: "..." }
   }
   ```
   Written as a single JSON line to `stdin` with trailing `\n`
3. **Reads stdout streaming**:
   - Accumulates chunks in a buffer
   - Splits by `\n` to extract complete JSON lines
   - Parses each line as `ParseResponse`:
     - `{ result: PythonReteGraph }` → converts via `pythonGraphToTs()` and resolves
     - `{ error: { code, message } }` → rejects with error message
4. **Handles process exit**: If process exits before response, rejects with "Service unavailable"
5. **Cleans up listeners**: Removes stdout data and exit listeners after settling

### `stopService(): void`

Terminates the Python service:

- Calls `process.kill()`
- Removes all event listeners
- Destroys stdio streams (`stdin`, `stdout`, `stderr`)
- Sets `this.process = null`

### `isServiceRunning(): boolean`

Returns `true` if `process !== null && !process.killed`.

---

## Message Contracts (`types.ts` + `conversion.ts`)

### Graph Types

**TypeScript interfaces** (camelCase):

- `ReteGraph`: `{ nodes: ReteNode[], connections: ReteConnection[] }`
- `ReteNode`: `{ id, label, inputs, outputs, data: NodeData, position? }`
- `ReteConnection`: `{ source, sourceOutput, target, targetInput }`
- `NodeData`: `{ astType, lineno?, colOffset?, [key: string]: unknown }`

**Python JSON format** (snake_case, see `conversion.ts`):

- `PythonReteGraph`: `{ nodes: PythonReteNode[], connections: PythonReteConnection[] }`
- `PythonReteNode`: `{ id, label, inputs, outputs, data: PythonNodeData, position? }`
- `PythonNodeData`: `{ ast_type, lineno?, col_offset?, ... }`

**Conversion**: `pythonGraphToTs()` converts Python JSON → TypeScript types, handling:
- `ast_type` → `astType`
- `col_offset` → `colOffset`
- `source_output` → `sourceOutput`
- `target_input` → `targetInput`

### Extension → Webview Messages

**`VSCodeMessageOut`** (from `types.ts`):

```typescript
type: "updateGraph" | "error"
graph?: ReteGraph
error?: string
```

**Inline messages** (not in `types.ts`, used directly in `extension.ts`):

- `"loading"`: `{ type: "loading", message: string }`
  - Sent during auto-refresh and retry operations
  - Webview shows loading spinner

### Webview → Extension Messages

**`VSCodeMessageIn`** (from `types.ts`):

```typescript
type: "navigateToSource"
nodeId?: string
lineno?: number
colOffset?: number
```

**Inline messages** (handled in `createVisualizationPanel`):

- `"retry"`: `{ type: "retry" }`
  - Triggers re-parse of the document
  - Extension re-opens document, sends `"loading"`, calls `parseAST`, sends `"updateGraph"` or `"error"`

---

## Visualization Panel Management

### Panel Registry

Panels are tracked in a `Map<string, PanelEntry[]>` keyed by document URI string:

```typescript
interface PanelEntry {
  panel: vscode.WebviewPanel;
  documentUri: vscode.Uri;
}
```

- **Registration**: `registerPanel(entry)` adds panel to list for URI
- **Unregistration**: `unregisterPanel(panel)` removes panel on disposal
- **Lookup**: `getPanelsForUri(uri)` returns all panels for a document URI

### `createVisualizationPanel(context, pythonClient, documentUri, initialGraph)`

Creates and configures a webview panel:

1. **Creates panel**:
   ```typescript
   createWebviewPanel(
     "pythonAstVisualization",
     "AST Visualization",
     ViewColumn.Beside,
     { enableScripts: true, localResourceRoots: [] }
   )
   ```

2. **Sets HTML content**: Uses `getWebviewHtml()` which references `__dirname/media/webview.js` and `webview.css`

3. **Sends initial graph**: `sendGraphToWebview(panel, initialGraph)` posts `{ type: "updateGraph", graph }`

4. **Registers panel**: Adds to registry via `registerPanel()`

5. **Sets up message handler** (`onDidReceiveMessage`):
   - `"navigateToSource"` → `handleNavigateToSource(documentUri, lineno, colOffset)`
   - `"retry"` → re-opens document, re-parses, sends `"loading"` then `"updateGraph"` or `"error"`

6. **Handles disposal**: `onDidDispose` unregisters panel and disposes message listener

### `handleNavigateToSource(documentUri, lineno?, colOffset?)`

Opens document and reveals location:

- Calls `window.showTextDocument(documentUri, { viewColumn: ViewColumn.One })`
- If `lineno` and `colOffset` provided:
  - Creates `Position(lineno - 1, colOffset)` (VS Code uses 0-based lines)
  - Reveals range in center (`TextEditorRevealType.InCenter`)
  - Sets editor selection to position

---

## Auto-Refresh Flow

### Trigger

`workspace.onDidSaveTextDocument` → `handleAutoRefresh(document)`:

1. **Filters documents**:
   - Must be `languageId === "python"`
   - Must be `uri.scheme === "file"` (not untitled, git, etc.)
   - Returns early if no `pythonClient`

2. **Debounces per URI**:
   - Uses `debounce(key, fn, DEBOUNCE_MS)` where `key = uri.toString()`
   - `DEBOUNCE_MS = 400`
   - Clears previous timer for the same URI if another save occurs

3. **Debounced refresh function**:
   - Gets panels for URI (`getPanelsForUri(uri)`)
   - Returns early if no panels exist
   - Sends `"loading"` message to all panels
   - Ensures service is running (`spawnService()` if not)
   - Calls `parseAST(document.getText())`
   - Sends `"updateGraph"` to all panels on success
   - On error: logs to Output channel, sends `"error"` to panels

### Debounce Behavior

- Multiple rapid saves within 400ms → only last save triggers parse
- Each document URI has independent debounce timer
- Timers are cleared on deactivation

---

## Error Handling & Retry

### Error Logging

**`logError(message: string, error?: Error)`**:

- Gets or creates Output channel: `"Python AST Visualization"`
- Appends timestamped error message
- Includes error message and stack trace if `Error` provided
- Shows channel (`channel.show(true)`)

### Error Categories

Extension categorizes errors for user-friendly messages:

- **Syntax errors**: `error.message.includes("Syntax error") || includes("invalid syntax")`
  - Message: `"Python syntax error: {message}"`
- **Service errors**: `error.message.includes("service") || includes("Service")`
  - Message: `"Python service error: {message}. Try restarting the extension..."`
- **Generic errors**: Default to `"Parse error: {message}"`

### Error Flow

1. **Parse failure**:
   - `PythonClient.parseAST()` rejects
   - Extension catches error in command handler or auto-refresh
   - Logs to Output channel (`logError()`)
   - Shows user message (`window.showErrorMessage()`)
   - Sends `"error"` message to webview panels

2. **Service unavailable**:
   - Process exits during request → `parseAST()` rejects with "Service unavailable"
   - Extension logs error and shows message
   - User can retry via webview "Retry" button

3. **Retry flow**:
   - Webview sends `{ type: "retry" }`
   - Extension handler:
     - Re-opens document (`workspace.openTextDocument(documentUri)`)
     - Sends `"loading"` to panel
     - Ensures service running (`spawnService()` if needed)
     - Calls `parseAST(sourceCode)`
     - Sends `"updateGraph"` or `"error"` based on result

---

## Extension Points

### Adding New VS Code Commands

1. Register command in `activate()`:
   ```typescript
   context.subscriptions.push(
     vscode.commands.registerCommand("python-ast.newCommand", async () => {
       // Handler logic
     })
   );
   ```

2. Add command to `package.json` `contributes.commands`:
   ```json
   {
     "command": "python-ast.newCommand",
     "title": "New Command Title"
   }
   ```

### Adding New Message Types

1. **Update `types.ts`**:
   - Add to `VSCodeMessageOut` union or create new interface
   - Add to `VSCodeMessageIn` union if bidirectional

2. **Handle in `extension.ts`**:
   - Add case in `onDidReceiveMessage` handler in `createVisualizationPanel()`

3. **Handle in webview** (`webview-ui/src/App.tsx`):
   - Add case in `window.addEventListener("message", ...)` handler

4. **Ensure type consistency**: Both sides must agree on message shape

### Extending PythonClient Protocol

If Python service adds new methods:

1. **Update `pythonClient.ts`**:
   - Add new method (e.g., `async analyzeCode(...)`)
   - Follow same pattern: send JSON request, read stdout, parse response

2. **Update Python service** (`python_service/server.py`):
   - Add method handler in `ASTParseServer`
   - Update request parsing to recognize new method

3. **Update types**:
   - Add request/response interfaces if needed
   - Update `ParseRequest` / `ParseResponse` or create new types

### Adding Panel Features

- **Panel state**: Store additional state in `PanelEntry` interface
- **Multiple panels per document**: Already supported via registry
- **Panel persistence**: VS Code handles panel restoration; extension can restore graph on panel restore via `onDidChangeViewState`

---

## Common Flows

### First Visualization

1. User runs `python-ast.visualize` command
2. Extension validates active editor (Python file)
3. Extension spawns Python service (`spawnService()`)
4. Extension calls `parseAST(sourceCode)`
5. Extension creates panel via `createVisualizationPanel()`
6. Panel sends initial graph to webview (`"updateGraph"`)
7. Webview renders graph

### Auto-Refresh Update

1. User saves Python file
2. `onDidSaveTextDocument` triggers `handleAutoRefresh()`
3. Extension debounces (400ms delay)
4. Extension sends `"loading"` to all panels for URI
5. Extension ensures service running
6. Extension calls `parseAST(newContent)`
7. Extension sends `"updateGraph"` to all panels
8. Webview updates graph

### Error + Retry

1. Parse fails → extension logs error, sends `"error"` to webview
2. Webview displays error UI with "Retry" button
3. User clicks Retry → webview sends `{ type: "retry" }`
4. Extension re-opens document, sends `"loading"`
5. Extension ensures service running, calls `parseAST()`
6. Extension sends `"updateGraph"` (success) or `"error"` (failure)
