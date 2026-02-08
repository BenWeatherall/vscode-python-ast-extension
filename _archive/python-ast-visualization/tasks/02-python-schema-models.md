# Background

This task defines the Pydantic models for the Rete.js graph structure. These models serve as the data contract between the Python service and the TypeScript/JavaScript components. This task depends on Task 01 (Project Structure Setup) as it requires the `pydantic` dependency to be installed. Following TDD principles, tests must be written before implementation.

# This Task

1. Create `python_service/__init__.py` (empty package initialization file)

2. Create `python_service/schema.py` with the following Pydantic models:
   - `Socket` model: Empty model for now, extensible for future socket metadata
   - `NodeData` model with:
     - `ast_type: str` - AST node type (e.g., 'BinOp', 'FunctionDef')
     - `lineno: Optional[int]` - Source line number
     - `col_offset: Optional[int]` - Source column offset
     - `extra = "allow"` - Allow type-specific fields
   - `ReteNode` model with:
     - `id: str` - Unique node identifier
     - `label: str` - Display label for the node
     - `inputs: Dict[str, Socket]` - Input sockets dictionary
     - `outputs: Dict[str, Socket]` - Output sockets dictionary
     - `data: NodeData` - Node data payload
     - `position: Optional[Dict[str, float]]` - Optional x,y position
   - `ReteConnection` model with:
     - `source: str` - Source node ID
     - `source_output: str` - Source socket name
     - `target: str` - Target node ID
     - `target_input: str` - Target socket name
   - `ReteGraph` model with:
     - `nodes: List[ReteNode]` - List of nodes
     - `connections: List[ReteConnection]` - List of connections

3. Add Google-style docstrings to all models with:
   - Class description
   - Field descriptions using Field(..., description="...")
   - Example usage (if helpful)

4. Ensure models support JSON serialization/deserialization (Pydantic default)

**Acceptance Criteria**:
- All models defined with correct types
- Models serialize to JSON correctly
- Models deserialize from JSON correctly
- Validation errors raised for invalid data
- Models match TypeScript interfaces (to be created in Task 03)
- All tests pass

# Testing Needed

1. Write test: `tests/python_service/test_schema.py::test_rete_node_creation_with_valid_data`
   - Create ReteNode with all required fields
   - Verify node created successfully
   - Verify serialization to JSON works
   - Verify all fields populated correctly

2. Write test: `tests/python_service/test_schema.py::test_rete_node_validation_with_invalid_data`
   - Test missing required fields (id, label, data) raises ValidationError
   - Test invalid data types raises ValidationError
   - Verify error messages are descriptive

3. Write test: `tests/python_service/test_schema.py::test_rete_connection_creation`
   - Create ReteConnection with valid source/target
   - Verify connection created successfully
   - Verify serialization to JSON works

4. Write test: `tests/python_service/test_schema.py::test_rete_graph_creation`
   - Create ReteGraph with nodes and connections
   - Verify graph structure is valid
   - Verify serialization to JSON works
   - Verify nodes and connections lists are preserved

5. Write test: `tests/python_service/test_schema.py::test_model_deserialization`
   - Deserialize JSON to models
   - Verify all fields populated correctly
   - Verify type conversions work (e.g., int strings to int)
   - Verify Optional fields handle None correctly

6. Write test: `tests/python_service/test_schema.py::test_node_data_extra_fields`
   - Create NodeData with extra fields (using extra="allow")
   - Verify extra fields preserved in serialization
   - Verify extra fields accessible after deserialization
