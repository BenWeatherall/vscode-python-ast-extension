---
name: ai-context-quick-reference
description: Guides the ai-context-writer subagent in maintaining AI_CONTEXT_QUICK_REFERENCE.md as a concise cheat sheet of environment, commands, runtime entry points, and troubleshooting for the python-vis project. Use when creating or updating the quick reference AI context file.
---

# AI Context Quick Reference Skill

## Purpose

Help the `ai-context-writer` subagent generate and maintain `docs/AI_CONTEXT/AI_CONTEXT_QUICK_REFERENCE.md` as a **high-signal, low-noise** reference for other agents.

This file is a **cheat sheet**, not a full architecture document. It should be safe to scan quickly when starting any task.

## Sources to Read

Before updating the quick reference, read (as needed):

- `@README.md` — project summary, goals, and high-level architecture
- `@docs/AI_CONTEXT/AI_CONTEXT_REPOSITORY.md` — deeper architecture and entry points
- `@python_service/` — to confirm Python entry points and core models
- `@src/` — to confirm extension commands and message types
- `@webview-ui/` — to confirm webview entry points and message contracts
- `@.cursor/rules/environment.mdc` — environment and tooling expectations
- `@.cursor/rules/documentation.mdc` and `@.cursor/rules/content_length.mdc` — style and length rules

Prefer **targeted reads** over exhaustive scans; this document must stay short.

## Required Sections in AI_CONTEXT_QUICK_REFERENCE.md

The target file must contain, at minimum:

1. **Metadata**
   - Version
   - Last Updated (ISO date)
   - Tags (include `quick-reference`)
   - Cross-References to other AI_CONTEXT files (`REPOSITORY`, `PATTERNS`, component docs)

2. **Project Summary**
   - One-paragraph description of purpose
   - Bullet list of main components (Python service, extension host, webview)

3. **Environment & Versions**
   - Supported Python and Node versions
   - Package managers (uv, pnpm)
   - Pointers to `pyproject.toml` and Node tooling

4. **Key Commands (Shell)**
   - Setup / install
   - Python service tests, mypy, ruff
   - Webview and extension build/test commands
   - “Quality gates” section listing commands that should pass before merging changes

5. **Runtime Entry Points**
   - Python service CLI entry (`python -m python_service`)
   - Extension activation and command (`python-ast.visualize`)
   - Webview UI bootstrap (`webview-ui/src/index.tsx`)

6. **Core Interfaces & Protocols (Quick View)**
   - JSON request/response shape for the Python service `parse` method
   - Extension ↔ webview message types (names only plus short descriptions)

7. **Frequently Used Imports**
   - Short code blocks for typical imports in:
     - Python service modules
     - Extension host
     - Webview UI

8. **Quick Troubleshooting Hints**
   - 5–10 common issues with concise bullet-point checks and actions

## Style & Constraints

- Keep sections **short and scannable**:
  - Bullets preferred over paragraphs
  - Use code fences for commands and imports
- Do **not** duplicate long explanations from `AI_CONTEXT_REPOSITORY.md`; instead, link to it.
- Assume a **developer / AI agent** reader, not management.
- Keep the file **well under the content length limit**; it should be significantly shorter than 500 lines.

## Update Strategy

When modifying the quick reference:

1. Preserve existing structure where possible.
2. Update version and last-updated date in Metadata.
3. Refresh commands and entry points if project tooling changes.
4. Add or adjust troubleshooting hints based on current failure modes.
5. Ensure all cross-references still point to valid files.

