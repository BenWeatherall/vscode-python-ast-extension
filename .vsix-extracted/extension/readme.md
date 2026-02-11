# Python AST Visualization

A VS Code extension that visualizes Python Abstract Syntax Trees (AST) as interactive node-based graphs. Explore code structure visually, navigate between graph nodes and source code, and understand program flow through an intuitive graph interface.

## Executive Summary

Python AST Visualization transforms Python source code into interactive visual graphs, making it easier to understand code structure, relationships between code elements, and program flow. The extension uses a sidecar architecture with three components: a Python service for AST parsing, a VS Code extension host for coordination, and a React-based webview using Rete.js for graph visualization.

### Key Features

- **Interactive Graph Visualization**: View Python AST nodes as connected graph elements with zoom, pan, and selection
- **Bidirectional Navigation**: Click graph nodes to jump to corresponding source code locations
- **Auto-Refresh**: Visualization automatically updates when Python files are saved
- **Theme Integration**: Matches VS Code dark/light theme automatically
- **Performance Optimized**: Handles large ASTs (100+ nodes) without UI lag
- **Error Handling**: Clear error messages and recovery suggestions for parsing failures

### Use Cases

- **Code Understanding**: Quickly grasp the structure of unfamiliar Python codebases
- **Teaching & Learning**: Visualize how Python code is parsed and structured
- **Code Review**: Identify complex code patterns and relationships visually
- **Refactoring**: Understand dependencies and relationships before making changes
- **Debugging**: Trace program flow through visual representation

### Target Audience

Developers working with Python code who want to:
- Understand code structure visually
- Navigate complex codebases more efficiently
- Learn how Python ASTs work
- Analyze code relationships and dependencies

## Installation

### Prerequisites

- **Python 3.12+**: Required for the AST parsing service
- **Node.js**: Required for the VS Code extension (version compatible with VS Code 1.80+)
- **VS Code 1.80+**: Required editor
- **uv**: Python package manager (for virtual environment and dependency management)
- **pnpm**: Node.js package manager

### Step-by-Step Installation

1. **Clone or download this repository**:
   ```bash
   git clone <repository-url>
   cd python-vis
   ```

2. **Run the installation script**:
   ```bash
   ./install.sh
   ```

   On Windows (Git Bash or WSL):
   ```bash
   bash install.sh
   ```

   The script will:
   - Create a Python virtual environment in `.venv`
   - Install Python dependencies (including dev dependencies)
   - Install Node.js dependencies via `pnpm`
   - Run tests to verify installation

3. **Build the extension**:
   ```bash
   pnpm run build
   ```

   This compiles TypeScript and bundles the webview UI.

4. **Verify installation**:
   ```bash
   # Run Python tests
   python -m pytest tests/ -v

   # Run TypeScript/Node tests
   pnpm test

   # Check code quality
   ruff check .
   mypy python_service/
   ```

### Troubleshooting

**Virtual environment not found**:
- Ensure `uv` is installed: `pip install uv` or `brew install uv`
- Check that the script has execute permissions: `chmod +x install.sh`

**Python service fails to start**:
- Verify Python 3.12+ is installed: `python --version`
- Ensure virtual environment is activated: `source .venv/bin/activate` (Unix) or `.venv\Scripts\activate` (Windows)
- Check that dependencies are installed: `uv pip list`

**Extension doesn't load**:
- Ensure VS Code version is 1.80 or higher
- Check that the extension compiled: `pnpm run compile`
- Verify webview bundle exists: `ls out/media/webview.js`

**Build errors**:
- Clear build artifacts: `rm -rf out/` and rebuild
- Ensure all Node dependencies are installed: `pnpm install`
- Check TypeScript version compatibility: `pnpm list typescript`

## Usage

### Opening the Visualization

1. **Open a Python file** (`.py`) in VS Code
2. **Open the Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. **Run the command**: `Python AST: Visualize AST` (or `python-ast.visualize`)

The visualization panel will open in a side-by-side view showing the AST graph of your Python code.

### Using the Graph Interface

**Zoom and Pan**:
- **Zoom**: Use mouse wheel or pinch gesture on trackpad
- **Pan**: Click and drag the background to move the graph
- **Reset View**: Double-click background (if supported by Rete.js)

**Node Selection**:
- **Click a node** to select it and highlight its connections
- **Node colors** indicate different AST node types:
  - Functions (`FunctionDef`)
  - Classes (`ClassDef`)
  - Calls (`Call`)
  - Operators (`BinOp`)
  - Variables (`Name`)
  - And more...

**Navigation**:
- **Click any node** to navigate to its source code location
- The editor will jump to the corresponding line and column
- Multiple clicks on the same node will toggle focus

### Auto-Refresh Feature

The visualization automatically refreshes when you save the Python file:

1. Make changes to your Python code
2. Save the file (`Ctrl+S` / `Cmd+S`)
3. The graph updates automatically after a 400ms debounce delay
4. A loading indicator appears during refresh

**Note**: Only files with an open visualization panel will auto-refresh. The extension tracks panels per file URI.

### Common Workflows

**Exploring a New Codebase**:
1. Open a Python file you want to understand
2. Run "Visualize AST" command
3. Use zoom/pan to explore the graph structure
4. Click nodes to jump to source code
5. Identify key functions and their relationships

**Understanding Function Calls**:
1. Visualize a file containing function calls
2. Look for `Call` nodes in the graph
3. Follow connections to see which functions call which
4. Click `Call` nodes to see the exact call site in code

**Analyzing Class Structure**:
1. Visualize a file with class definitions
2. Find `ClassDef` nodes
3. See how classes relate to methods and attributes
4. Navigate between class definition and usage sites

**Refactoring Preparation**:
1. Visualize code before refactoring
2. Identify all nodes that will be affected
3. Use node connections to understand dependencies
4. Navigate to each location to verify changes

### Error Handling

If parsing fails, you'll see an error message in the webview:

- **Syntax Errors**: Shows the specific Python syntax error message
- **Service Errors**: Indicates Python service issues with recovery suggestions
- **General Errors**: Displays parse error details

**Recovery**:
- Fix syntax errors in your Python code
- Try the "Retry" button in the error view
- Check the Output panel: "Python AST Visualization" channel for detailed logs
- Restart the extension if the Python service becomes unresponsive

### Keyboard Shortcuts

Currently, the extension uses VS Code's standard keyboard shortcuts:
- `Ctrl+Shift+P` / `Cmd+Shift+P`: Command Palette (to run "Visualize AST")
- `Ctrl+S` / `Cmd+S`: Save file (triggers auto-refresh)

Graph interaction uses mouse/trackpad gestures (zoom, pan, click).

## Architecture

The extension uses a **sidecar architecture**:

- **Python Service** (`python_service/`): Runs as a background process, parses Python AST using Python's `ast` module, converts to Rete.js graph format
- **Extension Host** (`src/`): Manages VS Code integration, spawns Python service, coordinates communication, handles file watchers
- **Webview UI** (`webview-ui/`): React-based interface using Rete.js for graph rendering, handles user interactions, communicates with extension host

Communication flows:
1. Extension host reads Python source code
2. Sends code to Python service via stdio (JSON-RPC-like protocol)
3. Python service parses AST and returns graph JSON
4. Extension host sends graph to webview via `postMessage`
5. Webview renders graph using Rete.js
6. User clicks node → webview sends navigation message → extension host opens file location

## Development

### Project Structure

```
python-vis/
├── python_service/      # Python AST parsing service
│   ├── parser.py       # AST to Rete.js converter
│   ├── schema.py       # Pydantic models
│   └── server.py       # Communication server
├── src/                 # VS Code extension host
│   ├── extension.ts    # Extension entry point
│   └── pythonClient.ts # Python service client
├── webview-ui/          # React webview UI
│   └── src/
│       ├── App.tsx     # Main React component
│       ├── editor.tsx  # Rete.js editor setup
│       └── nodes/      # Custom node components
└── tests/               # Test suites
```

### Running Tests

```bash
# Python tests
python -m pytest tests/ -v

# TypeScript/Node tests
pnpm test

# Integration tests
pnpm test -- tests/integration/
```

### Code Quality

```bash
# Python linting and formatting
ruff check . --fix
ruff format .

# Python type checking
mypy python_service/

# TypeScript compilation
pnpm run compile
```

### Building

```bash
# Full build (TypeScript + webview bundle)
pnpm run build

# Watch mode for development
pnpm run watch
```

## Contributing

This project follows Test-Driven Development (TDD) practices:
- Write tests before implementation
- Use models first for data structures
- Apply dependency injection for non-deterministic dependencies
- Follow black-box testing principles

See `.cursor/rules/development_practices.mdc` for detailed development guidelines.

## License

[Add license information here]

## Support

For issues, feature requests, or questions:
- Check the Output panel: "Python AST Visualization" channel for error logs
- Review test failures: `pnpm test` and `python -m pytest`
- Verify installation: Follow troubleshooting steps above
