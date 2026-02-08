# Background

This task establishes the foundational project structure and configuration files required for the Python AST visualization feature. This is the first task with no dependencies, as it sets up the build system, dependency management, and development environment that all subsequent tasks will rely on.

# This Task

1. Create `pyproject.toml` with:
   - Python 3.12 configuration
   - `pydantic>=2.0.0` as core dependency
   - Development dependencies: `pytest>=7.0.0`, `pytest-cov>=4.0.0`, `ruff>=0.1.0`, `mypy>=1.0.0`
   - Ruff configuration (`[tool.ruff]`) with line-length=100, target-version=py312
   - MyPy configuration (`[tool.mypy]`) with python_version=3.12, strict=true
   - Build system configuration

2. Create `package.json` with:
   - VS Code extension configuration (name, version, engines)
   - TypeScript setup (typescript>=5.0.0)
   - Webview dependencies: `rete>=2.0.0`, `rete-area-plugin>=2.0.0`, `rete-connection-plugin>=2.0.0`, `rete-react-render-plugin>=2.0.0`, `react>=18.0.0`, `react-dom>=18.0.0`, `tailwindcss>=3.0.0`
   - Extension host dependencies: `@types/vscode>=1.80.0`
   - Development dependencies: `@types/node>=20.0.0`, `@types/react>=18.0.0`, `@types/react-dom>=18.0.0`, bundler (webpack/vite/esbuild), testing framework (jest/mocha)
   - Scripts: compile, watch, build, bundle-webview, test
   - VS Code extension manifest (`contributes` section with commands and activation events)

3. Create `install.sh` script that:
   - Creates `.venv` virtual environment using `uv venv .venv`
   - Activates virtual environment (`source .venv/bin/activate`)
   - Installs Python project using `uv pip install -e .`
   - Runs pytest to verify installation (`python -m pytest tests/`)

4. Create `.vscode/launch.json` for extension debugging:
   - Extension development host configuration
   - Webview debugging configuration (if supported)

5. Create `.vscode/tasks.json` for build tasks:
   - TypeScript compilation task
   - Webview bundling task
   - Test running tasks

**Acceptance Criteria**:
- `install.sh` executes successfully on Windows/macOS/Linux
- Virtual environment created in `.venv`
- Python dependencies installable via `uv`
- Node.js dependencies installable via `npm`
- VS Code extension can be debugged using launch configuration
- Build tasks execute successfully

# Testing Needed

1. Manual validation: Execute `install.sh` and verify:
   - Virtual environment created successfully
   - Python dependencies installed
   - Node.js dependencies installed
   - Tests can be run

2. Manual validation: Verify VS Code extension debugging:
   - Extension Development Host launches
   - Extension activates correctly
   - Commands are registered

3. Manual validation: Verify build tasks:
   - TypeScript compiles without errors
   - Webview bundles successfully
