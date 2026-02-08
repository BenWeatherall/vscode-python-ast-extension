# Task Plan: 11-rete-editor-setup

## Overview

Initialize Rete.js editor in webview. ReteASTEditor: initialize(), loadGraph(), clearGraph(), getGraph(), onNodeClick(). Uses AreaPlugin, ConnectionPlugin, ReactRenderPlugin.

## Files to Create/Modify

| File | Action |
|------|--------|
| `package.json` | Modify – add rete, rete-area-plugin, rete-connection-plugin, rete-react-plugin |
| `webview-ui/src/editor.ts` | Create – ReteASTEditor |
| `webview-ui/src/__tests__/editor.test.ts` | Create – editor tests |

## Test Strategy (Write First)

1. `test_editor_initialization` – Editor created, plugins configured
2. `test_loading_graph_from_json` – loadGraph loads graph
3. `test_clearing_graph` – clearGraph empties editor
4. `test_getting_graph_data` – getGraph returns graph
5. `test_node_click_event_handling` – Handler registered
6. `test_plugin_configuration` – Plugins present
7. `test_error_handling` – Invalid graph/container

## Implementation Order

1. Add Rete.js deps to package.json
2. Create ReteASTEditor class
3. initialize(container) – NodeEditor, plugins, mount
4. loadGraph(graph) – Convert and add nodes/connections
5. clearGraph(), getGraph()
6. onNodeClick(handler) – Register handlers
7. Add JSDoc

## Validation Steps

- Editor initializes
- Graph loads/clears
- Node clicks captured
- All tests pass

## Documentation Updates

JSDoc on ReteASTEditor methods.
