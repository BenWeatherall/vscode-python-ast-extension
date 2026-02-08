# Background

This task implements the core AST parsing and graph conversion logic. The parser converts Python Abstract Syntax Trees into Rete.js-compatible graph structures. This task depends on Task 02 (Python Schema Models) as it uses the ReteGraph, ReteNode, and ReteConnection models. Following TDD principles, tests must be written before implementation.

# This Task

1. Create `python_service/parser.py` with:
   - `ReteConverter` class extending `ast.NodeVisitor`:
     - `__init__` method initializing:
       - `nodes: List[ReteNode]` - List of created nodes
       - `connections: List[ReteConnection]` - List of created connections
       - `_node_id_map: Dict[int, str]` - Mapping from AST node ID to Rete node ID
     - Node ID generation logic:
       - Deterministic based on AST node ID (id(node))
       - Unique IDs for each AST node
       - Same AST structure → same node IDs
     - `parse_to_rete(source_code: str) -> ReteGraph` entry point method:
       - Parse source code using `ast.parse()`
       - Visit AST tree using `self.visit()`
       - Return ReteGraph with nodes and connections
       - Raise SyntaxError for invalid Python code
     - `visit_BinOp(node: ast.BinOp)` method (first AST node type handler):
       - Create ReteNode for BinOp
       - Extract operator type
       - Create connections to left and right operands
       - Preserve line number and column offset
     - Connection tracking logic:
       - Track parent-child relationships
       - Create connections between parent and child nodes
       - Use appropriate socket names (e.g., "left", "right", "body")

2. Add Google-style docstrings to all methods with:
   - Method description
   - Args section for parameters
   - Returns section for return values
   - Raises section for exceptions

3. Implement basic error handling:
   - Catch SyntaxError from ast.parse()
   - Provide descriptive error messages

**Acceptance Criteria**:
- Parser creates valid ReteGraph structure
- Node IDs are unique and deterministic
- Connections reflect AST parent-child relationships
- Line numbers and column offsets preserved
- Invalid Python code raises SyntaxError with descriptive message
- All tests pass

# Testing Needed

1. Write test: `tests/python_service/test_parser.py::test_parsing_simple_binary_operation`
   - Parse `"x + y"` source code
   - Verify graph contains BinOp node
   - Verify graph contains Name nodes for x and y
   - Verify connections between BinOp and Name nodes
   - Verify node IDs are unique

2. Write test: `tests/python_service/test_parser.py::test_parsing_function_definition`
   - Parse `"def hello(): pass"` source code
   - Verify graph contains FunctionDef node
   - Verify function name in node data
   - Verify line number preserved in node data

3. Write test: `tests/python_service/test_parser.py::test_parsing_class_definition`
   - Parse `"class MyClass: pass"` source code
   - Verify graph contains ClassDef node
   - Verify class name in node data

4. Write test: `tests/python_service/test_parser.py::test_error_handling_invalid_syntax`
   - Parse invalid Python code (e.g., `"def incomplete"`)
   - Verify SyntaxError raised
   - Verify error message is descriptive

5. Write test: `tests/python_service/test_parser.py::test_line_number_preservation`
   - Parse multi-line code with specific line numbers
   - Verify lineno in node data matches source code
   - Verify column offset preserved

6. Write test: `tests/python_service/test_parser.py::test_node_id_generation`
   - Parse same code twice
   - Verify node IDs are deterministic (same AST → same IDs)
   - Verify node IDs are unique within a graph

7. Write test: `tests/python_service/test_parser.py::test_connection_creation`
   - Parse code with parent-child relationships
   - Verify parent-child relationships create connections
   - Verify connection source/target correct
   - Verify socket names appropriate

8. Write test: `tests/python_service/test_parser.py::test_empty_source_code`
   - Parse empty string
   - Verify empty graph returned (or appropriate handling)
