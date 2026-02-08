# Task Plan: 02-python-schema-models

## Overview

Define Pydantic models for Rete.js graph structure. Models serve as data contract between Python service and TypeScript/webview. TDD: write tests first.

## Files to Create/Modify

| File | Action |
|------|--------|
| `python_service/__init__.py` | Create – empty |
| `python_service/schema.py` | Create – Socket, NodeData, ReteNode, ReteConnection, ReteGraph |
| `tests/python_service/test_schema.py` | Create – all schema tests |

## Test Strategy (Write First)

1. `test_rete_node_creation_with_valid_data` – Create ReteNode, verify serialization
2. `test_rete_node_validation_with_invalid_data` – Missing/invalid fields → ValidationError
3. `test_rete_connection_creation` – Create ReteConnection, verify serialization
4. `test_rete_graph_creation` – Create ReteGraph with nodes/connections
5. `test_model_deserialization` – JSON → models, verify fields
6. `test_node_data_extra_fields` – extra="allow" works

## Implementation Order

1. Create `python_service/__init__.py`
2. Create `python_service/schema.py`: Socket (empty), NodeData (ast_type, lineno, col_offset, extra="allow"), ReteNode, ReteConnection, ReteGraph
3. Add Google-style docstrings and Field descriptions
4. Run tests, fix until all pass

## Validation Steps

- All tests pass
- Models serialize/deserialize JSON
- ValidationError for invalid data
- Models match TypeScript interfaces (Task 03)

## Documentation Updates

Docstrings in schema.py only.
