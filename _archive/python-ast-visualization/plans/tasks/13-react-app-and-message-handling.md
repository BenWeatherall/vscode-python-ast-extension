# Task Plan: 13-react-app-and-message-handling

## Overview

Create React App component. Manages graph state, loading, error. Listens for VSCodeMessage, calls editor.loadGraph. handleNodeClick sends navigateToSource. Uses vscode.postMessage.

## Files to Create/Modify

| File | Action |
|------|--------|
| `webview-ui/src/App.tsx` | Create – App component |
| `webview-ui/src/index.tsx` | Create – React entry |
| `webview-ui/index.html` | Create – HTML, root, script |
| `webview-ui/src/__tests__/App.test.tsx` | Create – App tests |

## Test Strategy (Write First)

1. `test_message_listener_setup` – addEventListener, cleanup
2. `test_handling_graph_update_messages` – updateGraph, loadGraph
3. `test_handling_error_messages` – error state
4. `test_sending_navigation_messages` – navigateToSource
5. `test_loading_state` – Loading indicator
6. `test_error_display` – Error UI
7. `test_editor_initialization` – useEffect init/cleanup
8. `test_component_unmount` – Listener removed, editor cleaned

## Implementation Order

1. App.tsx – state: graph, loading, error
2. useEffect – init editor, addEventListener('message')
3. handleMessage – updateGraph, error
4. handleNodeClick – postMessage(navigateToSource)
5. index.tsx – ReactDOM.createRoot, render App
6. index.html – div#root, script for bundle
7. Add JSDoc

## Validation Steps

- Message listener works
- Graph updates trigger loadGraph
- Node clicks send message
- Cleanup on unmount
- All tests pass

## Documentation Updates

JSDoc on App handlers.
