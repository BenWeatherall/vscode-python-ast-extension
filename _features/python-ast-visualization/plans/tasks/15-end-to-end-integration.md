# Task Plan: 15-end-to-end-integration

## Overview

Write integration tests verifying full workflow: file → parse → visualize, node click → navigation, file save → auto-refresh, error propagation. Fix any integration issues.

## Files to Create/Modify

| File | Action |
|------|--------|
| `tests/integration/e2e/workflow.test.ts` | Create |
| `tests/integration/e2e/navigation.test.ts` | Create |
| `tests/integration/e2e/auto-refresh.test.ts` | Create |
| `tests/integration/e2e/error-handling.test.ts` | Create |
| `tests/integration/e2e/communication.test.ts` | Create |
| `tests/integration/e2e/performance.test.ts` | Create |
| Fix integration issues found | Modify affected files |

## Test Strategy (Write First)

1. `test_file_to_parse_to_visualize` – Full workflow
2. `test_node_click_to_navigation` – Click → editor
3. `test_file_save_to_auto_refresh` – Save → graph update
4. `test_error_propagation_end_to_end` – Invalid code → webview error
5. `test_message_round_trip` – Extension ↔ webview
6. `test_large_file_handling` – 100+ nodes performance

## Implementation Order

1. Create integration test structure
2. Implement workflow test
3. Implement navigation test
4. Implement auto-refresh test
5. Implement error-handling test
6. Implement communication test
7. Implement performance test
8. Run tests, fix failures

## Validation Steps

- Full workflow works
- All integration tests pass
- < 5 seconds for workflow

## Documentation Updates

None (tests only).
