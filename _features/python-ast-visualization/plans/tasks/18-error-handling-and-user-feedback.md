# Task Plan: 18-error-handling-and-user-feedback

## Overview

Improve error handling and user feedback. User-friendly messages, parsing errors in webview, service failure handling, loading indicators, recovery suggestions, output channel logging.

## Files to Create/Modify

| File | Action |
|------|--------|
| `python_service/server.py` | Modify – error messages |
| `src/extension.ts` | Modify – user messages, output channel |
| `webview-ui/src/App.tsx` | Modify – error UI, loading |
| `tests/error-handling/error-handling.test.ts` | Create |

## Test Strategy (Write First)

1. `test_error_message_display` – User-friendly
2. `test_service_failure_handling` – Graceful, suggestions
3. `test_loading_state_display` – Indicators
4. `test_error_recovery` – Suggestions, retry
5. `test_parsing_error_display` – Syntax error, location
6. `test_error_logging` – Output channel

## Implementation Order

1. Improve server error messages
2. Extension: createOutputChannel, log errors
3. Webview: loading spinner, error UI, retry
4. Parsing errors: line/column in message
5. Service failure: "Restart service" suggestion

## Validation Steps

- Errors user-friendly
- Loading visible
- Recovery options
- All tests pass

## Documentation Updates

None (inline messages).
