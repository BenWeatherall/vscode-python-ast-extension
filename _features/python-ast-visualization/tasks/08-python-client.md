# Background

This task implements the TypeScript client for communicating with the Python service. The client spawns the Python service as a child process and communicates with it via stdio. This task depends on Task 06 (Communication Server) as it requires the Python service to be running. Following TDD principles, tests must be written before implementation.

# This Task

1. Create `src/pythonClient.ts` with:

   - `PythonClient` class:
     - Private field: `process: ChildProcess | null = null`
     - `spawnService(): Promise<void>`:
       - Spawn Python service process using `child_process.spawn()`
       - Use `python -m python_service` command
       - Set up stdio communication (stdin/stdout)
       - Wait for service to be ready (if needed)
       - Handle spawn errors
     - stdio communication setup:
       - Configure stdin/stdout for JSON communication
       - Set up data listeners for stdout
       - Handle process errors and exit events
     - `parseAST(sourceCode: string): Promise<ReteGraph>`:
       - Send parse request to Python service
       - Format request as JSON-RPC-like message
       - Wait for response
       - Parse response JSON
       - Handle errors from service
       - Return ReteGraph or throw error
     - Request/response parsing:
       - Format: `{"method": "parse", "params": {"sourceCode": "..."}}`
       - Parse response: `{"result": {...}}` or `{"error": {...}}`
       - Handle JSON parsing errors
     - Error handling:
       - Service unavailable errors
       - Parse errors from service
       - Communication errors
       - Timeout errors (if implemented)
     - `stopService(): void`:
       - Terminate Python service process
       - Clean up stdio listeners
       - Set process to null
     - `isServiceRunning(): boolean`:
       - Return true if process is running
       - Return false if process is null or exited

2. Add JSDoc comments to all public methods

3. Handle process lifecycle:
   - Monitor process exit events
   - Clean up on process termination
   - Handle unexpected process crashes

**Acceptance Criteria**:
- Client spawns Python service correctly
- Client communicates with service via stdio
- Client handles errors gracefully
- Client cleans up resources on stop
- Health check works correctly
- All tests pass

# Testing Needed

1. Write test: `tests/src/pythonClient.test.ts::test_service_spawning`
   - Mock child_process.spawn
   - Call spawnService()
   - Verify process spawned with correct command
   - Verify stdio configured correctly

2. Write test: `tests/src/pythonClient.test.ts::test_sending_parse_request`
   - Mock stdio communication
   - Send source code via parseAST()
   - Verify request formatted correctly
   - Verify request sent to stdin

3. Write test: `tests/src/pythonClient.test.ts::test_receiving_parse_response`
   - Mock response from Python service
   - Call parseAST() and wait for response
   - Verify graph data parsed correctly
   - Verify Promise resolves with graph

4. Write test: `tests/src/pythonClient.test.ts::test_error_handling_service_unavailable`
   - Mock service failure (process exits immediately)
   - Call parseAST()
   - Verify error thrown appropriately
   - Verify error message descriptive

5. Write test: `tests/src/pythonClient.test.ts::test_error_handling_parse_error`
   - Mock service returning error response
   - Call parseAST() with invalid code
   - Verify error thrown with service error message

6. Write test: `tests/src/pythonClient.test.ts::test_service_stopping`
   - Start service, then stop
   - Verify process terminated
   - Verify stdio listeners removed
   - Verify process set to null

7. Write test: `tests/src/pythonClient.test.ts::test_health_check`
   - Verify `isServiceRunning()` returns false initially
   - Start service, verify returns true
   - Stop service, verify returns false
   - Test with crashed process

8. Write test: `tests/src/pythonClient.test.ts::test_concurrent_requests`
   - Send multiple parse requests concurrently
   - Verify all requests handled correctly
   - Verify responses match requests
