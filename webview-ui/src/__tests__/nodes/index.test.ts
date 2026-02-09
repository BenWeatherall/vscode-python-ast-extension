/**
 * @jest-environment jsdom
 */
/** Tests for node factory and registration. */
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { getNodeComponent } from "../../nodes";
import { ASTNode } from "../../nodes/ASTNode";

const mockEmit = jest.fn();

const baseNodeData = {
  id: "n1",
  label: "Test",
  inputs: {} as Record<string, { socket: unknown; label?: string }>,
  outputs: {} as Record<string, { socket: unknown; label?: string }>,
};

describe("getNodeComponent", () => {
  it("returns BinOpNode for BinOp", () => {
    const Component = getNodeComponent("BinOp");
    expect(Component).toBeDefined();
    render(React.createElement(Component!, { data: { ...baseNodeData, label: "BinOp" }, emit: mockEmit }));
    expect(screen.getByTestId("ast-node-inner")).toBeTruthy();
  });

  it("returns FunctionDefNode for FunctionDef", () => {
    const Component = getNodeComponent("FunctionDef");
    expect(Component).toBeDefined();
    render(React.createElement(Component!, { data: { ...baseNodeData, label: "FunctionDef" }, emit: mockEmit }));
    expect(screen.getByTestId("ast-node-inner")).toBeTruthy();
  });

  it("returns ASTNode for unknown type", () => {
    const Component = getNodeComponent("UnknownType");
    expect(Component).toBe(ASTNode);
  });
});

describe("ASTNode", () => {
  it("renders label in title", () => {
    render(
      React.createElement(ASTNode, {
        data: { ...baseNodeData, label: "BinOp", data: { astType: "BinOp", lineno: 1 } },
        emit: mockEmit,
      })
    );
    expect(screen.getByTestId("title").textContent).toBe("BinOp");
  });

  it("renders lineno in body when present", () => {
    render(
      React.createElement(ASTNode, {
        data: { ...baseNodeData, data: { astType: "BinOp", lineno: 5, colOffset: 2 } },
        emit: mockEmit,
      })
    );
    expect(screen.getByTestId("body").textContent).toBe("L5:2");
  });

  it("does not render body when lineno absent", () => {
    render(
      React.createElement(ASTNode, {
        data: { ...baseNodeData, data: { astType: "Name" } },
        emit: mockEmit,
      })
    );
    expect(screen.queryByTestId("body")).toBeNull();
  });
});
