# Task Plan: 06-communication-server

## Overview

Implement stdio-based ASTParseServer. Reads JSON requests from stdin, parses via ReteConverter, returns graph or error to stdout. JSON-RPC-like protocol.

## Files to Create/Modify

| File | Action |
|------|--------|
| `python_service/server.py` | Create – ASTParseServer |
| `tests/python_service/test_server.py` | Create – server tests |

## Test Strategy (Write First)

1. `test_server_initialization` – Parser injected
2. `test_handling_valid_parse_request` – Valid code → graph response
3. `test_handling_invalid_source_code` – Invalid code → error response
4. `test_error_response_formatting` – Error structure, codes
5. `test_server_lifecycle` – start/stop
6. `test_request_parsing` – Valid/invalid JSON, missing fields
7. `test_response_serialization` – Graph serializes correctly

## Implementation Order

1. Create ASTParseServer class with __init__(parser)
2. Implement handle_parse_request(source_code) → {"result": graph} or {"error": {...}}
3. Error codes: -32700 (Parse), -32603 (Internal)
4. Implement start_server() – read stdin, parse JSON, call handle_parse_request, write stdout
5. Implement stop_server()
6. Request format: {"method": "parse", "params": {"sourceCode": "..."}}
7. Add docstrings

## Validation Steps

- All tests pass
- Valid requests return graph
- Invalid requests return proper errors
- Clean lifecycle

## Documentation Updates

Docstrings on ASTParseServer methods.
