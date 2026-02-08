# Background

This task implements the stdio-based communication server for the Python service. The server handles parse requests from the extension host and returns graph data or error responses. This task depends on Task 04 (AST Parser Core) and Task 02 (Python Schema Models) as it uses the ReteConverter parser and ReteGraph models. Following TDD principles, tests must be written before implementation.

# This Task

1. Create `python_service/server.py` with:

   - `ASTParseServer` class:
     - `__init__(parser: ReteConverter)` - Dependency injection of parser
       - Store parser instance
       - Initialize request/response handling state
     - `handle_parse_request(source_code: str) -> Dict[str, Any]`:
       - Call parser.parse_to_rete(source_code)
       - Return dictionary with 'result' containing ReteGraph (as dict)
       - Handle SyntaxError and return error response
       - Handle other exceptions and return error response
     - Request parsing logic:
       - Read JSON from stdin
       - Parse JSON to extract source_code
       - Validate request format
     - Response formatting logic:
       - Format successful response: `{"result": {...}}`
       - Format error response: `{"error": {"code": int, "message": str}}`
       - Write JSON to stdout
     - Error handling:
       - SyntaxError → error code -32700 (Parse error)
       - Other exceptions → error code -32603 (Internal error)
       - Include descriptive error messages
     - `start_server()` method:
       - Start stdio server loop
       - Read requests from stdin
       - Process requests and write responses
       - Handle EOF gracefully
     - `stop_server()` method:
       - Graceful shutdown
       - Clean up resources

2. Add Google-style docstrings to all methods

3. Implement JSON-RPC-like protocol:
   - Request format: `{"method": "parse", "params": {"sourceCode": "..."}}`
   - Response format: `{"result": {...}}` or `{"error": {...}}`

**Acceptance Criteria**:
- Server handles valid requests correctly
- Server handles invalid requests with proper errors
- Server lifecycle works correctly (start/stop)
- Communication protocol matches interface specification
- Error responses have correct structure and codes
- All tests pass

# Testing Needed

1. Write test: `tests/python_service/test_server.py::test_server_initialization`
   - Create server with parser
   - Verify server initialized successfully
   - Verify parser dependency injected correctly

2. Write test: `tests/python_service/test_server.py::test_handling_valid_parse_request`
   - Send valid source code via handle_parse_request
   - Verify response contains graph
   - Verify graph structure is valid
   - Verify response format matches specification

3. Write test: `tests/python_service/test_server.py::test_handling_invalid_source_code`
   - Send invalid Python code
   - Verify error response returned
   - Verify error message is descriptive
   - Verify error code is -32700 (Parse error)

4. Write test: `tests/python_service/test_server.py::test_error_response_formatting`
   - Trigger various error conditions
   - Verify error response has correct structure
   - Verify error codes are appropriate
   - Verify error messages are user-friendly

5. Write test: `tests/python_service/test_server.py::test_server_lifecycle`
   - Test server start
   - Test server stop
   - Verify clean shutdown
   - Verify resources cleaned up

6. Write test: `tests/python_service/test_server.py::test_request_parsing`
   - Test valid JSON request parsing
   - Test invalid JSON request handling
   - Test missing required fields handling

7. Write test: `tests/python_service/test_server.py::test_response_serialization`
   - Verify graph serializes to JSON correctly
   - Verify response format matches specification
   - Verify large graphs serialize without issues

8. Write test: `tests/python_service/test_server.py::test_concurrent_requests` (if applicable)
   - Test handling multiple requests sequentially
   - Verify no state leakage between requests
