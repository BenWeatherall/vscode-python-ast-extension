# Task Plan: 10-webview-panel-management

## Overview

Implement createVisualizationPanel and message handlers. Webview shows graph, receives updates, sends navigateToSource. Handles graph updates and errors.

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/extension.ts` | Modify – createVisualizationPanel, message handlers |
| `tests/src/extension.test.ts` | Modify – panel and message tests |

## Test Strategy (Write First)

1. `test_webview_panel_creation` – Panel config, webview options
2. `test_message_handling_from_webview` – navigateToSource handled
3. `test_sending_graph_updates_to_webview` – postMessage with graph
4. `test_navigation_to_source_code` – showTextDocument, revealRange
5. `test_error_display` – Error sent to webview
6. `test_panel_lifecycle` – Cleanup on disposal

## Implementation Order

1. createVisualizationPanel – createWebviewPanel, HTML, CSP
2. Graph update handler – postMessage({ type: 'updateGraph', graph })
3. navigateToSource handler – showTextDocument, revealRange(lineno, colOffset)
4. Error handler – postMessage({ type: 'error', error })
5. Panel lifecycle – onDidDispose cleanup
6. Wire command handler to create panel, send initial graph

## Validation Steps

- Panel created
- Messages sent/received
- Navigation works
- All tests pass

## Documentation Updates

JSDoc on createVisualizationPanel.
