# Implementation Approach

## Overview

This document outlines the step-by-step implementation sequence, prioritizing models and interfaces before implementation code, following TDD practices and project development rules.

## Implementation Order

### Phase 1: Foundation and Models (Priority: Highest)

**Objective**: Establish project structure and define all data models

#### Step 1.1: Project Structure Setup

**Files to Create**:
- `pyproject.toml` - Python project configuration
- `package.json` - Node.js project configuration
- `install.sh` - Virtual environment and dependency installation script
- `.vscode/launch.json` - Extension debugging configuration
- `.vscode/tasks.json` - Build tasks configuration

**Actions**:
1. Create root-level configuration files
2. Set up Python virtual environment structure (`.venv/`)
3. Configure `uv` for Python dependency management
4. Configure Node.js build tools (TypeScript, bundler)
5. Set up VS Code extension manifest

**Dependencies**: None

#### Step 1.2: Python Schema Models

**Files to Create**:
- `python_service/__init__.py`
- `python_service/schema.py` - Pydantic models

**Implementation**:
1. Define `Socket` model (empty for now, extensible)
2. Define `NodeData` model with `ast_type`, `lineno`, `col_offset`
3. Define `ReteNode` model with `id`, `label`, `inputs`, `outputs`, `data`, `position`
4. Define `ReteConnection` model with `source`, `source_output`, `target`, `target_input`
5. Define `ReteGraph` model with `nodes` and `connections` lists

**Tests First** (TDD):
- Test model creation with valid data
- Test model validation with invalid data
- Test model serialization to JSON
- Test model deserialization from JSON

**Dependencies**: `pydantic` package

#### Step 1.3: TypeScript Type Definitions

**Files to Create**:
- `webview-ui/src/types.ts` - TypeScript interfaces

**Implementation**:
1. Define `ReteGraph` interface
2. Define `ReteNode` interface
3. Define `ReteConnection` interface
4. Define `NodeData` interface
5. Define `VSCodeMessage` interface
6. Define `Socket` interface

**Tests First** (TDD):
- Test type compatibility with Python models
- Test JSON serialization/deserialization
- Test type guards for runtime validation

**Dependencies**: None (pure types)

### Phase 2: Python Service Implementation

**Objective**: Implement AST parsing and graph conversion

#### Step 2.1: AST Parser Core

**Files to Create**:
- `python_service/parser.py` - AST converter

**Implementation Order**:
1. Create `ReteConverter` class extending `ast.NodeVisitor`
2. Implement `__init__` with empty nodes/connections lists
3. Implement node ID generation logic
4. Implement `parse_to_rete` entry point
5. Implement `visit_BinOp` method (first AST node type)
6. Implement connection tracking logic
7. Add additional `visit_*` methods for other AST types

**Tests First** (TDD):
- Test parsing simple binary operation
- Test node creation for BinOp
- Test connection creation between nodes
- Test parsing function definition
- Test parsing class definition
- Test error handling for invalid syntax
- Test line number preservation
- Test column offset preservation

**Dependencies**: `python_service/schema.py`, Python `ast` module

#### Step 2.2: AST Node Type Handlers

**Files to Modify**:
- `python_service/parser.py`

**Implementation**:
1. Implement `visit_FunctionDef` handler
2. Implement `visit_ClassDef` handler
3. Implement `visit_Call` handler
4. Implement `visit_Name` handler
5. Implement `visit_If` handler
6. Implement `visit_For` handler
7. Implement `visit_While` handler
8. Implement `visit_Return` handler
9. Add handlers for remaining common AST node types

**Tests First** (TDD):
- Test each node type handler individually
- Test complex nested structures
- Test edge cases (empty functions, nested classes)

**Dependencies**: `python_service/parser.py` (Step 2.1)

#### Step 2.3: Communication Server

**Files to Create**:
- `python_service/server.py` - Communication server

**Implementation Order**:
1. Create `ASTParseServer` class
2. Implement `__init__` with parser dependency injection
3. Implement `handle_parse_request` method
4. Implement stdio-based communication (or JSON-RPC)
5. Implement request parsing
6. Implement response formatting
7. Implement error handling
8. Implement `start_server` method
9. Implement `stop_server` method

**Tests First** (TDD):
- Test server initialization with parser
- Test handling valid parse request
- Test handling invalid source code
- Test error response formatting
- Test server lifecycle (start/stop)

**Dependencies**: `python_service/parser.py`, `python_service/schema.py`

#### Step 2.4: Python Service Entry Point

**Files to Create**:
- `python_service/__main__.py` - Service entry point

**Implementation**:
1. Create main function
2. Initialize parser
3. Initialize server with parser
4. Start server
5. Handle shutdown signals

**Tests First** (TDD):
- Test service startup
- Test service shutdown
- Test signal handling

**Dependencies**: `python_service/server.py`

### Phase 3: Extension Host Implementation

**Objective**: Implement VS Code extension and Python client

#### Step 3.1: Python Client

**Files to Create**:
- `src/pythonClient.ts` - Python service client

**Implementation Order**:
1. Create `PythonClient` class
2. Implement `spawnService` method (child_process.spawn)
3. Implement stdio communication setup
4. Implement `parseAST` method (send request, receive response)
5. Implement request/response parsing
6. Implement error handling
7. Implement `stopService` method
8. Implement `isServiceRunning` method

**Tests First** (TDD):
- Test service spawning
- Test sending parse request
- Test receiving parse response
- Test error handling (service unavailable)
- Test service stopping
- Test health check

**Dependencies**: Node.js `child_process`, Python service running

#### Step 3.2: Extension Entry Point

**Files to Create**:
- `src/extension.ts` - Extension activation

**Implementation Order**:
1. Implement `activate` function
2. Create Python client instance
3. Register "Visualize AST" command
4. Implement command handler
5. Create webview panel creation function
6. Implement file watcher for auto-refresh
7. Implement `deactivate` function
8. Register message handler from webview

**Tests First** (TDD):
- Test extension activation
- Test command registration
- Test webview panel creation
- Test file watcher setup
- Test extension deactivation
- Mock VS Code API for testing

**Dependencies**: `src/pythonClient.ts`, VS Code API

#### Step 3.3: Webview Panel Management

**Files to Modify**:
- `src/extension.ts`

**Implementation**:
1. Implement `createVisualizationPanel` function
2. Set up webview HTML content
3. Configure webview options (enable scripts, local resources)
4. Implement message handler for webview messages
5. Implement graph update handler
6. Implement navigation handler (node click → editor navigation)
7. Implement error display handler

**Tests First** (TDD):
- Test webview panel creation
- Test message handling from webview
- Test sending graph updates to webview
- Test navigation to source code

**Dependencies**: `src/extension.ts` (Step 3.2)

### Phase 4: Webview UI Implementation

**Objective**: Implement Rete.js graph visualization

#### Step 4.1: Rete.js Editor Setup

**Files to Create**:
- `webview-ui/src/editor.ts` - Rete editor wrapper

**Implementation Order**:
1. Install Rete.js dependencies (`rete`, `rete-area-plugin`, `rete-connection-plugin`)
2. Create `ReteASTEditor` class
3. Implement `initialize` method (create NodeEditor, configure plugins)
4. Configure AreaPlugin for zoom/pan
5. Configure ConnectionPlugin for connections
6. Implement `loadGraph` method (`editor.fromJSON`)
7. Implement `clearGraph` method
8. Implement `getGraph` method (`editor.toJSON`)
9. Implement `onNodeClick` handler registration

**Tests First** (TDD):
- Test editor initialization
- Test loading graph from JSON
- Test clearing graph
- Test getting graph data
- Test node click event handling

**Dependencies**: Rete.js packages, `webview-ui/src/types.ts`

#### Step 4.2: Custom Node Components

**Files to Create**:
- `webview-ui/src/nodes/ASTNode.tsx` - Base node component
- `webview-ui/src/nodes/BinOpNode.tsx`
- `webview-ui/src/nodes/FunctionDefNode.tsx`
- `webview-ui/src/nodes/ClassDefNode.tsx`
- `webview-ui/src/nodes/index.ts` - Node factory

**Implementation Order**:
1. Create base `ASTNode` component with common styling
2. Implement node registration with Rete.js
3. Create `BinOpNode` component
4. Create `FunctionDefNode` component
5. Create `ClassDefNode` component
6. Create node factory function (node type → component)
7. Register all node types with editor

**Tests First** (TDD):
- Test base node component rendering
- Test node data display
- Test node styling
- Test node factory function
- Test node registration

**Dependencies**: React, Rete.js, `webview-ui/src/editor.ts`

#### Step 4.3: React App and Message Handling

**Files to Create**:
- `webview-ui/src/App.tsx` - Main React app
- `webview-ui/src/index.tsx` - Entry point
- `webview-ui/index.html` - HTML template

**Implementation Order**:
1. Create React app component
2. Initialize Rete editor in useEffect
3. Set up message listener (`window.addEventListener('message')`)
4. Implement `handleMessage` function
5. Implement `updateGraph` function
6. Implement `handleNodeClick` function
7. Implement `sendMessage` function
8. Add loading state management
9. Add error state display

**Tests First** (TDD):
- Test message listener setup
- Test handling graph update messages
- Test handling error messages
- Test sending navigation messages
- Test loading state
- Test error display

**Dependencies**: React, `webview-ui/src/editor.ts`, VS Code webview API

#### Step 4.4: Styling and Theme Integration

**Files to Create**:
- `webview-ui/tailwind.config.js` - Tailwind configuration
- `webview-ui/src/index.css` - Global styles
- `webview-ui/src/components/NodeStyles.css` - Node-specific styles

**Implementation**:
1. Configure Tailwind to use VS Code CSS variables
2. Create custom color palette matching VS Code theme
3. Style base node components
4. Style connection wires
5. Style viewport/area
6. Add hover and selection states
7. Implement Blueprint-inspired dark mode styling

**Tests First** (TDD):
- Test CSS variable usage
- Test theme color application
- Test responsive layout
- Visual regression tests (manual)

**Dependencies**: Tailwind CSS, `webview-ui/src/nodes/`

### Phase 5: Integration and End-to-End Flow

**Objective**: Connect all components and verify full workflow

#### Step 5.1: End-to-End Integration

**Files to Modify**:
- All components

**Implementation**:
1. Test Python service → Extension host communication
2. Test Extension host → Webview communication
3. Test Webview → Extension host navigation
4. Verify graph rendering with real Python code
5. Verify node click navigation works
6. Test error propagation through all layers

**Tests First** (TDD):
- Integration test: File → Parse → Visualize
- Integration test: Node click → Navigation
- Integration test: File save → Auto-refresh
- Test error handling end-to-end

**Dependencies**: All previous phases

#### Step 5.2: Auto-Refresh on File Save

**Files to Modify**:
- `src/extension.ts`

**Implementation**:
1. Enhance file watcher to detect Python file saves
2. Automatically trigger parse on save
3. Send updated graph to webview
4. Handle rapid save events (debounce)

**Tests First** (TDD):
- Test file watcher triggers on save
- Test parse triggered automatically
- Test debouncing rapid saves
- Test webview updates automatically

**Dependencies**: `src/extension.ts` (Step 3.2)

### Phase 6: Polish and Optimization

**Objective**: Performance optimization and user experience improvements

#### Step 6.1: Performance Optimization

**Files to Modify**:
- `python_service/parser.py` - Optimize graph generation
- `webview-ui/src/editor.ts` - Optimize rendering

**Implementation**:
1. Profile Python parser performance
2. Optimize node ID generation
3. Implement worker support for large graphs (if needed)
4. Optimize React component rendering
5. Implement virtual scrolling if needed
6. Debounce graph updates

**Tests First** (TDD):
- Performance test: Parse large file (100+ nodes)
- Performance test: Render large graph
- Test worker support (if implemented)
- Test debouncing behavior

**Dependencies**: All previous phases

#### Step 6.2: Error Handling and User Feedback

**Files to Modify**:
- All components

**Implementation**:
1. Add user-friendly error messages
2. Display parsing errors in webview
3. Handle Python service failures gracefully
4. Add loading indicators
5. Add error recovery suggestions

**Tests First** (TDD):
- Test error message display
- Test service failure handling
- Test loading state display
- Test error recovery

**Dependencies**: All previous phases

## File Organization

### Python Service Structure
```
python_service/
├── __init__.py
├── __main__.py          # Entry point
├── schema.py            # Pydantic models
├── parser.py            # AST converter
└── server.py            # Communication server
```

### Extension Host Structure
```
src/
├── extension.ts         # Extension entry point
└── pythonClient.ts      # Python service client
```

### Webview UI Structure
```
webview-ui/
├── src/
│   ├── index.tsx        # Entry point
│   ├── App.tsx          # Main React app
│   ├── editor.ts        # Rete editor wrapper
│   ├── types.ts         # TypeScript types
│   └── nodes/           # Node components
│       ├── ASTNode.tsx
│       ├── BinOpNode.tsx
│       ├── FunctionDefNode.tsx
│       └── index.ts
├── index.html
├── tailwind.config.js
└── package.json
```

## Dependency Injection Requirements

### Python Service
- `ASTParseServer.__init__(parser: ReteConverter)` - Parser injected
- `ReteConverter` - No external dependencies (uses stdlib `ast`)

### Extension Host
- `activate(context, pythonClient?)` - Python client can be injected for testing
- `PythonClient` - Receives Python executable path (configurable)

### Webview UI
- `ReteASTEditor` - Receives container element
- React components - Receive props (no global state)

## Code Organization Principles

1. **Models First**: Define all models before implementation
2. **Tests First**: Write tests before implementation code
3. **Dependency Injection**: Pass all non-deterministic dependencies
4. **Single Responsibility**: Each module has one clear purpose
5. **Interface Contracts**: Well-defined interfaces between components

## Implementation Dependencies Graph

```
Phase 1 (Foundation)
  ├─ 1.1 Project Structure (no deps)
  ├─ 1.2 Python Models (dep: pydantic)
  └─ 1.3 TypeScript Types (no deps)

Phase 2 (Python Service)
  ├─ 2.1 Parser Core (dep: 1.2)
  ├─ 2.2 Node Handlers (dep: 2.1)
  ├─ 2.3 Server (dep: 2.1, 1.2)
  └─ 2.4 Entry Point (dep: 2.3)

Phase 3 (Extension Host)
  ├─ 3.1 Python Client (dep: Python service running)
  ├─ 3.2 Extension Entry (dep: 3.1)
  └─ 3.3 Webview Management (dep: 3.2)

Phase 4 (Webview UI)
  ├─ 4.1 Editor Setup (dep: 1.3, Rete.js)
  ├─ 4.2 Node Components (dep: 4.1, React)
  ├─ 4.3 App & Messages (dep: 4.1, 4.2)
  └─ 4.4 Styling (dep: 4.2)

Phase 5 (Integration)
  └─ 5.1 E2E Flow (dep: all previous)
  └─ 5.2 Auto-refresh (dep: 3.2)

Phase 6 (Polish)
  └─ All phases (optimization)
```

## Validation Steps

After each phase:
1. Run unit tests for that phase
2. Verify linting passes (`ruff check`, `mypy`, TypeScript compiler)
3. Verify no regressions in previous phases
4. Check interface contracts are maintained

After completion:
1. Run full test suite
2. Verify end-to-end workflow
3. Performance testing with large files
4. User acceptance testing
