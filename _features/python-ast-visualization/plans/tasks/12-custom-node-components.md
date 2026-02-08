# Task Plan: 12-custom-node-components

## Overview

Create React components for AST nodes: ASTNode (base), BinOpNode, FunctionDefNode, ClassDefNode, CallNode, NameNode. Node factory and Rete registration.

## Files to Create/Modify

| File | Action |
|------|--------|
| `webview-ui/src/nodes/ASTNode.tsx` | Create – base node |
| `webview-ui/src/nodes/BinOpNode.tsx` | Create |
| `webview-ui/src/nodes/FunctionDefNode.tsx` | Create |
| `webview-ui/src/nodes/ClassDefNode.tsx` | Create |
| `webview-ui/src/nodes/CallNode.tsx` | Create |
| `webview-ui/src/nodes/NameNode.tsx` | Create |
| `webview-ui/src/nodes/index.ts` | Create – factory |
| `webview-ui/src/__tests__/nodes/` | Create – component tests |

## Test Strategy (Write First)

1. `test_base_node_component_rendering` – ASTNode renders
2. `test_node_data_display` – Data fields visible
3. `test_node_styling` – Theme, hover
4. `test_binop_node_rendering` – Operator displayed
5. `test_function_def_node_rendering` – Name, params
6. `test_node_factory_function` – Type → component, unknown → base
7. `test_node_registration` – Types mapped

## Implementation Order

1. ASTNode.tsx – header, body, common styling
2. BinOpNode, FunctionDefNode, ClassDefNode, CallNode, NameNode
3. index.ts – getNodeComponent(astType), fallback to ASTNode
4. Register with ReactRenderPlugin in editor
5. Add JSDoc

## Validation Steps

- Nodes render
- Factory works
- Unknown types fallback
- All tests pass

## Documentation Updates

JSDoc on components.
