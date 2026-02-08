# Task Plan: 03-typescript-type-definitions

## Overview

Define TypeScript interfaces matching Python models. Handle snake_case ↔ camelCase. Create VSCodeMessage for extension ↔ webview. TDD where applicable.

## Files to Create/Modify

| File | Action |
|------|--------|
| `webview-ui/src/types.ts` | Create – ReteGraph, ReteNode, ReteConnection, NodeData, Socket, VSCodeMessage |
| `webview-ui/src/__tests__/types.test.ts` | Create – type compatibility, serialization, guards |
| `src/pythonClient.ts` types section | Create if needed – matching interfaces |

## Test Strategy (Write First)

1. `test_type_compatibility_with_python_models` – Required/optional fields match
2. `test_json_serialization` – Round-trip serialize/deserialize
3. `test_type_guards` – Runtime validation (if implemented)
4. `test_case_conversion` – snake_case ↔ camelCase utilities (if created)

## Implementation Order

1. Create `webview-ui/src/types.ts` with all interfaces (camelCase: sourceOutput, targetInput, astType, colOffset)
2. Add case conversion utilities if Python JSON uses snake_case
3. Create type tests
4. Run `tsc --noEmit`, fix errors

## Validation Steps

- TypeScript compiles
- Types match Python models
- JSON compatible with Python output

## Documentation Updates

JSDoc on interfaces if needed.
