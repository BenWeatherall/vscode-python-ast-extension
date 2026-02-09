/**
 * Binary resolver module for platform detection and binary path resolution.
 *
 * This module provides functions to:
 * - Map Node.js platform/architecture to binary filenames
 * - Resolve absolute paths to Python service binaries from extension context
 * - Validate binary file existence
 *
 * @module binaryResolver
 */

import * as fs from "fs";
import * as path from "path";

/**
 * Supported Node.js platforms for binary resolution.
 */
export type Platform = "win32" | "linux" | "darwin";

/**
 * Supported CPU architectures for binary resolution.
 */
export type Architecture = "x64" | "arm64";

/**
 * Supported binary filenames.
 */
export type BinaryName =
  | "python_service-win-x64.exe"
  | "python_service-linux-x64"
  | "python_service-darwin-arm64"
  | "python_service-darwin-x64";

/**
 * Maps Node.js platform and architecture to binary filename.
 *
 * Platform mapping:
 * - `win32` + `x64` → `"python_service-win-x64.exe"`
 * - `linux` + `x64` → `"python_service-linux-x64"`
 * - `darwin` + `arm64` → `"python_service-darwin-arm64"`
 * - `darwin` + `x64` → `"python_service-darwin-x64"`
 * - Other combinations → `null`
 *
 * @returns Binary filename (e.g., "python_service-win-x64.exe") or null if platform/architecture unsupported
 */
export function getPlatformBinaryName(): string | null {
  const platform = process.platform;
  const arch = process.arch;

  const platformMap: Record<string, Record<string, string>> = {
    win32: {
      x64: "python_service-win-x64.exe",
    },
    linux: {
      x64: "python_service-linux-x64",
    },
    darwin: {
      arm64: "python_service-darwin-arm64",
      x64: "python_service-darwin-x64",
    },
  };

  return platformMap[platform]?.[arch] || null;
}

/**
 * Resolves absolute path to Python service binary from extension installation directory.
 *
 * This function:
 * 1. Calls `getPlatformBinaryName()` to determine filename for current platform
 * 2. Constructs path: `path.join(extensionPath, "bin", binaryName)`
 * 3. Validates file existence using `fs.existsSync()`
 *
 * @param extensionPath - Extension installation directory (from ExtensionContext.extensionPath)
 * @returns Absolute binary path or null if binary not found or platform unsupported
 */
export function resolveBinaryPath(extensionPath: string): string | null {
  const binaryName = getPlatformBinaryName();
  if (!binaryName) {
    return null;
  }

  const binaryPath = path.join(extensionPath, "bin", binaryName);

  if (!fs.existsSync(binaryPath)) {
    return null;
  }

  return binaryPath;
}

/**
 * Validates that binary file exists and is accessible.
 *
 * This function checks file existence using `fs.existsSync()`. It does not check
 * executable permissions (handled by spawn during execution).
 *
 * @param binaryPath - Absolute path to binary file
 * @returns True if binary exists and is accessible, false otherwise
 */
export function validateBinary(binaryPath: string): boolean {
  return fs.existsSync(binaryPath);
}
