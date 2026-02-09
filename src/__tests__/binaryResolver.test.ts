/** Tests for binaryResolver - platform detection, binary path resolution, and validation. */

import * as fs from "fs";
import * as path from "path";
import {
  getPlatformBinaryName,
  resolveBinaryPath,
  validateBinary,
} from "../binaryResolver";

jest.mock("fs");

describe("binaryResolver", () => {
  const originalPlatform = process.platform;
  const originalArch = process.arch;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset process properties to original values
    Object.defineProperty(process, "platform", {
      value: originalPlatform,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(process, "arch", {
      value: originalArch,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore original process properties
    Object.defineProperty(process, "platform", {
      value: originalPlatform,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(process, "arch", {
      value: originalArch,
      writable: true,
      configurable: true,
    });
  });

  describe("getPlatformBinaryName", () => {
    it("returns correct filename for Windows x64", () => {
      Object.defineProperty(process, "platform", {
        value: "win32",
        writable: true,
        configurable: true,
      });
      Object.defineProperty(process, "arch", {
        value: "x64",
        writable: true,
        configurable: true,
      });

      expect(getPlatformBinaryName()).toBe("python_service-win-x64.exe");
    });

    it("returns correct filename for Linux x64", () => {
      Object.defineProperty(process, "platform", {
        value: "linux",
        writable: true,
        configurable: true,
      });
      Object.defineProperty(process, "arch", {
        value: "x64",
        writable: true,
        configurable: true,
      });

      expect(getPlatformBinaryName()).toBe("python_service-linux-x64");
    });

    it("returns correct filename for macOS ARM64", () => {
      Object.defineProperty(process, "platform", {
        value: "darwin",
        writable: true,
        configurable: true,
      });
      Object.defineProperty(process, "arch", {
        value: "arm64",
        writable: true,
        configurable: true,
      });

      expect(getPlatformBinaryName()).toBe("python_service-darwin-arm64");
    });

    it("returns correct filename for macOS x64", () => {
      Object.defineProperty(process, "platform", {
        value: "darwin",
        writable: true,
        configurable: true,
      });
      Object.defineProperty(process, "arch", {
        value: "x64",
        writable: true,
        configurable: true,
      });

      expect(getPlatformBinaryName()).toBe("python_service-darwin-x64");
    });

    it("returns null for unsupported platform", () => {
      Object.defineProperty(process, "platform", {
        value: "unsupported",
        writable: true,
        configurable: true,
      });
      Object.defineProperty(process, "arch", {
        value: "x64",
        writable: true,
        configurable: true,
      });

      expect(getPlatformBinaryName()).toBeNull();
    });

    it("returns null for unsupported architecture", () => {
      Object.defineProperty(process, "platform", {
        value: "win32",
        writable: true,
        configurable: true,
      });
      Object.defineProperty(process, "arch", {
        value: "arm32",
        writable: true,
        configurable: true,
      });

      expect(getPlatformBinaryName()).toBeNull();
    });
  });

  describe("resolveBinaryPath", () => {
    it("constructs correct path when binary exists", () => {
      Object.defineProperty(process, "platform", {
        value: "win32",
        writable: true,
        configurable: true,
      });
      Object.defineProperty(process, "arch", {
        value: "x64",
        writable: true,
        configurable: true,
      });

      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const extensionPath = "/path/to/extension";
      const result = resolveBinaryPath(extensionPath);

      const expectedPath = path.join(extensionPath, "bin", "python_service-win-x64.exe");
      expect(result).toBe(expectedPath);
      expect(fs.existsSync).toHaveBeenCalledWith(expectedPath);
    });

    it("returns null for unsupported platform", () => {
      Object.defineProperty(process, "platform", {
        value: "unsupported",
        writable: true,
        configurable: true,
      });
      Object.defineProperty(process, "arch", {
        value: "x64",
        writable: true,
        configurable: true,
      });

      const extensionPath = "/path/to/extension";
      const result = resolveBinaryPath(extensionPath);

      expect(result).toBeNull();
      expect(fs.existsSync).not.toHaveBeenCalled();
    });

    it("returns null when binary not found", () => {
      Object.defineProperty(process, "platform", {
        value: "win32",
        writable: true,
        configurable: true,
      });
      Object.defineProperty(process, "arch", {
        value: "x64",
        writable: true,
        configurable: true,
      });

      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const extensionPath = "/path/to/extension";
      const result = resolveBinaryPath(extensionPath);

      const expectedPath = path.join(extensionPath, "bin", "python_service-win-x64.exe");
      expect(result).toBeNull();
      expect(fs.existsSync).toHaveBeenCalledWith(expectedPath);
    });

    it("constructs correct path for Linux x64", () => {
      Object.defineProperty(process, "platform", {
        value: "linux",
        writable: true,
        configurable: true,
      });
      Object.defineProperty(process, "arch", {
        value: "x64",
        writable: true,
        configurable: true,
      });

      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const extensionPath = "/usr/local/ext";
      const result = resolveBinaryPath(extensionPath);

      const expectedPath = path.join(extensionPath, "bin", "python_service-linux-x64");
      expect(result).toBe(expectedPath);
      expect(fs.existsSync).toHaveBeenCalledWith(expectedPath);
    });

    it("handles Windows-style paths correctly", () => {
      Object.defineProperty(process, "platform", {
        value: "win32",
        writable: true,
        configurable: true,
      });
      Object.defineProperty(process, "arch", {
        value: "x64",
        writable: true,
        configurable: true,
      });

      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const extensionPath = "C:\\Users\\Extension";
      const result = resolveBinaryPath(extensionPath);

      const expectedPath = path.join(extensionPath, "bin", "python_service-win-x64.exe");
      expect(result).toBe(expectedPath);
      expect(fs.existsSync).toHaveBeenCalledWith(expectedPath);
    });

    it("handles Unix-style paths correctly", () => {
      Object.defineProperty(process, "platform", {
        value: "linux",
        writable: true,
        configurable: true,
      });
      Object.defineProperty(process, "arch", {
        value: "x64",
        writable: true,
        configurable: true,
      });

      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const extensionPath = "/home/user/extension";
      const result = resolveBinaryPath(extensionPath);

      const expectedPath = path.join(extensionPath, "bin", "python_service-linux-x64");
      expect(result).toBe(expectedPath);
      expect(fs.existsSync).toHaveBeenCalledWith(expectedPath);
    });
  });

  describe("validateBinary", () => {
    it("returns true when file exists", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const binaryPath = "/path/to/binary.exe";
      const result = validateBinary(binaryPath);

      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith(binaryPath);
    });

    it("returns false when file not found", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const binaryPath = "/path/to/binary.exe";
      const result = validateBinary(binaryPath);

      expect(result).toBe(false);
      expect(fs.existsSync).toHaveBeenCalledWith(binaryPath);
    });

    it("handles Windows path correctly", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const binaryPath = "C:\\bin\\python_service-win-x64.exe";
      const result = validateBinary(binaryPath);

      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith(binaryPath);
    });

    it("handles Unix path correctly", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const binaryPath = "/usr/local/bin/python_service-linux-x64";
      const result = validateBinary(binaryPath);

      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith(binaryPath);
    });

    it("handles macOS path correctly", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const binaryPath = "/Applications/python_service-darwin-arm64";
      const result = validateBinary(binaryPath);

      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith(binaryPath);
    });
  });
});
