/**
 * Build script for Python service binaries using PyInstaller.
 *
 * This script detects the current platform and architecture, then invokes
 * PyInstaller to create a single-file executable for the Python AST service.
 *
 * Usage: node scripts/build-binaries.js
 *
 * Requirements:
 * - PyInstaller installed in Python environment
 * - python_service package importable (for PyInstaller to analyze)
 *
 * Output:
 * - Binary created in bin/ directory with naming convention:
 *   python_service-{platform}-{arch}[.exe]
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { platform, arch } = process;

const platformMap = {
  win32: { name: "win", ext: ".exe" },
  linux: { name: "linux", ext: "" },
  darwin: { name: "darwin", ext: "" },
};

const archMap = {
  x64: "x64",
  arm64: "arm64",
};

/**
 * Detect the current platform and architecture.
 *
 * @returns {{ platform: { name: string, ext: string }, arch: string }}
 *   Resolved platform info and architecture name.
 */
function detectPlatform() {
  const plat = platformMap[platform];
  const archName = archMap[arch];

  if (!plat) {
    console.error(`Unsupported platform: ${platform}`);
    console.error(
      `Supported platforms: ${Object.keys(platformMap).join(", ")}`,
    );
    process.exit(1);
  }

  if (!archName) {
    console.error(`Unsupported architecture: ${arch}`);
    console.error(
      `Supported architectures: ${Object.keys(archMap).join(", ")}`,
    );
    process.exit(1);
  }

  return { platform: plat, arch: archName };
}

/**
 * Build the Python service binary for the current platform.
 *
 * Constructs the binary name, ensures the output directory exists,
 * spawns PyInstaller, and validates the resulting binary.
 */
function buildBinary() {
  const { platform: plat, arch: archName } = detectPlatform();

  const binaryName = `python_service-${plat.name}-${archName}${plat.ext}`;
  const binDir = path.join(process.cwd(), "bin");
  const workDir = path.join(
    process.cwd(),
    ".build",
    `pyinstaller-${plat.name}-${archName}`,
  );

  // Ensure bin directory exists
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
    console.log(`Created directory: ${binDir}`);
  }

  const args = [
    "--onefile",
    "--name",
    binaryName,
    "--distpath",
    binDir,
    "--workpath",
    workDir,
    "--clean",
    "--hidden-import",
    "pydantic",
    "python_service/__main__.py",
  ];

  console.log(`Building binary: ${binaryName}`);
  console.log(
    `Platform: ${platform} (${plat.name}), Architecture: ${arch} (${archName})`,
  );
  console.log(`Output directory: ${binDir}`);

  // Detect PyInstaller executable (prefer virtual environment)
  let pyinstallerCmd = "pyinstaller";
  const venvPyInstaller =
    platform === "win32"
      ? path.join(process.cwd(), ".venv", "Scripts", "pyinstaller.exe")
      : path.join(process.cwd(), ".venv", "bin", "pyinstaller");

  if (fs.existsSync(venvPyInstaller)) {
    pyinstallerCmd = venvPyInstaller;
    console.log(`Using virtual environment PyInstaller: ${pyinstallerCmd}`);
  } else {
    console.log(`Using system PyInstaller: ${pyinstallerCmd}`);
  }

  console.log(`Command: ${pyinstallerCmd} ${args.join(" ")}`);

  const proc = spawn(pyinstallerCmd, args, {
    stdio: "inherit",
    shell: platform === "win32",
    cwd: process.cwd(),
  });

  proc.on("error", (error) => {
    console.error(`Failed to spawn PyInstaller: ${error.message}`);
    console.error("Make sure PyInstaller is installed: pip install pyinstaller");
    process.exit(1);
  });

  proc.on("close", (code) => {
    if (code !== 0) {
      console.error(`PyInstaller failed with exit code ${code}`);
      console.error("Check the output above for details");
      process.exit(code);
    }

    const binaryPath = path.join(binDir, binaryName);
    if (!fs.existsSync(binaryPath)) {
      console.error(`Binary not found at expected path: ${binaryPath}`);
      console.error("PyInstaller may have failed silently");
      process.exit(1);
    }

    const stats = fs.statSync(binaryPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`Binary built successfully: ${binaryPath}`);
    console.log(`  Size: ${sizeMB} MB`);
  });
}

// Main execution
if (require.main === module) {
  buildBinary();
}
