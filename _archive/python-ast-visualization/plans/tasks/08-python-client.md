# Task Plan: 08-python-client

## Overview

Implement TypeScript PythonClient. Spawns Python service via child_process, communicates via stdio JSON. parseAST(), stopService(), isServiceRunning().

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/pythonClient.ts` | Create – PythonClient class |
| `src/__tests__/pythonClient.test.ts` | Create – client tests |

## Test Strategy (Write First)

1. `test_service_spawning` – Mock spawn, verify command/stdio
2. `test_sending_parse_request` – parseAST sends correct JSON
3. `test_receiving_parse_response` – Mock response → graph
4. `test_error_handling_service_unavailable` – Process fails → error
5. `test_error_handling_parse_error` – Service returns error
6. `test_service_stopping` – stopService terminates process
7. `test_health_check` – isServiceRunning true/false
8. `test_concurrent_requests` – Multiple requests (if applicable)

## Implementation Order

1. Create PythonClient class, process: ChildProcess | null
2. spawnService() – spawn("python", ["-m", "python_service"])
3. parseAST(sourceCode) – send JSON, listen stdout, parse response
4. stopService() – kill process, cleanup listeners
5. isServiceRunning() – process !== null && alive
6. Add JSDoc

## Validation Steps

- All tests pass
- Client spawns and communicates
- Errors handled
- Cleanup on stop

## Documentation Updates

JSDoc on public methods.
