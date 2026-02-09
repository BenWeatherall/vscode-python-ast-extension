# Implement Feature

Implement a feature in one or more services/libraries following a structured workflow with mandatory planning, TDD, and documentation updates. For bug fixes, use the `implement-fix` command instead.

## Prerequisites

- Feature file must exist in `_features/` directory following the template format
- Feature file should contain: Background, This Task, and Testing Needed sections

## Regression Rules (MANDATORY)

- **Regression is not acceptable.** Failing tests that are not explicitly marked as expected failures (e.g., `@pytest.mark.xfail`, `@unittest.expectedFailure`) are regressions and must be fixed before the task is considered complete.
- **Expected failures are acceptable.** Tests annotated with framework-level expected-failure markers are excluded from the regression gate. Do not remove or alter these markers without explicit user approval.
- **Do not claim tests are unrelated.** If a test fails after your changes, it is your responsibility to fix it. You may not dismiss failing tests as "unrelated" or "pre-existing" without explicit user confirmation.
- **Full test suite requirement:** Before marking work complete, run the full test suite for affected component(s). All tests must pass (excluding expected failures).

## Instructions

You MUST follow these phases in order. **Planning is mandatory** - do not skip to implementation.

## Completion Checklist

**Check off each item as you complete it. Review this checklist throughout execution to ensure all tasks are completed.**

**Phase 1: Context Gathering**
- [ ] Step 1.1: Read relevant codebase context files from `docs/AI_CONTEXT/` directory
- [ ] Step 1.1: Read root `CHANGELOG.md` (or created if it doesn't exist)
- [ ] Step 1.2: Read feature file and extracted Background, This Task, and Testing Needed sections
- [ ] Step 1.3: 

**Phase 2: Planning**
- [ ] Step 2.1: Created implementation plan using `create_plan` tool (saved to `_features/{feature}/plans/tasks/`)
- [ ] Step 2.2: Presented plan to user and received explicit approval before proceeding

**Phase 3: Implementation**
- [ ] Step 3.1: Wrote tests first (TDD approach) following service-specific patterns
- [ ] Step 3.1: Verified tests FAIL before implementation
- [ ] Step 3.2: Implemented code changes following the approved plan
- [ ] Step 3.3: Ran code quality tools (ruff/mypy for Python, lint/check for UI) and fixed issues
- [ ] Step 3.4: Ran tests again and verified they PASS
- [ ] Step 3.5: Completed service-specific validation (if applicable)

**Phase 4: Completion**
- [ ] Step 4.1: Updated root `CHANGELOG.md` under `## [Unreleased]` with plan and task links
- [ ] Step 4.2: Updated relevant documentation in `docs/AI_CONTEXT/` directory
- [ ] Step 4.2: Updated service READMEs (if applicable)
- [ ] Step 4.3: Archived task and plan files to `_archive/{feature}/` (maintaining folder hierarchy)
- [ ] Step 4.4: Ran full test suite for affected service(s) and all tests passed
- [ ] Step 4.4: Verified no code quality errors remain
- [ ] Step 4.4: Confirmed all files are ready for commit

---

## Phase 1: Context Gathering

### Step 1.1: Read Codebase Context

1. Read relevant context files from `docs/AI_CONTEXT/` directory based on feature scope:
   - **Always read**: `AI_CONTEXT_QUICK_REFERENCE.md` for URLs, commands, and configurations
   - **Always read**: `AI_CONTEXT_REPOSITORY.md` for system architecture and component relationships
   - **If affecting Python service**: Read `AI_CONTEXT_PYTHON_SERVICE.md`
   - **If affecting webview UI**: Read `AI_CONTEXT_WEBVIEW_UI.md`
   - **If affecting extension host**: Read `AI_CONTEXT_EXTENSION_HOST.md`
   - **Always read**: `AI_CONTEXT_PATTERNS.md` for code patterns and conventions

2. Read root `CHANGELOG.md` (create if it doesn't exist) to understand:
   - Recent changes and their patterns
   - Current state of the `[Unreleased]` section
   - Changelog entry format (version-less, date-based releases)

### Step 1.2: Read Feature File

1. The user will provide the path to a feature file in `_features/` (e.g., `_features/my-feature.md`)
2. Read the feature file and extract:
   - **Background**: Context for what and why the change is needed
   - **This Task**: Specific list of changes to implement
   - **Testing Needed**: Tests that must be created or updated

### Step 1.3: Analyze Scope

Determine which service(s) or component(s) will be affected:

**Component Categories:**

- **Python Service** (`python_service/`):
  - `parser.py` - AST visitor logic for parsing Python code
  - `schema.py` - Rete.js JSON model definitions
  - `server.py` - JSON-RPC or socket listener for communication with extension host

- **Webview UI** (`webview-ui/`):
  - Frontend application (React/Vue/Svelte with Rete.js)
  - `src/nodes/` - Custom Rete node components
  - `src/editor.ts` - Rete.js initialization
  - `src/App.tsx` - Message handling logic

- **Extension Host** (`src/`):
  - `extension.ts` - Entry point that spawns Python service and manages Webview
  - `pythonClient.ts` - Handles communication with Python service

- **Utilities** (`tools/`):
  - Third-party tools and development utilities

**Identify affected component(s) based on:**
- Feature file description and task list
- Which component's functionality is being modified
- Cross-component dependencies (e.g., webview UI changes may require extension host changes)

---

## Phase 2: Planning (MANDATORY)

**You MUST create a plan before any implementation. Do not skip this phase.**

### Step 2.1: Create Implementation Plan

Use the `CreatePlan` tool to generate a detailed implementation plan that includes:

1. **Overview**: What the feature accomplishes
2. **Files to Create/Modify**: List all files with specific changes
3. **Test Strategy**: Which tests to write first (TDD approach)
4. **Implementation Order**: Step-by-step implementation sequence
5. **Validation Steps**: How to verify the implementation works
6. **Documentation Updates**: What docs need updating

Save the plan to `_features/{feature}/plans/tasks/` with the plan file name matching the task file name (e.g., `01-stubbing.md` for task `01-stubbing.md`).

Example: `cat > _features/add-logging/plans/tasks/01-stubbing.md << 'PLAN_EOF'`

### Step 2.2: Wait for User Approval

After the plan is created:

1. Present the plan summary to the user
2. **STOP and wait for user approval** before proceeding to implementation
3. The user may request changes to the plan
4. Only proceed when user explicitly confirms

---

## Phase 3: Implementation (After Approval Only)

Follow the TDD workflow defined in project rules:

### Step 3.1: Write Tests First

1. Create or update tests based on the affected service type:

   **For Python Service** (`python_service/`):
   - Create or update test files in the service's `tests/` directory
   - Follow black box testing principles
   - Use service-specific test fixtures and patterns
   - Reference `docs/AI_CONTEXT/AI_CONTEXT_PATTERNS.md` for testing patterns
   - Test files typically named `test_*.py`

   **For Webview UI** (`webview-ui/`):
   - Create or update test files with `.test.ts` or `.test.js` extension
   - Place tests in the same directory as the code being tested
   - Use Vitest for unit/integration tests
   - Use Playwright for end-to-end tests (if applicable)
   - Reference `docs/AI_CONTEXT/AI_CONTEXT_WEBVIEW_UI.md` for UI testing patterns

   **For Extension Host** (`src/`):
   - Create or update test files with `.test.ts` extension
   - Place tests in the same directory as the code being tested or in a `tests/` directory
   - Use Mocha or Jest for unit/integration tests
   - Reference `docs/AI_CONTEXT/AI_CONTEXT_EXTENSION_HOST.md` for extension host testing patterns

2. Run the tests and **verify they FAIL**:
   **For Python service:**
   ```bash
   cd python_service
   source ../.venv/bin/activate
   pytest tests/test_*.py -v
   ```

   **For Webview UI:**
   ```bash
   cd webview-ui
   pnpm run test:unit
   ```

   **For Extension Host:**
   ```bash
   pnpm run test
   ```

   - If tests pass before implementation, the tests don't validate the changes
   - Adjust tests until they correctly validate the expected behavior and fail

### Step 3.2: Implement Code Changes

1. Implement the code changes following the plan
2. Follow component-specific patterns:
   - **Python service**: Reference `docs/AI_CONTEXT/AI_CONTEXT_PATTERNS.md` for code organization, logging, type hints, and error handling
   - **Webview UI**: Reference `docs/AI_CONTEXT/AI_CONTEXT_WEBVIEW_UI.md` for component patterns, state management, and message handling
   - **Extension Host**: Reference `docs/AI_CONTEXT/AI_CONTEXT_EXTENSION_HOST.md` for VS Code extension patterns, API usage, and webview management
   - Follow existing code patterns in the affected component(s)
3. Use proper patterns:
   - **Python service**: Follow standard library → third-party → internal import organization
   - **Python service**: Use proper logging setup pattern (see AI_CONTEXT_PATTERNS.md)
   - **Webview UI**: Follow framework conventions (React/Vue/Svelte) and Rete.js patterns
   - **Extension Host**: Follow VS Code extension API patterns and TypeScript conventions
   - Maintain consistency with existing code in the component

### Step 3.3: Run Code Quality Tools

After code changes, fix style and type issues:

**For Python service:**
```bash
cd python_service
source ../.venv/bin/activate
ruff check --fix .
mypy .  # If mypy is configured
```

**For Webview UI:**
```bash
cd webview-ui
pnpm run lint
pnpm run check  # TypeScript type checking
```

**For Extension Host:**
```bash
pnpm run lint
pnpm run check  # TypeScript type checking
```

### Step 3.4: Run Tests

1. Run the tests again and **verify they PASS**:

   **For Python service:**
   ```bash
   cd python_service
   source ../.venv/bin/activate
   pytest tests/ -v
   ```

   **For Webview UI:**
   ```bash
   cd webview-ui
   pnpm run test
   ```

   **For Extension Host:**
   ```bash
   pnpm run test
   ```

2. If tests fail:
   - Validate implementation logic against the plan
   - Validate test logic against expected behavior
   - Fix issues and re-run until passing

### Step 3.5: Component-Specific Validation (If Needed)

**For Python service changes:**
- Validate AST parsing logic produces correct Rete.js JSON structure
- Test JSON-RPC communication with extension host
- Reference `docs/AI_CONTEXT/AI_CONTEXT_PYTHON_SERVICE.md` for validation steps

**For Webview UI changes:**
- Validate Rete.js graph rendering and node interactions
- Test message handling between webview and extension host
- Reference `docs/AI_CONTEXT/AI_CONTEXT_WEBVIEW_UI.md` for validation steps

**For Extension Host changes:**
- Validate Python service spawning and communication
- Test webview creation and message passing
- Reference `docs/AI_CONTEXT/AI_CONTEXT_EXTENSION_HOST.md` for validation steps

---

## Phase 4: Completion

### Step 4.1: Update Changelog

Create or update root `CHANGELOG.md` under the `## [Unreleased]` section:

1. **If `CHANGELOG.md` doesn't exist**, create it with this structure:
   ```markdown
   # Changelog

   All notable changes to this project will be documented in this file.

   ## [Unreleased]

   ```

2. Add entries under appropriate subsection (`### Added`, `### Changed`, `### Fixed`, or `### Removed`)
3. Include description of changes
4. Add links to the plan and archived task file:

```markdown
### Added/Changed/Fixed
- Description of the change
  - Plan: [task-name](_archive/{feature}/plans/tasks/{task-name}.md)
  - Task: [task-name](_archive/{feature}/tasks/{task-name}.md)
```

**Note:** The changelog uses a version-less format organized by release date. When a release is made, entries from `[Unreleased]` are moved to a new section with format `## YYYY-MM-DD` (e.g., `## 2024-01-15`).

### Step 4.2: Update Documentation

Review and update documentation based on what changed:

1. **Review relevant files in `docs/AI_CONTEXT/` directory**:
   - **If architectural changes**: Update `AI_CONTEXT_REPOSITORY.md`
   - **If Python service changes**: Update `AI_CONTEXT_PYTHON_SERVICE.md`
   - **If webview UI changes**: Update `AI_CONTEXT_WEBVIEW_UI.md`
   - **If extension host changes**: Update `AI_CONTEXT_EXTENSION_HOST.md`
   - **If new patterns/conventions**: Update `AI_CONTEXT_PATTERNS.md`
   - **If new URLs/commands**: Update `AI_CONTEXT_QUICK_REFERENCE.md`
   - Keep these files current for future AI agent context

2. **Update component READMEs** if applicable:
   - Add documentation for new public interfaces
   - Update examples if patterns changed
   - Component READMEs are typically in component directories (e.g., `python_service/README.md`, `webview-ui/README.md`)

### Step 4.3: Archive Task and Plan Files

On completion of a task, move both task and plan files to the archive maintaining folder hierarchy under `_archive/{feature}/`:

```bash
# On completion of a task, move both task and plan files to archive
# maintaining folder hierarchy under _archive/{feature}/

FEATURE="<feature-name>"   # e.g., add-logging
TASK_FILE="01-stubbing.md" # the completed task file name

mkdir -p _archive/${FEATURE}/tasks
mkdir -p _archive/${FEATURE}/plans/tasks

mv _features/${FEATURE}/tasks/${TASK_FILE} _archive/${FEATURE}/tasks/
mv _features/${FEATURE}/plans/tasks/${TASK_FILE} _archive/${FEATURE}/plans/tasks/
```

### Step 4.4: Final Validation

1. Run the full test suite for affected component(s):

   **For Python service:**
   ```bash
   cd python_service
   source ../.venv/bin/activate
   pytest tests/ -v
   ```

   **For Webview UI:**
   ```bash
   cd webview-ui
   pnpm run test
   ```

   **For Extension Host:**
   ```bash
   pnpm run test
   ```

2. Verify no code quality errors:

   **For Python service:**
   ```bash
   cd python_service
   source ../.venv/bin/activate
   ruff check .
   mypy .  # If mypy is configured
   ```

   **For Webview UI:**
   ```bash
   cd webview-ui
   pnpm run lint
   pnpm run check
   ```

   **For Extension Host:**
   ```bash
   pnpm run lint
   pnpm run check
   ```

3. Confirm all files are ready for commit

4. Review the **Completion Checklist** at the start of this document to ensure all items are checked before considering the job complete.

---

## Examples

### Example 1: Adding a New Feature to Python Service

**Feature File (`_features/add-ast-node-visitor.md`):**
```markdown
# Background
Need to add support for parsing function decorators in the AST parser.

# This Task
- Add decorator visitor logic in `python_service/parser.py`
- Update Rete.js schema to include decorator nodes
- Add error handling for unsupported decorator patterns

# Testing Needed
- Unit tests for decorator parsing logic
- Integration tests with Python files containing decorators
- Error handling tests
```

**Plan Would Include:**
1. Create `python_service/parser.py` visitor method for decorators
2. Update `python_service/schema.py` to include decorator node types
3. Add error logging for unsupported patterns
4. Tests in `python_service/tests/test_parser.py`

**Changelog Entry:**
```markdown
### Added
- Support for parsing function decorators in AST parser
  - Plan: [add-ast-node-visitor](_archive/add-ast-node-visitor/plans/tasks/add-ast-node-visitor.md)
  - Task: [add-ast-node-visitor](_archive/add-ast-node-visitor/tasks/add-ast-node-visitor.md)
```

### Example 2: Adding Webview UI Component

**Feature File (`_features/add-custom-rete-node.md`):**
```markdown
# Background
Users need a custom Rete.js node type to represent Python class definitions.

# This Task
- Create custom node component in `webview-ui/src/nodes/`
- Add node registration logic in `webview-ui/src/editor.ts`
- Integrate with AST parser output

# Testing Needed
- Component unit tests
- Integration tests with Rete.js editor
- Visual regression tests for node rendering
```

**Changelog Entry:**
```markdown
### Added
- Custom Rete.js node type for Python class definitions in webview UI
  - Plan: [add-custom-rete-node](_archive/add-custom-rete-node/plans/tasks/add-custom-rete-node.md)
  - Task: [add-custom-rete-node](_archive/add-custom-rete-node/tasks/add-custom-rete-node.md)
```

---

## Important Notes

- **Planning is mandatory**: Never skip Phase 2, even for "simple" changes
- **TDD is required**: Always write failing tests before implementation
- **Component boundaries matter**: Identify which component(s) are affected and follow component-specific patterns
- **Keep AI_CONTEXT files current**: Update relevant files in `docs/AI_CONTEXT/` directory for future changes
- **Archive, don't delete**: Task and plan files go to `_archive/{feature}/` maintaining folder hierarchy (`tasks/`, `plans/tasks/`), not trash
- **Links in changelog**: Always include plan and feature file links
- **One feature per file**: Each feature file should describe a single coherent change
- **Version-less changelog**: Root `CHANGELOG.md` uses date-based releases, not version numbers
- **Component-specific testing**: Follow testing patterns appropriate for the component type (Python service vs Webview UI vs Extension Host)

## Feature File Template Reference

Feature files in `_features/` should follow this template:

```markdown
# Background
User to add details of what and why the change is being done

# This Task
- a list of changes that need to be made

# Testing Needed
- a list of tests that should at least be made and or updated
```

See `_features/_template.md` for the template file.