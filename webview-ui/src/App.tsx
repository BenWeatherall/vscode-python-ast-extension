/** React App component for AST visualization webview. */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ReteASTEditor } from "./editor";
import type { ReteGraph, VSCodeMessage } from "./types";

const GRAPH_UPDATE_DEBOUNCE_MS = 150;

/** Props for injecting vscode API (for tests). */
export interface AppProps {
  getVscodeApi: () => { postMessage: (msg: unknown) => void };
}

/**
 * Main App component that manages graph state, message handling, and editor.
 * Handles VS Code messages (updateGraph, error, loading), manages editor lifecycle,
 * and provides error UI with retry functionality.
 * @param props - Component props including getVscodeApi function.
 * @returns React element rendering the AST visualization editor or error/loading UI.
 */
export function App({ getVscodeApi }: AppProps): React.ReactElement {
  const [graph, setGraph] = useState<ReteGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("Parsing...");
  const [editorReady, setEditorReady] = useState(false);
  const editorRef = useRef<ReteASTEditor | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  /**
   * Handles node click events from the editor.
   * Sends a navigation message to the extension host to jump to source code location.
   * @param nodeId - ID of the clicked node.
   * @param data - Node data containing optional line number and column offset.
   */
  const handleNodeClick = useCallback(
    (nodeId: string, data: { lineno?: number; colOffset?: number }) => {
      getVscodeApi().postMessage({
        type: "navigateToSource",
        nodeId,
        lineno: data.lineno,
        colOffset: data.colOffset,
      });
    },
    [getVscodeApi]
  );

  const graphDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const editor = new ReteASTEditor();
    editorRef.current = editor;
    editor.onNodeClick(handleNodeClick);

    const container = containerRef.current;
    if (!container) return;

    let mounted = true;
    editor.initialize(container).then(() => {
      if (mounted) setEditorReady(true);
    });

    const handleMessage = (e: MessageEvent) => {
      const msg = e.data as VSCodeMessage | undefined;
      if (!msg?.type) return;
      if (msg.type === "updateGraph" && msg.graph) {
        setError(null);
        setLoading(false);
        setLoadingMessage("Parsing...");
        if (graphDebounceRef.current) clearTimeout(graphDebounceRef.current);
        graphDebounceRef.current = setTimeout(() => {
          setGraph(msg.graph!);
          graphDebounceRef.current = null;
        }, GRAPH_UPDATE_DEBOUNCE_MS);
      }
      if (msg.type === "error" && msg.error) {
        if (graphDebounceRef.current) clearTimeout(graphDebounceRef.current);
        graphDebounceRef.current = null;
        setError(msg.error);
        setLoading(false);
        setLoadingMessage("Parsing...");
      }
      if (msg.type === "loading") {
        setLoading(true);
        setLoadingMessage(msg.message || "Parsing...");
        setError(null);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      mounted = false;
      window.removeEventListener("message", handleMessage);
      if (graphDebounceRef.current) clearTimeout(graphDebounceRef.current);
      editor.clearGraph();
      editorRef.current = null;
    };
  }, [handleNodeClick]);

  useEffect(() => {
    if (graph && editorRef.current && editorReady) {
      editorRef.current.loadGraph(graph);
    }
  }, [graph, editorReady]);

  /**
   * Handles retry button click.
   * Sends a retry message to the extension host to re-parse the source code.
   */
  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    setLoadingMessage("Retrying...");
    getVscodeApi().postMessage({ type: "retry" });
  }, [getVscodeApi]);

  /**
   * Generates error recovery suggestions based on error message content.
   * @param errorMsg - Error message to analyze.
   * @returns Array of suggestion strings for the user.
   */
  const getErrorRecoverySuggestions = (errorMsg: string): string[] => {
    const suggestions: string[] = [];
    const lowerMsg = errorMsg.toLowerCase();
    
    if (lowerMsg.includes("syntax error") || lowerMsg.includes("invalid syntax")) {
      suggestions.push("Check your Python syntax - look for missing colons, parentheses, or quotes");
      suggestions.push("Verify indentation is correct (Python is sensitive to indentation)");
    } else if (lowerMsg.includes("service") || lowerMsg.includes("unavailable")) {
      suggestions.push("Try restarting the Python AST visualization extension");
      suggestions.push("Check that Python is installed and accessible in your PATH");
    } else if (lowerMsg.includes("line") || lowerMsg.includes("column")) {
      suggestions.push("Check the line and column mentioned in the error");
      suggestions.push("Look for typos or missing characters near that location");
    } else {
      suggestions.push("Check the Python code for errors");
      suggestions.push("Try saving the file and refreshing the visualization");
    }
    
    return suggestions;
  };

  if (error) {
    const suggestions = getErrorRecoverySuggestions(error);
    return (
      <div
        data-testid="error"
        style={{
          padding: "20px",
          maxWidth: "600px",
          margin: "40px auto",
          fontFamily: "var(--vscode-font-family)",
          color: "var(--vscode-errorForeground)",
        }}
      >
        <div
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>⚠️</span>
          <span>Error</span>
        </div>
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            backgroundColor: "var(--vscode-inputValidation-errorBackground)",
            border: "1px solid var(--vscode-inputValidation-errorBorder)",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
        {suggestions.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontWeight: "bold", marginBottom: "8px" }}>Suggestions:</div>
            <ul style={{ marginLeft: "20px", marginTop: "0" }}>
              {suggestions.map((suggestion, idx) => (
                <li key={idx} style={{ marginBottom: "4px" }}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
        <button
          onClick={handleRetry}
          style={{
            padding: "8px 16px",
            backgroundColor: "var(--vscode-button-background)",
            color: "var(--vscode-button-foreground)",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "var(--vscode-button-hoverBackground)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "var(--vscode-button-background)";
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div
          data-testid="loading"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            fontFamily: "var(--vscode-font-family)",
            color: "var(--vscode-foreground)",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid var(--vscode-progressBar-background)",
              borderTop: "4px solid var(--vscode-progressBar-foreground)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <div>{loadingMessage}</div>
        </div>
      )}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div
        ref={containerRef}
        data-testid="editor-container"
        className="ast-viewport"
        style={{ width: "100%", height: "100%", display: loading ? "none" : "block" }}
      />
    </>
  );
}
