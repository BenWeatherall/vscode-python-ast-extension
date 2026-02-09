---
name: ai-context-extension-host
description: Guides the ai-context-writer subagent in generating and maintaining AI_CONTEXT_EXTENSION_HOST.md, documenting the VS Code extension host architecture, command registration, Python service lifecycle, message handling, auto-refresh, and error/retry behavior for the python-vis project. Use when creating or updating the extension host AI context file.
---

# AI Context Extension Host Skill

## Purpose

Help the `ai-context-writer` subagent create and maintain `docs/AI_CONTEXT/AI_CONTEXT_EXTENSION_HOST.md` as the **component-level reference** for the `src/` VS Code extension host:

- How the extension activates and deactivates
- How commands are registered
- How the Python service is spawned and managed
- How messages are exchanged with the webview
- How auto-refresh and error handling work

## Sources to Read

Before updating the extension host context, read:

- `@src/extension.ts`
- `@src/pythonClient.ts`
- `@src/types.ts`
- `@src/conversion.ts`
- Relevant tests targeting extension behavior (if present)
- `@docs/AI_CONTEXT/AI_CONTEXT_REPOSITORY.md` for overall architecture

Use these files as ground truth for actual behavior.

## Required Sections in AI_CONTEXT_EXTENSION_HOST.md

Include at least:

1. **Metadata**
   - Version
   - Last Updated (ISO date)
   - Tags including `extension-host`, `vscode`, `integration`
   - Cross-References to repository, quick reference, and webview UI AI_CONTEXT docs

2. **Module Overview**
   - Responsibilities of:
     - `extension.ts`
     - `pythonClient.ts`
     - `types.ts`
     - `conversion.ts`

3. **Activation & Deactivation**
   - How `activate(context)`:
     - Instantiates `PythonClient`
     - Registers the `python-ast.visualize` command
     - Subscribes to `workspace.onDidSaveTextDocument` for auto-refresh
   - How `deactivate()` cleans up processes and resources.

4. **PythonClient Lifecycle (pythonClient.ts)**
   - `spawnService()` and how it starts `python -m python_service`.
   - `parseAST(sourceCode: string)` request/response flow.
   - `stopService()` and `isServiceRunning()`.
   - Error and exit handling.

5. **Message Contracts (types.ts + conversion.ts)**
   - Types used for:
     - `ReteGraph`, `ReteNode`, `ReteConnection`, `NodeData`.
     - Messages to the webview (`updateGraph`, `error`, `loading`).
     - Messages from the webview (`navigateToSource`, `retry`).
   - Conversion logic between Python graph JSON and TypeScript types.

6. **Visualization Panel Management**
   - How visualization panels are created and identified (IDs, document URIs).
   - How the extension tracks open panels and sends updates to all panels for a document.

7. **Auto-Refresh Flow**
   - `onDidSaveTextDocument` → `handleAutoRefresh`.
   - Debouncing behavior per document URI.
   - Sequence of:
     - Sending `"loading"` to panels.
     - Ensuring Python service is running.
     - Calling `parseAST` and broadcasting `"updateGraph"` or `"error"`.

8. **Error Handling & Retry**
   - How `logError` writes to the Output channel.
   - How parse or communication failures are surfaced to the user via notifications and webview messages.
   - How `"retry"` from the webview is handled (re-open document, re-parse).

9. **Extension Points**
   - Where to add new VS Code commands.
   - How to introduce new message types between extension and webview.
   - How to adapt PythonClient or the protocol when adding new capabilities.

## Style & Constraints

- Focus on **behavior and integration points**, not generic VS Code extension concepts.
- Use concise, structured sections; avoid long prose.
- Include short code snippets or type definitions when they clarify message shapes or flows.
- Keep the file under the content length limit; split if the extension host grows substantially.

## Update Strategy

When the extension host changes:

1. Update activation/deactivation behavior and command list.
2. Adjust PythonClient lifecycle description and protocol interactions.
3. Refresh message contracts and flows to match `types.ts` and `App.tsx`.
4. Bump version and last-updated metadata.

