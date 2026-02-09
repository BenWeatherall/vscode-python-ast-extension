/**
 * @jest-environment jsdom
 */
/** Tests for App component - message handling, editor, navigation. */
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
import { App } from "../App";
import type { ReteGraph } from "../types";

const mockPostMessage = jest.fn<void, [unknown]>();
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

function createVscodeApi() {
  return { postMessage: mockPostMessage };
}

jest.mock("../editor", () => {
  const actual = jest.requireActual<typeof import("../editor")>("../editor");

  type NodeClickHandler = (nodeId: string, data: { lineno?: number; colOffset?: number }) => void;

  type MockGraph = {
    nodes: Array<{ id: string; label: string; data?: Record<string, unknown> }>;
    connections: unknown[];
  };

  class MockReteASTEditor {
    private container: HTMLElement | null = null;
    private handlers: NodeClickHandler[] = [];

    initialize(container: HTMLElement): Promise<void> {
      this.container = container;
      return Promise.resolve();
    }

    onNodeClick(handler: NodeClickHandler): void {
      this.handlers.push(handler);
    }

    clearGraph(): Promise<void> {
      if (this.container) this.container.innerHTML = "";
      return Promise.resolve();
    }

    loadGraph(graph: MockGraph): Promise<void> {
      if (!this.container) return Promise.resolve();
      this.container.innerHTML = "";
      for (const node of graph.nodes) {
        const el = document.createElement("div");
        el.setAttribute("data-testid", "ast-node");
        el.onclick = () => {
          this.handlers.forEach((h) => h(node.id, node.data ?? { astType: node.label }));
        };
        this.container.appendChild(el);
      }
      return Promise.resolve();
    }

    getGraph(): MockGraph {
      return { nodes: [], connections: [] };
    }
  }

  return { ...actual, ReteASTEditor: MockReteASTEditor };
});

beforeEach(() => {
  mockPostMessage.mockClear();
  mockAddEventListener.mockClear();
  mockRemoveEventListener.mockClear();
  Object.defineProperty(window, "addEventListener", {
    value: mockAddEventListener,
    writable: true,
  });
  Object.defineProperty(window, "removeEventListener", {
    value: mockRemoveEventListener,
    writable: true,
  });
});

async function renderApp() {
  let result: ReturnType<typeof render>;
  await act(async () => {
    result = render(<App getVscodeApi={createVscodeApi} />);
    await Promise.resolve();
  });
  return result!;
}

describe("App", () => {
  it("sets up message listener on mount", async () => {
    await renderApp();
    expect(mockAddEventListener).toHaveBeenCalledWith("message", expect.any(Function));
  });

  it("removes message listener on unmount", async () => {
    const { unmount } = await renderApp();
    const [, handler] = mockAddEventListener.mock.calls.find(
      (c) => c[0] === "message"
    ) ?? [null, null];
    await act(async () => {
      unmount();
      await Promise.resolve();
    });
    expect(mockRemoveEventListener).toHaveBeenCalledWith("message", handler);
  });

  it("shows loading state initially", async () => {
    await renderApp();
    expect(screen.getByTestId("loading")).toBeTruthy();
  });

  it("handles updateGraph message and loads graph", async () => {
    await renderApp();
    const [, handler] = mockAddEventListener.mock.calls.find(
      (c) => c[0] === "message"
    ) ?? [null, null];
    expect(handler).toBeDefined();

    const graph = {
      nodes: [{ id: "n1", label: "BinOp", inputs: {}, outputs: {}, data: { astType: "BinOp" } }],
      connections: [],
    };
    await act(async () => {
      handler?.({ data: { type: "updateGraph", graph } });
    });

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).toBeNull();
    });
  });

  it("handles error message and displays error", async () => {
    await renderApp();
    const [, handler] = mockAddEventListener.mock.calls.find(
      (c) => c[0] === "message"
    ) ?? [null, null];

    await act(async () => {
      handler?.({ data: { type: "error", error: "Parse failed" } });
    });

    await waitFor(() => {
      expect(screen.getByText(/parse failed/i)).toBeTruthy();
    });
  });

  it("sends navigateToSource when node is clicked", async () => {
    await renderApp();
    const [, handler] = mockAddEventListener.mock.calls.find(
      (c) => c[0] === "message"
    ) ?? [null, null];

    const graph = {
      nodes: [{ id: "n1", label: "BinOp", inputs: {}, outputs: {}, data: { astType: "BinOp", lineno: 5, colOffset: 2 } }],
      connections: [],
    };
    await act(async () => {
      handler?.({ data: { type: "updateGraph", graph } });
    });

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).toBeNull();
    });

    const node = await screen.findByTestId("ast-node", {}, { timeout: 2000 });
    fireEvent.click(node);

    expect(mockPostMessage).toHaveBeenCalledWith({
      type: "navigateToSource",
      nodeId: "n1",
      lineno: 5,
      colOffset: 2,
    });
  });
});
