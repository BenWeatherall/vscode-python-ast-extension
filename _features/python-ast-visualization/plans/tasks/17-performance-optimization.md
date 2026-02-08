# Task Plan: 17-performance-optimization

## Overview

Optimize for large ASTs (100+ nodes). Parser: fast ID generation. React: memo, useMemo. Rete: efficient config. Debounce updates. Target: parse < 1s, render < 2s.

## Files to Create/Modify

| File | Action |
|------|--------|
| `python_service/parser.py` | Modify – ID generation |
| `webview-ui/src/editor.ts` | Modify – Rete config |
| `webview-ui/src/App.tsx` | Modify – memo, useMemo |
| `tests/performance/performance.test.py` | Create |
| `tests/performance/performance.test.ts` | Create |

## Test Strategy (Write First)

1. `test_parse_large_file` – 100+ nodes, < 1s
2. `test_render_large_graph` – 100+ nodes, < 2s
3. `test_worker_support` – If implemented
4. `test_debouncing_behavior` – Debounce correct
5. `test_memory_usage` – No leaks
6. `test_ui_responsiveness` – UI responsive during parse

## Implementation Order

1. Profile parser, optimize ID generation
2. React.memo on node components
3. useMemo for expensive computations
4. Debounce graph updates in App
5. Configure Rete for performance
6. Add worker if needed (optional)

## Validation Steps

- Parse 100+ nodes < 1s
- Render 100+ nodes < 2s
- UI responsive
- No memory leaks

## Documentation Updates

Performance notes in code if needed.
