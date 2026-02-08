# Task Plan: 20-code-documentation

## Overview

Add Google-style docstrings (Python) and JSDoc (TypeScript) to all public APIs. Ensure examples in docstrings work.

## Files to Create/Modify

| File | Action |
|------|--------|
| `python_service/schema.py` | Modify – docstrings |
| `python_service/parser.py` | Modify – docstrings |
| `python_service/server.py` | Modify – docstrings |
| `python_service/__main__.py` | Modify – docstring |
| `src/pythonClient.ts` | Modify – JSDoc |
| `src/extension.ts` | Modify – JSDoc |
| `webview-ui/src/editor.ts` | Modify – JSDoc |
| `webview-ui/src/App.tsx` | Modify – JSDoc |
| `webview-ui/src/nodes/*.tsx` | Modify – JSDoc |

## Test Strategy

Review and manual validation:
1. All public APIs documented
2. Args, Returns, Raises/Throws present
3. Examples run correctly

## Implementation Order

1. Review Python files, add/fix docstrings
2. Review TypeScript files, add/fix JSDoc
3. Test code examples
4. Consistency pass

## Validation Steps

- All publics documented
- Google style (Python)
- JSDoc style (TypeScript)
- Examples work

## Documentation Updates

Code itself is documented.
