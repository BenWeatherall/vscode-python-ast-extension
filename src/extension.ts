/** VS Code extension entry point for Python AST visualization. */

import * as vscode from "vscode";
import { PythonClient } from "./pythonClient";
import type { ReteGraph } from "./types";

let pythonClient: PythonClient | null = null;
let outputChannel: vscode.OutputChannel | null = null;

interface PanelEntry {
  panel: vscode.WebviewPanel;
  documentUri: vscode.Uri;
}

const panelRegistry: Map<string, PanelEntry[]> = new Map();
const debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
const DEBOUNCE_MS = 400;

/**
 * Gets or creates the output channel for logging errors and diagnostics.
 * @returns VS Code output channel for Python AST Visualization.
 */
function getOutputChannel(): vscode.OutputChannel {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel("Python AST Visualization");
  }
  return outputChannel;
}

/**
 * Logs an error message and optional error details to the output channel.
 * @param message - Error message to log.
 * @param error - Optional Error object with stack trace.
 */
function logError(message: string, error?: Error): void {
  const channel = getOutputChannel();
  const timestamp = new Date().toISOString();
  channel.appendLine(`[${timestamp}] ERROR: ${message}`);
  if (error) {
    channel.appendLine(`  Error: ${error.message}`);
    if (error.stack) {
      channel.appendLine(`  Stack trace:`);
      channel.appendLine(error.stack);
    }
  }
  channel.show(true);
}

/**
 * Converts a VS Code URI to a string key for panel registry lookup.
 * @param uri - VS Code URI to convert.
 * @returns String representation of the URI.
 */
function getUriKey(uri: vscode.Uri): string {
  return uri.toString();
}

/**
 * Registers a webview panel in the panel registry for a document URI.
 * @param entry - Panel entry containing panel and document URI.
 */
function registerPanel(entry: PanelEntry): void {
  const key = getUriKey(entry.documentUri);
  const list = panelRegistry.get(key) ?? [];
  list.push(entry);
  panelRegistry.set(key, list);
}

/**
 * Unregisters a webview panel from the panel registry.
 * @param panel - Webview panel to unregister.
 */
function unregisterPanel(panel: vscode.WebviewPanel): void {
  for (const [key, list] of panelRegistry) {
    const idx = list.findIndex((e) => e.panel === panel);
    if (idx >= 0) {
      list.splice(idx, 1);
      if (list.length === 0) panelRegistry.delete(key);
      return;
    }
  }
}

/**
 * Gets all registered panels for a document URI.
 * @param uri - Document URI to look up.
 * @returns Array of panel entries for the URI, or empty array if none found.
 */
function getPanelsForUri(uri: vscode.Uri): PanelEntry[] {
  return panelRegistry.get(getUriKey(uri)) ?? [];
}

/**
 * Creates a debounced version of a function.
 * @param key - Unique key for tracking the debounce timer.
 * @param fn - Function to debounce.
 * @param delay - Delay in milliseconds.
 * @returns Debounced function that delays execution.
 */
function debounce<T extends (...args: unknown[]) => void>(
  key: string,
  fn: T,
  delay: number
): T {
  return ((...args: unknown[]) => {
    const existing = debounceTimers.get(key);
    if (existing) clearTimeout(existing);
    debounceTimers.set(
      key,
      setTimeout(() => {
        debounceTimers.delete(key);
        fn(...args);
      }, delay)
    );
  }) as T;
}

/**
 * Handles auto-refresh when a Python file is saved.
 * Parses the document and updates all associated visualization panels.
 * @param document - Text document that was saved.
 */
async function handleAutoRefresh(document: vscode.TextDocument): Promise<void> {
  if (document.languageId !== "python" || document.uri.scheme !== "file") return;
  if (!pythonClient) return;

  const uri = document.uri;
  const key = getUriKey(uri);
  const content = document.getText();

  const doRefresh = async () => {
    try {
      const client = pythonClient;
      if (!client) return;
      
      const panels = getPanelsForUri(uri);
      if (panels.length === 0) return;
      
      // Show loading state
      for (const { panel } of panels) {
        panel.webview.postMessage({
          type: "loading",
          message: "Refreshing...",
        });
      }
      
      if (!client.isServiceRunning()) await client.spawnService();
      const graph = await client.parseAST(content);
      
      for (const { panel } of panels) {
        panel.webview.postMessage({ type: "updateGraph", graph });
      }
    } catch (err) {
      // Log auto-refresh errors but don't show to user
      const error = err as Error;
      logError(`Auto-refresh failed for ${uri.fsPath}`, error);
      
      // Send error to webview for display
      const panels = getPanelsForUri(uri);
      for (const { panel } of panels) {
        panel.webview.postMessage({
          type: "error",
          error: `Failed to refresh: ${error.message}`,
        });
      }
    }
  };

  debounce(key, doRefresh, DEBOUNCE_MS)();
}

/**
 * Activates the extension.
 * Creates PythonClient instance, registers the 'python-ast.visualize' command,
 * and sets up auto-refresh on file save.
 * @param context - VS Code extension context for subscriptions.
 */
export function activate(context: vscode.ExtensionContext): void {
  pythonClient = new PythonClient();

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((doc) => handleAutoRefresh(doc))
  );

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
        const error = err as Error;
        const errorMessage = error.message || "Unknown error occurred";
        
        // Log error with context
        logError(
          `Failed to parse AST for ${doc.uri.fsPath}`,
          error
        );
        
        // Show user-friendly error message
        let userMessage = "Failed to parse Python code";
        if (errorMessage.includes("Syntax error") || errorMessage.includes("invalid syntax")) {
          userMessage = `Python syntax error: ${errorMessage}`;
        } else if (errorMessage.includes("service") || errorMessage.includes("Service")) {
          userMessage = `Python service error: ${errorMessage}. Try restarting the extension or checking your Python installation.`;
        } else {
          userMessage = `Parse error: ${errorMessage}`;
        }
        
        vscode.window.showErrorMessage(userMessage);
        
        // Send error to webview if panel exists
        const panels = getPanelsForUri(doc.uri);
        for (const { panel } of panels) {
          panel.webview.postMessage({
            type: "error",
            error: userMessage,
          });
        }
      }
    })
  );
}

/**
 * Deactivates the extension.
 * Stops the Python service, clears panel registry, and cleans up resources.
 */
export function deactivate(): void {
  panelRegistry.clear();
  debounceTimers.forEach((t) => clearTimeout(t));
  debounceTimers.clear();
  if (pythonClient) {
    pythonClient.stopService();
    pythonClient = null;
  }
  if (outputChannel) {
    outputChannel.dispose();
    outputChannel = null;
  }
}

/**
 * Creates a webview panel for AST visualization with message handling.
 * @param context - VS Code extension context for subscriptions.
 * @param _pythonClient - Python client instance (unused, kept for API compatibility).
 * @param documentUri - URI of the document being visualized.
 * @param initialGraph - Initial graph to display in the panel.
 * @returns Created webview panel instance.
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

  registerPanel({ panel, documentUri });

  const messageDisposable = panel.webview.onDidReceiveMessage(
    async (msg: { type?: string; lineno?: number; colOffset?: number }) => {
      if (msg.type === "navigateToSource") {
        handleNavigateToSource(documentUri, msg.lineno, msg.colOffset);
      } else if (msg.type === "retry") {
        // Handle retry request from webview
        try {
          const doc = await vscode.workspace.openTextDocument(documentUri);
          const sourceCode = doc.getText();
          
          if (!pythonClient) {
            panel.webview.postMessage({
              type: "error",
              error: "Python client not available. Please try the command again.",
            });
            return;
          }
          
          // Show loading state
          panel.webview.postMessage({
            type: "loading",
            message: "Parsing...",
          });
          
          if (!pythonClient.isServiceRunning()) {
            await pythonClient.spawnService();
          }
          
          const graph = await pythonClient.parseAST(sourceCode);
          panel.webview.postMessage({ type: "updateGraph", graph });
        } catch (err) {
          const error = err as Error;
          logError(`Retry failed for ${documentUri.fsPath}`, error);
          
          let userMessage = `Failed to parse: ${error.message}`;
          if (error.message.includes("Syntax error") || error.message.includes("invalid syntax")) {
            userMessage = `Python syntax error: ${error.message}`;
          } else if (error.message.includes("service") || error.message.includes("Service")) {
            userMessage = `Python service error: ${error.message}. Try restarting the extension.`;
          }
          
          panel.webview.postMessage({
            type: "error",
            error: userMessage,
          });
        }
      }
    }
  );

  panel.onDidDispose(() => {
    unregisterPanel(panel);
    messageDisposable.dispose();
  });

  return panel;
}

/**
 * Sends a graph update message to a webview panel.
 * @param panel - Webview panel to send the message to.
 * @param graph - Rete graph to send.
 */
function sendGraphToWebview(
  panel: vscode.WebviewPanel,
  graph: ReteGraph
): void {
  panel.webview.postMessage({ type: "updateGraph", graph });
}

/**
 * Handles navigation request from webview to source code location.
 * Opens the document and reveals the specified line and column.
 * @param documentUri - URI of the document to navigate to.
 * @param lineno - Line number (1-based).
 * @param colOffset - Column offset (0-based).
 */
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

/**
 * Generates HTML content for the webview panel.
 * @param webview - VS Code webview instance.
 * @returns HTML string for the webview.
 */
function getWebviewHtml(webview: vscode.Webview): string {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(vscode.Uri.file(__dirname), "media", "webview.js")
  );
  const styleUri = webview.asWebviewUri(
    vscode.Uri.joinPath(vscode.Uri.file(__dirname), "media", "webview.css")
  );
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AST Visualization</title>
  <link rel="stylesheet" href="${styleUri}">
</head>
<body>
  <div id="root"></div>
  <script src="${scriptUri}"></script>
</body>
</html>`;
}
