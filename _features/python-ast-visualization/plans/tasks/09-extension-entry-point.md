# Task Plan: 09-extension-entry-point

## Overview

Implement VS Code extension activation. activate() creates PythonClient, registers "python-ast.visualize" command. deactivate() cleans up.

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/extension.ts` | Create – activate, deactivate, command handler |
| `package.json` | Modify – contributes.commands, activationEvents |
| `tests/src/extension.test.ts` | Create – extension tests |

## Test Strategy (Write First)

1. `test_extension_activation` – activate() registers commands
2. `test_command_registration` – "python-ast.visualize" registered
3. `test_command_execution` – Handler calls parseAST, creates panel (mocked)
4. `test_extension_deactivation` – stopService, cleanup
5. `test_error_handling_no_active_editor` – Show message
6. `test_error_handling_non_python_file` – Handle appropriately

## Implementation Order

1. Create activate(context) – PythonClient, registerCommand
2. Command handler – get active editor, get content, parseAST, create panel (stub for Task 10)
3. Create deactivate() – stopService
4. Update package.json contributes.commands
5. Add JSDoc

## Validation Steps

- Extension activates
- Command triggers
- Deactivation cleans up
- All tests pass

## Documentation Updates

JSDoc on activate, deactivate.
