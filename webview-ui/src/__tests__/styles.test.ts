/**
 * @jest-environment node
 */
/** Tests for styling and theme integration. */
import * as fs from "fs";
import * as path from "path";

const webviewRoot = path.resolve(__dirname, "../..");
const srcRoot = path.join(webviewRoot, "src");

function readFile(relPath: string): string {
  return fs.readFileSync(path.join(webviewRoot, relPath), "utf-8");
}

describe("test_css_variable_usage", () => {
  it("index.css uses VS Code CSS variables", () => {
    const content = readFile("src/index.css");
    expect(content).toMatch(/var\(--vscode-/);
  });

  it("NodeStyles.css uses VS Code CSS variables", () => {
    const content = readFile("src/components/NodeStyles.css");
    expect(content).toMatch(/var\(--vscode-/);
  });

  it("index.css defines variable fallbacks", () => {
    const content = readFile("src/index.css");
    expect(content).toMatch(/--vscode-[^:]+:\s*[^;]+;/);
  });
});

describe("test_theme_color_application", () => {
  it("index.css references theme colors", () => {
    const content = readFile("src/index.css");
    expect(content).toMatch(/editorBackground|editorForeground|--vscode-/);
  });

  it("NodeStyles.css uses theme colors for nodes", () => {
    const content = readFile("src/components/NodeStyles.css");
    expect(content).toMatch(/--vscode-/);
  });
});

describe("test_responsive_layout", () => {
  it("index.css or NodeStyles provides full viewport coverage", () => {
    const index = readFile("src/index.css");
    const nodeStyles = readFile("src/components/NodeStyles.css");
    const combined = index + nodeStyles;
    expect(combined).toMatch(/100%|100vh|flex|grid/);
  });
});

describe("test_tailwind_configuration", () => {
  it("tailwind.config.js exists and has content paths", () => {
    const content = readFile("tailwind.config.js");
    expect(content).toMatch(/content/i);
    expect(content).toMatch(/tsx|ts|jsx|js|index\.html/);
  });

  it("tailwind.config.js extends theme", () => {
    const content = readFile("tailwind.config.js");
    expect(content).toMatch(/theme|extend|colors/);
  });
});
