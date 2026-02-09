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

## Implementation Order

1. Profile parser, optimize ID generation
2. React.memo on node components
3. Debounce graph updates in App
4. Configure Rete for performance (if needed)

## Validation Steps

- Parse 100+ nodes < 1s
- Render 100+ nodes < 2s
- UI responsive
