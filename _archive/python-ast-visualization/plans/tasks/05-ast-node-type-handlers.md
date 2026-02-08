# Task Plan: 05-ast-node-type-handlers

## Overview

Extend ReteConverter with visit handlers for common AST node types: FunctionDef, ClassDef, Call, Name, If, For, While, Return, Assign, etc.

## Files to Create/Modify

| File | Action |
|------|--------|
| `python_service/parser.py` | Modify – add visit_* methods |
| `tests/python_service/test_parser.py` | Modify – add handler tests |

## Test Strategy (Write First)

1. `test_visit_function_def` – FunctionDef node, body connections
2. `test_visit_class_def` – ClassDef node
3. `test_visit_call` – Call node, func/args connections
4. `test_visit_name` – Name node
5. `test_visit_if` – If node, test/body/orelse
6. `test_visit_for` – For node, target/iter/body
7. `test_visit_while` – While node
8. `test_visit_return` – Return node
9. `test_complex_nested_structures` – Nested functions/classes
10. `test_edge_cases` – Empty body, no params, etc.

## Implementation Order

1. visit_FunctionDef – name, params, body connections
2. visit_ClassDef – name, bases, body
3. visit_Call – func, args connections
4. visit_Name – id, context
5. visit_If – test, body, orelse
6. visit_For – target, iter, body
7. visit_While – test, body
8. visit_Return – value connection
9. visit_Assign, visit_AugAssign, visit_List, visit_Dict
10. visit_Constant (Python 3.8+), visit_Str/visit_Num for compatibility
11. Add docstrings

## Validation Steps

- All tests pass
- Each AST type creates correct Rete node
- Connections reflect nesting

## Documentation Updates

Docstrings for each visit method.
