# Background

This task connects all components and verifies the full end-to-end workflow from Python file to visualization. It ensures all layers communicate correctly and the complete feature works as intended. This task depends on all previous implementation tasks. Following TDD principles, tests must be written before implementation.

# This Task

1. Test Python service → Extension host communication:
   - Verify Python service spawns correctly
   - Verify parse requests sent and received
   - Verify graph data transmitted correctly
   - Test error propagation

2. Test Extension host → Webview communication:
   - Verify graph sent to webview
   - Verify webview receives and displays graph
   - Test message format compatibility

3. Test Webview → Extension host navigation:
   - Verify node clicks send navigation messages
   - Verify extension host receives messages
   - Verify editor navigation works

4. Verify graph rendering with real Python code:
   - Test with simple Python files
   - Test with complex Python files
   - Verify all node types render
   - Verify connections render correctly

5. Verify node click navigation works:
   - Click nodes with line numbers
   - Verify editor opens correct file
   - Verify cursor positioned correctly
   - Test with missing line numbers

6. Test error propagation through all layers:
   - Invalid Python code → error in webview
   - Service failure → error handling
   - Communication errors → graceful degradation

7. Fix any integration issues found:
   - Debug communication problems
   - Fix data format mismatches
   - Resolve timing issues
   - Fix error handling gaps

**Acceptance Criteria**:
- Full workflow works end-to-end
- Error handling works across layers
- Performance acceptable (< 5 seconds for full workflow)
- All integration tests pass

# Testing Needed

1. Write integration test: `tests/integration/e2e/workflow.test.ts::test_file_to_parse_to_visualize`
   - Create test Python file
   - Trigger visualization command
   - Verify Python service parses file
   - Verify graph sent to webview
   - Verify graph rendered in webview

2. Write integration test: `tests/integration/e2e/navigation.test.ts::test_node_click_to_navigation`
   - Render graph with known line numbers
   - Simulate node click
   - Verify editor navigates to correct line
   - Verify code highlighted (if supported)

3. Write integration test: `tests/integration/e2e/auto-refresh.test.ts::test_file_save_to_auto_refresh`
   - Open visualization
   - Modify source file
   - Save file
   - Verify graph automatically updated
   - Verify new nodes appear

4. Write integration test: `tests/integration/e2e/error-handling.test.ts::test_error_propagation_end_to_end`
   - Provide invalid Python code
   - Verify error propagated through all layers
   - Verify user sees error message in webview
   - Test service failure scenario

5. Write integration test: `tests/integration/e2e/communication.test.ts::test_message_round_trip`
   - Send message from extension to webview
   - Verify webview receives message
   - Send message from webview to extension
   - Verify extension receives message

6. Write integration test: `tests/integration/e2e/performance.test.ts::test_large_file_handling`
   - Parse large Python file (100+ nodes)
   - Verify parse completes in < 1 second
   - Verify graph renders in < 2 seconds
   - Verify UI remains responsive

7. Manual validation: End-to-end testing:
   - Install extension
   - Open Python file
   - Trigger visualization
   - Verify graph displays
   - Click nodes and verify navigation
   - Modify file and verify auto-refresh
   - Test error scenarios
