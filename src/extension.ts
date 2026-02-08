/** VS Code extension entry point for Python AST visualization. */

import * as vscode from "vscode";
import { PythonClient } from "./pythonClient";
import type { ReteGraph } from "./types";

let pythonClient: PythonClient | null = null;

/**
 * Activates the extension. Creates PythonClient and registers commands.
 */
export function activate(context: vscode.ExtensionContext): void {
  pythonClient = new PythonClient();

  context.subscriptions.push(
    vscode.commands.registerCommand("python-ast.visualize", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage(
          "No active editor. Open a Python file to visualize its AST."
        );
        return;
      }

      const doc = editor.document;
      if (doc.languageId !== "python") {
        vscode.window.showErrorMessage(
          "Active file is not a Python file. Open a .py file to visualize its AST."
        );
        return;
      }

      const sourceCode = doc.getText();
      if (!pythonClient) return;

      try {
        await pythonClient.spawnService();
        const graph = await pythonClient.parseAST(sourceCode);

        createVisualizationPanel(context, pythonClient, doc.uri, graph);
      } catch (err) {
        vscode.window.showErrorMessage(
          `Failed to parse AST: ${(err as Error).message}`
        );
      }
    })
  );
}

/**
 * Deactivates the extension. Stops Python service and cleans up.
 */
export function deactivate(): void {
  if (pythonClient) {
    pythonClient.stopService();
    pythonClient = null;
  }
}

/**
 * Creates a webview panel for AST visualization with message handling.
 */
export function createVisualizationPanel(
  context: vscode.ExtensionContext,
  _pythonClient: PythonClient,
  documentUri: vscode.Uri,
  initialGraph: ReteGraph
): vscode.WebviewPanel {
  const panel = vscode.window.createWebviewPanel(
    "pythonAstVisualization",
    "AST Visualization",
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      localResourceRoots: [],
    }
  );

  panel.webview.html = getWebviewHtml(panel.webview);
  sendGraphToWebview(panel, initialGraph);

  const messageDisposable = panel.webview.onDidReceiveMessage(
    (msg: { type?: string; lineno?: number; colOffset?: number }) => {
      if (msg.type === "navigateToSource") {
        handleNavigateToSource(documentUri, msg.lineno, msg.colOffset);
      }
    }
  );

  panel.onDidDispose(() => {
    messageDisposable.dispose();
  });

  return panel;
}

function sendGraphToWebview(
  panel: vscode.WebviewPanel,
  graph: ReteGraph
): void {
  panel.webview.postMessage({ type: "updateGraph", graph });
}

function handleNavigateToSource(
  documentUri: vscode.Uri,
  lineno?: number,
  colOffset?: number
): void {
  vscode.window.showTextDocument(documentUri, {
    viewColumn: vscode.ViewColumn.One,
    preserveFocus: false,
  }).then((editor) => {
    if (lineno != null && colOffset != null) {
      const position = new vscode.Position(lineno - 1, colOffset);
      const range = new vscode.Range(position, position);
      editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
      editor.selection = new vscode.Selection(position, position);
    }
  });
}

function getWebviewHtml(_webview: vscode.Webview): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>AST Visualization</title></head>
<body>
  <div id="root"></div>
  <script>
    const vscode = acquireVsCodeApi();
    window.addEventListener('message', e => {
      const msg = e.data;
      if (msg && msg.type === 'updateGraph') window.__graphData = msg.graph;
      if (msg && msg.type === 'error') window.__errorData = msg.error;
    });
    window.__postToExtension = (msg) => vscode.postMessage(msg);
  </script>
</body>
</html>`;
}
