You are an orchestrator for AI context documentation, not the primary writer.
Your job is to coordinate the `ai-context-writer` subagent to (re)generate all
AI_CONTEXT documentation files in `docs/AI_CONTEXT/`, ensuring each document
has a clear persona, narrow focus, and the right contextual inputs.

The actual content for each AI_CONTEXT file is written by the
`/ai-context-writer` subagent, which itself uses dedicated skills under
`.cursor/skills/` for each document type.

Follow all project rules:

- `@.cursor/rules/environment.mdc`
- `@.cursor/rules/development_practices.mdc`
- `@.cursor/rules/documentation.mdc`
- `@.cursor/rules/content_length.mdc`

Do **not** add management-focused content. All documentation is for developers
and AI agents working on this repository.

---

## Prerequisites (Phase 0: Project & Rules Check)

Before orchestrating subagents:

1. Verify project structure:
   - `python_service/` exists (Python AST parser service)
   - `webview-ui/` exists (React + Rete.js webview UI)
   - `src/` exists (VS Code extension host)
2. Verify rules and docs:
   - `.cursor/rules/environment.mdc`
   - `.cursor/rules/development_practices.mdc`
   - `.cursor/rules/documentation.mdc`
   - `.cursor/rules/content_length.mdc`
   - `README.md`
3. Ensure `docs/AI_CONTEXT/` exists or will be created by subagents.

Do **not** reimplement detailed documentation rules here. Instead, rely on:

- `AI_CONTEXT_REPOSITORY.md` (once generated)
- The skills under `.cursor/skills/ai-context-*/SKILL.md`

Those describe how each document should be structured and maintained.

---

## Overview of Subagent Workflow

When `update_context` runs, you will:

1. Invoke `/ai-context-writer` **once per AI_CONTEXT document**, using a fresh
   agent context each time.
2. For each invocation, specify:
   - The target document type and path in `docs/AI_CONTEXT/`
   - The corresponding skill file in `.cursor/skills/`
   - The core project paths the subagent should read for context
3. Require each subagent run to:
   - Create the document if missing, or update it in place
   - Maintain metadata at the top (version, last updated, tags, cross-refs)
   - Respect content length limits and split/index rules

This command **always** runs all six AI_CONTEXT phases. It must be safe and
idempotent to run multiple times.

Target documents:

1. `docs/AI_CONTEXT/AI_CONTEXT_QUICK_REFERENCE.md`
2. `docs/AI_CONTEXT/AI_CONTEXT_REPOSITORY.md`
3. `docs/AI_CONTEXT/AI_CONTEXT_PATTERNS.md`
4. `docs/AI_CONTEXT/AI_CONTEXT_PYTHON_SERVICE.md`
5. `docs/AI_CONTEXT/AI_CONTEXT_WEBVIEW_UI.md`
6. `docs/AI_CONTEXT/AI_CONTEXT_EXTENSION_HOST.md`

---

## Phase 1: Quick Reference Document

Goal: Ensure `AI_CONTEXT_QUICK_REFERENCE.md` exists and is current.

1. Invoke the `/ai-context-writer` subagent with a **fresh agent context**.
2. Instruct it to:
   - Read:
     - `@.cursor/skills/ai-context-quick-reference/SKILL.md`
     - `@README.md`
     - `@docs/AI_CONTEXT/AI_CONTEXT_REPOSITORY.md` (if present)
   - Optionally read:
     - `@python_service/`, `@src/`, `@webview-ui/` for confirmation of
       entry points and commands
   - Generate or update:
     - `docs/AI_CONTEXT/AI_CONTEXT_QUICK_REFERENCE.md`
   - Maintain:
     - Metadata (version, last updated, tags, cross-references)
     - Concise, scannable sections (environment, commands, entry points,
       quick troubleshooting, frequently used imports)
   - Ensure file length stays comfortably under the configured limit.

Do **not** write quick-reference content yourself. Delegate fully to the
`ai-context-writer` using the quick-reference skill.

---

## Phase 2: Repository Architecture Document

Goal: Ensure `AI_CONTEXT_REPOSITORY.md` exists and accurately reflects the
current architecture and repository layout.

1. Invoke `/ai-context-writer` with a **fresh agent context**.
2. Instruct it to:
   - Read:
     - `@.cursor/skills/ai-context-repository/SKILL.md`
     - `@README.md`
     - `@python_service/`
     - `@src/`
     - `@webview-ui/`
     - Any existing `@docs/AI_CONTEXT/AI_CONTEXT_REPOSITORY.md`
   - Generate or update:
     - `docs/AI_CONTEXT/AI_CONTEXT_REPOSITORY.md`
   - Include:
     - High-level overview and sidecar architecture
     - Annotated directory structure
     - Component responsibilities
     - Data flow between components (with at least one mermaid diagram)
     - Service boundaries and key dependencies
     - Entry points and extension hooks
   - Maintain metadata and cross-references to other AI_CONTEXT docs.
   - Respect the content length limit and, if needed, apply the split/index
     pattern described in `@.cursor/rules/content_length.mdc`.

---

## Phase 3: Patterns & Conventions Document

Goal: Ensure `AI_CONTEXT_PATTERNS.md` exists and documents key development
patterns and conventions.

1. Invoke `/ai-context-writer` with a **fresh agent context**.
2. Instruct it to:
   - Read:
     - `@.cursor/skills/ai-context-patterns/SKILL.md`
     - `@.cursor/rules/development_practices.mdc`
     - `@docs/AI_CONTEXT/AI_CONTEXT_REPOSITORY.md`
     - Representative files from:
       - `@python_service/`
       - `@src/`
       - `@webview-ui/`
       - `@tests/`
   - Generate or update:
     - `docs/AI_CONTEXT/AI_CONTEXT_PATTERNS.md`
   - Cover:
     - Code organization and naming
     - Typing and modelling patterns (Pydantic, TS types)
     - Error handling and logging patterns
     - Testing and TDD approach
     - Dependency injection and validation patterns
     - Q&A style entries for common “how do we …?” behaviors
   - Keep examples short and grounded in real code, with file references.
   - Maintain metadata and cross-references.
   - Stay within content length limits, splitting if necessary.

---

## Phase 4: Python Service Document

Goal: Ensure `AI_CONTEXT_PYTHON_SERVICE.md` exists and documents the
`python_service/` package.

1. Invoke `/ai-context-writer` with a **fresh agent context**.
2. Instruct it to:
   - Read:
     - `@.cursor/skills/ai-context-python-service/SKILL.md`
     - `@python_service/schema.py`
     - `@python_service/parser.py`
     - `@python_service/server.py`
     - `@python_service/__main__.py`
     - Relevant tests under `@tests/python_service/` (if present)
     - Any existing `@docs/AI_CONTEXT/AI_CONTEXT_PYTHON_SERVICE.md`
   - Generate or update:
     - `docs/AI_CONTEXT/AI_CONTEXT_PYTHON_SERVICE.md`
   - Document:
     - Pydantic models and their fields
     - `ReteConverter` behavior and key `visit_*` methods
     - JSON request/response protocol and error codes
     - Service lifecycle and signal handling
     - Extension points for new AST node types
   - Include example JSON requests and responses.
   - Maintain metadata, tags, and cross-references.

---

## Phase 5: Webview UI Document

Goal: Ensure `AI_CONTEXT_WEBVIEW_UI.md` exists and documents the
`webview-ui/` React + Rete graph editor.

1. Invoke `/ai-context-writer` with a **fresh agent context**.
2. Instruct it to:
   - Read:
     - `@.cursor/skills/ai-context-webview-ui/SKILL.md`
     - `@webview-ui/src/index.tsx`
     - `@webview-ui/src/App.tsx`
     - `@webview-ui/src/editor.tsx`
     - `@webview-ui/src/types.ts`
     - `@webview-ui/src/conversion.ts` (if present)
     - `@webview-ui/src/nodes/` components and `nodes/index.ts`
     - `@webview-ui/src/index.css` and `components/NodeStyles.css`
     - Any existing `@docs/AI_CONTEXT/AI_CONTEXT_WEBVIEW_UI.md`
   - Generate or update:
     - `docs/AI_CONTEXT/AI_CONTEXT_WEBVIEW_UI.md`
   - Document:
     - Webview bootstrap and React root initialization
     - Message handling from/to the extension
     - Graph rendering and node component mapping
     - Styling and theming approach
     - Any available tests or diagnostics patterns
   - Maintain metadata and cross-references.

---

## Phase 6: Extension Host Document

Goal: Ensure `AI_CONTEXT_EXTENSION_HOST.md` exists and documents the `src/`
VS Code extension host.

1. Invoke `/ai-context-writer` with a **fresh agent context**.
2. Instruct it to:
   - Read:
     - `@.cursor/skills/ai-context-extension-host/SKILL.md`
     - `@src/extension.ts`
     - `@src/pythonClient.ts`
     - `@src/types.ts`
     - `@src/conversion.ts`
     - Relevant tests (if present)
     - Any existing `@docs/AI_CONTEXT/AI_CONTEXT_EXTENSION_HOST.md`
   - Generate or update:
     - `docs/AI_CONTEXT/AI_CONTEXT_EXTENSION_HOST.md`
   - Document:
     - Extension activation and deactivation
     - PythonClient lifecycle and protocol usage
     - Command registration and auto-refresh behavior
     - Message contracts between extension and webview
     - Error handling, logging, and retry flows
     - Key extension points for new commands or messages
   - Maintain metadata and cross-references.

---

## Final Phase: Validation & Cross-Checks

After all six phases:

1. Verify existence of:
   - `docs/AI_CONTEXT/AI_CONTEXT_QUICK_REFERENCE.md`
   - `docs/AI_CONTEXT/AI_CONTEXT_REPOSITORY.md`
   - `docs/AI_CONTEXT/AI_CONTEXT_PATTERNS.md`
   - `docs/AI_CONTEXT/AI_CONTEXT_PYTHON_SERVICE.md`
   - `docs/AI_CONTEXT/AI_CONTEXT_WEBVIEW_UI.md`
   - `docs/AI_CONTEXT/AI_CONTEXT_EXTENSION_HOST.md`
2. Optionally run the `content_length` command to ensure each file is under
   the configured limit and split/index rules are followed if necessary.
3. Spot-check cross-references:
   - Quick reference should link to repository and component docs.
   - Repository should reference all component-specific AI_CONTEXT files.
   - Component docs should reference repository and any shared patterns.

Do **not** manually edit AI_CONTEXT content in this command; always delegate
to the `/ai-context-writer` subagent with the appropriate skill and context.

