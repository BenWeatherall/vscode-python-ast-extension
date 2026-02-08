# Background

This task creates the React app component that ties together the Rete editor, message handling, and VS Code communication. The app component initializes the editor and handles bidirectional message communication with the extension host. This task depends on Task 11 (Rete Editor Setup) and Task 12 (Custom Node Components) as it uses both the editor and node components. Following TDD principles, tests must be written before implementation.

# This Task

1. Create `webview-ui/src/App.tsx` with:

   - React app component:
     - State management:
       - `graph: ReteGraph | null` - Current graph data
       - `loading: boolean` - Loading state
       - `error: string | null` - Error state
     - Initialize Rete editor in useEffect:
       - Create container element reference
       - Initialize editor when component mounts
       - Clean up editor on unmount
     - Set up message listener:
       - `window.addEventListener('message', handleMessage)`
       - Remove listener on unmount
     - `handleMessage(message: VSCodeMessage)` function:
       - Handle 'updateGraph' messages
       - Handle 'error' messages
       - Handle other message types
     - `updateGraph(graph: ReteGraph)` function:
       - Update graph state
       - Call editor.loadGraph()
       - Clear error state
     - `handleNodeClick(nodeId, lineno, colOffset)` function:
       - Send navigateToSource message to extension host
       - Format message as VSCodeMessage
     - `sendMessage(message: VSCodeMessage)` function:
       - Use `vscode.postMessage()` to send message
       - Handle send errors
     - Loading state management:
       - Show loading indicator during parsing
       - Hide loading indicator when graph received
     - Error state display:
       - Display error messages
       - Provide error recovery options

2. Create `webview-ui/src/index.tsx` - React entry point:
   - Import React and ReactDOM
   - Render App component to root element
   - Set up React root

3. Create `webview-ui/index.html` - HTML template:
   - Basic HTML structure
   - Root div for React app
   - Script tag for bundled JavaScript
   - VS Code webview API script

4. Add JSDoc comments to all functions

**Acceptance Criteria**:
- Message listener works correctly
- Graph updates trigger editor refresh
- Node clicks send navigation messages
- Loading and error states display correctly
- Component cleans up on unmount
- All tests pass

# Testing Needed

1. Write test: `webview-ui/src/__tests__/App.test.tsx::test_message_listener_setup`
   - Render app component
   - Verify message listener registered
   - Verify listener calls handleMessage
   - Test listener cleanup on unmount

2. Write test: `webview-ui/src/__tests__/App.test.tsx::test_handling_graph_update_messages`
   - Send updateGraph message
   - Verify graph state updated
   - Verify editor.loadGraph() called
   - Verify error state cleared

3. Write test: `webview-ui/src/__tests__/App.test.tsx::test_handling_error_messages`
   - Send error message
   - Verify error state set
   - Verify error displayed in UI
   - Verify loading state cleared

4. Write test: `webview-ui/src/__tests__/App.test.tsx::test_sending_navigation_messages`
   - Trigger node click with lineno/colOffset
   - Verify navigateToSource message sent
   - Verify message format correct
   - Test with missing lineno/colOffset

5. Write test: `webview-ui/src/__tests__/App.test.tsx::test_loading_state`
   - Set loading state
   - Verify loading indicator shown
   - Verify graph not interactive during loading
   - Verify loading cleared when graph received

6. Write test: `webview-ui/src/__tests__/App.test.tsx::test_error_display`
   - Set error state
   - Verify error message displayed
   - Verify error styling applied
   - Test error recovery

7. Write test: `webview-ui/src/__tests__/App.test.tsx::test_editor_initialization`
   - Verify editor initialized on mount
   - Verify editor cleaned up on unmount
   - Test editor initialization errors

8. Write test: `webview-ui/src/__tests__/App.test.tsx::test_component_unmount`
   - Unmount component
   - Verify message listener removed
   - Verify editor cleaned up
   - Verify no memory leaks

9. Manual validation: Test app in webview:
   - Load webview in VS Code
   - Verify app renders
   - Send test messages and verify handling
   - Test node clicks and navigation
