---
name: ai-context-repository
description: Guides the ai-context-writer subagent in maintaining AI_CONTEXT_REPOSITORY.md, documenting repository architecture, directory structure, component responsibilities, data flow, and extension points for the python-vis project. Use when creating or updating the repository AI context file.
---

# AI Context Repository Skill

## Purpose

Help the `ai-context-writer` subagent generate and maintain `docs/AI_CONTEXT/AI_CONTEXT_REPOSITORY.md` as the **single source of truth** for:

- Overall architecture
- Directory and component layout
- Data flow between services
- High-level extension points

Other AI_CONTEXT documents (patterns, component-specific docs) should link back here for structure.

## Sources to Read

Before updating the repository document, read (as appropriate):

- `@README.md` — project purpose and high-level goals
- `@python_service/` — parser, models, server entry point
- `@src/` — extension host, commands, integration logic
- `@webview-ui/` — React + Rete webview implementation
- `@tests/` — to see where tests live
- `@.cursor/rules/environment.mdc` — structure and tooling expectations
- Existing `@docs/AI_CONTEXT/AI_CONTEXT_REPOSITORY.md` (if present)

## Required Sections in AI_CONTEXT_REPOSITORY.md

At minimum, ensure the file contains:

1. **Metadata**
   - Version
   - Last Updated (ISO date)
   - Tags (include `architecture`, `repository`)
   - Cross-References to quick reference, patterns, and component-specific AI_CONTEXT docs

2. **High-Level Overview**
   - Goal of the system in 1–2 paragraphs
   - Summary of the sidecar architecture (Python service, extension host, webview UI)

3. **Directory Structure**
   - An annotated tree of the most important directories:
     - `python_service/`
     - `src/`
     - `webview-ui/`
     - `tests/`
     - `.cursor/`
     - `_features/` (and others if relevant)

4. **Component Responsibilities**
   - Subsections for each major component:
     - Python service
     - Extension host
     - Webview UI
   - For each: what it does, key modules, and main responsibilities.

5. **Data Flow**
   - End-to-end flow from VS Code editor → extension → Python service → webview → back to editor.
   - Auto-refresh flow on save.
   - Error and retry flow.
   - At least one **mermaid diagram** illustrating the main happy path.

6. **Service Boundaries & Dependencies**
   - Clarify the boundaries between:
     - Python process
     - Node/extension host
     - Webview/browser runtime
   - List key external libraries and frameworks per component.

7. **Entry Points & Extension Hooks**
   - Python service entry (`python_service.__main__`, `ASTParseServer`).
   - Extension activation (`extension.ts`, command registration).
   - Webview bootstrap (`webview-ui/src/index.tsx` and `App.tsx`).
   - Guidance on where to plug in:
     - New AST node visitors
     - New webview messages
     - New VS Code commands

## Style & Constraints

- Keep the document **architectural**, not tutorial-style.
- Use **semantic headings** and short paragraphs.
- Prefer diagrams and structured lists over long prose.
- Avoid management or roadmap content; focus purely on **how the system is structured today**.
- Keep under the content length limit; if it grows too large:
  - Split into sub-documents (e.g. `AI_CONTEXT_REPOSITORY/`) per `content_length` rules.
  - Provide an index with links and one-line descriptions.

## Update Strategy

When the project structure or flow changes:

1. Update the directory tree to match the real repository.
2. Adjust component responsibilities and data flow descriptions.
3. Refresh diagrams to reflect new paths or services.
4. Bump version/last-updated metadata.
5. Ensure cross-references to component-specific docs remain valid.

