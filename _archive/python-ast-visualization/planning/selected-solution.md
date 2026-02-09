# Selected Solution

## Overview

**Selected Library:** Rete.js  
**Version:** Latest stable (v2.x recommended)  
**License:** MIT  
**Repository:** https://github.com/retejs/rete  
**Documentation:** https://rete.js.org/

Rete.js is selected as the graph visualization library for the Python AST visualization feature. It provides a node-based editor framework specifically designed for visual programming interfaces, which aligns perfectly with the AST visualization use case.

## Library Architecture

### Core Components

#### 1. Rete Engine (`rete`)

**Purpose:** Core graph engine managing nodes and connections

**Key Interfaces:**
- `Rete` - Main engine class
- `Node` - Node instance with data and connections
- `Socket` - Input/output socket definition
- `Connection` - Connection between node sockets

**Usage Pattern:**
```typescript
import { NodeEditor } from 'rete';

const editor = new NodeEditor('python-ast@1.0.0', container);
```

**Key Methods:**
- `editor.addNode(node: Node)` - Add node to graph
- `editor.removeNode(node: Node)` - Remove node
- `editor.connect(output: Output, input: Input)` - Create connection
- `editor.fromJSON(data: GraphData)` - Load graph from JSON
- `editor.toJSON()` - Export graph to JSON

#### 2. Area Plugin (`rete-area-plugin`)

**Purpose:** Provides zoom, pan, and viewport management

**Key Interfaces:**
- `AreaPlugin` - Plugin instance
- Viewport controls (zoom in/out, pan, fit to screen)

**Usage Pattern:**
```typescript
import AreaPlugin from 'rete-area-plugin';

const area = new AreaPlugin(container);
editor.use(AreaPlugin);
```

**Key Features:**
- Mouse wheel zoom
- Drag to pan
- Fit to screen
- Viewport transformation
- Performance optimization for large graphs

#### 3. Connection Plugin (`rete-connection-plugin`)

**Purpose:** Renders connections between nodes with curved wires

**Key Interfaces:**
- `ConnectionPlugin` - Plugin instance
- Connection rendering with Bezier curves

**Usage Pattern:**
```typescript
import ConnectionPlugin from 'rete-connection-plugin';

editor.use(ConnectionPlugin);
```

**Key Features:**
- Curved connection rendering
- Connection animations
- Visual feedback on hover/select
- Customizable connection styles

#### 4. React Render Plugin (`rete-react-render-plugin`)

**Purpose:** React integration for custom node components

**Key Interfaces:**
- `ReactRenderPlugin` - Plugin instance
- React component registration

**Usage Pattern:**
```typescript
import ReactRenderPlugin from 'rete-react-render-plugin';

editor.use(ReactRenderPlugin);
```

**Key Features:**
- React component support
- Custom node rendering
- Component lifecycle management

### Required Packages

**Core:**
- `rete` - Core engine
- `rete-area-plugin` - Zoom/pan functionality
- `rete-connection-plugin` - Connection rendering

**React Integration (if using React):**
- `rete-react-render-plugin` - React component support
- `react` - React library
- `react-dom` - React DOM rendering

**TypeScript Support:**
- `@types/react` - React type definitions
- TypeScript definitions included in Rete.js packages

## Implementation Strategy

### Phase 1: Core Setup

**1.1 Install Dependencies**
```json
{
  "dependencies": {
    "rete": "^2.0.0",
    "rete-area-plugin": "^2.0.0",
    "rete-connection-plugin": "^2.0.0",
    "rete-react-render-plugin": "^2.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

**1.2 Initialize Editor**
- Create editor instance in webview container
- Configure plugins (Area, Connection, React Render)
- Set up event handlers

**1.3 Define Node Schema**
- Create TypeScript interfaces matching Python `ReteNode` model
- Define socket types (input/output)
- Create node data structure

### Phase 2: Custom Node Components

**2.1 Base AST Node Component**
- Generic node component with inputs/outputs
- Display node label and type
- Show node data (operation type, variable names)

**2.2 Specific Node Types**
- `BinOpNode` - Binary operation visualization
- `FunctionDefNode` - Function definition
- `ClassDefNode` - Class definition
- `CallNode` - Function call
- `NameNode` - Variable reference

**2.3 Node Styling**
- Match VS Code theme colors
- Use CSS variables for theming
- Blueprint-inspired dark mode styling

### Phase 3: Graph Loading

**3.1 JSON Deserialization**
- Receive Rete graph JSON from Python service
- Validate structure
- Convert to Rete.js format

**3.2 Graph Rendering**
- Clear existing graph
- Create nodes from JSON data
- Create connections from JSON data
- Apply layout (if needed)

**3.3 Performance Optimization**
- Use Rete.js worker support for large graphs
- Implement virtual scrolling if needed
- Debounce graph updates

### Phase 4: Interaction Features

**4.1 Node Selection**
- Handle node click events
- Highlight selected nodes
- Show node details

**4.2 Bidirectional Mapping**
- Store source code location (line, column) in node data
- On node click, send message to extension host
- Extension host navigates editor to source location

**4.3 Viewport Controls**
- Zoom controls
- Pan controls
- Fit to screen button
- Reset view

## Data Flow Integration

### Python → TypeScript

**Python Service Output:**
```python
{
    "nodes": [
        {
            "id": "node_1",
            "label": "Binary Operation",
            "inputs": {"left": {}, "right": {}},
            "outputs": {"value": {}},
            "data": {
                "op": "Add",
                "lineno": 10,
                "col_offset": 5
            }
        }
    ],
    "connections": [
        {
            "source": "node_1",
            "sourceOutput": "value",
            "target": "node_2",
            "targetInput": "input"
        }
    ]
}
```

**TypeScript Processing:**
1. Receive JSON via `webview.postMessage()`
2. Validate structure
3. Convert to Rete.js format
4. Call `editor.fromJSON(graphData)`
5. Render graph

### TypeScript → Extension Host

**Node Click Event:**
```typescript
{
    type: "navigateToSource",
    nodeId: "node_1",
    lineno: 10,
    colOffset: 5
}
```

**Extension Host Processing:**
1. Receive message from webview
2. Open source file (if not already open)
3. Navigate to line/column
4. Highlight code section

## Key Interfaces to Implement

### Editor Interface

```typescript
interface ASTEditor {
    initialize(container: HTMLElement): void;
    loadGraph(graph: ReteGraph): void;
    clearGraph(): void;
    getGraph(): ReteGraph;
    onNodeClick(handler: (nodeId: string, data: NodeData) => void): void;
}
```

### Node Component Interface

```typescript
interface ASTNodeComponent {
    node: Node;
    updateData(data: NodeData): void;
    highlight(active: boolean): void;
}
```

### Graph Data Interface

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
}

interface NodeData {
    astType: string;
    lineno?: number;
    colOffset?: number;
    [key: string]: unknown;
}
```

## Styling Approach

### Theme Integration

**CSS Variables:**
- Use VS Code CSS variables for colors
- `var(--vscode-editor-background)` - Background
- `var(--vscode-editor-foreground)` - Text color
- `var(--vscode-list-activeSelectionBackground)` - Selection

**Tailwind Configuration:**
- Configure Tailwind to use CSS variables
- Create custom color palette matching VS Code theme
- Blueprint-inspired dark mode styling

### Node Styling

**Base Styles:**
- Rounded corners
- Shadow effects
- Hover states
- Active/selected states

**Type-Specific Styles:**
- Color coding by AST node type
- Icons for different node types
- Visual hierarchy

## Performance Considerations

### Large Graph Handling

**Worker Support:**
- Use Rete.js worker system for layout calculations
- Offload heavy computations to web worker
- Maintain UI responsiveness

**Optimization Strategies:**
- Virtual scrolling for node lists
- Lazy rendering of off-screen nodes
- Debounce graph updates
- Incremental graph loading

### Bundle Size

**Bundling Strategy:**
- Use Vite or Esbuild for webview bundling
- Tree-shake unused Rete.js features
- Code splitting if needed
- Minimize bundle size for faster webview load

## Testing Strategy

### Unit Tests

**Editor Tests:**
- Graph loading from JSON
- Graph export to JSON
- Node creation/removal
- Connection creation/removal

**Node Component Tests:**
- Component rendering
- Data updates
- Event handling

### Integration Tests

**End-to-End Flow:**
- Python AST → JSON → Rete.js graph
- Node click → Extension navigation
- Graph update → UI refresh

## Documentation References

**Official Documentation:**
- Main Site: https://rete.js.org/
- GitHub Repository: https://github.com/retejs/rete
- Examples: https://rete.js.org/#/examples

**Key Documentation Sections:**
- Getting Started Guide
- Plugin Development
- Custom Node Components
- React Integration
- Performance Optimization

**Community Resources:**
- GitHub Issues for troubleshooting
- Example projects for reference
- Community plugins for additional features

## Alternative Fallback

If Rete.js proves problematic during implementation, **React Flow** serves as the documented fallback option with:
- Better documentation
- More examples
- React-first design
- Similar feature set

The architecture is designed to abstract the graph library behind interfaces, making a switch to React Flow feasible if needed.

## Summary

Rete.js provides the optimal solution for Python AST visualization with:
- Node-based editor focus matching the use case
- Plugin architecture for extensibility
- JSON serialization for Python integration
- Performance features for large graphs
- VS Code webview compatibility
- Active development and community support

Implementation follows a phased approach with clear interfaces, enabling testability and maintainability per project development practices.
