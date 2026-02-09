# Task Plan: 14-styling-and-theme-integration

## Overview

Configure Tailwind, VS Code CSS variables, node styles. Dark mode, hover/selection states. Blueprint-inspired styling.

## Files to Create/Modify

| File | Action |
|------|--------|
| `webview-ui/tailwind.config.js` | Create – Tailwind, VS Code vars |
| `webview-ui/src/index.css` | Create – Tailwind, base styles |
| `webview-ui/src/components/NodeStyles.css` | Create – Node styles |
| `webview-ui/src/__tests__/styles.test.ts` | Create – style tests |

## Test Strategy (Write First)

1. `test_css_variable_usage` – Variables in styles
2. `test_theme_color_application` – Dark mode
3. `test_responsive_layout` – Responsive classes
4. `test_tailwind_configuration` – Config loads

## Implementation Order

1. tailwind.config.js – content paths, theme extend
2. index.css – @tailwind, var(--vscode-*)
3. NodeStyles.css – node header/body, wires, hover
4. Apply to node components
5. Connection wire styles
6. Viewport/area background

## Validation Steps

- CSS vars used
- Theme matches VS Code
- Dark mode
- All tests pass

## Documentation Updates

None (styles only).
