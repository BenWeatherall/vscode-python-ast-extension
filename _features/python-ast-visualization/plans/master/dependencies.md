# Dependencies and Requirements

## Overview

This document lists all external dependencies, internal dependencies, system requirements, environment setup, and configuration requirements for the Python AST visualization feature.

## External Dependencies

### Python Dependencies (`pyproject.toml`)

#### Core Dependencies

**pydantic** (^2.0.0)
- **Purpose**: Data validation and model definition
- **Usage**: Schema models for Rete graph structure
- **License**: MIT
- **Required**: Yes

**python-jsonrpc-server** (optional, ^0.4.0) OR **stdio-based communication**
- **Purpose**: JSON-RPC communication protocol (if using JSON-RPC)
- **Usage**: Server communication layer
- **License**: MIT
- **Required**: Optional (can use stdio instead)

#### Development Dependencies

**pytest** (^7.0.0)
- **Purpose**: Testing framework
- **Usage**: Running unit tests
- **License**: MIT
- **Required**: Development only

**pytest-cov** (^4.0.0)
- **Purpose**: Test coverage reporting
- **Usage**: Generate coverage reports
- **License**: MIT
- **Required**: Development only

**ruff** (^0.1.0)
- **Purpose**: Python linter and formatter
- **Usage**: Code quality checks
- **License**: MIT
- **Required**: Development only

**mypy** (^1.0.0)
- **Purpose**: Static type checking
- **Usage**: Type validation
- **License**: MIT
- **Required**: Development only

### Node.js Dependencies (`package.json`)

#### Core Dependencies

**@types/vscode** (^1.80.0)
- **Purpose**: VS Code API type definitions
- **Usage**: TypeScript types for VS Code extension
- **License**: MIT
- **Required**: Yes

**typescript** (^5.0.0)
- **Purpose**: TypeScript compiler
- **Usage**: Compile TypeScript to JavaScript
- **License**: Apache-2.0
- **Required**: Yes

#### Webview UI Dependencies

**rete** (^2.0.0)
- **Purpose**: Core Rete.js graph engine
- **Usage**: Graph visualization framework
- **License**: MIT
- **Required**: Yes

**rete-area-plugin** (^2.0.0)
- **Purpose**: Zoom and pan functionality
- **Usage**: Viewport management for graph
- **License**: MIT
- **Required**: Yes

**rete-connection-plugin** (^2.0.0)
- **Purpose**: Connection rendering
- **Usage**: Draw connections between nodes
- **License**: MIT
- **Required**: Yes

**rete-react-render-plugin** (^2.0.0)
- **Purpose**: React integration for Rete.js
- **Usage**: Custom React node components
- **License**: MIT
- **Required**: Yes

**react** (^18.0.0)
- **Purpose**: React library
- **Usage**: UI component framework
- **License**: MIT
- **Required**: Yes

**react-dom** (^18.0.0)
- **Purpose**: React DOM rendering
- **Usage**: Render React components
- **License**: MIT
- **Required**: Yes

#### Development Dependencies

**@types/react** (^18.0.0)
- **Purpose**: React type definitions
- **Usage**: TypeScript types for React
- **License**: MIT
- **Required**: Development only

**@types/react-dom** (^18.0.0)
- **Purpose**: React DOM type definitions
- **Usage**: TypeScript types for React DOM
- **License**: MIT
- **Required**: Development only

**@types/node** (^20.0.0)
- **Purpose**: Node.js type definitions
- **Usage**: TypeScript types for Node.js APIs
- **License**: MIT
- **Required**: Development only

**webpack** (^5.0.0) OR **vite** (^4.0.0) OR **esbuild** (^0.19.0)
- **Purpose**: Bundler for webview code
- **Usage**: Bundle webview code into single JS file
- **License**: MIT (webpack/vite), MIT (esbuild)
- **Required**: Yes (choose one)

**jest** (^29.0.0) OR **mocha** (^10.0.0)
- **Purpose**: Testing framework
- **Usage**: Running TypeScript/React tests
- **License**: MIT
- **Required**: Development only (choose one)

**@testing-library/react** (^14.0.0)
- **Purpose**: React component testing utilities
- **Usage**: Testing React components
- **License**: MIT
- **Required**: Development only

**eslint** (^8.0.0)
- **Purpose**: JavaScript/TypeScript linter
- **Usage**: Code quality checks
- **License**: MIT
- **Required**: Development only

**@typescript-eslint/parser** (^6.0.0)
- **Purpose**: TypeScript ESLint parser
- **Usage**: ESLint TypeScript support
- **License**: MIT
- **Required**: Development only

**@typescript-eslint/eslint-plugin** (^6.0.0)
- **Purpose**: TypeScript ESLint plugin
- **Usage**: TypeScript-specific linting rules
- **License**: MIT
- **Required**: Development only

**tailwindcss** (^3.0.0)
- **Purpose**: Utility-first CSS framework
- **Usage**: Styling webview UI
- **License**: MIT
- **Required**: Yes

**postcss** (^8.0.0)
- **Purpose**: CSS processor
- **Usage**: Process Tailwind CSS
- **License**: MIT
- **Required**: Yes

**autoprefixer** (^10.0.0)
- **Purpose**: CSS vendor prefixing
- **Usage**: Add vendor prefixes to CSS
- **License**: MIT
- **Required**: Yes

## Internal Dependencies

### Component Dependencies

#### Python Service

**python_service/parser.py** depends on:
- `python_service/schema.py` - Data models
- Python standard library `ast` module

**python_service/server.py** depends on:
- `python_service/parser.py` - AST converter
- `python_service/schema.py` - Data models

**python_service/__main__.py** depends on:
- `python_service/server.py` - Server implementation

#### Extension Host

**src/extension.ts** depends on:
- `src/pythonClient.ts` - Python service client
- VS Code API (`vscode` module)

**src/pythonClient.ts** depends on:
- Node.js `child_process` module
- Python service running (external process)

#### Webview UI

**webview-ui/src/App.tsx** depends on:
- `webview-ui/src/editor.ts` - Rete editor wrapper
- `webview-ui/src/types.ts` - Type definitions
- VS Code webview API

**webview-ui/src/editor.ts** depends on:
- Rete.js libraries (`rete`, `rete-area-plugin`, `rete-connection-plugin`)
- `webview-ui/src/types.ts` - Type definitions

**webview-ui/src/nodes/** depends on:
- `webview-ui/src/editor.ts` - Editor instance
- React library
- Rete.js React plugin

## System Requirements

### Python Requirements

- **Python Version**: 3.12 (per project rules)
- **Python Standard Library**: `ast` module (included)
- **Virtual Environment**: `.venv` directory (created by `install.sh`)
- **Package Manager**: `uv` (per project rules)

### Node.js Requirements

- **Node.js Version**: 18.0.0 or higher
- **npm Version**: 9.0.0 or higher (or compatible package manager)
- **VS Code Version**: 1.80.0 or higher (for extension API compatibility)

### Operating System

- **Windows**: Supported (current development environment)
- **macOS**: Supported
- **Linux**: Supported

## Environment Setup

### Python Environment

**Virtual Environment**:
- Location: `.venv/` (project root)
- Created by: `install.sh` script
- Activated by: `install.sh` script (or manually: `source .venv/bin/activate`)

**Installation**:
```bash
# Run install.sh (creates venv, installs dependencies)
./install.sh

# Or manually:
uv venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -e .
```

### Node.js Environment

**Dependencies Installation**:
```bash
npm install
```

**Build**:
```bash
npm run build
```

**Development**:
```bash
npm run watch  # Watch mode for development
```

### VS Code Extension Development

**Extension Development**:
- Use VS Code Extension Development Host
- Configure `.vscode/launch.json` for debugging
- Configure `.vscode/tasks.json` for build tasks

## Configuration Requirements

### Python Configuration (`pyproject.toml`)

**Required Sections**:
- `[project]` - Project metadata, dependencies
- `[project.optional-dependencies]` - Development dependencies
- `[tool.ruff]` - Ruff linting configuration
- `[tool.mypy]` - MyPy type checking configuration
- `[build-system]` - Build system configuration

**Example Structure**:
```toml
[project]
name = "python-vis"
version = "0.1.0"
dependencies = [
    "pydantic>=2.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "pytest-cov>=4.0.0",
    "ruff>=0.1.0",
    "mypy>=1.0.0",
]

[tool.ruff]
line-length = 100
target-version = "py312"

[tool.mypy]
python_version = "3.12"
strict = true
```

### Node.js Configuration (`package.json`)

**Required Sections**:
- `name`, `version`, `description` - Package metadata
- `main` - Extension entry point
- `scripts` - Build and test scripts
- `dependencies` - Runtime dependencies
- `devDependencies` - Development dependencies
- `engines` - Node.js and VS Code version requirements

**Example Structure**:
```json
{
  "name": "python-ast-visualization",
  "version": "0.1.0",
  "engines": {
    "vscode": "^1.80.0"
  },
  "main": "./out/extension.js",
  "scripts": {
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "build": "npm run compile && npm run bundle-webview",
    "bundle-webview": "webpack --mode production",
    "test": "jest"
  },
  "dependencies": {
    "@types/vscode": "^1.80.0",
    "rete": "^2.0.0",
    "rete-area-plugin": "^2.0.0",
    "rete-connection-plugin": "^2.0.0",
    "rete-react-render-plugin": "^2.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0",
    "webpack": "^5.0.0",
    "jest": "^29.0.0"
  }
}
```

### VS Code Extension Configuration (`package.json` - Extension Manifest)

**Required Sections**:
- `contributes.commands` - VS Code commands
- `contributes.activationEvents` - Extension activation events
- `contributes.views` - Webview panels (if using)

**Example**:
```json
{
  "contributes": {
    "commands": [
      {
        "command": "python-ast.visualize",
        "title": "Visualize AST"
      }
    ],
    "activationEvents": [
      "onCommand:python-ast.visualize"
    ]
  }
}
```

### Webview Bundling Configuration

**Webpack Configuration** (`webpack.config.js`):
- Entry point: `webview-ui/src/index.tsx`
- Output: Single bundled JS file for webview
- Target: Web (not Node.js)
- Mode: Production for release, Development for debugging

**Vite Configuration** (`vite.config.ts`) - Alternative:
- Entry point: `webview-ui/index.html`
- Build target: Web
- Output: Single bundled file

### Tailwind CSS Configuration (`tailwind.config.js`)

**Required Configuration**:
- Content paths (where to find CSS classes)
- VS Code CSS variable integration
- Custom color palette matching VS Code theme

**Example**:
```javascript
module.exports = {
  content: ['./webview-ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'vscode-bg': 'var(--vscode-editor-background)',
        'vscode-fg': 'var(--vscode-editor-foreground)',
      },
    },
  },
};
```

## Installation Script (`install.sh`)

**Required Functionality**:
1. Create Python virtual environment in `.venv` using `uv`
2. Activate virtual environment
3. Install Python project using `uv` and `pyproject.toml`
4. Run pytest to verify installation

**Script Structure**:
```bash
#!/bin/bash
set -e

# Create venv
uv venv .venv

# Activate venv
source .venv/bin/activate

# Install project
uv pip install -e .

# Run tests
python -m pytest tests/
```

## Dependency Management

### Python Dependencies

- **Management Tool**: `uv` (per project rules)
- **Lock File**: `uv.lock` (generated by uv)
- **Installation**: `uv pip install -e .`
- **Updates**: `uv pip install --upgrade <package>`

### Node.js Dependencies

- **Management Tool**: `npm` (or compatible)
- **Lock File**: `package-lock.json`
- **Installation**: `npm install`
- **Updates**: `npm update <package>`

## Version Constraints

### Python Packages

- **pydantic**: `^2.0.0` (compatible with 2.x)
- **pytest**: `^7.0.0` (compatible with 7.x)

### Node.js Packages

- **rete**: `^2.0.0` (compatible with 2.x)
- **react**: `^18.0.0` (compatible with 18.x)
- **typescript**: `^5.0.0` (compatible with 5.x)

## Optional Dependencies

### JSON-RPC Server (Alternative to stdio)

If using JSON-RPC instead of stdio:
- **python-jsonrpc-server**: `^0.4.0`

### Alternative Bundlers

- **vite**: `^4.0.0` (alternative to webpack)
- **esbuild**: `^0.19.0` (alternative to webpack/vite)

### Alternative Testing Frameworks

- **mocha**: `^10.0.0` (alternative to jest)

## Dependency Conflicts

### Potential Conflicts

- **React Versions**: Ensure `react` and `react-dom` versions match
- **TypeScript Versions**: Ensure TypeScript version compatible with VS Code API
- **Rete.js Plugins**: Ensure Rete.js plugin versions match core Rete.js version

### Resolution Strategy

- Use exact versions for critical dependencies (Rete.js ecosystem)
- Use caret ranges for less critical dependencies
- Test compatibility before upgrading

## Security Considerations

### Dependency Security

- **Audit Dependencies**: Run `npm audit` and `pip-audit` regularly
- **Update Regularly**: Keep dependencies up to date
- **Pin Critical Versions**: Pin versions for security-critical packages

### Supply Chain Security

- **Lock Files**: Commit lock files (`package-lock.json`, `uv.lock`)
- **Verified Sources**: Only use packages from verified sources (PyPI, npm)
- **Review Dependencies**: Review dependency licenses and security

## Performance Considerations

### Bundle Size

- **Tree Shaking**: Enable tree shaking in bundler configuration
- **Code Splitting**: Consider code splitting for large webview bundle
- **Minification**: Enable minification for production builds

### Runtime Performance

- **Lazy Loading**: Lazy load Rete.js plugins if possible
- **Worker Support**: Use Rete.js workers for large graphs
- **Virtual Scrolling**: Implement virtual scrolling for large node lists

## Documentation Dependencies

### Documentation Tools

- **Markdown**: All documentation in Markdown format
- **Docstrings**: Google-style docstrings for Python code
- **JSDoc**: TypeScript/JavaScript documentation comments

## Summary

All dependencies are well-maintained, open-source packages with MIT or compatible licenses. The dependency structure follows a clear separation between Python service, Extension host, and Webview UI, with minimal cross-dependencies. The project uses modern tooling (`uv` for Python, standard npm for Node.js) and follows project development practices.
