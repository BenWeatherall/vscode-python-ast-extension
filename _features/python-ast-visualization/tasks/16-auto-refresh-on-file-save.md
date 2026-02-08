# Background

This task implements automatic graph refresh when Python files are saved. The file watcher detects file saves and automatically triggers parsing and graph updates. This task depends on Task 09 (Extension Entry Point) as it extends the extension functionality. Following TDD principles, tests must be written before implementation.

# This Task

1. Enhance file watcher in `src/extension.ts`:

   - Create file watcher for Python files:
     - Use `vscode.workspace.createFileSystemWatcher()`
     - Watch for `.py` file saves
     - Filter to active workspace files

   - Automatically trigger parse on save:
     - Listen for file save events
     - Get file content
     - Call pythonClient.parseAST()
     - Send updated graph to webview

   - Send updated graph to webview:
     - Find active webview panel
     - Send updateGraph message
     - Handle case where no panel open

   - Implement debouncing for rapid save events:
     - Use debounce utility (lodash or custom)
     - Debounce delay: 300-500ms
     - Cancel previous debounced calls on new save

2. Handle edge cases:
   - Multiple webview panels open
   - File saved while parsing in progress
   - File saved while webview closed
   - Rapid consecutive saves

3. Add configuration option (optional):
   - Allow users to enable/disable auto-refresh
   - Configurable debounce delay

**Acceptance Criteria**:
- File watcher triggers on save
- Parse triggered automatically
- Debouncing works for rapid saves
- Webview updates automatically
- No performance degradation
- All tests pass

# Testing Needed

1. Write test: `tests/src/extension.test.ts::test_file_watcher_triggers_on_save`
   - Mock file watcher
   - Simulate file save event
   - Verify watcher triggers
   - Verify parse called

2. Write test: `tests/src/extension.test.ts::test_parse_triggered_automatically`
   - Save Python file
   - Verify parseAST called automatically
   - Verify graph sent to webview

3. Write test: `tests/src/extension.test.ts::test_debouncing_rapid_saves`
   - Simulate rapid saves (multiple in < 500ms)
   - Verify debouncing applied
   - Verify only one parse triggered
   - Verify final state correct

4. Write test: `tests/src/extension.test.ts::test_webview_updates_automatically`
   - Open webview panel
   - Save Python file
   - Verify webview receives updated graph
   - Verify graph refreshed in UI

5. Write test: `tests/src/extension.test.ts::test_auto_refresh_with_no_panel`
   - Save file with no webview open
   - Verify no errors thrown
   - Verify parse still triggered (for future use)

6. Write test: `tests/src/extension.test.ts::test_auto_refresh_multiple_panels`
   - Open multiple webview panels
   - Save file
   - Verify all panels receive update

7. Write test: `tests/src/extension.test.ts::test_debounce_cancellation`
   - Trigger save
   - Trigger another save before debounce completes
   - Verify previous debounce cancelled
   - Verify only latest parse executed

8. Manual validation: Test auto-refresh:
   - Open visualization
   - Modify Python file
   - Save file
   - Verify graph updates automatically
   - Test rapid saves and verify debouncing
