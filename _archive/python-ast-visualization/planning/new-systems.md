# New Systems

## Overview

This document identifies all new components, modules, interfaces, and functionality that will be added to implement the Python AST visualization feature. The architecture follows a "Sidecar" pattern with three main components: Python service, Extension Host, and Webview UI.

## Component Architecture

### 1. Python Service (`python_service/`)

The Python service acts as the AST parsing engine, running as a background process and communicating via JSON-RPC or standard I/O.

#### 1.1 AST Parser Module (`parser.py`)

**Purpose:** Walk Python AST and convert to Rete.js-compatible JSON structure

**Key Components:**
- `ReteConverter` class extending `ast.NodeVisitor`
- Node flattening logic to convert nested AST to graph structure
- AST node type handlers (BinOp, FunctionDef, ClassDef, etc.)
- Line number and column offset preservation for bidirectional mapping

**Interfaces:**
- `parse_to_rete(source_code: str) -> ReteGraph` - Main entry point
- `visit_*` methods for each AST node type
- Node ID generation and connection tracking

**Dependencies:**
- Python `ast` module (standard library)
- Custom data models for Rete graph structure

#### 1.2 Schema Module (`schema.py`)

**Purpose:** Define Rete.js JSON model structures and data validation

**Key Components:**
- Pydantic models for Rete node structure
- Pydantic models for Rete connection structure
- Pydantic models for complete graph structure
- Validation logic for graph data integrity

**Interfaces:**
- `ReteNode` model - Node structure with id, label, inputs, outputs, data
- `ReteConnection` model - Connection structure with source/target
- `ReteGraph` model - Complete graph with nodes and connections

**Dependencies:**
- `pydantic` for data validation

#### 1.3 Server Module (`server.py`)

**Purpose:** JSON-RPC or socket-based communication server

**Key Components:**
- Request handler for parse requests
- Response formatter for Rete graph data
- Error handling and validation
- Process lifecycle management

**Interfaces:**
- `handle_parse_request(source_code: str) -> ReteGraph`
- `start_server()` - Initialize and start service
- `stop_server()` - Graceful shutdown

**Dependencies:**
- JSON-RPC library or socket library
- Integration with parser and schema modules

### 2. Extension Host (`src/`)

The TypeScript/Node.js extension host manages the VS Code extension lifecycle and coordinates between Python service and webview.

#### 2.1 Extension Entry Point (`extension.ts`)

**Purpose:** VS Code extension activation and lifecycle management

**Key Components:**
- Extension activation logic
- Webview panel creation and management
- Command registration ("Visualize AST" command)
- File watcher setup for auto-update on save
- Extension deactivation cleanup

**Interfaces:**
- `activate(context: vscode.ExtensionContext)` - Extension activation
- `deactivate()` - Extension cleanup
- `createVisualizationPanel()` - Create and show webview
- `registerCommands()` - Register VS Code commands

**Dependencies:**
- VS Code API (`vscode` module)
- Python client module
- Webview message handling

#### 2.2 Python Client (`pythonClient.ts`)

**Purpose:** Communication bridge with Python service

**Key Components:**
- Child process spawn and management
- JSON-RPC or stdio communication protocol
- Request/response handling
- Error handling and retry logic
- Process health monitoring

**Interfaces:**
- `PythonClient` class
- `spawnService()` - Start Python service process
- `parseAST(sourceCode: string): Promise<ReteGraph>` - Send parse request
- `stopService()` - Terminate Python process
- `isServiceRunning(): boolean` - Health check

**Dependencies:**
- Node.js `child_process` module
- JSON serialization/deserialization

### 3. Webview UI (`webview-ui/`)

The React-based webview provides the Rete.js graph visualization interface.

#### 3.1 Rete.js Editor (`src/editor.ts`)

**Purpose:** Initialize and configure Rete.js editor instance

**Key Components:**
- Rete.js engine initialization
- Plugin configuration (AreaPlugin, ConnectionPlugin)
- Custom node registration
- Graph loading from JSON (`editor.fromJSON()`)
- Graph export to JSON (`editor.toJSON()`)

**Interfaces:**
- `initializeEditor(container: HTMLElement): ReteEditor`
- `loadGraph(graph: ReteGraph): void`
- `clearGraph(): void`
- `getGraph(): ReteGraph`

**Dependencies:**
- `rete` core library
- Rete.js plugins (AreaPlugin, ConnectionPlugin)
- Custom node components

#### 3.2 Custom Node Components (`src/nodes/`)

**Purpose:** Visual representations for different AST node types

**Key Components:**
- Node component for each AST type (BinOp, FunctionDef, etc.)
- Node styling and layout
- Input/output socket definitions
- Node data display (operation type, variable names, etc.)

**Interfaces:**
- `BinOpNode` component
- `FunctionDefNode` component
- `ClassDefNode` component
- Generic `ASTNode` base component
- Node factory for creating nodes by type

**Dependencies:**
- Rete.js component system
- React (if using React-based nodes)
- Styling system (CSS/Tailwind)

#### 3.3 Message Handling (`src/App.tsx`)

**Purpose:** Handle communication with extension host via postMessage

**Key Components:**
- Message listener for graph updates
- Graph update handler
- Error handling and display
- Loading state management
- Bidirectional mapping (node click -> editor navigation)

**Interfaces:**
- `handleMessage(message: VSCodeMessage): void`
- `updateGraph(graph: ReteGraph): void`
- `handleNodeClick(nodeId: string): void` - Navigate to source code
- `sendMessage(message: VSCodeMessage): void` - Send to extension host

**Dependencies:**
- VS Code webview API (`acquireVsCodeApi()`)
- Rete editor instance
- React state management

#### 3.4 Styling System

**Purpose:** Blueprint-inspired dark mode styling matching VS Code theme

**Key Components:**
- Tailwind CSS configuration
- CSS variables for VS Code theme colors
- Custom Rete.js node styling
- Responsive layout styles

**Interfaces:**
- `tailwind.config.js` - Tailwind configuration
- CSS files for custom styling
- Theme color integration (`var(--vscode-editor-background)`)

**Dependencies:**
- Tailwind CSS
- PostCSS
- VS Code theme CSS variables

### 4. Data Models and Interfaces

#### 4.1 Rete Graph Data Structure

**Python Side (`schema.py`):**
- `ReteNode` - Node with id, label, inputs, outputs, data
- `ReteConnection` - Connection with source node/port, target node/port
- `ReteGraph` - Complete graph with nodes list and connections list

**TypeScript Side:**
- Matching TypeScript interfaces/types
- JSON serialization/deserialization
- Type validation

#### 4.2 Communication Protocol

**Request Format:**
- `{ type: "parse", sourceCode: string }`

**Response Format:**
- `{ type: "graph", graph: ReteGraph }`
- `{ type: "error", message: string }`

**Bidirectional Messages:**
- Extension -> Webview: Graph updates, errors
- Webview -> Extension: Node click events (for navigation)

### 5. Build and Configuration

#### 5.1 Python Configuration (`pyproject.toml`)

**Components:**
- Project metadata
- Dependencies (pydantic, json-rpc or similar)
- Build system configuration
- Tool configurations (ruff, mypy)

#### 5.2 Node.js Configuration (`package.json`)

**Components:**
- Extension metadata
- Dependencies (rete, react, vscode)
- Build scripts (webpack/vite for webview bundling)
- VS Code extension manifest

#### 5.3 Build Scripts

**Components:**
- Webview bundling (Vite/Esbuild)
- TypeScript compilation
- Extension packaging
- Development watch mode

### 6. Testing Infrastructure

#### 6.1 Python Tests

**Components:**
- Unit tests for AST parser
- Unit tests for schema validation
- Integration tests for server communication
- Test fixtures for sample AST structures

#### 6.2 TypeScript Tests

**Components:**
- Unit tests for Python client
- Unit tests for extension activation
- Mock tests for VS Code API
- Integration tests for message passing

#### 6.3 End-to-End Tests

**Components:**
- Full workflow tests (file -> parse -> visualize)
- Webview rendering tests
- Extension command tests

## Summary

This feature introduces a complete three-component system with clear separation of concerns:

1. **Python Service** - AST parsing and graph generation (3 modules)
2. **Extension Host** - VS Code integration and coordination (2 modules)
3. **Webview UI** - Graph visualization interface (4 main components)

All components communicate via well-defined interfaces using JSON-based protocols, enabling testability and maintainability per project development practices.
