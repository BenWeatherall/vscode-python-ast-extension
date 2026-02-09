# Changelog

## [Unreleased]

### Added
- Extension integration tests for binary resolution during activation (7 TDD tests: resolve binary, missing binary, unsupported platform, activation continuity, flow-through, error handling, logging)
  - Plan: [06-write-extension-integration-tests](_archive/vscode-extension-packaging/plans/tasks/06-write-extension-integration-tests.md)
  - Task: [06-write-extension-integration-tests](_archive/vscode-extension-packaging/tasks/06-write-extension-integration-tests.md)

### Changed
- PythonClient accepts optional `binaryPath` parameter; spawns binary directly when provided, falls back to `python -m python_service` otherwise
  - Plan: [05-modify-pythonclient](_archive/vscode-extension-packaging/plans/tasks/05-modify-pythonclient.md)
  - Task: [05-modify-pythonclient](_archive/vscode-extension-packaging/tasks/05-modify-pythonclient.md)

### Fixed
- Fixed pre-existing test bugs: mock editors missing `uri` property, incorrect auto-refresh expectations, error-handling test file type (.ts→.tsx), App loading text assertion
  - Related to task 05 regression cleanup

### Added
- Code documentation (Google-style docstrings for Python, JSDoc for TypeScript)
  - Plan: [20-code-documentation](_archive/python-ast-visualization/plans/tasks/20-code-documentation.md)
  - Task: [20-code-documentation](_archive/python-ast-visualization/tasks/20-code-documentation.md)
- README.md with executive summary, installation instructions, and usage documentation
  - Plan: [19-readme](_archive/python-ast-visualization/plans/tasks/19-readme.md)
  - Task: [19-readme](_archive/python-ast-visualization/tasks/19-readme.md)
- Error handling and user feedback (user-friendly error messages, loading indicators, error recovery suggestions, output channel logging)
  - Plan: [18-error-handling-and-user-feedback](_archive/python-ast-visualization/plans/tasks/18-error-handling-and-user-feedback.md)
  - Task: [18-error-handling-and-user-feedback](_archive/python-ast-visualization/tasks/18-error-handling-and-user-feedback.md)
- Performance optimization (React.memo on nodes, graph update debounce 150ms, parser ID format)
  - Plan: [17-performance-optimization](_archive/python-ast-visualization/plans/tasks/17-performance-optimization.md)
  - Task: [17-performance-optimization](_archive/python-ast-visualization/tasks/17-performance-optimization.md)
- Auto-refresh on file save (workspace.onDidSaveTextDocument, debounce 400ms, panel registry)
  - Plan: [16-auto-refresh-on-file-save](_archive/python-ast-visualization/plans/tasks/16-auto-refresh-on-file-save.md)
  - Task: [16-auto-refresh-on-file-save](_archive/python-ast-visualization/tasks/16-auto-refresh-on-file-save.md)
- End-to-end integration tests (workflow, navigation, error propagation, communication, performance)
  - Plan: [15-end-to-end-integration](_archive/python-ast-visualization/plans/tasks/15-end-to-end-integration.md)
  - Task: [15-end-to-end-integration](_archive/python-ast-visualization/tasks/15-end-to-end-integration.md)
- Styling and theme integration (Tailwind, VS Code CSS vars, dark mode, node styles)
  - Plan: [14-styling-and-theme-integration](_archive/python-ast-visualization/plans/tasks/14-styling-and-theme-integration.md)
  - Task: [14-styling-and-theme-integration](_archive/python-ast-visualization/tasks/14-styling-and-theme-integration.md)
- Rete.js editor setup (ReteASTEditor: initialize, loadGraph, clearGraph, getGraph, onNodeClick)
  - Plan: [11-rete-editor-setup](_archive/python-ast-visualization/plans/tasks/11-rete-editor-setup.md)
  - Task: [11-rete-editor-setup](_archive/python-ast-visualization/tasks/11-rete-editor-setup.md)
- Webview panel management (createVisualizationPanel, message handlers, navigation)
  - Plan: [10-webview-panel-management](_archive/python-ast-visualization/plans/tasks/10-webview-panel-management.md)
  - Task: [10-webview-panel-management](_archive/python-ast-visualization/tasks/10-webview-panel-management.md)
- Extension entry point (activate/deactivate, python-ast.visualize command)
  - Plan: [09-extension-entry-point](_archive/python-ast-visualization/plans/tasks/09-extension-entry-point.md)
  - Task: [09-extension-entry-point](_archive/python-ast-visualization/tasks/09-extension-entry-point.md)
- Python client (PythonClient: spawns Python service, parseAST via stdio)
  - Plan: [08-python-client](_archive/python-ast-visualization/plans/tasks/08-python-client.md)
  - Task: [08-python-client](_archive/python-ast-visualization/tasks/08-python-client.md)
- Python service entry point (python -m python_service)
  - Plan: [07-python-service-entry-point](_archive/python-ast-visualization/plans/tasks/07-python-service-entry-point.md)
  - Task: [07-python-service-entry-point](_archive/python-ast-visualization/tasks/07-python-service-entry-point.md)
- Communication server (ASTParseServer: stdio, JSON-RPC-like protocol)
  - Plan: [06-communication-server](_archive/python-ast-visualization/plans/tasks/06-communication-server.md)
  - Task: [06-communication-server](_archive/python-ast-visualization/tasks/06-communication-server.md)
- AST node type handlers (Call, If, For, While, Return, Assign, AugAssign, Constant, List, Dict)
  - Plan: [05-ast-node-type-handlers](_archive/python-ast-visualization/plans/tasks/05-ast-node-type-handlers.md)
  - Task: [05-ast-node-type-handlers](_archive/python-ast-visualization/tasks/05-ast-node-type-handlers.md)
- AST parser core (ReteConverter: BinOp, Name, FunctionDef, ClassDef, Pass)
  - Plan: [04-ast-parser-core](_archive/python-ast-visualization/plans/tasks/04-ast-parser-core.md)
  - Task: [04-ast-parser-core](_archive/python-ast-visualization/tasks/04-ast-parser-core.md)
- TypeScript type definitions and snake_case↔camelCase conversion (webview-ui)
  - Plan: [03-typescript-type-definitions](_archive/python-ast-visualization/plans/tasks/03-typescript-type-definitions.md)
  - Task: [03-typescript-type-definitions](_archive/python-ast-visualization/tasks/03-typescript-type-definitions.md)
- Python schema models (ReteNode, ReteConnection, ReteGraph, NodeData, Socket)
  - Plan: [02-python-schema-models](_archive/python-ast-visualization/plans/tasks/02-python-schema-models.md)
  - Task: [02-python-schema-models](_archive/python-ast-visualization/tasks/02-python-schema-models.md)
- Project structure setup for Python AST visualization
  - Plan: [01-project-structure-setup](_archive/python-ast-visualization/plans/tasks/01-project-structure-setup.md)
  - Task: [01-project-structure-setup](_archive/python-ast-visualization/tasks/01-project-structure-setup.md)
