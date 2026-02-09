---
name: ai-context-patterns
description: Guides the ai-context-writer subagent in creating and maintaining AI_CONTEXT_PATTERNS.md, documenting code organization, typing, error handling, testing, data models, dependency injection, and validation patterns for the python-vis project. Use when generating or updating the patterns AI context file.
---

# AI Context Patterns Skill

## Purpose

Help the `ai-context-writer` subagent produce `docs/AI_CONTEXT/AI_CONTEXT_PATTERNS.md` as a **pattern and convention catalog**:

- How code is organized
- How data and types are modelled
- How errors, logging, and validation are handled
- How tests and TDD are approached

This document guides other agents in writing code that **fits the existing system**.

## Sources to Read

Before updating patterns, read (selectively):

- `@.cursor/rules/development_practices.mdc` — TDD, models, DI, validation rules
- `@.cursor/rules/environment.mdc` — tooling and layout assumptions
- `@python_service/` — parsing, models, server behavior
- `@src/` — extension host patterns, TS types, conversion functions
- `@webview-ui/` — React and Rete integration, node components
- `@tests/` — how tests are structured and named
- Existing `@docs/AI_CONTEXT/AI_CONTEXT_REPOSITORY.md` — overall architecture context

Prefer reading **specific files that demonstrate patterns** instead of every file.

## Required Sections in AI_CONTEXT_PATTERNS.md

Include at least:

1. **Metadata**
   - Version
   - Last Updated (ISO date)
   - Tags including `patterns`, `conventions`
   - Cross-References to repository and component-specific AI_CONTEXT docs

2. **Code Organization**
   - How Python modules, TS files, and React components are grouped.
   - Naming conventions for files and directories (e.g. `parser.py`, `server.py`, `extension.ts`).

3. **Type & Model Patterns**
   - Pydantic models in `python_service/schema.py` (NodeData, ReteNode, etc.).
   - TypeScript types in `src/types.ts` and `webview-ui/src/types.ts`.
   - Conversion patterns between Python and TS (`conversion.ts` files).

4. **Error Handling & Logging**
   - How `ASTParseServer` reports syntax vs internal errors (codes, messages).
   - How the extension logs to the Output channel and surfaces user-facing errors.
   - How the webview presents error banners and supports retries.

5. **Testing & TDD**
   - Where Python tests live and typical test naming/structure.
   - Where TypeScript/React tests live (if present).
   - How to approach test-first development in this repo (high level).

6. **Dependency Injection & Validation**
   - How non-deterministic dependencies are passed into functions/classes (per dev rules).
   - How Pydantic models are used for input validation instead of ad-hoc checks.

7. **Q&A Behavior Examples**
   - Short Q&A style entries explaining typical workflows, for example:
     - “How do I add support for a new AST node type?”
     - “How should I propagate parse errors to the webview?”
   - Each answer should reference concrete files and functions.

## Style & Constraints

- Use **Q&A style** for behavior explanations where possible.
- Provide **short, real code snippets**, not pseudocode, and reference actual paths.
- Keep each example focused; do not dump large code blocks.
- Keep the file under the content length limit; if it grows, split by topic (e.g. `patterns-testing.md`, `patterns-errors.md`) with an index file as per `content_length` rules.

## Update Strategy

When implementation patterns evolve:

1. Sync documented patterns with what the code actually does.
2. Remove or clearly mark any deprecated patterns.
3. Add new Q&A entries for newly introduced workflows or tricky behaviors.
4. Refresh metadata and cross-references.

