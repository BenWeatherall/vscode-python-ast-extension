# Documentation Requirements

## Overview

This document outlines all documentation that needs to be created or updated for the Python AST visualization feature, following project documentation standards and content length rules.

## Project Documentation

### README.md (Root Level)

**Purpose**: Executive summary, installation, and usage for end users

**Required Sections**:
1. **Executive Summary**
   - What the project does
   - Key features
   - Use cases

2. **Installation Instructions**
   - Prerequisites (Python 3.12, Node.js, VS Code)
   - Step-by-step installation
   - Running `install.sh`
   - Verifying installation

3. **Usage Instructions**
   - How to open visualization
   - How to use the graph interface
   - How to navigate to source code
   - Keyboard shortcuts (if any)

**Target Audience**: End users (developers using the extension)

**Content Length**: Must stay under 500 lines (per content_length.mdc)

**File Location**: `README.md` (project root)

### Architecture Documentation (`docs/architecture.md`)

**Purpose**: System architecture overview for developers

**Required Sections**:
1. **Architecture Overview**
   - Sidecar architecture pattern
   - Component breakdown
   - Data flow diagrams

2. **Component Details**
   - Python service architecture
   - Extension host architecture
   - Webview UI architecture

3. **Communication Protocols**
   - Python service ↔ Extension host
   - Extension host ↔ Webview

**Target Audience**: Developers working on the project

**Content Length**: Must stay under 500 lines

**File Location**: `docs/architecture.md`

### Developer Guide (`docs/developer-guide.md`)

**Purpose**: Development workflow and practices

**Required Sections**:
1. **Development Setup**
   - Environment setup
   - Running tests
   - Building extension

2. **Development Workflow**
   - TDD approach
   - Code organization
   - Testing practices

3. **Contributing Guidelines**
   - Code style
   - Commit messages
   - Pull request process

**Target Audience**: Developers contributing to the project

**Content Length**: Must stay under 500 lines

**File Location**: `docs/developer-guide.md`

## Code Documentation

### Python Code Documentation

**Format**: Google-style docstrings

**Required for**:
- All public functions and methods
- All classes
- All modules (module-level docstrings)

**Example**:
```python
def parse_to_rete(source_code: str) -> ReteGraph:
    """
    Parse Python source code and convert to Rete graph.
    
    Args:
        source_code: Python source code string
        
    Returns:
        ReteGraph with nodes and connections
        
    Raises:
        SyntaxError: If source code is invalid Python
    """
    pass
```

**Files Requiring Documentation**:
- `python_service/schema.py` - All Pydantic models
- `python_service/parser.py` - All methods in ReteConverter
- `python_service/server.py` - All methods in ASTParseServer
- `python_service/__main__.py` - Main function

### TypeScript Code Documentation

**Format**: JSDoc comments

**Required for**:
- All public functions and methods
- All classes
- All interfaces (if not self-documenting)
- Complex type definitions

**Example**:
```typescript
/**
 * Parse Python source code to Rete graph.
 * 
 * @param sourceCode Python source code string
 * @returns Promise resolving to ReteGraph
 * @throws Error if parsing fails or service unavailable
 */
async parseAST(sourceCode: string): Promise<ReteGraph>;
```

**Files Requiring Documentation**:
- `src/pythonClient.ts` - All public methods
- `src/extension.ts` - All exported functions
- `webview-ui/src/editor.ts` - All public methods
- `webview-ui/src/App.tsx` - Main component and handlers
- `webview-ui/src/nodes/*.tsx` - All node components

## API Documentation

### Python Service API

**Documentation File**: `docs/api/python-service.md`

**Required Sections**:
1. **Schema Models**
   - ReteNode model
   - ReteConnection model
   - ReteGraph model
   - Field descriptions

2. **Parser API**
   - `parse_to_rete()` function
   - ReteConverter class methods
   - AST node type handlers

3. **Server API**
   - Request format
   - Response format
   - Error format
   - Communication protocol

**Target Audience**: Developers integrating with Python service

**Content Length**: Must stay under 500 lines

### Extension Host API

**Documentation File**: `docs/api/extension-host.md`

**Required Sections**:
1. **Python Client API**
   - `spawnService()` method
   - `parseAST()` method
   - `stopService()` method
   - Error handling

2. **Extension API**
   - `activate()` function
   - `deactivate()` function
   - Command registration
   - Webview management

**Target Audience**: Developers extending the extension

**Content Length**: Must stay under 500 lines

### Webview UI API

**Documentation File**: `docs/api/webview-ui.md`

**Required Sections**:
1. **Editor API**
   - `initialize()` method
   - `loadGraph()` method
   - `clearGraph()` method
   - `onNodeClick()` method

2. **Component API**
   - Node component props
   - Message handling
   - Event handlers

**Target Audience**: Developers customizing webview UI

**Content Length**: Must stay under 500 lines

## User Documentation

### User Guide (`docs/user-guide.md`)

**Purpose**: Detailed usage instructions for end users

**Required Sections**:
1. **Getting Started**
   - Installation
   - First visualization
   - Basic usage

2. **Features**
   - Graph visualization
   - Node interaction
   - Source code navigation
   - Auto-refresh

3. **Troubleshooting**
   - Common issues
   - Error messages
   - Performance tips

**Target Audience**: End users

**Content Length**: Must stay under 500 lines

**File Location**: `docs/user-guide.md`

## Configuration Documentation

### Configuration Files

**Documentation**: Inline comments in configuration files

**Files**:
- `pyproject.toml` - Comments explaining configuration options
- `package.json` - Comments for complex scripts
- `tailwind.config.js` - Comments for theme configuration
- `webpack.config.js` or `vite.config.ts` - Comments for build configuration

## Testing Documentation

### Test Documentation

**Format**: Test docstrings and README

**Required**:
- Test file docstrings explaining test purpose
- `tests/README.md` explaining test structure
- Test fixture documentation

**Files**:
- `tests/README.md` - Test organization and running tests
- Individual test files - Docstrings for test cases

## Changelog

### CHANGELOG.md

**Purpose**: Version history and changes

**Format**: Keep a changelog format

**Required Sections**:
- Version numbers
- Added features
- Changed features
- Deprecated features
- Removed features
- Fixed bugs
- Security updates

**File Location**: `CHANGELOG.md` (project root)

## Documentation Maintenance

### Documentation Updates

**When to Update**:
- When adding new features
- When changing APIs
- When fixing bugs that affect usage
- When changing configuration

**Update Process**:
1. Update code documentation (docstrings/JSDoc) with code changes
2. Update API documentation when interfaces change
3. Update user guide when features change
4. Update README when installation/usage changes
5. Update CHANGELOG for each release

### Documentation Review

**Review Checklist**:
- ✅ All public APIs documented
- ✅ All code examples work
- ✅ Documentation matches code
- ✅ No broken links
- ✅ Content length under 500 lines (or split appropriately)
- ✅ Target audience appropriate
- ✅ Consistent style and format

## Documentation Standards

### Markdown Format

- Use standard Markdown syntax
- Use code fences for code examples
- Use proper heading hierarchy
- Use lists for step-by-step instructions
- Use tables for comparisons

### Code Examples

- Include complete, runnable examples
- Show expected output
- Include error handling examples
- Keep examples concise and focused

### Style Guidelines

- **Concise**: Keep documentation concise and relevant
- **Clear**: Use clear, simple language
- **Complete**: Cover all necessary information
- **Current**: Keep documentation up to date
- **Consistent**: Use consistent terminology and format

## Documentation Structure

### Directory Structure

```
docs/
├── architecture.md          # System architecture
├── developer-guide.md       # Development workflow
├── user-guide.md            # User instructions
└── api/
    ├── python-service.md    # Python service API
    ├── extension-host.md    # Extension host API
    └── webview-ui.md        # Webview UI API
```

### File Organization

- **Root Level**: README.md, CHANGELOG.md
- **docs/**: Architecture, guides, API documentation
- **Code Files**: Inline documentation (docstrings, JSDoc)
- **Tests**: Test documentation in test files

## Content Length Management

### 500 Line Limit

Per `content_length.mdc`:
- All documentation files capped at 500 lines
- If exceeding limit, split into logical sub-files
- Create folder named for original file
- Include `index.md` listing all sub-files

### Example: Splitting Large Documentation

If `docs/api/python-service.md` exceeds 500 lines:
```
docs/api/python-service/
├── index.md              # Lists all sub-files
├── schema.md             # Schema models
├── parser.md             # Parser API
└── server.md             # Server API
```

## Documentation Tools

### Tools Used

- **Markdown**: All documentation in Markdown
- **Docstrings**: Python code documentation
- **JSDoc**: TypeScript/JavaScript documentation
- **Code Fences**: For code examples

### No External Tools Required

- No documentation generators (Sphinx, JSDoc generator)
- No separate documentation site
- Documentation lives with code

## Documentation Priorities

### High Priority (Required for MVP)

1. ✅ README.md - Installation and usage
2. ✅ Code docstrings - All public APIs
3. ✅ Architecture overview - System design

### Medium Priority (Post-MVP)

1. API documentation - Detailed API reference
2. User guide - Comprehensive usage guide
3. Developer guide - Development workflow

### Low Priority (Future)

1. Advanced usage examples
2. Performance tuning guide
3. Extension development guide

## Documentation Review Process

### Before Release

1. Review all documentation for accuracy
2. Verify all code examples work
3. Check for broken links
4. Verify content length compliance
5. Ensure consistent style

### Documentation Updates

- Update documentation with code changes
- Never update code based on documentation
- Keep documentation current with implementation
- Review documentation during code review

## Summary

Documentation requirements cover:
- **Project Documentation**: README, architecture, guides
- **Code Documentation**: Docstrings, JSDoc comments
- **API Documentation**: Detailed API references
- **User Documentation**: Usage guides and troubleshooting

All documentation follows project standards:
- Markdown format
- Concise and relevant
- Under 500 lines (or split appropriately)
- Target audience appropriate
- Kept current with code
