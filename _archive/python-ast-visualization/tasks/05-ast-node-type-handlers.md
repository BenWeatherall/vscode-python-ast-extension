# Background

This task extends the AST parser core (Task 04) by implementing visit handlers for common AST node types. This allows the parser to handle a wider variety of Python code structures. This task depends on Task 04 (AST Parser Core) as it extends the ReteConverter class with additional visit methods.

# This Task

1. Extend `python_service/parser.py` with additional visit methods:

   - `visit_FunctionDef(node: ast.FunctionDef)`:
     - Create FunctionDef node with function name
     - Extract function parameters
     - Create connections to body statements
     - Preserve decorators (if present)
     - Preserve line number and column offset

   - `visit_ClassDef(node: ast.ClassDef)`:
     - Create ClassDef node with class name
     - Extract base classes
     - Create connections to body statements
     - Preserve decorators (if present)
     - Preserve line number and column offset

   - `visit_Call(node: ast.Call)`:
     - Create Call node
     - Create connection to function being called
     - Create connections to arguments
     - Preserve keyword arguments (if present)

   - `visit_Name(node: ast.Name)`:
     - Create Name node with variable name
     - Extract name ID
     - Preserve context (Load/Store/Del)

   - `visit_If(node: ast.If)`:
     - Create If node
     - Create connection to test condition
     - Create connections to body statements
     - Create connections to orelse statements (if present)

   - `visit_For(node: ast.For)`:
     - Create For node
     - Create connection to target
     - Create connection to iter
     - Create connections to body statements
     - Create connections to orelse statements (if present)

   - `visit_While(node: ast.While)`:
     - Create While node
     - Create connection to test condition
     - Create connections to body statements
     - Create connections to orelse statements (if present)

   - `visit_Return(node: ast.Return)`:
     - Create Return node
     - Create connection to value (if present)

   - Additional common AST types:
     - `visit_Assign(node: ast.Assign)` - Assignment statements
     - `visit_AugAssign(node: ast.AugAssign)` - Augmented assignments
     - `visit_List(node: ast.List)` - List literals
     - `visit_Dict(node: ast.Dict)` - Dictionary literals
     - `visit_Constant(node: ast.Constant)` - Constants (Python 3.8+)
     - `visit_Str(node: ast.Str)` - String literals (Python < 3.8)
     - `visit_Num(node: ast.Num)` - Number literals (Python < 3.8)

2. Add Google-style docstrings to all visit methods

3. Ensure consistent connection naming:
   - Use descriptive socket names (e.g., "body", "test", "target", "iter")
   - Document socket naming conventions

**Acceptance Criteria**:
- Each AST node type creates appropriate Rete node
- Connections reflect AST structure correctly
- Complex nested structures handled correctly
- All tests pass

# Testing Needed

1. Write test: `tests/python_service/test_parser.py::test_visit_function_def`
   - Parse function definition
   - Verify FunctionDef node created with correct data
   - Verify connections to body created
   - Verify function name in node data

2. Write test: `tests/python_service/test_parser.py::test_visit_class_def`
   - Parse class definition
   - Verify ClassDef node created
   - Verify connections to body created
   - Verify class name in node data

3. Write test: `tests/python_service/test_parser.py::test_visit_call`
   - Parse function call
   - Verify Call node created
   - Verify connections to function and arguments created

4. Write test: `tests/python_service/test_parser.py::test_visit_name`
   - Parse variable reference
   - Verify Name node created with variable name

5. Write test: `tests/python_service/test_parser.py::test_visit_if`
   - Parse if statement
   - Verify If node created
   - Verify connections to test, body, and orelse created

6. Write test: `tests/python_service/test_parser.py::test_visit_for`
   - Parse for loop
   - Verify For node created
   - Verify connections to target, iter, and body created

7. Write test: `tests/python_service/test_parser.py::test_visit_while`
   - Parse while loop
   - Verify While node created
   - Verify connections to test and body created

8. Write test: `tests/python_service/test_parser.py::test_visit_return`
   - Parse return statement
   - Verify Return node created
   - Verify connection to value created (if present)

9. Write test: `tests/python_service/test_parser.py::test_complex_nested_structures`
   - Parse nested functions/classes
   - Verify all nodes created
   - Verify all connections reflect nesting structure
   - Verify line numbers preserved throughout

10. Write test: `tests/python_service/test_parser.py::test_edge_cases`
    - Parse empty function body
    - Parse function with no parameters
    - Parse if without else
    - Verify appropriate handling
