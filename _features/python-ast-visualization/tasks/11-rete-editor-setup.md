# Background

This task initializes the Rete.js editor with plugins in the webview. The editor provides the graph visualization canvas and handles node rendering. This task depends on Task 03 (TypeScript Type Definitions) for type definitions and requires Rete.js packages to be installed. Following TDD principles, tests must be written before implementation.

# This Task

1. Install Rete.js dependencies in `package.json`:
   - `rete>=2.0.0` - Core Rete.js graph engine
   - `rete-area-plugin>=2.0.0` - Zoom and pan functionality
   - `rete-connection-plugin>=2.0.0` - Connection rendering
   - `rete-react-render-plugin>=2.0.0` - React integration

2. Create `webview-ui/src/editor.ts` with:

   - `ReteASTEditor` class implementing `ASTEditor` interface:
     - Private fields:
       - `editor: NodeEditor | null = null`
       - `nodeClickHandlers: Array<(nodeId: string, data: NodeData) => void> = []`
     - `initialize(container: HTMLElement)`:
       - Create NodeEditor instance
       - Configure AreaPlugin for zoom/pan
       - Configure ConnectionPlugin for connections
       - Configure ReactRenderPlugin for React components
       - Mount editor to container
     - `loadGraph(graph: ReteGraph)`:
       - Call `editor.fromJSON()` with graph
       - Handle loading errors
     - `clearGraph()`:
       - Clear editor nodes and connections
       - Reset editor state
     - `getGraph(): ReteGraph`:
       - Call `editor.toJSON()` to get current graph
       - Return ReteGraph structure
     - `onNodeClick(handler)`:
       - Register node click handler
       - Store handler in nodeClickHandlers array
       - Set up Rete.js node click events

3. Add JSDoc comments to all public methods

4. Handle plugin configuration:
   - Configure AreaPlugin with zoom/pan settings
   - Configure ConnectionPlugin with connection styles
   - Configure ReactRenderPlugin with React components

**Acceptance Criteria**:
- Editor initializes with plugins correctly
- Graph loads and renders correctly
- Node click events captured
- Graph can be cleared and reloaded
- All tests pass

# Testing Needed

1. Write test: `webview-ui/src/__tests__/editor.test.ts::test_editor_initialization`
   - Create container element
   - Initialize editor
   - Verify Rete editor created
   - Verify plugins configured
   - Verify editor mounted to container

2. Write test: `webview-ui/src/__tests__/editor.test.ts::test_loading_graph_from_json`
   - Create test graph
   - Load graph into editor
   - Verify graph loaded successfully
   - Verify nodes rendered
   - Verify connections rendered

3. Write test: `webview-ui/src/__tests__/editor.test.ts::test_clearing_graph`
   - Load graph, then clear
   - Verify graph cleared
   - Verify editor empty
   - Verify can load new graph after clear

4. Write test: `webview-ui/src/__tests__/editor.test.ts::test_getting_graph_data`
   - Load graph
   - Get graph data via getGraph()
   - Verify data matches input
   - Verify structure is ReteGraph

5. Write test: `webview-ui/src/__tests__/editor.test.ts::test_node_click_event_handling`
   - Register click handler
   - Simulate node click
   - Verify handler called with correct nodeId and data
   - Test multiple handlers

6. Write test: `webview-ui/src/__tests__/editor.test.ts::test_plugin_configuration`
   - Verify AreaPlugin configured
   - Verify ConnectionPlugin configured
   - Verify ReactRenderPlugin configured
   - Test plugin functionality (zoom, pan, connections)

7. Write test: `webview-ui/src/__tests__/editor.test.ts::test_error_handling`
   - Test loading invalid graph
   - Test initializing with invalid container
   - Verify errors handled gracefully
