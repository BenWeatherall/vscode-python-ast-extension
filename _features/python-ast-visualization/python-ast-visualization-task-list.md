# Python AST Visualization - Task List

## Overview

This task list breaks down the implementation of the Python AST visualization feature into specific, testable tasks following Test-Driven Development (TDD) and project development practices. Tasks are organized by phase with clear dependencies and interface requirements.

## Development Practices

All tasks must follow:
- **Test-Driven Development**: Write tests before implementation code
- **Models First**: Define data models before business logic
- **Dependency Injection**: Pass non-deterministic dependencies as parameters
- **Black Box Testing**: Validate functionality, not internal behavior
- **Model Validation**: Use models for data validation at boundaries only

## Phase 1: Foundation and Models

### Task 1.1: Project Structure Setup
**Status**: Pending  
**Dependencies**: None  
**Priority**: Highest

**Description**: Create foundational project structure and configuration files.

**Tasks**:
1. Create `pyproject.toml` with Python 3.12 configuration, pydantic dependency, and development dependencies (pytest, ruff, mypy)
2. Create `package.json` with VS Code extension configuration, TypeScript setup, and webview dependencies (rete, react, tailwind)
3. Create `install.sh` script that:
   - Creates `.venv` virtual environment using `uv`
   - Activates virtual environment
   - Installs Python project using `uv` and `pyproject.toml`
   - Runs pytest to verify installation
4. Create `.vscode/launch.json` for extension debugging
5. Create `.vscode/tasks.json` for build tasks
6. Create VS Code extension manifest (`package.json` contributes section)

**Validation**:
- `install.sh` executes successfully
- Virtual environment created in `.venv`
- Python dependencies installable
- Node.js dependencies installable
- VS Code extension can be debugged

**Files Created**:
- `pyproject.toml`
- `package.json`
- `install.sh`
- `.vscode/launch.json`
- `.vscode/tasks.json`

---

### Task 1.2: Python Schema Models
**Status**: Pending  
**Dependencies**: Task 1.1  
**Priority**: Highest

**Description**: Define Pydantic models for Rete.js graph structure following TDD.

**Test Tasks (Write First)**:
1. Write test: `test_schema.py::test_rete_node_creation_with_valid_data` - Create ReteNode with all required fields, verify serialization
2. Write test: `test_schema.py::test_rete_node_validation_with_invalid_data` - Missing required fields, invalid types, verify ValidationError
3. Write test: `test_schema.py::test_rete_connection_creation` - Create ReteConnection, verify serialization
4. Write test: `test_schema.py::test_rete_graph_creation` - Create ReteGraph with nodes/connections, verify structure
5. Write test: `test_schema.py::test_model_deserialization` - Deserialize JSON to models, verify all fields populated

**Implementation Tasks**:
1. Create `python_service/__init__.py`
2. Create `python_service/schema.py` with:
   - `Socket` model (empty, extensible)
   - `NodeData` model with `ast_type: str`, `lineno: Optional[int]`, `col_offset: Optional[int]`, `extra = "allow"`
   - `ReteNode` model with `id: str`, `label: str`, `inputs: Dict[str, Socket]`, `outputs: Dict[str, Socket]`, `data: NodeData`, `position: Optional[Dict[str, float]]`
   - `ReteConnection` model with `source: str`, `source_output: str`, `target: str`, `target_input: str`
   - `ReteGraph` model with `nodes: List[ReteNode]`, `connections: List[ReteConnection]`
3. Add Google-style docstrings to all models
4. Run tests to verify all pass

**Validation**:
- All tests pass
- Models serialize/deserialize JSON correctly
- Validation errors raised for invalid data
- Models match TypeScript interfaces (to be created in Task 1.3)

**Files Created**:
- `python_service/__init__.py`
- `python_service/schema.py`
- `tests/python_service/test_schema.py`

---

### Task 1.3: TypeScript Type Definitions
**Status**: Pending  
**Dependencies**: Task 1.2  
**Priority**: Highest

**Description**: Define TypeScript interfaces matching Python models for type safety.

**Test Tasks (Write First)**:
1. Write test: `types.test.ts::test_type_compatibility_with_python_models` - Verify TypeScript types match Python model structure
2. Write test: `types.test.ts::test_json_serialization` - Serialize/deserialize TypeScript interfaces to JSON
3. Write test: `types.test.ts::test_type_guards` - Create runtime type guards for validation

**Implementation Tasks**:
1. Create `webview-ui/src/types.ts` with:
   - `ReteGraph` interface
   - `ReteNode` interface
   - `ReteConnection` interface
   - `NodeData` interface
   - `Socket` interface
   - `VSCodeMessage` interface (for extension ↔ webview communication)
2. Create `src/pythonClient.ts` type definitions section with matching interfaces
3. Ensure field names match Python models (snake_case conversion handled in serialization layer)

**Validation**:
- TypeScript compiles without errors
- Types match Python model structure
- Type guards work correctly
- JSON serialization compatible with Python output

**Files Created**:
- `webview-ui/src/types.ts`
- `tests/webview-ui/src/__tests__/types.test.ts`

---

## Phase 2: Python Service Implementation

### Task 2.1: AST Parser Core
**Status**: Pending  
**Dependencies**: Task 1.2  
**Priority**: High

**Description**: Implement core AST parsing and graph conversion logic following TDD.

**Test Tasks (Write First)**:
1. Write test: `test_parser.py::test_parsing_simple_binary_operation` - Parse `"x + y"`, verify BinOp node, Name nodes, connections
2. Write test: `test_parser.py::test_parsing_function_definition` - Parse `"def hello(): pass"`, verify FunctionDef node, name, line number
3. Write test: `test_parser.py::test_parsing_class_definition` - Parse `"class MyClass: pass"`, verify ClassDef node
4. Write test: `test_parser.py::test_error_handling_invalid_syntax` - Invalid Python code, verify SyntaxError raised
5. Write test: `test_parser.py::test_line_number_preservation` - Multi-line code, verify lineno in node data
6. Write test: `test_parser.py::test_node_id_generation` - Verify unique IDs, deterministic (same AST → same IDs)
7. Write test: `test_parser.py::test_connection_creation` - Verify parent-child relationships create connections

**Implementation Tasks**:
1. Create `python_service/parser.py` with:
   - `ReteConverter` class extending `ast.NodeVisitor`
   - `__init__` method initializing `nodes: List[ReteNode]`, `connections: List[ReteConnection]`, `_node_id_map: Dict[int, str]`
   - Node ID generation logic (deterministic based on AST node ID)
   - `parse_to_rete(source_code: str) -> ReteGraph` entry point method
   - `visit_BinOp(node: ast.BinOp)` method (first AST node type handler)
   - Connection tracking logic (parent-child relationships)
2. Add Google-style docstrings to all methods
3. Run tests to verify all pass

**Validation**:
- All tests pass
- Parser creates valid ReteGraph structure
- Node IDs are unique and deterministic
- Connections reflect AST parent-child relationships
- Line numbers and column offsets preserved

**Files Created**:
- `python_service/parser.py`
- `tests/python_service/test_parser.py`

---

### Task 2.2: AST Node Type Handlers
**Status**: Pending  
**Dependencies**: Task 2.1  
**Priority**: High

**Description**: Implement visit handlers for common AST node types.

**Test Tasks (Write First)**:
1. Write test: `test_parser.py::test_visit_function_def` - FunctionDef handler creates node with correct data
2. Write test: `test_parser.py::test_visit_class_def` - ClassDef handler creates node
3. Write test: `test_parser.py::test_visit_call` - Call handler creates node
4. Write test: `test_parser.py::test_visit_name` - Name handler creates node
5. Write test: `test_parser.py::test_visit_if` - If handler creates node with body connections
6. Write test: `test_parser.py::test_visit_for` - For handler creates node
7. Write test: `test_parser.py::test_visit_while` - While handler creates node
8. Write test: `test_parser.py::test_visit_return` - Return handler creates node
9. Write test: `test_parser.py::test_complex_nested_structures` - Nested functions/classes, verify all nodes and connections

**Implementation Tasks**:
1. Implement `visit_FunctionDef(node: ast.FunctionDef)` - Create FunctionDef node, connect to body
2. Implement `visit_ClassDef(node: ast.ClassDef)` - Create ClassDef node, connect to body
3. Implement `visit_Call(node: ast.Call)` - Create Call node, connect func and args
4. Implement `visit_Name(node: ast.Name)` - Create Name node
5. Implement `visit_If(node: ast.If)` - Create If node, connect test, body, orelse
6. Implement `visit_For(node: ast.For)` - Create For node, connect target, iter, body
7. Implement `visit_While(node: ast.While)` - Create While node, connect test, body
8. Implement `visit_Return(node: ast.Return)` - Create Return node, connect value
9. Add handlers for additional common AST types (Assign, AugAssign, List, Dict, etc.)
10. Add Google-style docstrings to all visit methods
11. Run tests to verify all pass

**Validation**:
- All tests pass
- Each AST node type creates appropriate Rete node
- Connections reflect AST structure
- Complex nested structures handled correctly

**Files Modified**:
- `python_service/parser.py`
- `tests/python_service/test_parser.py`

---

### Task 2.3: Communication Server
**Status**: Pending  
**Dependencies**: Task 2.1, Task 1.2  
**Priority**: High

**Description**: Implement stdio-based communication server for Python service.

**Test Tasks (Write First)**:
1. Write test: `test_server.py::test_server_initialization` - Create server with parser, verify dependency injection
2. Write test: `test_server.py::test_handling_valid_parse_request` - Send valid source code, verify graph response
3. Write test: `test_server.py::test_handling_invalid_source_code` - Send invalid Python, verify error response
4. Write test: `test_server.py::test_error_response_formatting` - Verify error response structure and codes
5. Write test: `test_server.py::test_server_lifecycle` - Test start/stop, verify clean shutdown

**Implementation Tasks**:
1. Create `python_service/server.py` with:
   - `ASTParseServer` class
   - `__init__(parser: ReteConverter)` - Dependency injection of parser
   - `handle_parse_request(source_code: str) -> Dict[str, Any]` - Parse and return graph or error
   - Request parsing logic (read from stdin)
   - Response formatting logic (write to stdout)
   - Error handling and formatting
   - `start_server()` method - Start stdio server loop
   - `stop_server()` method - Graceful shutdown
2. Add Google-style docstrings to all methods
3. Run tests to verify all pass

**Validation**:
- All tests pass
- Server handles valid requests correctly
- Server handles invalid requests with proper errors
- Server lifecycle works correctly
- Communication protocol matches interface specification

**Files Created**:
- `python_service/server.py`
- `tests/python_service/test_server.py`

---

### Task 2.4: Python Service Entry Point
**Status**: Pending  
**Dependencies**: Task 2.3  
**Priority**: Medium

**Description**: Create main entry point for Python service.

**Test Tasks (Write First)**:
1. Write test: `test_main.py::test_service_startup` - Service starts successfully
2. Write test: `test_main.py::test_service_shutdown` - Service shuts down gracefully
3. Write test: `test_main.py::test_signal_handling` - SIGTERM/SIGINT handled correctly

**Implementation Tasks**:
1. Create `python_service/__main__.py` with:
   - `main()` function
   - Initialize `ReteConverter`
   - Initialize `ASTParseServer` with parser
   - Start server
   - Handle shutdown signals (SIGTERM, SIGINT)
2. Add Google-style docstring
3. Update `pyproject.toml` with entry point configuration
4. Run tests to verify all pass

**Validation**:
- Service starts and runs
- Service responds to shutdown signals
- Entry point executable via `python -m python_service`

**Files Created**:
- `python_service/__main__.py`
- `tests/python_service/test_main.py`

---

## Phase 3: Extension Host Implementation

### Task 3.1: Python Client
**Status**: Pending  
**Dependencies**: Task 2.3 (Python service running)  
**Priority**: High

**Description**: Implement TypeScript client for communicating with Python service.

**Test Tasks (Write First)**:
1. Write test: `pythonClient.test.ts::test_service_spawning` - Mock child_process.spawn, verify process spawned
2. Write test: `pythonClient.test.ts::test_sending_parse_request` - Mock stdio, send source code, verify request format
3. Write test: `pythonClient.test.ts::test_receiving_parse_response` - Mock response, verify graph parsed correctly
4. Write test: `pythonClient.test.ts::test_error_handling_service_unavailable` - Mock service failure, verify error thrown
5. Write test: `pythonClient.test.ts::test_service_stopping` - Start then stop, verify process terminated
6. Write test: `pythonClient.test.ts::test_health_check` - Verify `isServiceRunning()` returns correct state

**Implementation Tasks**:
1. Create `src/pythonClient.ts` with:
   - `PythonClient` class
   - `spawnService(): Promise<void>` - Spawn Python service process using child_process
   - stdio communication setup (stdin/stdout)
   - `parseAST(sourceCode: string): Promise<ReteGraph>` - Send request, receive response
   - Request/response parsing (JSON-RPC-like protocol)
   - Error handling
   - `stopService(): void` - Terminate process
   - `isServiceRunning(): boolean` - Health check
2. Add JSDoc comments to all public methods
3. Run tests to verify all pass

**Validation**:
- All tests pass
- Client spawns Python service correctly
- Client communicates with service via stdio
- Client handles errors gracefully
- Client cleans up resources on stop

**Files Created**:
- `src/pythonClient.ts`
- `tests/src/pythonClient.test.ts`

---

### Task 3.2: Extension Entry Point
**Status**: Pending  
**Dependencies**: Task 3.1  
**Priority**: High

**Description**: Implement VS Code extension activation and command registration.

**Test Tasks (Write First)**:
1. Write test: `extension.test.ts::test_extension_activation` - Mock VS Code API, call activate, verify commands registered
2. Write test: `extension.test.ts::test_command_registration` - Verify "Visualize AST" command registered with handler
3. Write test: `extension.test.ts::test_webview_panel_creation` - Trigger command, verify panel created
4. Write test: `extension.test.ts::test_file_watcher_setup` - Verify file watcher created, triggers on save
5. Write test: `extension.test.ts::test_extension_deactivation` - Call deactivate, verify cleanup

**Implementation Tasks**:
1. Create `src/extension.ts` with:
   - `activate(context: vscode.ExtensionContext)` function
   - Create `PythonClient` instance
   - Register "python-ast.visualize" command
   - Command handler implementation
   - `deactivate()` function for cleanup
2. Add JSDoc comments to all exported functions
3. Run tests to verify all pass

**Validation**:
- All tests pass
- Extension activates successfully
- Commands registered correctly
- Extension deactivates cleanly

**Files Created**:
- `src/extension.ts`
- `tests/src/extension.test.ts`

---

### Task 3.3: Webview Panel Management
**Status**: Pending  
**Dependencies**: Task 3.2  
**Priority**: High

**Description**: Implement webview panel creation and message handling.

**Test Tasks (Write First)**:
1. Write test: `extension.test.ts::test_webview_panel_creation` - Verify panel created with correct configuration
2. Write test: `extension.test.ts::test_message_handling_from_webview` - Mock webview message, verify handled correctly
3. Write test: `extension.test.ts::test_sending_graph_updates_to_webview` - Send graph, verify webview receives it
4. Write test: `extension.test.ts::test_navigation_to_source_code` - Navigate message, verify editor opens and navigates

**Implementation Tasks**:
1. Implement `createVisualizationPanel(context, pythonClient)` function:
   - Create webview panel
   - Set HTML content with script loading
   - Configure webview options (enable scripts, local resources)
   - Set up message handler for webview messages
2. Implement message handlers:
   - Graph update handler (send graph to webview)
   - Navigation handler (node click → editor navigation using `vscode.window.showTextDocument`)
   - Error display handler
3. Add JSDoc comments
4. Run tests to verify all pass

**Validation**:
- All tests pass
- Webview panel created correctly
- Messages sent/received correctly
- Navigation works (opens file, navigates to line/column)

**Files Modified**:
- `src/extension.ts`
- `tests/src/extension.test.ts`

---

## Phase 4: Webview UI Implementation

### Task 4.1: Rete.js Editor Setup
**Status**: Pending  
**Dependencies**: Task 1.3, Rete.js packages  
**Priority**: High

**Description**: Initialize Rete.js editor with plugins in webview.

**Test Tasks (Write First)**:
1. Write test: `editor.test.ts::test_editor_initialization` - Create container, initialize editor, verify Rete editor created
2. Write test: `editor.test.ts::test_loading_graph_from_json` - Load test graph, verify nodes rendered
3. Write test: `editor.test.ts::test_clearing_graph` - Load then clear, verify editor empty
4. Write test: `editor.test.ts::test_getting_graph_data` - Load graph, get data, verify matches input
5. Write test: `editor.test.ts::test_node_click_event_handling` - Register handler, simulate click, verify handler called

**Implementation Tasks**:
1. Install Rete.js dependencies: `rete`, `rete-area-plugin`, `rete-connection-plugin`, `rete-react-render-plugin`
2. Create `webview-ui/src/editor.ts` with:
   - `ReteASTEditor` class implementing `ASTEditor` interface
   - `initialize(container: HTMLElement)` - Create NodeEditor, configure plugins (AreaPlugin, ConnectionPlugin, ReactRenderPlugin)
   - `loadGraph(graph: ReteGraph)` - Call `editor.fromJSON()`
   - `clearGraph()` - Clear editor
   - `getGraph(): ReteGraph` - Call `editor.toJSON()`
   - `onNodeClick(handler)` - Register node click handlers
3. Add JSDoc comments
4. Run tests to verify all pass

**Validation**:
- All tests pass
- Editor initializes with plugins
- Graph loads and renders correctly
- Node click events captured

**Files Created**:
- `webview-ui/src/editor.ts`
- `webview-ui/src/__tests__/editor.test.ts`

---

### Task 4.2: Custom Node Components
**Status**: Pending  
**Dependencies**: Task 4.1  
**Priority**: High

**Description**: Create React components for AST node visualization.

**Test Tasks (Write First)**:
1. Write test: `ASTNode.test.tsx::test_base_node_component_rendering` - Render with test data, verify component renders
2. Write test: `ASTNode.test.tsx::test_node_data_display` - Render with specific data, verify fields visible
3. Write test: `ASTNode.test.tsx::test_node_styling` - Render node, verify styles applied, theme colors used
4. Write test: `ASTNode.test.tsx::test_node_factory_function` - Call factory with node type, verify correct component returned

**Implementation Tasks**:
1. Create `webview-ui/src/nodes/ASTNode.tsx` - Base node component with common styling
2. Create `webview-ui/src/nodes/BinOpNode.tsx` - Binary operation node component
3. Create `webview-ui/src/nodes/FunctionDefNode.tsx` - Function definition node component
4. Create `webview-ui/src/nodes/ClassDefNode.tsx` - Class definition node component
5. Create `webview-ui/src/nodes/CallNode.tsx` - Function call node component
6. Create `webview-ui/src/nodes/NameNode.tsx` - Variable reference node component
7. Create `webview-ui/src/nodes/index.ts` - Node factory function (node type → component)
8. Register all node types with Rete editor
9. Add JSDoc comments
10. Run tests to verify all pass

**Validation**:
- All tests pass
- Node components render correctly
- Node data displayed properly
- Styling matches VS Code theme
- Node factory works correctly

**Files Created**:
- `webview-ui/src/nodes/ASTNode.tsx`
- `webview-ui/src/nodes/BinOpNode.tsx`
- `webview-ui/src/nodes/FunctionDefNode.tsx`
- `webview-ui/src/nodes/ClassDefNode.tsx`
- `webview-ui/src/nodes/CallNode.tsx`
- `webview-ui/src/nodes/NameNode.tsx`
- `webview-ui/src/nodes/index.ts`
- `webview-ui/src/__tests__/nodes/ASTNode.test.tsx`

---

### Task 4.3: React App and Message Handling
**Status**: Pending  
**Dependencies**: Task 4.1, Task 4.2  
**Priority**: High

**Description**: Create React app component with VS Code message handling.

**Test Tasks (Write First)**:
1. Write test: `App.test.tsx::test_message_listener_setup` - Render app, verify message listener registered
2. Write test: `App.test.tsx::test_handling_graph_update_messages` - Send updateGraph message, verify graph updated
3. Write test: `App.test.tsx::test_handling_error_messages` - Send error message, verify error displayed
4. Write test: `App.test.tsx::test_sending_navigation_messages` - Trigger node click, verify navigation message sent
5. Write test: `App.test.tsx::test_loading_state` - Set loading state, verify indicator shown
6. Write test: `App.test.tsx::test_error_display` - Set error state, verify error message displayed

**Implementation Tasks**:
1. Create `webview-ui/src/App.tsx` with:
   - React app component
   - Initialize Rete editor in useEffect
   - Set up message listener (`window.addEventListener('message')`)
   - `handleMessage(message: VSCodeMessage)` function
   - `updateGraph(graph: ReteGraph)` function
   - `handleNodeClick(nodeId, lineno, colOffset)` function
   - `sendMessage(message: VSCodeMessage)` function
   - Loading state management
   - Error state display
2. Create `webview-ui/src/index.tsx` - React entry point
3. Create `webview-ui/index.html` - HTML template
4. Add JSDoc comments
5. Run tests to verify all pass

**Validation**:
- All tests pass
- Message listener works correctly
- Graph updates trigger editor refresh
- Node clicks send navigation messages
- Loading and error states display correctly

**Files Created**:
- `webview-ui/src/App.tsx`
- `webview-ui/src/index.tsx`
- `webview-ui/index.html`
- `webview-ui/src/__tests__/App.test.tsx`

---

### Task 4.4: Styling and Theme Integration
**Status**: Pending  
**Dependencies**: Task 4.2  
**Priority**: Medium

**Description**: Configure Tailwind CSS and apply VS Code theme styling.

**Test Tasks (Write First)**:
1. Write test: `styles.test.ts::test_css_variable_usage` - Verify CSS variables used in styles
2. Write test: `styles.test.ts::test_theme_color_application` - Verify theme colors applied correctly
3. Write test: `styles.test.ts::test_responsive_layout` - Verify responsive classes applied

**Implementation Tasks**:
1. Create `webview-ui/tailwind.config.js` - Configure Tailwind to use VS Code CSS variables
2. Create `webview-ui/src/index.css` - Global styles with VS Code theme variables
3. Create `webview-ui/src/components/NodeStyles.css` - Node-specific styles
4. Configure custom color palette matching VS Code theme
5. Style base node components (rounded corners, shadows)
6. Style connection wires
7. Style viewport/area
8. Add hover and selection states
9. Implement Blueprint-inspired dark mode styling
10. Run tests to verify all pass

**Validation**:
- CSS variables used correctly
- Theme colors match VS Code
- Responsive layout works
- Visual styling matches design (manual verification)

**Files Created**:
- `webview-ui/tailwind.config.js`
- `webview-ui/src/index.css`
- `webview-ui/src/components/NodeStyles.css`
- `webview-ui/src/__tests__/styles.test.ts`

---

## Phase 5: Integration and End-to-End Flow

### Task 5.1: End-to-End Integration
**Status**: Pending  
**Dependencies**: All previous phases  
**Priority**: High

**Description**: Connect all components and verify full workflow.

**Test Tasks (Write First)**:
1. Write integration test: `e2e/workflow.test.ts::test_file_to_parse_to_visualize` - Create test Python file, trigger visualization, verify graph rendered
2. Write integration test: `e2e/navigation.test.ts::test_node_click_to_navigation` - Render graph, click node, verify editor navigates
3. Write integration test: `e2e/auto-refresh.test.ts::test_file_save_to_auto_refresh` - Open visualization, modify file, save, verify graph updated
4. Write integration test: `e2e/error-handling.test.ts::test_error_propagation_end_to_end` - Invalid Python code, verify error shown in webview

**Implementation Tasks**:
1. Test Python service → Extension host communication
2. Test Extension host → Webview communication
3. Test Webview → Extension host navigation
4. Verify graph rendering with real Python code
5. Verify node click navigation works
6. Test error propagation through all layers
7. Fix any integration issues found

**Validation**:
- All integration tests pass
- Full workflow works end-to-end
- Error handling works across layers
- Performance acceptable (< 5 seconds for full workflow)

**Files Created**:
- `tests/integration/e2e/workflow.test.ts`
- `tests/integration/e2e/navigation.test.ts`
- `tests/integration/e2e/auto-refresh.test.ts`
- `tests/integration/e2e/error-handling.test.ts`

---

### Task 5.2: Auto-Refresh on File Save
**Status**: Pending  
**Dependencies**: Task 3.2  
**Priority**: Medium

**Description**: Implement automatic graph refresh when Python files are saved.

**Test Tasks (Write First)**:
1. Write test: `extension.test.ts::test_file_watcher_triggers_on_save` - Save Python file, verify watcher triggers
2. Write test: `extension.test.ts::test_parse_triggered_automatically` - Verify parse called on file save
3. Write test: `extension.test.ts::test_debouncing_rapid_saves` - Rapid saves, verify debounced
4. Write test: `extension.test.ts::test_webview_updates_automatically` - Verify webview receives updated graph

**Implementation Tasks**:
1. Enhance file watcher in `src/extension.ts` to detect Python file saves
2. Automatically trigger parse on save
3. Send updated graph to webview
4. Implement debouncing for rapid save events (use debounce utility)
5. Run tests to verify all pass

**Validation**:
- File watcher triggers on save
- Parse triggered automatically
- Debouncing works for rapid saves
- Webview updates automatically

**Files Modified**:
- `src/extension.ts`
- `tests/src/extension.test.ts`

---

## Phase 6: Polish and Optimization

### Task 6.1: Performance Optimization
**Status**: Pending  
**Dependencies**: All previous phases  
**Priority**: Low

**Description**: Optimize performance for large ASTs (100+ nodes).

**Test Tasks (Write First)**:
1. Write performance test: `performance.test.py::test_parse_large_file` - Parse file with 100+ nodes, verify < 1 second
2. Write performance test: `performance.test.ts::test_render_large_graph` - Render graph with 100+ nodes, verify < 2 seconds
3. Write test: `performance.test.ts::test_worker_support` - If implemented, verify worker support works
4. Write test: `performance.test.ts::test_debouncing_behavior` - Verify debouncing works correctly

**Implementation Tasks**:
1. Profile Python parser performance
2. Optimize node ID generation
3. Implement worker support for large graphs (if needed)
4. Optimize React component rendering (use React.memo, useMemo)
5. Implement virtual scrolling if needed
6. Debounce graph updates
7. Run performance tests

**Validation**:
- Performance tests pass
- Large files parse in < 1 second
- Large graphs render in < 2 seconds
- UI remains responsive

**Files Modified**:
- `python_service/parser.py`
- `webview-ui/src/editor.ts`
- `webview-ui/src/App.tsx`
- `tests/performance/performance.test.py`
- `tests/performance/performance.test.ts`

---

### Task 6.2: Error Handling and User Feedback
**Status**: Pending  
**Dependencies**: All previous phases  
**Priority**: Medium

**Description**: Improve error handling and user feedback throughout the system.

**Test Tasks (Write First)**:
1. Write test: `error-handling.test.ts::test_error_message_display` - Verify error messages displayed in webview
2. Write test: `error-handling.test.ts::test_service_failure_handling` - Python service fails, verify graceful handling
3. Write test: `error-handling.test.ts::test_loading_state_display` - Verify loading indicators shown
4. Write test: `error-handling.test.ts::test_error_recovery` - Verify error recovery suggestions shown

**Implementation Tasks**:
1. Add user-friendly error messages throughout
2. Display parsing errors in webview with clear messages
3. Handle Python service failures gracefully (show error, suggest restart)
4. Add loading indicators during parsing
5. Add error recovery suggestions
6. Run tests to verify all pass

**Validation**:
- Error messages user-friendly
- Service failures handled gracefully
- Loading states visible
- Error recovery suggestions helpful

**Files Modified**:
- `python_service/server.py`
- `src/extension.ts`
- `webview-ui/src/App.tsx`
- `tests/error-handling/error-handling.test.ts`

---

## Documentation Tasks

### Task D.1: README.md
**Status**: Pending  
**Dependencies**: Task 1.1  
**Priority**: High

**Description**: Create project README with executive summary, installation, and usage.

**Tasks**:
1. Write executive summary (what project does, key features, use cases)
2. Write installation instructions (prerequisites, step-by-step, running install.sh)
3. Write usage instructions (how to open visualization, use graph interface, navigate to source)
4. Ensure content stays under 500 lines

**Files Created**:
- `README.md`

---

### Task D.2: Code Documentation
**Status**: Pending  
**Dependencies**: All implementation tasks  
**Priority**: Medium

**Description**: Add Google-style docstrings (Python) and JSDoc comments (TypeScript) to all public APIs.

**Tasks**:
1. Review all Python files, add docstrings to public functions/classes
2. Review all TypeScript files, add JSDoc comments to public functions/classes
3. Ensure all code examples in docstrings work

**Files Modified**:
- All Python and TypeScript source files

---

## Task Dependencies Summary

```
Phase 1 (Foundation):
  1.1 Project Structure (no deps)
  1.2 Python Models (dep: 1.1)
  1.3 TypeScript Types (dep: 1.2)

Phase 2 (Python Service):
  2.1 Parser Core (dep: 1.2)
  2.2 Node Handlers (dep: 2.1)
  2.3 Server (dep: 2.1, 1.2)
  2.4 Entry Point (dep: 2.3)

Phase 3 (Extension Host):
  3.1 Python Client (dep: 2.3)
  3.2 Extension Entry (dep: 3.1)
  3.3 Webview Management (dep: 3.2)

Phase 4 (Webview UI):
  4.1 Editor Setup (dep: 1.3, Rete.js)
  4.2 Node Components (dep: 4.1)
  4.3 App & Messages (dep: 4.1, 4.2)
  4.4 Styling (dep: 4.2)

Phase 5 (Integration):
  5.1 E2E Flow (dep: all previous)
  5.2 Auto-refresh (dep: 3.2)

Phase 6 (Polish):
  6.1 Performance (dep: all previous)
  6.2 Error Handling (dep: all previous)

Documentation:
  D.1 README (dep: 1.1)
  D.2 Code Docs (dep: all implementation)
```

## Validation Checklist

After each task:
- ✅ Tests written first (TDD)
- ✅ Tests pass
- ✅ Linting passes (`ruff check`, `mypy`, TypeScript compiler)
- ✅ No regressions in previous tasks
- ✅ Interface contracts maintained
- ✅ Dependency injection used for non-deterministic dependencies
- ✅ Models validate data at boundaries
- ✅ Code follows project development practices
