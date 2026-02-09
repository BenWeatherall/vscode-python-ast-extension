## Metadata

- **Version**: 1.0
- **Last Updated**: 2026-02-09
- **Tags**: python-service, parser, protocol, ast, pydantic
- **Cross-References**:
  - `AI_CONTEXT_REPOSITORY.md` - Overall architecture and component structure
  - `AI_CONTEXT_PATTERNS.md` - Code organization, typing, testing patterns
  - `AI_CONTEXT_QUICK_REFERENCE.md` - Environment, commands, troubleshooting

---

## Module Overview

The `python_service/` package is a standalone Python process that parses Python source code into Rete.js-compatible graph structures. It communicates via a JSON-RPC-like protocol over stdio.

**Core modules**:

- **`schema.py`**: Pydantic models defining the graph data contract (`Socket`, `NodeData`, `ReteNode`, `ReteConnection`, `ReteGraph`)
- **`parser.py`**: `ReteConverter` class that visits Python AST nodes and builds graph structures
- **`server.py`**: `ASTParseServer` class that handles stdio communication and request/response formatting
- **`__main__.py`**: Entry point that initializes the service, sets up signal handlers, and starts the server loop

---

## Data Models (schema.py)

All data contracts use Pydantic models for validation and serialization.

### Socket

```python
class Socket(BaseModel):
    """Socket definition for Rete.js node inputs/outputs."""
    pass
```

Currently empty but reserved for future socket metadata (e.g., type hints, validation rules).

### NodeData

```python
class NodeData(BaseModel):
    model_config = ConfigDict(extra="allow")
    ast_type: str  # Required: AST node type (e.g., 'BinOp', 'FunctionDef')
    lineno: Optional[int] = None  # Source line number
    col_offset: Optional[int] = None  # Source column offset
```

**Key points**:
- `extra="allow"` permits additional fields from AST nodes (e.g., `name` for `FunctionDef`, `op` for `BinOp`, `value` for `Constant`)
- `lineno` and `col_offset` are preserved from AST nodes for source navigation
- Used via `NodeData.model_validate(dict)` in visitor methods

### ReteNode

```python
class ReteNode(BaseModel):
    id: str  # Unique identifier (e.g., 'n0', 'n1')
    label: str  # Display label (e.g., function name, operator type)
    inputs: Dict[str, Socket] = {}  # Input sockets (e.g., {'left': Socket(), 'right': Socket()})
    outputs: Dict[str, Socket] = {}  # Output sockets (e.g., {'result': Socket()})
    data: NodeData  # Node data payload
    position: Optional[Dict[str, float]] = None  # Optional x,y position for layout
```

**Socket naming conventions**:
- Inputs: descriptive names (`left`, `right`, `test`, `value`, `func`, `args`, `target`, `iter`, `body`, `orelse`)
- Outputs: typically `result` for expressions, `body` for containers (functions/classes)
- Statement inputs: indexed (`stmt_0`, `stmt_1`, `arg_0`, `arg_1`, `elt_0`, `target_0`)

### ReteConnection

```python
class ReteConnection(BaseModel):
    source: str  # Source node ID
    source_output: str  # Source socket name
    target: str  # Target node ID
    target_input: str  # Target socket name
```

Represents a directed edge from `source` node's `source_output` socket to `target` node's `target_input` socket.

### ReteGraph

```python
class ReteGraph(BaseModel):
    nodes: List[ReteNode] = []
    connections: List[ReteConnection] = []
```

Top-level container for the complete graph structure.

---

## Parsing & Conversion (parser.py)

### ReteConverter Class

`ReteConverter` extends `ast.NodeVisitor` to traverse Python ASTs and build Rete graphs.

**State management**:
- `self.nodes: List[ReteNode]` - Accumulated nodes
- `self.connections: List[ReteConnection]` - Accumulated connections
- `self._node_id_map: Dict[int, str]` - Maps AST node object IDs to string IDs (`n0`, `n1`, ...)
- `self._node_counter: int` - Counter for generating unique IDs

**Public API**:

```python
def parse_to_rete(self, source_code: str) -> ReteGraph:
    """Parse Python source and convert to Rete graph.
    
    Raises:
        SyntaxError: If source code is invalid Python.
    """
```

Resets state, parses source with `ast.parse()`, visits the tree, and returns a `ReteGraph`.

**Node ID generation**:

```python
def _get_node_id(self, node: ast.AST) -> str:
    """Generate deterministic unique ID for AST node."""
```

Uses `id(node)` as a key to ensure the same AST node object always gets the same ID within a parse run. IDs are sequential (`n0`, `n1`, ...).

**Connection creation**:

```python
def _add_connection(self, source_id: str, source_output: str, 
                   target_id: str, target_input: str) -> None:
```

Appends a `ReteConnection` to `self.connections`.

### Implemented Visitor Methods

The converter implements specialized visitors for common AST node types:

**Top-level**:
- `visit_Module`: Traverses all statements in `node.body`
- `visit_Expr`: Visits expression value (e.g., function call at module level)

**Expressions**:
- `visit_BinOp`: Creates node with `left`/`right` inputs, `result` output; connects operands
- `visit_Name`: Creates node with identifier as label, `result` output
- `visit_Constant`: Creates node with literal value as label (truncated to 50 chars), `result` output
- `visit_Call`: Creates node with `func` and indexed `args` inputs (`arg_0`, `arg_1`, ...), `result` output
- `visit_List`: Creates node with indexed `elt_*` inputs, `result` output
- `visit_Dict`: Creates node (visits keys/values but no explicit inputs currently)

**Statements**:
- `visit_FunctionDef`: Creates node with `body` output; connects each body statement via `stmt_*` inputs
- `visit_ClassDef`: Creates node with `body` output; connects each body statement via `stmt_*` inputs
- `visit_Pass`: Creates node with no inputs/outputs
- `visit_If`: Creates node with `test`, `body`, `orelse` inputs; connects test and body/orelse statements
- `visit_For`: Creates node with `target`, `iter`, `body` inputs; connects target, iterable, and body statements
- `visit_While`: Creates node with `test`, `body` inputs; connects test and body statements
- `visit_Return`: Creates node with optional `value` input; connects return value if present
- `visit_Assign`: Creates node with `value` input, `result` output; connects value and targets
- `visit_AugAssign`: Creates node with `target`, `value` inputs, `result` output; includes operator in label

**Pattern**: Each visitor method:
1. Gets or generates node ID via `_get_node_id(node)`
2. Visits child nodes recursively (if any)
3. Creates `NodeData` with `ast_type`, `lineno`, `col_offset`, plus extra fields
4. Creates `ReteNode` with appropriate inputs/outputs
5. Appends node to `self.nodes`
6. Creates connections from child nodes to this node (or vice versa for control flow)

---

## JSON Protocol & Server (server.py)

### ASTParseServer Class

Handles stdio-based communication using a JSON-RPC-like protocol.

**Error codes**:
- `PARSE_ERROR_CODE = -32700`: Syntax errors (invalid Python code)
- `INTERNAL_ERROR_CODE = -32603`: Internal errors (exceptions, invalid requests)

### Request Format

**Input** (stdin, one JSON line per request):

```json
{
  "method": "parse",
  "params": {
    "sourceCode": "def hello():\n    pass"
  }
}
```

**Parameter name**: Supports both `sourceCode` (camelCase) and `source_code` (snake_case).

**Validation**:
- Must be valid JSON
- Must be an object
- `method` must be `"parse"`
- `params.sourceCode` (or `source_code`) must be present and a string

### Response Format

**Success** (stdout, one JSON line):

```json
{
  "result": {
    "nodes": [
      {
        "id": "n0",
        "label": "hello",
        "inputs": {},
        "outputs": {"body": {}},
        "data": {
          "ast_type": "FunctionDef",
          "lineno": 1,
          "col_offset": 0,
          "name": "hello"
        },
        "position": null
      },
      {
        "id": "n1",
        "label": "Pass",
        "inputs": {},
        "outputs": {},
        "data": {
          "ast_type": "Pass",
          "lineno": 2,
          "col_offset": 4
        },
        "position": null
      }
    ],
    "connections": [
      {
        "source": "n0",
        "source_output": "body",
        "target": "n1",
        "target_input": "stmt_0"
      }
    ]
  }
}
```

**Error** (stdout, one JSON line):

```json
{
  "error": {
    "code": -32700,
    "message": "Syntax error: invalid syntax at line 1, column 5"
  }
}
```

Or for internal errors:

```json
{
  "error": {
    "code": -32603,
    "message": "Parse error: <exception message>"
  }
}
```

### Server Lifecycle

**`start_server()`**:
- Sets `_running = True`
- Loops over `sys.stdin`, reading one line at a time
- Skips empty lines
- Parses each line via `_parse_request()`
- Writes JSON response to `sys.stdout` (one line per request)
- Flushes stdout after each response
- Exits loop when `_running = False` or stdin closes

**`stop_server()`**:
- Sets `_running = False`
- Causes `start_server()` loop to exit after current request (if any)

**`handle_parse_request(source_code: str) -> dict`**:
- Calls `self.parser.parse_to_rete(source_code)`
- On success: returns `{"result": graph.model_dump()}`
- On `SyntaxError`: formats message with line/column, returns `{"error": {"code": PARSE_ERROR_CODE, "message": ...}}`
- On other exceptions: returns `{"error": {"code": INTERNAL_ERROR_CODE, "message": ...}}`

**`_parse_request(line: str) -> dict | None`**:
- Parses JSON line
- Validates request structure and parameters
- Calls `handle_parse_request()` with extracted `source_code`
- Returns response dict or error dict

---

## Process Entry Point (__main__.py)

### main() Function

Entry point when running `python -m python_service`:

1. **Initialization**:
   - Creates `ReteConverter()` instance
   - Creates `ASTParseServer(parser)` instance

2. **Signal handling**:
   - Registers `SIGTERM` handler (if available) → calls `server.stop_server()` and exits
   - Registers `SIGINT` handler → calls `server.stop_server()` and exits
   - Handles `KeyboardInterrupt` → calls `server.stop_server()` and exits

3. **Server loop**:
   - Calls `server.start_server()` (blocks until stdin closes or stop_server() is called)

**Graceful shutdown**: Signal handlers ensure the server stops cleanly and exits with code 0.

---

## Extension Points

### Adding Support for a New AST Node Type

1. **Implement visitor method** in `parser.py`:
   ```python
   def visit_NewNodeType(self, node: ast.NewNodeType) -> None:
       node_id = self._get_node_id(node)
       
       # Visit child nodes first (if any)
       for child in node.children:
           self.visit(child)
       
       # Create NodeData with ast_type and location info
       data = NodeData.model_validate({
           "ast_type": "NewNodeType",
           "lineno": node.lineno,
           "col_offset": node.col_offset,
           # Add any extra fields from the AST node
           "extra_field": node.extra_field,
       })
       
       # Create ReteNode with appropriate sockets
       rete_node = ReteNode(
           id=node_id,
           label="NewNodeType",  # Or derive from node attributes
           inputs={"input1": Socket(), "input2": Socket()},
           outputs={"result": Socket()},
           data=data,
           position=None,
       )
       self.nodes.append(rete_node)
       
       # Create connections to/from child nodes
       child_id = self._get_node_id(node.child)
       self._add_connection(child_id, "result", node_id, "input1")
   ```

2. **Follow conventions**:
   - Use descriptive socket names (`left`, `right`, `test`, `value`, etc.)
   - Index multiple inputs/outputs (`stmt_0`, `arg_0`, `elt_0`)
   - Preserve `lineno` and `col_offset` for source navigation
   - Add extra fields to `NodeData` via `model_validate()` dict (they'll be preserved via `extra="allow"`)

3. **Test**: Add test case in `tests/python_service/test_parser.py`:
   ```python
   def test_visit_new_node_type(self):
       converter = ReteConverter()
       graph = converter.parse_to_rete("code_with_new_node_type")
       
       new_nodes = [n for n in graph.nodes if n.data.ast_type == "NewNodeType"]
       self.assertEqual(len(new_nodes), 1)
   ```

### Extending the Protocol

To add new request methods (beyond `"parse"`):

1. **Update `_parse_request()`** in `server.py`:
   - Add validation for new `method` value
   - Extract new parameters from `params`
   - Call new handler method

2. **Add handler method**:
   ```python
   def handle_new_request(self, param1: str, param2: int) -> Dict[str, Any]:
       # Process request
       return {"result": {...}}
   ```

3. **Update extension host** (`src/pythonClient.ts`):
   - Add method to send new request type
   - Handle new response format

**Note**: Currently, only `"parse"` is supported. Extending requires coordination with the extension host.

---

## Examples

### Example 1: Successful Parse

**Request**:
```json
{
  "method": "parse",
  "params": {
    "sourceCode": "x + y"
  }
}
```

**Response**:
```json
{
  "result": {
    "nodes": [
      {
        "id": "n0",
        "label": "x",
        "inputs": {},
        "outputs": {"result": {}},
        "data": {"ast_type": "Name", "lineno": 1, "col_offset": 0, "id": "x"},
        "position": null
      },
      {
        "id": "n1",
        "label": "y",
        "inputs": {},
        "outputs": {"result": {}},
        "data": {"ast_type": "Name", "lineno": 1, "col_offset": 4, "id": "y"},
        "position": null
      },
      {
        "id": "n2",
        "label": "BinOp(Add)",
        "inputs": {"left": {}, "right": {}},
        "outputs": {"result": {}},
        "data": {"ast_type": "BinOp", "lineno": 1, "col_offset": 2, "op": "Add"},
        "position": null
      }
    ],
    "connections": [
      {"source": "n0", "source_output": "result", "target": "n2", "target_input": "left"},
      {"source": "n1", "source_output": "result", "target": "n2", "target_input": "right"}
    ]
  }
}
```

### Example 2: Syntax Error

**Request**:
```json
{
  "method": "parse",
  "params": {
    "sourceCode": "def incomplete"
  }
}
```

**Response**:
```json
{
  "error": {
    "code": -32700,
    "message": "Syntax error: expected ':' at line 1, column 15"
  }
}
```

### Example 3: Invalid Request Format

**Request** (invalid JSON):
```
{method: "parse", params: {}}
```

**Response**:
```json
{
  "error": {
    "code": -32603,
    "message": "Invalid request format: Expecting property name enclosed in double quotes: line 1 column 2"
  }
}
```

### Example 4: Missing Parameter

**Request**:
```json
{
  "method": "parse",
  "params": {}
}
```

**Response**:
```json
{
  "error": {
    "code": -32603,
    "message": "Missing required parameter: 'sourceCode' is required to parse Python code"
  }
}
```

---

## Summary

- **Models**: Pydantic models in `schema.py` define graph structure (`ReteNode`, `ReteConnection`, `ReteGraph`) with `NodeData` supporting extra fields
- **Parser**: `ReteConverter` visits AST nodes, generates deterministic IDs, creates nodes/connections following socket naming conventions
- **Protocol**: JSON-RPC-like over stdio; request `{"method": "parse", "params": {"sourceCode": "..."}}`, response `{"result": {...}}` or `{"error": {...}}`
- **Lifecycle**: Entry point sets up signal handlers, starts server loop; graceful shutdown on SIGTERM/SIGINT
- **Extension**: Add `visit_<NodeType>` methods to support new AST nodes; extend protocol by adding handlers and updating request validation

For patterns and conventions, see `AI_CONTEXT_PATTERNS.md`. For overall architecture, see `AI_CONTEXT_REPOSITORY.md`.
