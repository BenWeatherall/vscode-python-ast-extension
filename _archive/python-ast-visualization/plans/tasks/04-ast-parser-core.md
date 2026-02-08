# Task Plan: 04-ast-parser-core

## Overview

Implement core AST parsing and graph conversion. ReteConverter extends ast.NodeVisitor. Converts Python AST to ReteGraph. TDD: tests first.

## Files to Create/Modify

| File | Action |
|------|--------|
| `python_service/parser.py` | Create – ReteConverter, parse_to_rete, visit_BinOp, connection logic |
| `tests/python_service/test_parser.py` | Create – parsing and error tests |

## Test Strategy (Write First)

1. `test_parsing_simple_binary_operation` – "x + y" → BinOp, Name nodes, connections
2. `test_parsing_function_definition` – "def hello(): pass" → FunctionDef
3. `test_parsing_class_definition` – "class MyClass: pass" → ClassDef
4. `test_error_handling_invalid_syntax` – Invalid code → SyntaxError
5. `test_line_number_preservation` – lineno, col_offset in node data
6. `test_node_id_generation` – Unique, deterministic IDs
7. `test_connection_creation` – Parent-child connections
8. `test_empty_source_code` – Empty string handling

## Implementation Order

1. Create ReteConverter class with __init__, nodes, connections, _node_id_map
2. Implement parse_to_rete (ast.parse, visit, return ReteGraph)
3. Implement node ID generation (id(node) → deterministic string)
4. Implement visit_BinOp (create node, connections to left/right)
5. Implement connection tracking (parent-child)
6. Add visit_Generic to handle other node types (stub) or generic_visit
7. Add docstrings

## Validation Steps

- All tests pass
- Valid ReteGraph structure
- Unique, deterministic node IDs
- Connections reflect AST structure

## Documentation Updates

Google-style docstrings on ReteConverter methods.
