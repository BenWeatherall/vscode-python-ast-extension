# Background

This task creates React components for visualizing AST nodes. Each AST node type gets its own component with appropriate styling and data display. This task depends on Task 11 (Rete Editor Setup) as the components are registered with the Rete editor. Following TDD principles, tests must be written before implementation.

# This Task

1. Create `webview-ui/src/nodes/ASTNode.tsx` - Base node component:
   - Common styling and layout
   - Node header with label
   - Node body with data display
   - VS Code theme integration
   - Hover and selection states

2. Create specific node type components:

   - `webview-ui/src/nodes/BinOpNode.tsx`:
     - Display binary operation (e.g., "+", "-", "*")
     - Show operator symbol
     - Style based on operator type

   - `webview-ui/src/nodes/FunctionDefNode.tsx`:
     - Display function name
     - Show parameters
     - Indicate function type

   - `webview-ui/src/nodes/ClassDefNode.tsx`:
     - Display class name
     - Show base classes (if any)
     - Indicate class type

   - `webview-ui/src/nodes/CallNode.tsx`:
     - Display function call
     - Show function name and arguments

   - `webview-ui/src/nodes/NameNode.tsx`:
     - Display variable name
     - Show name context (Load/Store/Del)

3. Create `webview-ui/src/nodes/index.ts` - Node factory:
   - Function to map node type to component
   - Register all node types
   - Return appropriate component for node type
   - Handle unknown node types (fallback to base component)

4. Register all node types with Rete editor:
   - Use ReactRenderPlugin to register components
   - Map AST node types to React components
   - Configure node component props

5. Add JSDoc comments to all components

**Acceptance Criteria**:
- Node components render correctly
- Node data displayed properly
- Styling matches VS Code theme
- Node factory works correctly
- Unknown node types handled gracefully
- All tests pass

# Testing Needed

1. Write test: `webview-ui/src/__tests__/nodes/ASTNode.test.tsx::test_base_node_component_rendering`
   - Render base node with test data
   - Verify component renders
   - Verify node structure (header, body)
   - Verify styling applied

2. Write test: `webview-ui/src/__tests__/nodes/ASTNode.test.tsx::test_node_data_display`
   - Render node with specific data
   - Verify data fields visible
   - Verify formatting correct
   - Test with missing optional fields

3. Write test: `webview-ui/src/__tests__/nodes/ASTNode.test.tsx::test_node_styling`
   - Render node
   - Verify styles applied
   - Verify theme colors used
   - Test hover and selection states

4. Write test: `webview-ui/src/__tests__/nodes/BinOpNode.test.tsx::test_binop_node_rendering`
   - Render BinOp node
   - Verify operator displayed
   - Verify operator-specific styling

5. Write test: `webview-ui/src/__tests__/nodes/FunctionDefNode.test.tsx::test_function_def_node_rendering`
   - Render FunctionDef node
   - Verify function name displayed
   - Verify parameters displayed (if shown)

6. Write test: `webview-ui/src/__tests__/nodes/index.test.ts::test_node_factory_function`
   - Call factory with known node type
   - Verify correct component returned
   - Test with unknown node type
   - Verify fallback to base component

7. Write test: `webview-ui/src/__tests__/nodes/index.test.ts::test_node_registration`
   - Verify all node types registered
   - Verify components mapped correctly
   - Test node type mapping

8. Manual validation: Test node rendering:
   - Load graph with various node types
   - Verify each node type renders correctly
   - Verify styling consistent
   - Verify hover/selection states work
