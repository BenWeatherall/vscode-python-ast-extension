/** React App component for AST visualization webview. */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ReteASTEditor } from "./editor";
import type { ReteGraph, VSCodeMessage } from "./types";

/** Props for injecting vscode API (for tests). */
export interface AppProps {
  getVscodeApi: () => { postMessage: (msg: unknown) => void };
}

/** Manages graph state, message handling, and editor. */
export function App({ getVscodeApi }: AppProps): React.ReactElement {
  const [graph, setGraph] = useState<ReteGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorReady, setEditorReady] = useState(false);
  const editorRef = useRef<ReteASTEditor | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
        setGraph(msg.graph);
        setLoading(false);
      }
      if (msg.type === "error" && msg.error) {
        setError(msg.error);
        setLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      mounted = false;
      window.removeEventListener("message", handleMessage);
      editor.clearGraph();
      editorRef.current = null;
    };
  }, [handleNodeClick]);

  useEffect(() => {
    if (graph && editorRef.current && editorReady) {
      editorRef.current.loadGraph(graph);
    }
  }, [graph, editorReady]);

  if (error) {
    return <div data-testid="error">{error}</div>;
  }

  return (
    <>
      {loading && <div data-testid="loading">Loading...</div>}
      <div
        ref={containerRef}
        data-testid="editor-container"
        style={{ width: "100%", height: "100vh", display: loading ? "none" : "block" }}
      />
    </>
  );
}
