import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("python-ast.visualize", () => {
      vscode.window.showInformationMessage("Python AST Visualization - Placeholder");
    }),
  );
}

export function deactivate(): void {}
