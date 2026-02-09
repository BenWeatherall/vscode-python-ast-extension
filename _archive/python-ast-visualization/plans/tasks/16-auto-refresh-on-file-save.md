# Task Plan: 16-auto-refresh-on-file-save

## Overview

Implement file watcher for .py saves. On save: parse, send updateGraph to webview. Debounce 300–500ms. Handle multiple panels, no panel, rapid saves.

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/extension.ts` | Modify – file watcher, debounce |
| `tests/src/extension.test.ts` | Modify – auto-refresh tests |

## Test Strategy (Write First)

1. `test_file_watcher_triggers_on_save` – Watcher fires
2. `test_parse_triggered_automatically` – parseAST called
3. `test_debouncing_rapid_saves` – One parse for rapid saves
4. `test_webview_updates_automatically` – Panel receives graph
5. `test_auto_refresh_with_no_panel` – No errors
6. `test_auto_refresh_multiple_panels` – All panels updated
7. `test_debounce_cancellation` – Previous cancelled

## Implementation Order

1. createFileSystemWatcher("**/*.py")
2. onDidSave → get content, parseAST, postMessage to panel(s)
3. Add debounce (custom or lodash)
4. Track active panels, send to all
5. Handle no panel (no-op or prepare for future)

## Validation Steps

- Watcher triggers
- Debounce works
- Webview updates
- All tests pass

## Documentation Updates

JSDoc on watcher setup.
