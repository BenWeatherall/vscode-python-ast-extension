/** Tests for PythonClient - spawns Python service, communicates via stdio. */

import { spawn } from "child_process";
import { PythonClient } from "../pythonClient";

jest.mock("child_process", () => ({
  spawn: jest.fn(),
}));

const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

/** Mock process shape for PythonClient tests. */
interface MockProcess {
  stdin: { write: jest.Mock; destroy: jest.Mock };
  stdout: { on: jest.Mock; off: jest.Mock; destroy: jest.Mock };
  stderr: { on: jest.Mock; destroy: jest.Mock };
  on: jest.Mock;
  once: jest.Mock;
  off: jest.Mock;
  removeAllListeners: jest.Mock;
  kill: jest.Mock;
  killed: boolean;
  sendResponse: (response: object) => void;
  triggerExit: (code: number) => void;
}

/** Captures stdout data callback and allows manual triggering of responses. */
function createMockProcess(): MockProcess {
  const stdin = { write: jest.fn(), destroy: jest.fn() };
  let dataCallback: ((chunk: Buffer | string) => void) | null = null;
  const exitCallbacks: Array<(code: number | null) => void> = [];

  const stdout: { on: jest.Mock; off: jest.Mock; destroy: jest.Mock } = {
    on: jest.fn((ev: string, cb: (chunk: Buffer | string) => void) => {
      if (ev === "data") dataCallback = cb;
      return stdout;
    }),
    off: jest.fn(),
    destroy: jest.fn(),
  };

  const proc: MockProcess = {
    stdin,
    stdout,
    stderr: { on: jest.fn(), destroy: jest.fn() },
    on: jest.fn((ev: string, cb: (code?: number | null) => void) => {
      if (ev === "spawn") setTimeout(cb as () => void, 0);
      if (ev === "exit") exitCallbacks.push(cb);
      return proc;
    }),
    once: jest.fn((ev: string, cb: (code?: number | null) => void) => {
      if (ev === "exit") exitCallbacks.push(cb);
      return proc;
    }),
    off: jest.fn(),
    removeAllListeners: jest.fn(),
    kill: jest.fn(),
    killed: false,
    sendResponse: (response: object) => {
      if (dataCallback) dataCallback(Buffer.from(JSON.stringify(response) + "\n"));
    },
    triggerExit: (code: number) => {
      exitCallbacks.forEach((cb) => cb(code));
    },
  };
  return proc;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("PythonClient", () => {
  describe("test_service_spawning", () => {
    it("spawns process with correct command and stdio", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc as never);

      const client = new PythonClient();
      await client.spawnService();

      expect(mockSpawn).toHaveBeenCalledWith(
        "python",
        ["-m", "python_service"],
        expect.objectContaining({
          stdio: ["pipe", "pipe", "pipe"],
        })
      );
    });
  });

  describe("test_sending_parse_request", () => {
    it("formats and sends parse request correctly", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc as never);

      const client = new PythonClient();
      await client.spawnService();

      const parsePromise = client.parseAST("x = 1");
      mockProc.sendResponse({ result: { nodes: [], connections: [] } });

      await parsePromise;

      const writeCalls = mockProc.stdin.write.mock.calls;
      expect(writeCalls.length).toBeGreaterThan(0);
      expect(writeCalls[0][0]).toContain('"method":"parse"');
      expect(writeCalls[0][0]).toContain('"sourceCode":"x = 1"');
    });
  });

  describe("test_receiving_parse_response", () => {
    it("parses response and returns graph with camelCase", async () => {
      const pythonGraph = {
        nodes: [
          {
            id: "n1",
            label: "BinOp",
            inputs: {},
            outputs: { result: {} },
            data: { ast_type: "BinOp", lineno: 1 },
          },
        ],
        connections: [
          { source: "n1", source_output: "r", target: "n2", target_input: "i" },
        ],
      };

      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc as never);

      const client = new PythonClient();
      await client.spawnService();

      const parsePromise = client.parseAST("1 + 2");
      mockProc.sendResponse({ result: pythonGraph });

      const graph = await parsePromise;
      expect(graph.nodes).toHaveLength(1);
      expect(graph.nodes[0].id).toBe("n1");
      expect(graph.nodes[0].data.astType).toBe("BinOp");
      expect(graph.connections).toHaveLength(1);
      expect(graph.connections[0].sourceOutput).toBe("r");
    });
  });

  describe("test_error_handling_service_unavailable", () => {
    it("throws when process exits before response", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc as never);

      const client = new PythonClient();
      await client.spawnService();

      const parsePromise = client.parseAST("x = 1");
      mockProc.triggerExit(1);

      await expect(parsePromise).rejects.toThrow(/service|unavailable|exit|error/i);
    });
  });

  describe("test_error_handling_parse_error", () => {
    it("throws with service error message on parse error", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc as never);

      const client = new PythonClient();
      await client.spawnService();

      const parsePromise = client.parseAST("invalid syntax {{{");
      mockProc.sendResponse({
        error: { code: -32700, message: "invalid syntax" },
      });

      await expect(parsePromise).rejects.toThrow(/invalid syntax/);
    });
  });

  describe("test_service_stopping", () => {
    it("terminates process and cleans up on stop", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc as never);

      const client = new PythonClient();
      await client.spawnService();

      client.stopService();

      expect(mockProc.kill).toHaveBeenCalled();
      expect(client.isServiceRunning()).toBe(false);
    });
  });

  describe("test_health_check", () => {
    it("returns false initially, true when running, false after stop", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc as never);

      const client = new PythonClient();
      expect(client.isServiceRunning()).toBe(false);

      await client.spawnService();
      expect(client.isServiceRunning()).toBe(true);

      client.stopService();
      expect(client.isServiceRunning()).toBe(false);
    });
  });

  describe("test_concurrent_requests", () => {
    it("handles multiple parse requests sequentially", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc as never);

      const client = new PythonClient();
      await client.spawnService();

      const p1 = client.parseAST("a");
      mockProc.sendResponse({ result: { nodes: [{ id: "a1", label: "A", inputs: {}, outputs: {}, data: { ast_type: "A" } }], connections: [] } });
      const g1 = await p1;
      expect(g1.nodes[0].id).toBe("a1");

      const p2 = client.parseAST("b");
      mockProc.sendResponse({ result: { nodes: [{ id: "b1", label: "B", inputs: {}, outputs: {}, data: { ast_type: "B" } }], connections: [] } });
      const g2 = await p2;
      expect(g2.nodes[0].id).toBe("b1");
    });
  });

  describe("constructor", () => {
    it("accepts binary path parameter", () => {
      const client = new PythonClient("/path/to/binary.exe");
      expect(client).toBeInstanceOf(PythonClient);
    });

    it("accepts null binary path", () => {
      const client = new PythonClient(null);
      expect(client).toBeInstanceOf(PythonClient);
    });

    it("accepts undefined binary path", () => {
      const client = new PythonClient(undefined);
      expect(client).toBeInstanceOf(PythonClient);
    });

    it("accepts no arguments", () => {
      const client = new PythonClient();
      expect(client).toBeInstanceOf(PythonClient);
    });
  });

  describe("spawnService", () => {
    describe("with binary path", () => {
      it("spawns binary when path provided", async () => {
        const mockProc = createMockProcess();
        mockSpawn.mockReturnValue(mockProc as never);

        const client = new PythonClient("/path/to/binary.exe");
        await client.spawnService();

        expect(mockSpawn).toHaveBeenCalledWith(
          "/path/to/binary.exe",
          [],
          expect.objectContaining({
            stdio: ["pipe", "pipe", "pipe"],
          })
        );
      });
    });

    describe("without binary path", () => {
      it("spawns Python command when path not provided", async () => {
        const mockProc = createMockProcess();
        mockSpawn.mockReturnValue(mockProc as never);

        const client = new PythonClient(null);
        await client.spawnService();

        expect(mockSpawn).toHaveBeenCalledWith(
          "python",
          ["-m", "python_service"],
          expect.objectContaining({
            stdio: ["pipe", "pipe", "pipe"],
          })
        );
      });

      it("spawns Python command when path undefined", async () => {
        const mockProc = createMockProcess();
        mockSpawn.mockReturnValue(mockProc as never);

        const client = new PythonClient(undefined);
        await client.spawnService();

        expect(mockSpawn).toHaveBeenCalledWith(
          "python",
          ["-m", "python_service"],
          expect.objectContaining({
            stdio: ["pipe", "pipe", "pipe"],
          })
        );
      });

      it("spawns Python command when no arguments", async () => {
        const mockProc = createMockProcess();
        mockSpawn.mockReturnValue(mockProc as never);

        const client = new PythonClient();
        await client.spawnService();

        expect(mockSpawn).toHaveBeenCalledWith(
          "python",
          ["-m", "python_service"],
          expect.objectContaining({
            stdio: ["pipe", "pipe", "pipe"],
          })
        );
      });
    });
  });

  describe("protocol compatibility", () => {
    it("maintains JSON-RPC protocol with binary execution", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc as never);

      const client = new PythonClient("/path/to/binary.exe");
      await client.spawnService();

      const pythonGraph = {
        nodes: [
          {
            id: "n1",
            label: "FunctionDef",
            inputs: {},
            outputs: { body: {} },
            data: { ast_type: "FunctionDef", lineno: 1 },
          },
        ],
        connections: [],
      };

      const parsePromise = client.parseAST("def hello(): pass");
      mockProc.sendResponse({ result: pythonGraph });

      const graph = await parsePromise;
      expect(graph.nodes).toHaveLength(1);
      expect(graph.nodes[0].data.astType).toBe("FunctionDef");
      expect(graph.nodes[0].data.lineno).toBe(1);
    });

    it("maintains JSON-RPC protocol with Python command", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc as never);

      const client = new PythonClient(null);
      await client.spawnService();

      const pythonGraph = {
        nodes: [
          {
            id: "n1",
            label: "FunctionDef",
            inputs: {},
            outputs: { body: {} },
            data: { ast_type: "FunctionDef", lineno: 1 },
          },
        ],
        connections: [],
      };

      const parsePromise = client.parseAST("def hello(): pass");
      mockProc.sendResponse({ result: pythonGraph });

      const graph = await parsePromise;
      expect(graph.nodes).toHaveLength(1);
      expect(graph.nodes[0].data.astType).toBe("FunctionDef");
    });
  });

  describe("edge cases", () => {
    it("handles binary execution failure", async () => {
      const mockProc = createMockProcess();
      // Override on() to trigger error event instead of spawn
      mockProc.on.mockImplementation((event: string, callback: (err?: Error) => void) => {
        if (event === "error") {
          setTimeout(() => callback(new Error("ENOENT: no such file or directory")), 0);
        }
        return mockProc;
      });
      mockSpawn.mockReturnValue(mockProc as never);

      const client = new PythonClient("/path/to/nonexistent.exe");

      await expect(client.spawnService()).rejects.toThrow(/Failed to spawn|ENOENT/);
    });

    it("handles binary exit error", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc as never);

      const client = new PythonClient("/path/to/binary.exe");
      await client.spawnService();

      const parsePromise = client.parseAST("x = 1");
      mockProc.triggerExit(1);

      await expect(parsePromise).rejects.toThrow(/service|unavailable|exit|error/i);
    });

    it("handles empty binary path string", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc as never);

      const client = new PythonClient("");
      await client.spawnService();

      // Empty string treated as falsy; should fall back to Python command
      expect(mockSpawn).toHaveBeenCalledWith(
        "python",
        ["-m", "python_service"],
        expect.objectContaining({
          stdio: ["pipe", "pipe", "pipe"],
        })
      );
    });
  });
});
