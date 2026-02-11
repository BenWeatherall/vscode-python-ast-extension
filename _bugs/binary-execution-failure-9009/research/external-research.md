# External Research Findings

## Research Sources

This document summarizes findings from web searches about VS Code extension packaging best practices, npm lifecycle hooks, and CI/CD strategies for preventing stale build artifacts.

---

## NPM Lifecycle Hooks for VS Code Extensions

### vscode:prepublish Hook

**Source**: [vscode-extension-tester Issue #441](https://github.com/redhat-developer/vscode-extension-tester/issues/441)

**Key Finding**: The `vscode:prepublish` script is the standard npm lifecycle hook for VS Code extensions. VSCE automatically executes this script before packaging or publishing.

**Example from Research**:
```json
{
  "scripts": {
    "vscode:prepublish": "npm run esbuild -- --minify"
  }
}
```

**Usage**: When you run `vsce package` or `vsce publish`, VSCE will automatically run the `vscode:prepublish` script first. This is the recommended mechanism for ensuring builds are fresh before packaging.

**Official Behavior**: Unlike `prepack` (which runs before `npm pack`), `vscode:prepublish` is specific to VS Code extension tooling and is recognized by VSCE.

---

## VS Code Extension Bundling Best Practices

### Source: [Why you should always bundle a VS Code extension with esbuild](https://roboleary.net/2024/02/16/vscode-ext-esbuild)

**Key Recommendations**:

1. **Always Bundle Before Packaging**: Extensions should be bundled (not just compiled) to optimize size and performance.

2. **Use esbuild for Speed**: esbuild is 10-100x faster than webpack and requires minimal configuration.

3. **Configure vscode:prepublish for Production Builds**:
   ```json
   {
     "scripts": {
       "esbuild-base": "esbuild ./src/extension.ts --bundle --outfile=dist/extension.js --external:vscode --format=cjs --platform=node",
       "dev": "npm run esbuild-base -- --sourcemap --watch",
       "vscode:prepublish": "npm run esbuild-base -- --minify"
     }
   }
   ```

4. **Benefits**:
   - Single bundled file (faster loading)
   - Minified production builds (smaller VSIX size)
   - No need for `typescript` as runtime dependency
   - Automatic execution before packaging

**Application to Our Project**: We currently use `tsc` for compilation and `esbuild` for webview bundling. We could apply this pattern by adding `vscode:prepublish` to ensure compilation before packaging.

---

## PNPM and VSCE Compatibility

### Source: [Packaging a VS Code Extension Using pnpm and VSCE](https://opensciencelabs.org/blog/packaging-a-vs-code-extension-using-pnpm-and-vsce/)

**Issue**: VSCE uses `npm list --production --parseable --depth=99999` to resolve dependencies, which fails under pnpm's symlink-based dependency management.

**Solution**: Use the `--no-dependencies` flag when packaging:

```bash
vsce package --no-dependencies
```

**Recommendation**: When using bundlers (esbuild, webpack), bundle all dependencies into the extension code and use `--no-dependencies` to skip dependency resolution.

**Application to Our Project**: We use pnpm. If we encounter packaging errors related to dependencies, we should:
1. Ensure webview and extension are properly bundled
2. Add `--no-dependencies` flag to `vscode:package` script

**Current Status**: Our project already bundles the webview with esbuild. Extension code uses TypeScript compilation without bundling dependencies.

---

## Official VSCE Documentation

### Source: [@vscode/vsce npm package](https://www.npmjs.com/package/@vscode/vsce)

**Version Requirements**:
- Current VSCE requires Node.js 20.x.x or higher
- Our project uses Node 18.16.0 (per pnpm undici override in package.json)

**Configuration Options**: VSCE can be configured in package.json:

```json
{
  "vsce": {
    "dependencies": true,
    "yarn": false
  }
}
```

**Flags**:
- `--no-dependencies`: Skip dependency packaging (useful with bundlers)
- `--yarn`: Use Yarn instead of npm for dependency resolution

**Application**: We should verify our Node.js version compatibility and consider adding `--no-dependencies` if we encounter pnpm issues.

---

## Source: [VS Code Publishing Extensions Official Docs](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

**Official Guidance**:

1. **Pre-Publishing Steps**:
   - Compile/bundle your extension
   - Test the packaged VSIX locally
   - Use `vscode:prepublish` script for automated builds

2. **Package Before Publish**: Always test with `vsce package` before publishing to marketplace:
   ```bash
   vsce package    # Creates .vsix file
   # Test the .vsix locally
   vsce publish    # Publishes to marketplace
   ```

3. **Security Updates (2026)**:
   - Personal Access Tokens (PATs) now require 2FA
   - Granular tokens limited to 90 days maximum
   - Important for CI/CD pipelines

**Application**: We should follow the official workflow and use `vscode:prepublish` for automated builds.

---

## CI/CD Strategies for Clean Builds

### Source: [CI/CD pipeline for a Visual Studio extension (VSIX) using Azure DevOps](https://www.meziantou.net/ci-cd-pipeline-for-a-visual-studio-extension-vsix-using-azure-devops.htm)

**Best Practices for Preventing Stale Artifacts**:

1. **Fresh Restore and Build**:
   - Always restore dependencies fresh in CI (don't rely on cached builds)
   - Build entire solution from source
   - Never use incremental builds in CI

2. **Clean Workspace**:
   - Clear workspace between pipeline runs
   - Use dedicated staging directories for artifacts
   - Don't rely on shared output folders

3. **Artifact Staging**:
   - Copy only necessary files to staging directory
   - Don't include debug symbols, source maps, or dev artifacts
   - Version artifacts with build numbers

4. **Version Management**:
   - Update version numbers dynamically during build
   - Use build counters (e.g., `0.1.{BUILD_NUMBER}`)
   - Ensures unique identifiers for each build

**Application to Our Project**:
- Use `vscode:prepublish` to ensure fresh builds locally
- In CI/CD, always run build before package
- Consider automated version incrementing
- Clean `out/` directory before building

---

## Retention Policies and Artifact Management

### Source: [Azure DevOps Artifact Best Practices](https://learn.microsoft.com/en-us/azure/devops/artifacts/concepts/best-practices?view=azure-devops)

**Recommendations**:

1. **Retention Policies**: Set policies to automatically clean old artifacts and prevent disk accumulation
2. **Isolation**: Each build should be isolated (no shared state between builds)
3. **Verification**: Validate artifact contents before publishing

**Application**: Once we implement CI/CD, configure retention policies and ensure builds are isolated.

---

## Industry-Standard Approaches

### Pattern: Pre-Publishing Automation

**Finding**: The industry-standard approach for VS Code extensions is:

1. **Use `vscode:prepublish` lifecycle hook**
2. **Bundle/compile in prepublish script**
3. **Test packaged VSIX before publishing**
4. **Use `--no-dependencies` with bundlers**

### Example from Real Extensions

Many VS Code extensions follow this pattern:

```json
{
  "scripts": {
    "compile": "tsc -p .",
    "watch": "tsc -watch -p .",
    "package": "vsce package",
    "vscode:prepublish": "npm run compile"
  }
}
```

### Advanced Pattern with esbuild

For optimized extensions:

```json
{
  "scripts": {
    "compile": "tsc -p .",
    "bundle": "esbuild ./src/extension.ts --bundle --outfile=out/extension.js --external:vscode --format=cjs --platform=node",
    "package": "vsce package --no-dependencies",
    "vscode:prepublish": "npm run bundle -- --minify"
  }
}
```

---

## Key Takeaways

1. **`vscode:prepublish` is the standard solution**: VSCE automatically runs this script before packaging
2. **Bundling is recommended**: Use esbuild or webpack for production builds
3. **PNPM compatibility**: Use `--no-dependencies` when bundling
4. **CI/CD best practices**: Always build fresh, clean workspace, version artifacts
5. **Official guidance**: VS Code documentation recommends `vscode:prepublish` for automated builds

---

## Sources Summary

| Source | URL | Key Insight |
|--------|-----|-------------|
| VS Code Extension Samples | GitHub | vscode:prepublish pattern |
| Rob O'Leary Blog | roboleary.net | esbuild bundling best practices |
| Open Science Labs | opensciencelabs.org | pnpm + vsce compatibility |
| @vscode/vsce npm | npmjs.com | Official VSCE documentation |
| VS Code API Docs | code.visualstudio.com | Publishing guidelines |
| Meziantou's Blog | meziantou.net | CI/CD VSIX pipeline practices |
| Microsoft Learn | learn.microsoft.com | Azure DevOps artifact management |

---

## Cross-References

- Investigation: `_bugs/binary-execution-failure-9009/investigation/root-cause-hypothesis.md`
- Internal Documentation: `_bugs/binary-execution-failure-9009/research/internal-documentation.md`
- Applicable Solutions: `_bugs/binary-execution-failure-9009/research/applicable-solutions.md`
