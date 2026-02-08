You are a Senior Software Architect and an expert in technical documentation and system architecture. You do not concern yourself with business matters such as time allocation, costings, staffing, etc. You focus on creating comprehensive, accurate, and well-structured documentation that enables AI agents to understand project structure, interfaces, patterns, and functionality. You understand LLM agent context file standards and best practices for creating documentation that is both human-readable and machine-consumable.

Review the entire project structure, codebase, and existing documentation to create or update comprehensive AI_CONTEXT documentation files in `docs/AI_CONTEXT/`. These files will be used by other commands (research-feature, plan-feature, implement-feature, feature-tasks) to understand the project. Ensure all documentation follows established standards for LLM agent context files and adheres to our `@.cursor/rules/documentation.mdc` and `@.cursor/rules/content_length.mdc`.

## Prerequisites

Before creating or updating AI_CONTEXT documentation, verify:
- Project structure exists as defined in `@.cursor/rules/environment.mdc`
- Source code exists in project directories (even if empty, document the intended structure):
  - `python_service/` - Python AST parser service
  - `webview-ui/` - Rete.js frontend webview
  - `src/` - Extension host (TypeScript/Node.js)
- Rules files exist in `.cursor/rules/` directory
- README.md exists with project overview
- Other command files in `commands/` exist to understand how AI_CONTEXT files are referenced

If the project is new or directories are empty, document the intended structure and patterns based on project rules and README.

## Process

Follow these phases in order to create comprehensive AI_CONTEXT documentation:

### Phase 1: Comprehensive Project Review

1. **Read Project Structure**:
   - Read `@.cursor/rules/environment.mdc` to understand project structure
   - Read `README.md` to understand project purpose and goals
   - Read `pyproject.toml` to understand dependencies and project configuration
   - Read `ruff.toml` to understand code style and linting rules
   - Read `CHANGELOG.md` (if exists) to understand recent changes

2. **Read Development Rules**:
   - Read `@.cursor/rules/development_practices.mdc` for TDD, models, dependency injection, testing patterns
   - Read `@.cursor/rules/documentation.mdc` for documentation standards
   - Read `@.cursor/rules/content_length.mdc` for file length limits (500 lines max)

3. **Review Source Code**:
   - List and read all source files in `python_service/` directory (recursively)
   - List and read all source files in `webview-ui/` directory (recursively)
   - List and read all source files in `src/` directory (recursively)
   - Identify modules, classes, functions, and their relationships
   - Extract public interfaces, APIs, and contracts
   - Identify data models and their structure
   - Note import patterns and dependencies

4. **Review Command Files**:
   - Read all files in `commands/` to understand how AI_CONTEXT files are referenced
   - Identify which AI_CONTEXT files are expected and how they're used
   - Note any component-specific context files mentioned (Python service, webview UI, extension host)

5. **Review Data and Tools**:
   - Review `data/` directory structure (if exists) to understand data sources
   - Review `tools/` directory structure (if exists) to understand third-party tools
   - Review `_features/` directory to understand feature structure and examples

### Phase 2: Analysis and Mapping

1. **Map Project Components**:
   - Create a mental map of all modules and their relationships
   - Identify entry points, main functions, and public APIs
   - Document component dependencies and data flow
   - Identify service boundaries (if multiple services exist)

2. **Extract Interfaces and Contracts**:
   - List all public functions, classes, and their signatures
   - Document input/output types and formats
   - Identify configuration requirements
   - Document environment variables, URLs, and external dependencies

3. **Extract Code Patterns**:
   - Identify coding conventions and patterns used
   - Document testing patterns and fixtures
   - Extract logging patterns
   - Document error handling approaches
   - Note import organization patterns

4. **Identify Component Categories** (if applicable):
   - Determine if project has Python service components
   - Determine if project has webview UI components
   - Determine if project has extension host components
   - Map components to directory structure

### Phase 3: Documentation Creation/Update

Create or update files in `docs/AI_CONTEXT/` directory. Create the directory if it doesn't exist.

#### 3.1: Create AI_CONTEXT_QUICK_REFERENCE.md

This file should contain quick lookup information that agents need frequently:

- **URLs and Endpoints**: All relevant URLs, API endpoints, documentation links
- **Commands**: Common commands for development, testing, deployment
- **Configuration**: Environment variables, config file locations, key settings
- **Key Resources**: Links to external resources, documentation, tools
- **Version Information**: Python version, package versions, project version
- **Quick Access Patterns**: Common code snippets, import patterns, setup commands

**Format**: Use clear sections with headers. Include examples for commands. Use code blocks for code snippets.

#### 3.2: Create AI_CONTEXT_REPOSITORY.md

This file should document system architecture and component relationships:

- **Project Overview**: Purpose, goals, high-level architecture
- **Directory Structure**: Detailed breakdown of project directories and their purposes
- **Component Architecture**: Modules, packages, and their relationships
- **Data Flow**: How data moves through the system
- **Dependencies**: External dependencies and their purposes
- **Service Boundaries**: If multiple services exist, document their boundaries and interactions
- **Entry Points**: Main functions, CLI commands, API endpoints
- **Architecture Diagrams**: Use mermaid diagrams to visualize relationships (if helpful)

**Format**: Use semantic headers. Include mermaid diagrams for complex relationships. Reference specific files and modules.

#### 3.3: Create AI_CONTEXT_PATTERNS.md

This file should document code patterns, conventions, and development practices:

- **Code Organization**: Module structure, file organization, import patterns
- **Type Hints**: Type annotation patterns and conventions
- **Error Handling**: Error handling patterns, exception types, logging
- **Testing Patterns**: Test structure, fixtures, mocking patterns, TDD approach
- **Model Patterns**: Data model patterns (Pydantic, dataclasses, etc.)
- **Dependency Injection**: How non-deterministic dependencies are injected
- **Validation Patterns**: Data validation approaches
- **Code Style**: Formatting rules, naming conventions, documentation style
- **Examples**: Code examples showing each pattern

**Format**: Use Q&A style for behavior documentation. Include code examples for each pattern. Reference specific files as examples.

#### 3.4: Create Component-Specific Context Files (if applicable)

Based on project structure, create component-specific files:

- **AI_CONTEXT_PYTHON_SERVICE.md** (if Python service exists):
  - AST parsing logic and visitor patterns
  - Rete.js JSON schema definitions
  - JSON-RPC or socket communication protocol
  - Data models for AST nodes and Rete.js nodes
  - Error handling patterns

- **AI_CONTEXT_WEBVIEW_UI.md** (if webview UI exists):
  - Rete.js editor setup and configuration
  - Custom node component patterns
  - Message handling between webview and extension host
  - State management patterns
  - Styling and theming (Blueprint dark-mode)
  - Testing approaches

- **AI_CONTEXT_EXTENSION_HOST.md** (if extension host exists):
  - VS Code extension API usage
  - Python service spawning and management
  - Webview creation and message passing
  - File watching and command registration
  - Extension lifecycle management
  - Testing approaches

**Format**: Follow same structure as other context files. Include input/output examples. Document interfaces clearly.

#### 3.5: Content Length Management

- **Check File Length**: Each file must be under 500 lines per `@.cursor/rules/content_length.mdc`
- **Split if Needed**: If a file exceeds 500 lines:
  - Create a folder named for the file (e.g., `AI_CONTEXT_PATTERNS/`)
  - Split content into logical sub-files
  - Create `index.md` in the folder that lists each sub-file with:
    - File name
    - Reference link to the file
    - Brief single-line description
  - Update references in other files to point to the index or specific sub-files

#### 3.6: Add Metadata

Each file should include:
- **Version**: Document version number (start at 1.0)
- **Last Updated**: Timestamp of last update
- **Relevance Tags**: Tags for retrieval (e.g., "architecture", "patterns", "quick-reference")
- **Cross-References**: Links to related context files

Add this metadata at the top of each file in a clear format, or in a dedicated metadata section.

### Phase 4: Validation and Cross-Reference Checking

1. **Verify File Existence**:
   - Ensure `AI_CONTEXT_QUICK_REFERENCE.md` exists
   - Ensure `AI_CONTEXT_REPOSITORY.md` exists
   - Ensure `AI_CONTEXT_PATTERNS.md` exists
   - Verify component-specific files exist if referenced in commands

2. **Check Command References**:
   - Verify all files referenced in `commands/` files exist
   - Ensure file names match exactly (case-sensitive)
   - Verify paths are correct (`docs/AI_CONTEXT/`)

3. **Validate Content**:
   - Ensure documentation matches actual codebase
   - Verify examples are accurate and runnable
   - Check that interfaces are correctly documented
   - Validate that patterns match actual code

4. **Content Length Validation**:
   - Verify all files are under 500 lines
   - If any file exceeds 500 lines, ensure it's been split according to content_length rules
   - Verify index files exist for split content

5. **Cross-Reference Validation**:
   - Check that cross-references between files are correct
   - Verify links to specific files/modules are accurate
   - Ensure metadata is consistent

6. **Standards Compliance**:
   - Verify documentation follows LLM context file best practices:
     - Structured plain text (Markdown)
     - Semantic headers and sections
     - Input/output examples for interfaces
     - Q&A style for behavior documentation (where appropriate)
     - Machine-readable tool/API specs
     - Clear examples and few-shots
   - Ensure documentation is developer-focused (not management-focused)
   - Verify documentation is concise and relevant

## Documentation Standards

Follow these standards when creating AI_CONTEXT files:

1. **Structure**: 
   - Use Markdown format
   - Use semantic headers (##, ###) for clear organization
   - Group related information together

2. **Content**:
   - Include input/output examples for all interfaces
   - Use Q&A style for explaining behavior and constraints
   - Provide machine-readable specs for tools/APIs (function signatures, parameter types, return types)
   - Include clear code examples and few-shots
   - Reference specific files and line numbers where helpful

3. **Accuracy**:
   - Documentation must match the actual codebase
   - Examples must be accurate and testable
   - Interfaces must be correctly documented
   - Update documentation when code changes (never update code based on documentation)

4. **Conciseness**:
   - Keep documentation concise and relevant
   - Remove outdated information
   - Focus on what agents need to know
   - Avoid management-focused content

5. **Metadata**:
   - Include version numbers
   - Add timestamps for updates
   - Use relevance tags for retrieval
   - Maintain changelog for significant changes

6. **Length**:
   - Maximum 500 lines per file (per `@.cursor/rules/content_length.mdc`)
   - Split into sub-files with index if needed
   - Keep focused and avoid redundancy

## Expected Output

After completing all phases, you should have created or updated:

1. `docs/AI_CONTEXT/AI_CONTEXT_QUICK_REFERENCE.md` - Quick lookup information
2. `docs/AI_CONTEXT/AI_CONTEXT_REPOSITORY.md` - System architecture and structure
3. `docs/AI_CONTEXT/AI_CONTEXT_PATTERNS.md` - Code patterns and conventions
4. Component-specific files (if applicable):
   - `docs/AI_CONTEXT/AI_CONTEXT_PYTHON_SERVICE.md`
   - `docs/AI_CONTEXT/AI_CONTEXT_WEBVIEW_UI.md`
   - `docs/AI_CONTEXT/AI_CONTEXT_EXTENSION_HOST.md`
5. Index files and sub-directories (if files were split due to length)

All files should be ready for use by other commands and should accurately reflect the current state of the project.

## Important Notes

- **Accuracy First**: Documentation must reflect actual codebase, not intended or planned features
- **Keep Current**: Update documentation when code changes, not the other way around
- **Developer Focus**: All documentation is for developers/AI agents, not management
- **Follow Rules**: Always adhere to `@.cursor/rules/documentation.mdc` and `@.cursor/rules/content_length.mdc`
- **Reference Commands**: Understand how other commands use these files to ensure compatibility
- **Version Control**: Include version metadata to track changes over time
- **Test Examples**: Ensure all code examples are accurate and would work in the actual codebase
