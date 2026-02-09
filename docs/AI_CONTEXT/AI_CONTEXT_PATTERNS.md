## Metadata

- **Version**: 1.0
- **Last Updated**: 2026-02-09
- **Tags**: patterns, conventions, code-organization, testing, validation
- **Cross-References**:
  - `AI_CONTEXT_REPOSITORY.md` - Overall architecture and component structure
  - `AI_CONTEXT_PYTHON_SERVICE.md` - Python service implementation details
  - `AI_CONTEXT_WEBVIEW_UI.md` - Webview React + Rete.js patterns
  - `AI_CONTEXT_EXTENSION_HOST.md` - VS Code extension host patterns

---

## Code Organization

### Python Service (`python_service/`)

- **Single-purpose modules**: Each file has a clear responsibility:
  - `schema.py`: Pydantic models only (`Socket`, `NodeData`, `ReteNode`, `ReteConnection`, `ReteGraph`)
  - `parser.py`: AST visitor logic (`ReteConverter` class)
  - `server.py`: Communication protocol (`ASTParseServer` class)
  - `__main__.py`: Entry point and signal handling

- **Naming conventions**:
  - Classes: PascalCase (`ReteConverter`, `ASTParseServer`)
  - Functions/methods: snake_case (`parse_to_rete`, `handle_parse_request`)
  - Constants: UPPER_SNAKE_CASE (`PARSE_ERROR_CODE`, `INTERNAL_ERROR_CODE`)

- **Import organization**: Grouped by standard library, third-party, then local imports (see `parser.py`).

### Extension Host (`src/`)

- **File structure**:
  - `extension.ts`: Main entry point, command registration, panel management
  - `pythonClient.ts`: Python service communication client
  - `types.ts`: TypeScript type definitions for extension side
  - `conversion.ts`: Python JSON → TypeScript conversion utilities

- **Naming conventions**:
  - Classes: PascalCase (`PythonClient`)
  - Functions: camelCase (`spawnService`, `parseAST`)
  - Interfaces: PascalCase (`VSCodeMessageOut`, `VSCodeMessageIn`)
  - Constants: UPPER_SNAKE_CASE (`DEBOUNCE_MS`)

- **Module organization**: Each file exports a focused set of related types/functions. No circular dependencies.

### Webview UI (`webview-ui/src/`)

- **Component organization**:
  - `App.tsx`: Main React component, message handling, error UI
  - `editor.tsx`: Rete.js editor wrapper (`ReteASTEditor` class)
  - `nodes/`: Node component library
    - `ASTNode.tsx`: Base node component
    - `BinOpNode.tsx`, `CallNode.tsx`, etc.: Specialized node components
    - `index.ts`: Node factory (`getNodeComponent`)

- **Naming conventions**:
  - React components: PascalCase (`App`, `ASTNode`)
  - Functions: camelCase (`getNodeComponent`, `handleNodeClick`)
  - Type exports: PascalCase (`VSCodeMessage`, `ReteGraph`)

---

## Type & Model Patterns

### Python: Pydantic Models

All data contracts use Pydantic models in `python_service/schema.py`:

- **Base models**: Inherit from `pydantic.BaseModel`
- **Field definitions**: Use `Field(...)` with descriptions for documentation
- **Extra fields**: `NodeData` uses `ConfigDict(extra="allow")` to accept additional AST node attributes
- **Optional fields**: Use `Optional[T]` or `T | None` with `Field(None, ...)`
- **Default factories**: Use `Field(default_factory=list)` for mutable defaults

**Example** (`schema.py`):
```python
class NodeData(BaseModel):
    model_config = ConfigDict(extra="allow")
    ast_type: str = Field(..., description="AST node type")
    lineno: Optional[int] = Field(None, description="Source line number")
    col_offset: Optional[int] = Field(None, description="Source column offset")
```

**Validation pattern**: Models validate on construction. Use `model_validate()` for dict → model conversion (see `parser.py` visit methods).

### TypeScript: Interfaces

TypeScript types mirror Python models but use camelCase:

- **Interfaces**: Use `interface` for object shapes (`ReteNode`, `NodeData`)
- **Index signatures**: `NodeData` uses `[key: string]: unknown` for extra fields
- **Optional properties**: Use `?` suffix (`lineno?: number`)
- **Type unions**: Use `type` for unions (`VSCodeMessageType`)

**Example** (`src/types.ts`):
```typescript
export interface NodeData {
  astType: string;
  lineno?: number;
  colOffset?: number;
  [key: string]: unknown;
}
```

### Conversion Pattern

Python (snake_case) ↔ TypeScript (camelCase) conversion happens in `src/conversion.ts` and `webview-ui/src/conversion.ts`:

- **Separate conversion functions**: `pythonNodeDataToTs`, `pythonNodeToTs`, `pythonConnectionToTs`, `pythonGraphToTs`
- **Preserve extra fields**: Copy unknown keys from Python `NodeData` to TypeScript `NodeData`
- **Type safety**: Use TypeScript interfaces for Python JSON shapes (`PythonNodeData`, `PythonReteGraph`)

**Example** (`src/conversion.ts`):
```typescript
function pythonNodeDataToTs(data: PythonNodeData): NodeData {
  const result: NodeData = {
    astType: data.ast_type,
    lineno: data.lineno,
    colOffset: data.col_offset,
  };
  // Preserve extra fields
  for (const [key, value] of Object.entries(data)) {
    if (!["ast_type", "lineno", "col_offset"].includes(key)) {
      result[key] = value;
    }
  }
  return result;
}
```

---

## Error Handling & Logging

### Python Service Error Handling

`ASTParseServer` in `server.py` categorizes errors:

- **Syntax errors**: `PARSE_ERROR_CODE = -32700`, user-friendly message with line/column
- **Internal errors**: `INTERNAL_ERROR_CODE = -32603`, generic message (avoids exposing internals)
- **Request validation**: Returns error dict for invalid JSON, missing params, wrong types

**Pattern**: Always return `{"error": {"code": int, "message": str}}` or `{"result": dict}`. Never raise exceptions across stdio boundary.

**Example** (`server.py`):
```python
except SyntaxError as e:
    error_msg = "Invalid Python syntax"
    if e.msg:
        error_msg = f"Syntax error: {e.msg}"
    if e.lineno is not None:
        location = f" at line {e.lineno}"
        if e.offset is not None:
            location += f", column {e.offset}"
        error_msg += location
    return {"error": {"code": self.PARSE_ERROR_CODE, "message": error_msg}}
```

### Extension Host Logging

Extension uses VS Code Output channel for diagnostics:

- **Channel creation**: `getOutputChannel()` creates/returns singleton `vscode.OutputChannel`
- **Error logging**: `logError(message, error?)` writes timestamped errors with stack traces
- **User-facing errors**: Use `vscode.window.showErrorMessage` for critical failures
- **Error categorization**: Parse error messages to show syntax vs service vs generic errors

**Pattern**: Log technical details to Output channel, show user-friendly messages in dialogs.

**Example** (`extension.ts`):
```typescript
function logError(message: string, error?: Error): void {
  const channel = getOutputChannel();
  const timestamp = new Date().toISOString();
  channel.appendLine(`[${timestamp}] ERROR: ${message}`);
  if (error) {
    channel.appendLine(`  Error: ${error.message}`);
    if (error.stack) {
      channel.appendLine(`  Stack trace:`);
      channel.appendLine(error.stack);
    }
  }
  channel.show(true);
}
```

### Webview Error Handling

Webview (`App.tsx`) displays errors and supports retry:

- **Error state**: `error: string | null` state variable
- **Error messages**: Displayed in banner with suggestions derived from message content
- **Retry flow**: Posts `{ type: "retry" }` message to extension, which re-opens document and re-parses
- **Loading state**: Shows spinner during parse operations

**Pattern**: Webview never logs to console for production. All errors surfaced via UI or messages to extension.

---

## Testing & TDD

### Test-Driven Development Approach

Per `development_practices.mdc`:

- **Write test first**: Always write test case before implementation
- **Black box testing**: Tests validate functionality, not internal behavior
  - Never check for "called_once" or log lines
  - Validate returned objects or referenced objects (if pass-by-reference)
  - Use exception expectation tests (`assertRaises`, `expect().toThrow()`)
- **Working tests**: All tests must work; fix broken tests
- **Valid tests**: All tests must be able to fail

### Python Test Structure

Tests live in `tests/python_service/`:

- **File naming**: `test_<module>.py` (e.g., `test_parser.py`, `test_schema.py`)
- **Test classes**: Group related tests in `unittest.TestCase` subclasses
- **Test methods**: `test_<description>` naming
- **Assertions**: Use `unittest` assertions (`assertEqual`, `assertIsInstance`, `assertRaises`)

**Example** (`tests/python_service/test_parser.py`):
```python
class TestParsingSimpleBinaryOperation(unittest.TestCase):
    def test_parsing_simple_binary_operation(self) -> None:
        converter = ReteConverter()
        graph = converter.parse_to_rete("x + y")
        
        self.assertIsInstance(graph, ReteGraph)
        binop_nodes = [n for n in graph.nodes if n.data.ast_type == "BinOp"]
        self.assertEqual(len(binop_nodes), 1)
```

### TypeScript Test Structure

Tests live alongside source:

- **Extension tests**: `src/__tests__/extension.test.ts`, `src/__tests__/pythonClient.test.ts`
- **Webview tests**: `webview-ui/src/__tests__/App.test.tsx`, `webview-ui/src/__tests__/editor.test.tsx`
- **Test framework**: Jest with `@testing-library/react` for React components
- **Mocking**: VS Code API mocked via `src/__mocks__/vscodeMock.ts`

**Pattern**: Mock external dependencies (VS Code API, Python service). Test behavior, not implementation details.

**Example** (`src/__tests__/extension.test.ts`):
```typescript
jest.mock("../pythonClient");
const MockPythonClient = PythonClient as jest.MockedClass<typeof PythonClient>;

beforeEach(() => {
  MockPythonClient.mockImplementation(() => ({
    spawnService: jest.fn().mockResolvedValue(undefined),
    parseAST: jest.fn().mockResolvedValue({ nodes: [], connections: [] }),
  }) as unknown as PythonClient);
});
```

### Integration Tests

End-to-end tests in `tests/integration/e2e/`:

- **Test files**: `communication.test.ts`, `navigation.test.ts`, `error-handling.test.ts`, etc.
- **Scope**: Test full workflows (extension → Python service → webview)
- **Isolation**: Each test sets up and tears down its own environment

---

## Dependency Injection & Validation

### Dependency Injection Pattern

Per `development_practices.mdc`, non-deterministic dependencies must be passed as parameters:

- **Time**: Pass `time` function or `Date` constructor if needed (not used currently)
- **External APIs**: Pass VS Code API, file system, process spawn functions
- **Example**: `PythonClient` receives `spawn` function implicitly via `child_process.spawn`, but could be injected for testing

**Pattern**: Functions that need non-deterministic behavior accept dependencies as parameters, not globals.

### Validation Pattern

Per `development_practices.mdc`: **Validation over testing**:

- **Pydantic models**: All ingested data loaded into models. If validation fails, reject data.
- **Once validated**: Never check validity again. Trust the model.
- **Example**: `ASTParseServer._parse_request` validates JSON structure, then `handle_parse_request` trusts the validated `source_code` string.

**Example** (`server.py`):
```python
def _parse_request(self, line: str) -> Dict[str, Any] | None:
    # Validate JSON structure
    data = json.loads(line)
    if not isinstance(data, dict):
        return {"error": {"code": self.INTERNAL_ERROR_CODE, "message": "..."}}
    
    # Extract and validate sourceCode
    source_code = params.get("sourceCode") or params.get("source_code")
    if source_code is None or not isinstance(source_code, str):
        return {"error": {...}}
    
    # Pass validated source_code to handler (no further validation)
    return self.handle_parse_request(source_code)
```

---

## Q&A: Common Patterns & Workflows

### How do I add support for a new AST node type?

1. **Python side** (`python_service/parser.py`):
   - Add `visit_<NodeType>` method to `ReteConverter`
   - Create `ReteNode` with appropriate inputs/outputs
   - Add connections to child nodes using `_add_connection`
   - Use `NodeData.model_validate()` to create node data with `ast_type`, `lineno`, `col_offset`

2. **Webview side** (`webview-ui/src/nodes/`):
   - Create new component file (e.g., `NewNodeTypeNode.tsx`) wrapping `ASTNode`
   - Register in `nodes/index.ts` `TYPE_MAP`: `NewNodeType: NewNodeTypeNode`
   - `getNodeComponent` will automatically return the specialized component

**Example**: See `visit_BinOp` in `parser.py` and `BinOpNode.tsx` in `webview-ui/src/nodes/`.

### How should I propagate parse errors to the webview?

1. **Python service** (`server.py`): Returns `{"error": {"code": int, "message": str}}`
2. **Extension** (`extension.ts`): `PythonClient.parseAST` throws `Error` with message
3. **Extension handler**: Catches error, calls `logError`, sends `{ type: "error", error: string }` to webview
4. **Webview** (`App.tsx`): Receives error message, sets `error` state, displays banner with retry button

**Pattern**: Errors flow Python → Extension (Error) → Webview (message). Extension logs technical details, webview shows user-friendly message.

### How do I add a new message type between webview and extension?

1. **Update type definitions**:
   - `webview-ui/src/types.ts`: Add to `VSCodeMessageType` union and `VSCodeMessage` interface
   - `src/types.ts`: Add to `VSCodeMessageOut` or `VSCodeMessageIn` (or create inline type if one-off)

2. **Implement handlers**:
   - Extension (`extension.ts`): Add case in `onDidReceiveMessage` handler within `createVisualizationPanel`
   - Webview (`App.tsx`): Add case in `window.addEventListener("message", ...)` handler

3. **Ensure type safety**: Both sides must agree on payload shape (TypeScript interfaces help catch mismatches)

**Example**: See `"navigateToSource"` message handling in `extension.ts` and `App.tsx`.

### How do I test a function that spawns a process?

**Pattern**: Mock `child_process.spawn` or inject spawn function.

**Example** (`src/__tests__/pythonClient.test.ts`):
```typescript
jest.mock("child_process");
import { spawn } from "child_process";
const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

it("spawns Python service process", async () => {
  mockSpawn.mockReturnValue(mockProcess as unknown as ChildProcess);
  const client = new PythonClient();
  await client.spawnService();
  expect(mockSpawn).toHaveBeenCalledWith("python", ["-m", "python_service"], {...});
});
```

### How do I add a new Pydantic model field?

1. **Add field to model** (`python_service/schema.py`):
   - Use `Field(...)` with description
   - Mark as `Optional[T]` if not required
   - Use `Field(default_factory=...)` for mutable defaults

2. **Update conversion** (`src/conversion.ts`, `webview-ui/src/conversion.ts`):
   - Add snake_case → camelCase mapping in conversion function
   - Update TypeScript interface in `types.ts`

3. **Update tests**: Add test case validating new field serialization/deserialization

**Example**: See `NodeData.lineno` and `NodeData.col_offset` fields and their conversion in `pythonNodeDataToTs`.

### How do I ensure a test can fail?

**Pattern**: Test must assert a specific condition that could be false.

**Anti-pattern**: Tests that only pass (no assertions, or assertions that always pass).

**Example** (valid test):
```python
def test_node_has_required_fields(self):
    node = ReteNode(id="n1", label="Test", inputs={}, outputs={}, 
                    data=NodeData(ast_type="Test"))
    self.assertEqual(node.id, "n1")  # Could fail if id was wrong
```

**Example** (invalid test):
```python
def test_node_exists(self):
    node = ReteNode(...)
    self.assertIsNotNone(node)  # Always passes if node creation succeeds
```

---

## Summary

- **Code organization**: Single-purpose modules, clear naming conventions (PascalCase classes, camelCase/snake_case functions)
- **Types**: Pydantic models in Python, TypeScript interfaces in TS, conversion functions handle snake_case ↔ camelCase
- **Errors**: Python returns error dicts, Extension logs to Output channel, Webview displays user-friendly messages
- **Testing**: TDD with black-box tests, unittest for Python, Jest for TypeScript, mock external dependencies
- **Validation**: Pydantic models validate on construction, once validated never check again
- **DI**: Pass non-deterministic dependencies as parameters

For component-specific patterns, see cross-referenced AI_CONTEXT files.
