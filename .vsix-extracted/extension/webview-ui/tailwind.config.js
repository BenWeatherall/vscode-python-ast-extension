/** Tailwind config for AST visualization webview – VS Code theme integration. */
module.exports = {
  content: ["./src/**/*.{ts,tsx,js,jsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        "vscode-bg": "var(--vscode-editor-background)",
        "vscode-fg": "var(--vscode-editor-foreground)",
        "vscode-node": "var(--vscode-editorWidget-background)",
        "vscode-border": "var(--vscode-panel-border)",
        "vscode-selected": "var(--vscode-list-activeSelectionBackground)",
        "vscode-hover": "var(--vscode-list-hoverBackground)",
      },
    },
  },
  plugins: [],
};
