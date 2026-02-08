# Background

This task implements webview panel creation and message handling. The webview panel displays the Rete.js graph visualization and handles bidirectional communication between the extension host and webview. This task depends on Task 09 (Extension Entry Point) as it extends the extension functionality. Following TDD principles, tests must be written before implementation.

# This Task

1. Extend `src/extension.ts` with webview panel management:

   - `createVisualizationPanel(context, pythonClient)` function:
     - Create webview panel using `vscode.window.createWebviewPanel()`
     - Set panel title and icon
     - Configure webview options:
       - Enable scripts
       - Allow local resources
       - Set content security policy
     - Set HTML content with script loading
     - Set up message handler for webview messages
     - Return panel instance

   - Message handlers:
     - Graph update handler:
       - Receive graph from Python service
       - Send graph to webview via `panel.webview.postMessage()`
       - Format message as VSCodeMessage
     - Navigation handler:
       - Receive navigateToSource message from webview
       - Extract nodeId, lineno, colOffset
       - Open file and navigate to position using `vscode.window.showTextDocument()`
       - Reveal range in editor
     - Error display handler:
       - Receive error from Python service
       - Send error message to webview
       - Format error as VSCodeMessage

   - Panel lifecycle management:
     - Handle panel disposal
     - Clean up message listeners
     - Stop Python service if needed

2. Update command handler to use webview panel:
   - Create panel when command triggered
   - Send initial graph to panel
   - Handle panel close events

3. Add JSDoc comments to all functions

**Acceptance Criteria**:
- Webview panel created correctly
- Messages sent/received correctly
- Navigation works (opens file, navigates to line/column)
- Error messages displayed in webview
- Panel lifecycle managed correctly
- All tests pass

# Testing Needed

1. Write test: `tests/src/extension.test.ts::test_webview_panel_creation`
   - Mock vscode.window.createWebviewPanel
   - Call createVisualizationPanel()
   - Verify panel created with correct configuration
   - Verify webview options set correctly

2. Write test: `tests/src/extension.test.ts::test_message_handling_from_webview`
   - Mock webview message
   - Simulate navigateToSource message
   - Verify message handler called
   - Verify navigation triggered

3. Write test: `tests/src/extension.test.ts::test_sending_graph_updates_to_webview`
   - Create panel
   - Send graph update
   - Verify webview.postMessage called with correct message
   - Verify message format matches VSCodeMessage interface

4. Write test: `tests/src/extension.test.ts::test_navigation_to_source_code`
   - Mock navigateToSource message with lineno/colOffset
   - Verify vscode.window.showTextDocument called
   - Verify editor reveals correct range
   - Test with missing lineno/colOffset

5. Write test: `tests/src/extension.test.ts::test_error_display`
   - Send error message to webview
   - Verify error message formatted correctly
   - Verify webview receives error

6. Write test: `tests/src/extension.test.ts::test_panel_lifecycle`
   - Create panel
   - Simulate panel disposal
   - Verify message listeners cleaned up
   - Verify resources released

7. Manual validation: Test webview in VS Code:
   - Trigger visualization command
   - Verify webview panel opens
   - Verify graph displayed (after UI implementation)
   - Click node and verify navigation works
