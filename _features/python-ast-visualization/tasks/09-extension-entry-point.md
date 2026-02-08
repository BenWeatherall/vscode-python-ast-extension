# Background

This task implements the VS Code extension activation and command registration. The extension entry point sets up the Python client and registers commands for visualizing ASTs. This task depends on Task 08 (Python Client) as it uses the PythonClient class. Following TDD principles, tests must be written before implementation.

# This Task

1. Create `src/extension.ts` with:

   - `activate(context: vscode.ExtensionContext)` function:
     - Create `PythonClient` instance
     - Store client in extension context
     - Register "python-ast.visualize" command
     - Set up command handler
     - Return disposable for cleanup

   - Command handler implementation:
     - Get active text editor
     - Get document content
     - Call pythonClient.parseAST()
     - Create webview panel (to be implemented in Task 10)
     - Handle errors and show error messages

   - `deactivate()` function:
     - Stop Python service
     - Clean up resources
     - Dispose of disposables

2. Add JSDoc comments to all exported functions

3. Register commands in `package.json`:
   - Add command to `contributes.commands`
   - Add activation event

**Acceptance Criteria**:
- Extension activates successfully
- Commands registered correctly
- Command handler executes when triggered
- Extension deactivates cleanly
- All tests pass

# Testing Needed

1. Write test: `tests/src/extension.test.ts::test_extension_activation`
   - Mock VS Code API
   - Call activate() function
   - Verify commands registered
   - Verify Python client created

2. Write test: `tests/src/extension.test.ts::test_command_registration`
   - Verify "python-ast.visualize" command registered
   - Verify command handler attached
   - Verify command appears in command palette

3. Write test: `tests/src/extension.test.ts::test_command_execution`
   - Mock active editor and document
   - Trigger command
   - Verify parseAST called with document content
   - Verify webview panel created (mocked)

4. Write test: `tests/src/extension.test.ts::test_extension_deactivation`
   - Call deactivate()
   - Verify Python service stopped
   - Verify resources cleaned up
   - Verify disposables disposed

5. Write test: `tests/src/extension.test.ts::test_error_handling_no_active_editor`
   - Trigger command with no active editor
   - Verify error message shown to user

6. Write test: `tests/src/extension.test.ts::test_error_handling_non_python_file`
   - Trigger command with non-Python file
   - Verify appropriate handling (error or skip)

7. Manual validation: Test extension in VS Code:
   - Install extension
   - Open Python file
   - Trigger command from command palette
   - Verify command executes
