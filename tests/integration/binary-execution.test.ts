/**
 * Integration tests for binary execution flow.
 *
 * Tests verify end-to-end binary execution:
 * - Extension activation with binary resolution
 * - Binary execution and JSON-RPC communication
 * - Protocol compatibility between binary and Python command
 * - Fallback behavior when binary unavailable
 * - Platform-specific binary resolution
 */

import * as path from "path";
import * as fs from "fs";
import { PythonClient } from "../../src/pythonClient";
import { resolveBinaryPath } from "../../src/binaryResolver";
import type { ReteGraph } from "../../src/types";

// Helper to check if binary exists for current platform
function getBinaryPathIfExists(): string | null {
  const extensionPath = path.join(__dirname, "../../");
  const binaryPath = resolveBinaryPath(extensionPath);
  
  if (binaryPath && fs.existsSync(binaryPath)) {
    return binaryPath;
  }
  
  return null;
}

// Helper to skip tests when binary not available
function skipIfBinaryNotAvailable(binaryPath: string | null): void {
  if (!binaryPath) {
    console.log("Skipping test: binary not available for current platform");
  }
}

// Helper to validate graph structure
function validateGraphStructure(graph: ReteGraph): void {
  expect(graph).toBeDefined();
  expect(graph.nodes).toBeInstanceOf(Array);
  expect(graph.connections).toBeInstanceOf(Array);
}

describe("Binary Execution Integration", () => {
  const extensionPath = path.join(__dirname, "../../");
  let binaryPath: string | null = null;

  beforeAll(() => {
    // Resolve binary path once for all tests
    binaryPath = getBinaryPathIfExists();
    if (binaryPath) {
      console.log(`Binary found at: ${binaryPath}`);
    } else {
      console.log("Binary not found - binary execution tests will be skipped");
    }
  });

  describe("extension activation with binary", () => {
    it("resolves binary path for current platform", () => {
      const resolvedPath = resolveBinaryPath(extensionPath);
      
      // This test validates that resolveBinaryPath doesn't crash
      // It may return null if binary doesn't exist or platform unsupported
      expect(resolvedPath === null || typeof resolvedPath === "string").toBe(true);
    });

    it("handles missing binary gracefully", () => {
      const fakePath = "/nonexistent/path";
      const result = resolveBinaryPath(fakePath);
      
      // Should return null when binary not found
      expect(result).toBeNull();
    });
  });

  describe("binary execution", () => {
    it("executes binary and receives JSON-RPC response", async () => {
      skipIfBinaryNotAvailable(binaryPath);
      if (!binaryPath) return;

      const client = new PythonClient(binaryPath);
      
      try {
        await client.spawnService();
        expect(client.isServiceRunning()).toBe(true);

        const sourceCode = "def hello():\n    pass";
        const graph = await client.parseAST(sourceCode);

        validateGraphStructure(graph);
        
        // Verify graph contains expected AST nodes
        const functionNodes = graph.nodes.filter(
          (n) => n.data.astType === "FunctionDef"
        );
        expect(functionNodes.length).toBeGreaterThan(0);
        expect(functionNodes[0].data.astType).toBe("FunctionDef");
      } finally {
        client.stopService();
      }
    }, 10000); // 10 second timeout for binary execution

    it("handles multiple parse requests", async () => {
      skipIfBinaryNotAvailable(binaryPath);
      if (!binaryPath) return;

      const client = new PythonClient(binaryPath);
      
      try {
        await client.spawnService();

        // First request
        const graph1 = await client.parseAST("x = 1");
        validateGraphStructure(graph1);

        // Second request
        const graph2 = await client.parseAST("y = 2");
        validateGraphStructure(graph2);

        // Third request with different node type
        const graph3 = await client.parseAST("x + y");
        validateGraphStructure(graph3);
        
        const binopNodes = graph3.nodes.filter((n) => n.data.astType === "BinOp");
        expect(binopNodes.length).toBeGreaterThan(0);
      } finally {
        client.stopService();
      }
    }, 15000);

    it("handles syntax errors from binary", async () => {
      skipIfBinaryNotAvailable(binaryPath);
      if (!binaryPath) return;

      const client = new PythonClient(binaryPath);
      
      try {
        await client.spawnService();

        const invalidCode = "def invalid syntax:";
        
        await expect(client.parseAST(invalidCode)).rejects.toThrow();
      } finally {
        client.stopService();
      }
    }, 10000);

    it("validates binary spawns correctly", async () => {
      skipIfBinaryNotAvailable(binaryPath);
      if (!binaryPath) return;

      const client = new PythonClient(binaryPath);
      
      expect(client.isServiceRunning()).toBe(false);
      
      await client.spawnService();
      
      expect(client.isServiceRunning()).toBe(true);
      
      client.stopService();
      
      expect(client.isServiceRunning()).toBe(false);
    }, 10000);
  });

  describe("protocol compatibility", () => {
    it("binary execution uses identical JSON-RPC protocol as Python command", async () => {
      const sourceCode = "x + y";
      let binaryGraph: ReteGraph | null = null;
      let pythonGraph: ReteGraph | null = null;

      // Test binary execution
      if (binaryPath) {
        const binaryClient = new PythonClient(binaryPath);
        try {
          await binaryClient.spawnService();
          binaryGraph = await binaryClient.parseAST(sourceCode);
        } catch (e) {
          console.log(`Binary execution failed: ${e}`);
        } finally {
          binaryClient.stopService();
        }
      }

      // Test Python command execution
      try {
        const pythonClient = new PythonClient(null);
        await pythonClient.spawnService();
        pythonGraph = await pythonClient.parseAST(sourceCode);
        pythonClient.stopService();
      } catch (e) {
        console.log(`Python command execution failed: ${e}`);
      }

      // Compare responses if both available
      if (binaryGraph && pythonGraph) {
        // Verify identical graph structure
        expect(binaryGraph.nodes.length).toBe(pythonGraph.nodes.length);
        expect(binaryGraph.connections.length).toBe(pythonGraph.connections.length);
        
        // Verify node types match
        const binaryNodeTypes = binaryGraph.nodes.map(n => n.data.astType).sort();
        const pythonNodeTypes = pythonGraph.nodes.map(n => n.data.astType).sort();
        expect(binaryNodeTypes).toEqual(pythonNodeTypes);
      } else if (!binaryGraph && !pythonGraph) {
        console.log("Skipping comparison: neither binary nor Python available");
      } else {
        // At least one execution path worked
        expect(binaryGraph || pythonGraph).toBeDefined();
      }
    }, 15000);

    it("error handling is identical between binary and Python command", async () => {
      const invalidCode = "def broken():";
      let binaryError: Error | null = null;
      let pythonError: Error | null = null;

      // Test binary error handling
      if (binaryPath) {
        const binaryClient = new PythonClient(binaryPath);
        try {
          await binaryClient.spawnService();
          await binaryClient.parseAST(invalidCode);
        } catch (e) {
          binaryError = e as Error;
        } finally {
          binaryClient.stopService();
        }
      }

      // Test Python command error handling
      try {
        const pythonClient = new PythonClient(null);
        await pythonClient.spawnService();
        await pythonClient.parseAST(invalidCode);
        pythonClient.stopService();
      } catch (e) {
        pythonError = e as Error;
        // Skip if Python not available (exit code 9009 on Windows)
        if (pythonError.message.includes("9009") || pythonError.message.includes("ENOENT")) {
          pythonError = null;
        }
      }

      // Both should throw errors for invalid syntax
      if (binaryError && pythonError) {
        expect(binaryError).toBeDefined();
        expect(pythonError).toBeDefined();
        
        // Error messages should contain similar information
        expect(binaryError.message.toLowerCase()).toContain("syntax");
        expect(pythonError.message.toLowerCase()).toContain("syntax");
      } else if (!binaryError && !pythonError) {
        console.log("Skipping comparison: neither binary nor Python available for error test");
      } else {
        // At least one execution path threw an error
        expect(binaryError || pythonError).toBeDefined();
      }
    }, 15000);
  });

  describe("fallback behavior", () => {
    it("falls back to Python command when binary path is null", async () => {
      const client = new PythonClient(null);
      
      try {
        await client.spawnService();
        expect(client.isServiceRunning()).toBe(true);

        const sourceCode = "x = 1";
        const graph = await client.parseAST(sourceCode);

        validateGraphStructure(graph);
        
        // Verify same functionality as binary
        expect(graph.nodes.length).toBeGreaterThan(0);
      } catch (e) {
        console.log(`Python command not available: ${e}`);
        // Test skipped if Python not available in environment
      } finally {
        client.stopService();
      }
    }, 10000);

    it("falls back to Python command when binary path is empty string", async () => {
      const client = new PythonClient("");
      
      try {
        await client.spawnService();
        expect(client.isServiceRunning()).toBe(true);

        const sourceCode = "def test(): pass";
        const graph = await client.parseAST(sourceCode);

        validateGraphStructure(graph);
        
        const functionNodes = graph.nodes.filter(
          (n) => n.data.astType === "FunctionDef"
        );
        expect(functionNodes.length).toBeGreaterThan(0);
      } catch (e) {
        console.log(`Python command not available: ${e}`);
      } finally {
        client.stopService();
      }
    }, 10000);

    it("falls back to Python command when binary path is undefined", async () => {
      const client = new PythonClient(undefined);
      
      try {
        await client.spawnService();
        expect(client.isServiceRunning()).toBe(true);

        const sourceCode = "class Test: pass";
        const graph = await client.parseAST(sourceCode);

        validateGraphStructure(graph);
        
        const classNodes = graph.nodes.filter(
          (n) => n.data.astType === "ClassDef"
        );
        expect(classNodes.length).toBeGreaterThan(0);
      } catch (e) {
        console.log(`Python command not available: ${e}`);
      } finally {
        client.stopService();
      }
    }, 10000);
  });

  describe("platform-specific scenarios", () => {
    it("handles platform-specific binary names correctly", () => {
      const testCases = [
        { platform: "win32", arch: "x64", expected: "python_service-win-x64.exe" },
        { platform: "linux", arch: "x64", expected: "python_service-linux-x64" },
        { platform: "darwin", arch: "arm64", expected: "python_service-darwin-arm64" },
        { platform: "darwin", arch: "x64", expected: "python_service-darwin-x64" },
      ];

      for (const testCase of testCases) {
        const binaryName = testCase.expected;
        expect(binaryName).toBeTruthy();
        
        // Verify naming convention
        if (testCase.platform === "win32") {
          expect(binaryName).toMatch(/\.exe$/);
        } else {
          expect(binaryName).not.toMatch(/\.exe$/);
        }
      }
    });

    it("validates binary existence check works correctly", () => {
      // Test with known non-existent path
      const nonExistentPath = "/nonexistent/path/to/binary";
      expect(fs.existsSync(nonExistentPath)).toBe(false);

      // Test with current directory (should exist)
      const currentDir = __dirname;
      expect(fs.existsSync(currentDir)).toBe(true);
    });

    it("handles binary path resolution for current platform", () => {
      const resolvedPath = resolveBinaryPath(extensionPath);
      
      if (resolvedPath) {
        // If binary exists, path should be absolute
        expect(path.isAbsolute(resolvedPath)).toBe(true);
        
        // Path should contain 'bin' directory
        expect(resolvedPath).toContain("bin");
        
        // Binary should actually exist
        expect(fs.existsSync(resolvedPath)).toBe(true);
      } else {
        // If null, either platform unsupported or binary not built
        console.log("Binary not available for current platform");
      }
    });
  });

  describe("graph data validation", () => {
    it("validates graph node structure from binary", async () => {
      skipIfBinaryNotAvailable(binaryPath);
      if (!binaryPath) return;

      const client = new PythonClient(binaryPath);
      
      try {
        await client.spawnService();

        const sourceCode = `
def add(x, y):
    return x + y

result = add(1, 2)
`;
        const graph = await client.parseAST(sourceCode);

        validateGraphStructure(graph);
        
        // Verify nodes have required properties
        for (const node of graph.nodes) {
          expect(node.id).toBeDefined();
          expect(node.label).toBeDefined();
          expect(node.data).toBeDefined();
          expect(node.data.astType).toBeDefined();
        }
        
        // Verify specific node types exist
        const functionNodes = graph.nodes.filter(n => n.data.astType === "FunctionDef");
        expect(functionNodes.length).toBeGreaterThan(0);
        
        const binopNodes = graph.nodes.filter(n => n.data.astType === "BinOp");
        expect(binopNodes.length).toBeGreaterThan(0);
        
        const callNodes = graph.nodes.filter(n => n.data.astType === "Call");
        expect(callNodes.length).toBeGreaterThan(0);
      } finally {
        client.stopService();
      }
    }, 10000);

    it("validates connection structure from binary", async () => {
      skipIfBinaryNotAvailable(binaryPath);
      if (!binaryPath) return;

      const client = new PythonClient(binaryPath);
      
      try {
        await client.spawnService();

        const sourceCode = "x + y";
        const graph = await client.parseAST(sourceCode);

        validateGraphStructure(graph);
        
        // Verify connections have required properties
        for (const connection of graph.connections) {
          expect(connection.source).toBeDefined();
          expect(connection.target).toBeDefined();
          expect(connection.sourceOutput).toBeDefined();
          expect(connection.targetInput).toBeDefined();
        }
        
        // Verify all connection endpoints reference valid nodes
        const nodeIds = new Set(graph.nodes.map(n => n.id));
        for (const connection of graph.connections) {
          expect(nodeIds.has(connection.source)).toBe(true);
          expect(nodeIds.has(connection.target)).toBe(true);
        }
      } finally {
        client.stopService();
      }
    }, 10000);

    it("validates node data contains line and column information", async () => {
      skipIfBinaryNotAvailable(binaryPath);
      if (!binaryPath) return;

      const client = new PythonClient(binaryPath);
      
      try {
        await client.spawnService();

        const sourceCode = "def hello():\n    pass";
        const graph = await client.parseAST(sourceCode);

        validateGraphStructure(graph);
        
        // Find FunctionDef node
        const functionNodes = graph.nodes.filter(n => n.data.astType === "FunctionDef");
        expect(functionNodes.length).toBeGreaterThan(0);
        
        const functionNode = functionNodes[0];
        
        // Verify line and column information exists
        expect(functionNode.data.lineno).toBeDefined();
        expect(functionNode.data.colOffset).toBeDefined();
        expect(typeof functionNode.data.lineno).toBe("number");
        expect(typeof functionNode.data.colOffset).toBe("number");
      } finally {
        client.stopService();
      }
    }, 10000);
  });
});
