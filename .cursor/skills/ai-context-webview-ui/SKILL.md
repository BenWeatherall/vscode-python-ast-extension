---
name: ai-context-webview-ui
description: Guides the ai-context-writer subagent in generating and maintaining AI_CONTEXT_WEBVIEW_UI.md, documenting the webview-ui React + Rete.js architecture, message handling, node components, styling, and testing approach for the python-vis project. Use when creating or updating the webview UI AI context file.
---

# AI Context Webview UI Skill

## Purpose

Help the `ai-context-writer` subagent create and maintain `docs/AI_CONTEXT/AI_CONTEXT_WEBVIEW_UI.md` as the **component-level reference** for the `webview-ui/` React + Rete graph editor:

- How the webview is bootstrapped
- How messages are handled
- How graphs are rendered and updated
- How node components map to AST node types
- How styling and theming work

## Sources to Read

Before updating the webview UI context, read:

- `@webview-ui/src/index.tsx`
- `@webview-ui/src/App.tsx`
- `@webview-ui/src/editor.tsx`
- `@webview-ui/src/types.ts`
- `@webview-ui/src/conversion.ts` (if used)
- `@webview-ui/src/nodes/` components and `nodes/index.ts`
- `@webview-ui/src/index.css` and `@webview-ui/src/components/NodeStyles.css`
- Relevant tests under `@tests/` (if any target webview behavior)

Optionally cross-check with:

- `@src/types.ts` for shared message and graph types.

## Required Sections in AI_CONTEXT_WEBVIEW_UI.md

Include at least:

1. **Metadata**
   - Version
   - Last Updated (ISO date)
   - Tags including `webview-ui`, `react`, `rete`
   - Cross-References to repository and extension-host AI_CONTEXT docs

2. **Module Overview**
   - Roles of:
     - `index.tsx`
     - `App.tsx`
     - `editor.tsx`
     - `types.ts`
     - `nodes/` and `components/`

3. **Bootstrap & Lifecycle**
   - How `index.tsx` sets up the React root and connects to VS Code’s `acquireVsCodeApi`.
   - How `App.tsx` initializes `ReteASTEditor` and listens for messages via `window.addEventListener("message", ...)`.

4. **Message Handling**
   - Types of messages expected from the extension:
     - `updateGraph`
     - `error`
     - `loading`
   - Messages the webview sends back:
     - `navigateToSource`
     - `retry`
   - How each message affects local React state and the editor.

5. **Graph Rendering (editor.tsx)**
   - How `ReteASTEditor`:
     - Initializes the Rete editor, area, connection, and React plugins.
     - Transforms `ReteGraph` into Rete nodes and connections.
     - Applies node positions and zoom-to-fit behavior.
   - How node click handlers are wired to send `navigateToSource` messages.

6. **Node Components (nodes/)**
   - How `ASTNode.tsx` serves as the base visual component.
   - How specialized nodes (`BinOpNode`, `CallNode`, `ClassDefNode`, `FunctionDefNode`, `NameNode`, etc.) extend the base.
   - How `nodes/index.ts` maps `ast_type` strings to concrete components.

7. **Styling & Theming**
   - Use of VS Code theme variables for colors.
   - Role of `index.css` and `NodeStyles.css`.
   - Any important class names (e.g. `.ast-node-wrapper`) that other agents might rely on.

8. **Testing & Diagnostics (if available)**
   - Describe how UI behavior is tested (if tests exist).
   - Mention how to debug message flow or graph rendering from within the webview.

## Style & Constraints

- Focus on **behavior and integration** rather than React basics.
- Use concise descriptions and reference actual prop names and type names from `types.ts`.
- Provide small code snippets for message payload shapes and example message handlers.
- Keep the file within the content length limit; split into sub-documents if the webview grows significantly.

## Update Strategy

When the webview UI changes:

1. Update message type lists and their behavior.
2. Add or update node component mappings.
3. Refresh styling/theming notes if CSS structure changes.
4. Adjust descriptions of initialization and lifecycle to match the current `App.tsx` and `editor.tsx`.
5. Bump version and last-updated metadata.

