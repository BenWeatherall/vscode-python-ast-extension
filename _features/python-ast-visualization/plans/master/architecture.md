# Architecture Design

## System Architecture Overview

The Python AST visualization feature uses a **Sidecar Architecture** with three independent components communicating via well-defined interfaces:

```
┌─────────────────┐
│   VS Code IDE   │
│  (User Context) │
└────────┬────────┘
         │
    ┌────▼────────────────────────────────────┐
    │   Extension Host (TypeScript/Node.js)   │
    │  - Manages webview panel                │
    │  - Spawns Python service                │
    │  - Coordinates communication             │
    └────┬───────────────────┬────────────────┘
         │                   │
         │ postMessage        │ stdio/JSON-RPC
         │                   │
    ┌────▼────────┐    ┌─────▼──────────────┐
    │  Webview UI │    │  Python Service     │
    │  (React +   │    │  - AST Parser       │
    │   Rete.js)  │    │  - Graph Converter  │
    │             │    │  - JSON Server      │
    └─────────────┘    └─────────────────────┘
```

## Component Breakdown

### 1. Python Service (`python_service/`)

**Purpose**: AST parsing engine running as background process

**Responsibilities**:
- Parse Python source code into AST
- Convert nested AST to flat Rete.js graph structure
- Validate graph data using Pydantic models
- Serve graph data via JSON-RPC or stdio

**Key Modules**:
- `parser.py`: AST visitor and graph converter
- `schema.py`: Pydantic models for graph structure
- `server.py`: Communication server (JSON-RPC or stdio)

**Design Patterns**:
- **Visitor Pattern**: `ReteConverter` extends `ast.NodeVisitor`
- **Dependency Injection**: Server receives parser instance
- **Model Validation**: All data validated via Pydantic models

### 2. Extension Host (`src/`)

**Purpose**: VS Code extension lifecycle and coordination

**Responsibilities**:
- Activate/deactivate extension
- Create and manage webview panel
- Spawn and manage Python service process
- Handle file watchers for auto-refresh
- Relay messages between Python service and webview

**Key Modules**:
- `extension.ts`: Extension entry point and lifecycle
- `pythonClient.ts`: Python service communication client

**Design Patterns**:
- **Command Pattern**: VS Code commands for user actions
- **Observer Pattern**: File watchers for change detection
- **Dependency Injection**: Python client injected into extension

### 3. Webview UI (`webview-ui/`)

**Purpose**: Interactive graph visualization interface

**Responsibilities**:
- Initialize Rete.js editor with plugins
- Render custom AST node components
- Handle user interactions (zoom, pan, select)
- Send navigation messages to extension host
- Receive and apply graph updates

**Key Modules**:
- `src/editor.ts`: Rete.js editor initialization
- `src/nodes/`: Custom node components
- `src/App.tsx`: React app and message handling

**Design Patterns**:
- **Component Pattern**: React components for nodes
- **Plugin Architecture**: Rete.js plugins for features
- **Message Passing**: postMessage API for communication

## Data Flow

### Graph Generation Flow

1. **User Action**: User saves Python file or triggers "Visualize AST" command
2. **Extension Host**: Reads source code from active editor
3. **Python Service**: Receives source code via stdio/JSON-RPC
4. **AST Parsing**: Python service parses code using `ast.parse()`
5. **Graph Conversion**: `ReteConverter` walks AST and builds graph structure
6. **Validation**: Graph data validated via Pydantic models
7. **Response**: Python service returns JSON graph data
8. **Webview Update**: Extension host sends graph to webview via `postMessage`
9. **Rendering**: Webview calls `editor.fromJSON()` to render graph

### Navigation Flow

1. **User Action**: User clicks node in graph
2. **Event Handler**: Node click event captured by React component
3. **Message**: Webview sends navigation message to extension host
4. **Extension Host**: Receives message with node ID and location data
5. **Navigation**: Extension host opens file and navigates to line/column
6. **Visual Feedback**: Source code location highlighted in editor

## Design Principles

### 1. Separation of Concerns

- **Python Service**: Pure AST parsing logic, no UI concerns
- **Extension Host**: VS Code integration only, no parsing logic
- **Webview UI**: Visualization only, no parsing logic

### 2. Dependency Injection

- Python service parser injected into server
- Python client injected into extension
- Rete editor injected into React components
- All non-deterministic dependencies passed as parameters

### 3. Model-First Approach

- Define Pydantic models before implementation
- Validate all data at boundaries
- Never re-validate validated data

### 4. Interface Contracts

- Well-defined interfaces between components
- JSON-based communication protocol
- Type-safe models on both sides

## Graph Structure

### Rete.js Graph Format

```typescript
interface ReteGraph {
    nodes: ReteNode[];
    connections: ReteConnection[];
}

interface ReteNode {
    id: string;
    label: string;
    inputs: Record<string, Socket>;
    outputs: Record<string, Socket>;
    data: NodeData;
    position?: { x: number; y: number };
}

interface ReteConnection {
    source: string;      // Source node ID
    sourceOutput: string; // Source socket name
    target: string;       // Target node ID
    targetInput: string;  // Target socket name
}

interface NodeData {
    astType: string;     // AST node type (e.g., "BinOp", "FunctionDef")
    lineno?: number;     // Source line number
    colOffset?: number;  // Source column offset
    [key: string]: unknown; // Type-specific data
}
```

### AST to Graph Conversion Strategy

**Flattening Approach**:
- Each AST node becomes a graph node
- Parent-child relationships become graph connections
- Node IDs generated deterministically (e.g., based on AST node ID)
- Position data optional (can use layout algorithm)

**Connection Rules**:
- Expression nodes connect to their parent expressions
- Statement nodes connect in execution order
- Function/class definitions connect to their bodies

## Communication Protocol

### Extension Host ↔ Python Service

**Request Format** (stdio or JSON-RPC):
```json
{
    "method": "parse",
    "params": {
        "sourceCode": "def hello(): ..."
    }
}
```

**Response Format**:
```json
{
    "result": {
        "nodes": [...],
        "connections": [...]
    }
}
```

**Error Format**:
```json
{
    "error": {
        "code": -32603,
        "message": "Parse error: invalid syntax"
    }
}
```

### Extension Host ↔ Webview

**Extension → Webview**:
```typescript
{
    type: "updateGraph",
    graph: ReteGraph
}
```

**Webview → Extension**:
```typescript
{
    type: "navigateToSource",
    nodeId: string,
    lineno: number,
    colOffset: number
}
```

## Styling Architecture

### Theme Integration

- Use VS Code CSS variables for colors
- Tailwind CSS configured to use CSS variables
- Blueprint-inspired dark mode styling
- Responsive layout for different screen sizes

### Node Styling Strategy

- Base styles for all nodes (rounded corners, shadows)
- Type-specific color coding
- Hover and selection states
- Visual hierarchy through size and color

## Performance Considerations

### Large Graph Handling

- **Worker Support**: Use Rete.js workers for layout calculations
- **Virtual Scrolling**: Render only visible nodes
- **Debouncing**: Debounce graph updates during rapid file changes
- **Incremental Loading**: Load graph in chunks if needed

### Optimization Strategies

- Lazy rendering of off-screen nodes
- Connection rendering optimization
- Efficient node lookup (use Map for O(1) access)
- Minimize re-renders in React components

## Error Handling

### Error Boundaries

- Python service: Catch parsing errors, return error response
- Extension host: Handle Python service failures, show error messages
- Webview: Handle invalid graph data, show error UI

### Error Recovery

- Retry logic for Python service communication
- Fallback to empty graph on parse failure
- User-friendly error messages in webview

## Security Considerations

- Validate all input data at boundaries
- Sanitize source code before parsing
- Limit Python service resource usage
- Isolated webview environment (VS Code security)

## Testing Architecture

### Unit Tests

- Python: Test parser, schema validation, server handlers
- TypeScript: Test extension activation, Python client, message handling
- React: Test components, event handlers, graph updates

### Integration Tests

- End-to-end: File → Parse → Visualize flow
- Communication: Verify message passing between components
- Navigation: Test bidirectional mapping

### Test Infrastructure

- Python: `unittest` framework
- TypeScript: Jest or Mocha
- React: React Testing Library
- Mock VS Code API for extension tests
