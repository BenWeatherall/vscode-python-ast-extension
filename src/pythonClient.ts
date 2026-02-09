/** TypeScript client for communicating with the Python AST parse service via stdio. */

import { spawn, type ChildProcess } from "child_process";
import type { ReteGraph } from "./types";
import { pythonGraphToTs } from "./conversion";
import type { PythonReteGraph } from "./conversion";

/** JSON-RPC-like request format. */
interface ParseRequest {
  method: string;
  params: { sourceCode: string };
}

/** JSON-RPC-like response format. */
interface ParseResponse {
  result?: PythonReteGraph;
  error?: { code: number; message: string };
}

/** Client for spawning and communicating with the Python AST parse service. */
export class PythonClient {
  private process: ChildProcess | null = null;

  /**
   * Spawns the Python service process using stdio for communication.
   * @throws Error if spawn fails or process exits immediately
   */
  async spawnService(): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn("python", ["-m", "python_service"], {
        stdio: ["pipe", "pipe", "pipe"],
      });

      this.process = proc;

      proc.on("spawn", () => resolve());
      proc.on("error", (err) => {
        this.process = null;
        reject(new Error(`Failed to spawn Python service: ${err.message}`));
      });
      proc.on("exit", (code) => {
        this.process = null;
        if (code !== null && code !== 0) {
          reject(new Error(`Python service exited with code ${code}`));
        }
      });
    });
  }

  /**
   * Sends a parse request to the Python service and returns the graph.
   * @param sourceCode - Python source code to parse
   * @returns Promise resolving to ReteGraph
   * @throws Error if service unavailable, parse error, or communication error
   */
  async parseAST(sourceCode: string): Promise<ReteGraph> {
    const proc = this.process;
    const stdin = proc?.stdin;
    const stdout = proc?.stdout;
    if (!proc || !stdin || !stdout) {
      throw new Error("Python service is not running");
    }

    return new Promise((resolve, reject) => {
      const request: ParseRequest = {
        method: "parse",
        params: { sourceCode },
      };
      const requestLine = JSON.stringify(request) + "\n";

      let buffer = "";
      let settled = false;

      const cleanup = () => {
        if (settled) return;
        settled = true;
        stdout.off("data", onData);
        proc.off("exit", onExit);
      };

      const onData = (chunk: Buffer | string) => {
        buffer += chunk.toString();
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const response = JSON.parse(line) as ParseResponse;
            if (response.error) {
              cleanup();
              reject(new Error(response.error.message || "Parse error"));
            } else if (response.result) {
              cleanup();
              resolve(pythonGraphToTs(response.result));
            }
          } catch (e) {
            cleanup();
            reject(new Error(`Invalid response from service: ${(e as Error).message}`));
          }
        }
      };

      const onExit = (code: number | null) => {
        if (settled) return;
        cleanup();
        this.process = null;
        reject(new Error(`Service unavailable: process exited with code ${code}`));
      };

      stdout.on("data", onData);
      proc.once("exit", onExit);

      stdin.write(requestLine, (err) => {
        if (err) {
          cleanup();
          reject(new Error(`Failed to send request: ${err.message}`));
        }
      });
    });
  }

  /**
   * Stops the Python service process and cleans up resources.
   */
  stopService(): void {
    if (this.process) {
      this.process.kill();
      this.process.removeAllListeners();
      this.process.stdin?.destroy();
      this.process.stdout?.destroy();
      this.process.stderr?.destroy();
      this.process = null;
    }
  }

  /**
   * Returns true if the Python service process is running.
   */
  isServiceRunning(): boolean {
    return this.process !== null && !this.process.killed;
  }
}
