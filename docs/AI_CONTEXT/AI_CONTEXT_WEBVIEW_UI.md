## Metadata

- **Version**: 1.0
- **Last Updated**: 2026-02-09
- **Tags**: webview-ui, react, rete, graph-editor, message-handling
- **Cross-References**:
  - `AI_CONTEXT_REPOSITORY.md` - High-level architecture and data flow
  - `AI_CONTEXT_EXTENSION_HOST.md` - Extension host message handling and panel management
  - `AI_CONTEXT_PATTERNS.md` - Code organization and testing patterns

---

## Module Overview

The `webview-ui/` package is a React + Rete.js graph editor rendered inside a VS Code webview panel. It visualizes Python AST graphs as interactive node-and-edge diagrams, handles user interactions (node clicks, retry), and communicates with the extension host via `postMessage`.

**Key modules**:

- `index.tsx` - Webview entry point, acquires VS Code API, mounts React root
- `App.tsx` - Main React component managing graph state, message handling, editor lifecycle, error/loading UI
- `editor.tsx` - `ReteASTEditor` class wrapping Rete.js editor initialization and graph operations
- `types.ts` - TypeScript interfaces for `ReteGraph`, `ReteNode`, `ReteConnection`, `NodeData`, `VSCodeMessage`
- `conversion.ts` - Utilities for converting Python snake_case JSON to TypeScript camelCase (currently unused in webview; conversion happens in extension host)
- `nodes/` - React components for rendering AST nodes:
  - `ASTNode.tsx` - Base node component with header, body, inputs/outputs
  - `FunctionDefNode.tsx`, `ClassDefNode.tsx`, `CallNode.tsx`, `BinOpNode.tsx`, `NameNode.tsx` - Specialized node components
  - `index.ts` - Node component factory (`getNodeComponent`) mapping AST types to components
- `components/NodeStyles.css` - Node-specific styling (card wrapper, hover, selection)
- `index.css` - Global styles, Tailwind imports, VS Code theme variable definitions

---

## Bootstrap & Lifecycle

### Entry Point (`index.tsx`)

The webview HTML loads `index.tsx` as the entry script:

```typescript
const acquireApi = (globalThis as unknown as { acquireVsCodeApi?: () => { postMessage: (msg: unknown) => void } }).acquireVsCodeApi;
const vscode = acquireApi ? acquireApi() : { postMessage: () => {} };
createRoot(root).render(<App getVscodeApi={() => vscode} />);
```

- Acquires VS Code API via `acquireVsCodeApi()` (returns `undefined` in non-VS Code contexts, e.g., tests)
- Creates React root and renders `<App>` with injected `getVscodeApi` function (enables testability)

### App Component Lifecycle (`App.tsx`)

`App` manages the editor lifecycle and message handling:

1. **Initialization** (`useEffect` on mount):
   - Creates `ReteASTEditor` instance and stores in `editorRef`
   - Registers node click handler via `editor.onNodeClick(handleNodeClick)`
   - Calls `editor.initialize(containerRef.current)` (async)
   - Sets up `window.addEventListener("message", handleMessage)` listener
   - Sets `editorReady` to `true` when initialization completes

2. **Graph Loading** (`useEffect` watching `graph` and `editorReady`):
   - When `graph` updates and `editorReady` is `true`, calls `editorRef.current.loadGraph(graph)`

3. **Cleanup** (`useEffect` return function):
   - Removes message listener
   - Clears debounce timer
   - Calls `editor.clearGraph()` and nullifies `editorRef`

**State management**:
- `graph: ReteGraph | null` - Current graph data
- `loading: boolean` - Loading spinner visibility
- `error: string | null` - Error message to display
- `loadingMessage: string` - Loading spinner text (default: "Parsing...")
- `editorReady: boolean` - Whether Rete editor is initialized

---

## Message Handling

### Messages Received from Extension Host

The webview listens for `MessageEvent` via `window.addEventListener("message", handleMessage)`:

#### `updateGraph`

```typescript
{ type: "updateGraph", graph: ReteGraph }
```

- **Behavior**: Clears error state, stops loading, debounces graph update (150ms), sets `graph` state
- **Debouncing**: Prevents rapid-fire updates during auto-refresh; uses `graphDebounceRef` timeout

#### `error`

```typescript
{ type: "error", error: string }
```

- **Behavior**: Clears debounce timer, sets `error` state, stops loading
- **UI**: Renders error banner with suggestions and "Retry" button (see Error UI section)

#### `loading`

```typescript
{ type: "loading", message?: string }
```

- **Behavior**: Sets `loading` to `true`, updates `loadingMessage` (defaults to "Parsing..."), clears error
- **UI**: Shows centered spinner with message text

### Messages Sent to Extension Host

Messages are sent via `vscode.postMessage()` (acquired from `acquireVsCodeApi()`):

#### `navigateToSource`

```typescript
{ type: "navigateToSource", nodeId: string, lineno?: number, colOffset?: number }
```

- **Trigger**: User clicks a node in the graph
- **Handler**: `handleNodeClick` callback registered via `editor.onNodeClick`
- **Extension response**: Opens source file and navigates to line/column (see `AI_CONTEXT_EXTENSION_HOST.md`)

#### `retry`

```typescript
{ type: "retry" }
```

- **Trigger**: User clicks "Retry" button in error UI
- **Extension response**: Re-opens document, re-parses source code, sends `updateGraph` or `error`

---

## Graph Rendering (`editor.tsx`)

### ReteASTEditor Class

`ReteASTEditor` implements the `ASTEditor` interface and wraps Rete.js editor operations:

#### `initialize(container: HTMLElement): Promise<void>`

Sets up Rete.js editor with React rendering:

1. Creates `NodeEditor<Schemes>` instance
2. Creates `AreaPlugin` for viewport/pan/zoom
3. Creates `ReactPlugin` with `createRoot` from `react-dom/client`
4. Creates `ConnectionPlugin` for edge rendering
5. Registers React node render preset:
   - Uses `getNodeComponent(contextData.payload.label)` to resolve component by AST type
   - Wraps component in clickable `div` with `className="ast-node-wrapper"` and `data-testid="ast-node"`
   - Click handler extracts `NodeData` from props and calls all registered `nodeClickHandlers`
6. Adds Rete extensions:
   - `AreaExtensions.selectableNodes` (Ctrl+click for multi-select)
   - `AreaExtensions.simpleNodesOrder` (z-index ordering)

#### `loadGraph(graph: ReteGraph): Promise<void>`

Loads a graph into the editor:

1. Clears existing graph and node data map
2. Creates `ClassicPreset.Node` instances for each `ReteNode`:
   - Sets node `id` and `label`
   - Adds inputs/outputs as `ClassicPreset.Input/Output` with socket
   - Attaches `NodeData` to node via `(node as unknown as { data?: NodeData }).data = n.data`
   - Stores `NodeData` in internal `nodeDataMap` for click handler access
3. Applies node positions via `area.translate(n.id, n.position)` if provided
4. Creates connections between nodes using `ClassicPreset.Connection`
5. Calls `AreaExtensions.zoomAt(area, editor.getNodes())` to fit all nodes in viewport

#### `clearGraph(): Promise<void>`

Clears all nodes and connections via `editor.clear()` and clears `nodeDataMap`.

#### `getGraph(): ReteGraph`

Reconstructs graph snapshot from current editor state:
- Iterates `editor.getNodes()` and builds `ReteNode[]` with positions from `area.nodeViews`
- Maps `editor.getConnections()` to `ReteConnection[]`
- Returns `{ nodes, connections }`

#### `onNodeClick(handler: NodeClickHandler): void`

Registers a callback for node click events. Multiple handlers can be registered; all are called on click.

---

## Node Components (`nodes/`)

### Base Component: `ASTNode.tsx`

`ASTNode` is the base React component for all AST nodes:

**Props**:
- `data: NodePayload` - Rete node data (id, label, inputs, outputs, controls, selected, width, height, optional `data: NodeData`)
- `emit: (props: unknown) => void` - Rete emit function for socket/control interactions
- `bodyContent?: React.ReactNode` - Optional override for body content (used by specialized nodes)

**Rendering**:
- Title: `data.label` (AST type name)
- Body: `bodyContent` if provided, otherwise location string (`"L{lineno}:{colOffset}"`) if `lineno` present
- Outputs: Rendered first (top), sorted by `index` property
- Controls: Rendered between outputs and inputs
- Inputs: Rendered last (bottom), sorted by `index` property
- Uses `Presets.classic.NodeStyles` for Rete styling (selected state, width/height)

**Location formatting**:
- `"L{lineno}"` if only `lineno` present
- `"L{lineno}:{colOffset}"` if both present

### Specialized Node Components

All specialized nodes extend `ASTNode` by passing `bodyContent`:

- **`FunctionDefNode`**: Displays `name(params.join(", "))` (e.g., `"my_func(a, b)"`)
- **`ClassDefNode`**: Displays class `name`
- **`CallNode`**: Displays `"call {func}"`
- **`NameNode`**: Displays identifier `id`
- **`BinOpNode`**: Falls back to base `ASTNode` (no custom body)

All use `React.memo` for performance.

### Node Factory (`nodes/index.ts`)

`getNodeComponent(astType: string)` maps AST type strings to React components:

```typescript
const TYPE_MAP: Record<string, React.ComponentType<ASTNodeProps>> = {
  BinOp: BinOpNode,
  Call: CallNode,
  ClassDef: ClassDefNode,
  FunctionDef: FunctionDefNode,
  Name: NameNode,
};
```

- Returns specialized component if found, otherwise returns `ASTNode` as fallback
- Used in `editor.tsx` during React preset registration

**Adding new node types**:
1. Create new component file (e.g., `IfNode.tsx`) extending `ASTNode`
2. Add entry to `TYPE_MAP` in `nodes/index.ts`
3. Ensure Python service emits nodes with matching `ast_type` label

---

## Styling & Theming

### Global Styles (`index.css`)

- Imports `NodeStyles.css` and Tailwind layers (`@tailwind base/components/utilities`)
- Defines VS Code theme variable fallbacks (for non-VS Code contexts):
  - `--vscode-editor-background`, `--vscode-editor-foreground`
  - `--vscode-editorWidget-background`, `--vscode-panel-border`
  - `--vscode-list-activeSelectionBackground`, `--vscode-list-hoverBackground`
- Sets global `html, body, #root` styles (full viewport, VS Code font family, background color)

### Node Styles (`components/NodeStyles.css`)

**`.ast-node-wrapper`**:
- Card-like appearance: background, border, border-radius, box-shadow, padding
- Uses `var(--vscode-editorWidget-background)` and `var(--vscode-panel-border)`
- Min-width: 120px

**`.ast-node-wrapper:hover`**:
- Background: `var(--vscode-list-hoverBackground)`
- Border color: `var(--vscode-focusBorder, #007acc)`

**`.ast-node-wrapper.selected`**:
- Background: `var(--vscode-list-activeSelectionBackground)`
- Border color: `var(--vscode-focusBorder)`

**`.ast-viewport`**:
- Full viewport dimensions, background from `--vscode-editor-background`

**Node title/body**:
- Title: foreground color, font-weight 600
- Body: description foreground color, font-size 11px, opacity 0.8

### VS Code Theme Integration

The webview automatically inherits VS Code CSS variables when rendered in a webview panel. The extension host sets these via `<meta name="color-scheme">` and inline styles in the HTML. Colors adapt to light/dark themes without code changes.

---

## Testing & Diagnostics

### Test Structure (`webview-ui/src/__tests__/`)

**`App.test.tsx`**:
- Tests message listener setup/teardown
- Tests `updateGraph`, `error`, `loading` message handling
- Tests node click → `navigateToSource` message flow
- Uses mocked `ReteASTEditor` and `window.addEventListener`

**`editor.test.ts`**:
- Tests `ReteASTEditor` initialization, `loadGraph`, `clearGraph`, `getGraph`
- Tests node click handler registration
- Uses real Rete.js editor instances in jsdom environment

**`nodes/index.test.ts`**:
- Tests `getNodeComponent` factory (returns correct component for known types, falls back to `ASTNode`)
- Tests `ASTNode` rendering (title, body with lineno, inputs/outputs)

**`styles.test.ts`**, **`types.test.ts`**:
- Type and style validation tests

### Debugging Message Flow

- **In webview**: Use browser DevTools (right-click webview → Inspect) to:
  - Inspect `window.postMessage` calls in Console
  - Monitor `MessageEvent` listeners
  - Inspect React component state via React DevTools
- **In extension**: Check Output channel (`Python AST Visualization`) for parse errors and communication logs

### Common Issues

- **Graph not updating**: Check debounce timer in `App.tsx`; verify `editorReady` is `true` before `loadGraph`
- **Node clicks not working**: Verify `onNodeClick` handler is registered and `nodeDataMap` is populated during `loadGraph`
- **Styling broken**: Ensure VS Code theme variables are available; check `index.css` imports `NodeStyles.css`

---

## Extension Points

### Adding New AST Node Types

1. **Python side** (see `AI_CONTEXT_PYTHON_SERVICE.md`):
   - Implement `visit_<NodeType>` in `ReteConverter` to emit `ReteNode` with `ast_type` label

2. **Webview side**:
   - Create new component file in `nodes/` (e.g., `IfNode.tsx`)
   - Extend `ASTNode` with custom `bodyContent` if needed
   - Add entry to `TYPE_MAP` in `nodes/index.ts`
   - Component will be automatically used when Python emits matching `ast_type`

### Adding New Message Types

1. Update `VSCodeMessageType` union in `webview-ui/src/types.ts`:
   ```typescript
   export type VSCodeMessageType = "updateGraph" | "error" | "navigateToSource" | "loading" | "retry" | "newMessage";
   ```

2. Update `VSCodeMessage` interface with optional fields:
   ```typescript
   export interface VSCodeMessage {
     type: VSCodeMessageType;
     // ... existing fields
     newField?: string;
   }
   ```

3. Handle in `App.tsx` `handleMessage`:
   ```typescript
   if (msg.type === "newMessage") {
     // Handle new message
   }
   ```

4. Send from extension host (see `AI_CONTEXT_EXTENSION_HOST.md`)

### Customizing Node Appearance

- **Override base styles**: Modify `components/NodeStyles.css` or add Tailwind classes
- **Custom body content**: Pass `bodyContent` prop in specialized node components
- **Custom node wrapper**: Modify `editor.tsx` React preset `customize.node` wrapper div

---

## Key Dependencies

- **`rete`**, **`rete-area-plugin`**, **`rete-connection-plugin`**, **`rete-react-plugin`**: Rete.js graph editor framework
- **`react`**, **`react-dom/client`**: React rendering
- **Tailwind CSS**: Utility-first CSS (via `tailwind.config.js`)
- **VS Code API**: `acquireVsCodeApi()` for `postMessage` communication

---

## Related Documentation

- `AI_CONTEXT_REPOSITORY.md` - Overall architecture and data flow
- `AI_CONTEXT_EXTENSION_HOST.md` - Extension host message handling and panel lifecycle
- `AI_CONTEXT_PYTHON_SERVICE.md` - Python service graph generation
- `AI_CONTEXT_PATTERNS.md` - Code organization and testing patterns
