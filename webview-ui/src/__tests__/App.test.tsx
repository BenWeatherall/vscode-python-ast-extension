/**
 * @jest-environment jsdom
 */
/** Tests for App component - message handling, editor, navigation. */
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
import { App } from "../App";

const mockPostMessage = jest.fn<void, [unknown]>();
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

function createVscodeApi() {
  return { postMessage: mockPostMessage };
}

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

describe("App", () => {
  it("sets up message listener on mount", () => {
    render(<App getVscodeApi={createVscodeApi} />);
    expect(mockAddEventListener).toHaveBeenCalledWith("message", expect.any(Function));
  });

  it("removes message listener on unmount", () => {
    const { unmount } = render(<App getVscodeApi={createVscodeApi} />);
    const [, handler] = mockAddEventListener.mock.calls.find(
      (c) => c[0] === "message"
    ) ?? [null, null];
    unmount();
    expect(mockRemoveEventListener).toHaveBeenCalledWith("message", handler);
  });

  it("shows loading state initially", () => {
    render(<App getVscodeApi={createVscodeApi} />);
    expect(screen.getByText(/loading/i)).toBeTruthy();
  });

  it("handles updateGraph message and loads graph", async () => {
    render(<App getVscodeApi={createVscodeApi} />);
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
    render(<App getVscodeApi={createVscodeApi} />);
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
    render(<App getVscodeApi={createVscodeApi} />);
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
