# Background

This task configures Tailwind CSS and applies VS Code theme styling to the webview UI. The styling ensures the visualization matches VS Code's appearance and supports dark mode. This task depends on Task 12 (Custom Node Components) as it styles the node components. Following TDD principles, tests must be written before implementation.

# This Task

1. Create `webview-ui/tailwind.config.js`:
   - Configure Tailwind to use VS Code CSS variables
   - Set content paths for Tailwind scanning
   - Configure custom color palette matching VS Code theme
   - Extend theme with VS Code-specific colors

2. Create `webview-ui/src/index.css` - Global styles:
   - Import Tailwind directives
   - Define VS Code CSS variable mappings
   - Set base styles for webview
   - Configure dark mode support

3. Create `webview-ui/src/components/NodeStyles.css` - Node-specific styles:
   - Base node component styles
   - Node header styles
   - Node body styles
   - Connection wire styles
   - Hover and selection states

4. Style base node components:
   - Rounded corners
   - Shadows
   - Borders
   - Padding and spacing

5. Style connection wires:
   - Wire colors
   - Wire thickness
   - Wire curves
   - Wire hover states

6. Style viewport/area:
   - Background color
   - Grid pattern (optional)
   - Zoom/pan visual feedback

7. Add hover and selection states:
   - Node hover effects
   - Node selection highlighting
   - Connection hover effects

8. Implement Blueprint-inspired dark mode styling:
   - Dark color scheme
   - High contrast for readability
   - Subtle shadows and borders

**Acceptance Criteria**:
- CSS variables used correctly
- Theme colors match VS Code
- Responsive layout works
- Dark mode supported
- Visual styling matches design
- All tests pass

# Testing Needed

1. Write test: `webview-ui/src/__tests__/styles.test.ts::test_css_variable_usage`
   - Verify CSS variables used in styles
   - Verify variables defined correctly
   - Test variable fallbacks

2. Write test: `webview-ui/src/__tests__/styles.test.ts::test_theme_color_application`
   - Verify theme colors applied correctly
   - Test dark mode color switching
   - Verify color contrast meets accessibility standards

3. Write test: `webview-ui/src/__tests__/styles.test.ts::test_responsive_layout`
   - Verify responsive classes applied
   - Test layout at different viewport sizes
   - Verify components scale correctly

4. Write test: `webview-ui/src/__tests__/styles.test.ts::test_tailwind_configuration`
   - Verify Tailwind config loads correctly
   - Verify content paths configured
   - Verify custom colors available

5. Manual validation: Visual testing:
   - Load webview in VS Code
   - Verify styling matches VS Code theme
   - Test dark mode appearance
   - Verify hover/selection states
   - Test responsive behavior

6. Manual validation: Accessibility:
   - Verify color contrast ratios
   - Verify focus indicators visible
   - Test keyboard navigation styling
