---
name: ai-context-python-service
description: Guides the ai-context-writer subagent in generating and maintaining AI_CONTEXT_PYTHON_SERVICE.md, documenting the python_service package architecture, data models, parsing behavior, JSON protocol, error handling, and extension points for the python-vis project. Use when creating or updating the Python service AI context file.
---

# AI Context Python Service Skill

## Purpose

Help the `ai-context-writer` subagent create and maintain `docs/AI_CONTEXT/AI_CONTEXT_PYTHON_SERVICE.md` as the **authoritative reference** for the `python_service/` package:

- Models and data contracts
- AST parsing and graph conversion
- JSON protocol exposed over stdio
- Error handling and lifecycle behavior
- Extension points for new node types or features

## Sources to Read

Before updating the Python service context, read:

- `@python_service/schema.py`
- `@python_service/parser.py`
- `@python_service/server.py`
- `@python_service/__main__.py`
- Relevant tests under `@tests/python_service/` (if present)
- Existing `@docs/AI_CONTEXT/AI_CONTEXT_REPOSITORY.md` for overall context

Use these files as **ground truth**; do not speculate about behavior that is not implemented.

## Required Sections in AI_CONTEXT_PYTHON_SERVICE.md

Include at least:

1. **Metadata**
   - Version
   - Last Updated (ISO date)
   - Tags including `python-service`, `parser`, `protocol`
   - Cross-References to `AI_CONTEXT_REPOSITORY.md` and `AI_CONTEXT_QUICK_REFERENCE.md`

2. **Module Overview**
   - Brief description of each core module:
     - `schema.py`
     - `parser.py`
     - `server.py`
     - `__main__.py`

3. **Data Models (schema.py)**
   - Describe Pydantic models:
     - `NodeData`
     - `ReteNode`
     - `ReteConnection`
     - `ReteGraph`
     - Any helper types (e.g. Socket)
   - Explain key fields and how extra data is handled (e.g. `extra="allow"`).

4. **Parsing & Conversion (parser.py)**
   - Describe `ReteConverter`:
     - Its role as an `ast.NodeVisitor`
     - How it assigns node IDs and accumulates nodes/connections
     - The main `visit_*` methods that are implemented (e.g. Module, FunctionDef, ClassDef, Call, If, For, While, Assign, Constant, etc.).
   - Document the main public API method:
     - `parse_to_rete(source_code: str) -> ReteGraph`

5. **JSON Protocol & Server (server.py)**
   - Request format expected over stdin (JSON line).
   - Response format on success (`result: ReteGraph JSON`) and on error (`error` object).
   - Error codes and their meanings (parse vs internal errors).
   - Lifecycle of `ASTParseServer` (`start_server`, `stop_server`).

6. **Process Entry Point (__main__.py)**
   - How `python -m python_service` is wired:
     - Construction of `ReteConverter` and `ASTParseServer`
     - Signal handling (`SIGTERM`, `SIGINT`)
     - Loop behavior and graceful shutdown.

7. **Extension Points**
   - How to add support for a new AST node type:
     - Implement `visit_<NodeType>` with creation of `ReteNode` and `ReteConnection`s.
     - Any conventions for node labels and data fields.
   - How to change or extend the protocol (if needed).

8. **Examples**
   - Include at least one example request/response pair for:
     - A successful parse.
     - A syntax error.

## Style & Constraints

- Use **developer-level detail** but keep explanations concise.
- Always show JSON protocol shapes and Pydantic model fields using code blocks.
- Clearly separate **current behavior** from any future ideas (prefer omitting speculative content).
- Keep under the content length limit; split into sub-documents if the Python service grows significantly.

## Update Strategy

When the Python service changes:

1. Update model descriptions and public API signatures.
2. Revise protocol examples and error codes as needed.
3. Add or remove documented `visit_*` behaviors to match the implementation.
4. Bump metadata version and last-updated date.

