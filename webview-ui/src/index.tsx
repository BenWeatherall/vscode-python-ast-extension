/** React entry point for webview. */

import { createRoot } from "react-dom/client";
import { App } from "./App";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

const acquireApi = (globalThis as unknown as { acquireVsCodeApi?: () => { postMessage: (msg: unknown) => void } }).acquireVsCodeApi;
const vscode = acquireApi ? acquireApi() : { postMessage: () => {} };

createRoot(root).render(<App getVscodeApi={() => vscode} />);
