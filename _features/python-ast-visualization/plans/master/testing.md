# Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for the Python AST visualization feature, following TDD principles, black box testing approach, and project development practices.

## Testing Principles

### Test-Driven Development (TDD)

- **Write tests first**: All implementation code must have tests written before implementation
- **Red-Green-Refactor**: Write failing test → Implement to pass → Refactor
- **Test coverage**: Aim for comprehensive coverage of all functionality

### Black Box Testing

- **Validate functionality, not implementation**: Tests verify behavior, not internal details
- **No implementation checks**: Never test for "called_once" or log lines
- **Validate outputs**: Test returned objects or referenced objects (if pass-by-reference)
- **Exception testing**: Use expect exception tests for error cases

### Model Validation Over Testing

- **Models validate data**: All ingested data loaded into models; if validation fails, data is rejected
- **No re-validation**: Once data passes model validation, never check validity again
- **Boundary validation**: Validate data at component boundaries only

## Test Organization

### Python Service Tests (`tests/python_service/`)

#### Schema Tests (`test_schema.py`)

**Test Cases**:
1. **Test ReteNode creation with valid data**
   - Create node with all required fields
   - Verify node created successfully
   - Verify serialization to JSON

2. **Test ReteNode validation with invalid data**
   - Missing required field (id, label, data)
   - Invalid data types
   - Verify validation errors raised

3. **Test ReteConnection creation**
   - Create connection with valid source/target
   - Verify connection created successfully
   - Verify serialization to JSON

4. **Test ReteGraph creation**
   - Create graph with nodes and connections
   - Verify graph structure
   - Verify serialization to JSON

5. **Test model deserialization**
   - Deserialize JSON to models
   - Verify all fields populated correctly
   - Verify type conversions

**Test Approach**: Unit tests using `unittest`, validate model behavior

#### Parser Tests (`test_parser.py`)

**Test Cases**:
1. **Test parsing simple binary operation**
   - Input: `"x + y"`
   - Verify: Graph contains BinOp node
   - Verify: Graph contains Name nodes for x and y
   - Verify: Connections between nodes

2. **Test parsing function definition**
   - Input: `"def hello(): pass"`
   - Verify: Graph contains FunctionDef node
   - Verify: Function name in node data
   - Verify: Line number preserved

3. **Test parsing class definition**
   - Input: `"class MyClass: pass"`
   - Verify: Graph contains ClassDef node
   - Verify: Class name in node data

4. **Test parsing complex nested structure**
   - Input: Function with nested if/for/while
   - Verify: All nodes created
   - Verify: Connections reflect nesting

5. **Test error handling for invalid syntax**
   - Input: Invalid Python code
   - Verify: SyntaxError raised
   - Verify: Error message descriptive

6. **Test line number preservation**
   - Input: Multi-line code with specific line numbers
   - Verify: Node data contains correct lineno
   - Verify: Column offset preserved

7. **Test node ID generation**
   - Verify: Node IDs are unique
   - Verify: Node IDs are deterministic (same AST → same IDs)

8. **Test connection creation**
   - Verify: Parent-child relationships create connections
   - Verify: Connection source/target correct
   - Verify: Socket names appropriate

**Test Approach**: Unit tests, validate parser output (graph structure), not internal state

#### Server Tests (`test_server.py`)

**Test Cases**:
1. **Test server initialization**
   - Create server with parser
   - Verify: Server initialized successfully
   - Verify: Parser dependency injected

2. **Test handling valid parse request**
   - Send valid source code
   - Verify: Response contains graph
   - Verify: Graph structure valid

3. **Test handling invalid source code**
   - Send invalid Python code
   - Verify: Error response returned
   - Verify: Error message descriptive

4. **Test error response formatting**
   - Verify: Error response has correct structure
   - Verify: Error codes appropriate

5. **Test server lifecycle**
   - Test: Server start
   - Test: Server stop
   - Verify: Clean shutdown

**Test Approach**: Unit tests with mocked parser, validate server behavior

### Extension Host Tests (`tests/src/`)

#### Python Client Tests (`pythonClient.test.ts`)

**Test Cases**:
1. **Test service spawning**
   - Mock child_process.spawn
   - Verify: Service process spawned
   - Verify: Communication channels set up

2. **Test sending parse request**
   - Mock stdio communication
   - Send source code
   - Verify: Request formatted correctly
   - Verify: Response received

3. **Test receiving parse response**
   - Mock response from Python service
   - Verify: Graph data parsed correctly
   - Verify: Promise resolves with graph

4. **Test error handling (service unavailable)**
   - Mock service failure
   - Verify: Error thrown appropriately
   - Verify: Error message descriptive

5. **Test service stopping**
   - Start service, then stop
   - Verify: Process terminated
   - Verify: Resources cleaned up

6. **Test health check**
   - Verify: `isServiceRunning` returns correct state
   - Test: Service running → true
   - Test: Service stopped → false

**Test Approach**: Unit tests with mocked child_process, validate client behavior

#### Extension Tests (`extension.test.ts`)

**Test Cases**:
1. **Test extension activation**
   - Mock VS Code API
   - Call activate function
   - Verify: Commands registered
   - Verify: Python client created

2. **Test command registration**
   - Verify: "Visualize AST" command registered
   - Verify: Command handler attached

3. **Test webview panel creation**
   - Trigger command
   - Verify: Webview panel created
   - Verify: Panel configured correctly

4. **Test file watcher setup**
   - Verify: File watcher created
   - Verify: Watcher triggers on save

5. **Test extension deactivation**
   - Call deactivate
   - Verify: Resources cleaned up
   - Verify: Python service stopped

6. **Test message handling from webview**
   - Mock webview message
   - Verify: Message handled correctly
   - Verify: Navigation triggered (if navigateToSource)

**Test Approach**: Unit tests with mocked VS Code API, validate extension behavior

### Webview UI Tests (`webview-ui/src/__tests__/`)

#### Editor Tests (`editor.test.ts`)

**Test Cases**:
1. **Test editor initialization**
   - Create container element
   - Initialize editor
   - Verify: Rete editor created
   - Verify: Plugins configured

2. **Test loading graph from JSON**
   - Create test graph
   - Load into editor
   - Verify: Graph loaded successfully
   - Verify: Nodes rendered

3. **Test clearing graph**
   - Load graph, then clear
   - Verify: Graph cleared
   - Verify: Editor empty

4. **Test getting graph data**
   - Load graph
   - Get graph data
   - Verify: Data matches input

5. **Test node click event handling**
   - Register click handler
   - Simulate node click
   - Verify: Handler called with correct data

**Test Approach**: Unit tests with mocked Rete.js, validate editor behavior

#### Node Component Tests (`nodes/ASTNode.test.tsx`)

**Test Cases**:
1. **Test base node component rendering**
   - Render with test data
   - Verify: Component renders
   - Verify: Node data displayed

2. **Test node data display**
   - Render with specific data
   - Verify: Data fields visible
   - Verify: Formatting correct

3. **Test node styling**
   - Render node
   - Verify: Styles applied
   - Verify: Theme colors used

4. **Test node factory function**
   - Call factory with node type
   - Verify: Correct component returned
   - Verify: Unknown type handled

**Test Approach**: React Testing Library, validate component rendering and behavior

#### App Component Tests (`App.test.tsx`)

**Test Cases**:
1. **Test message listener setup**
   - Render app
   - Verify: Message listener registered
   - Verify: Listener calls handler

2. **Test handling graph update messages**
   - Send updateGraph message
   - Verify: Graph updated in editor
   - Verify: UI refreshed

3. **Test handling error messages**
   - Send error message
   - Verify: Error displayed
   - Verify: Error message visible

4. **Test sending navigation messages**
   - Trigger node click
   - Verify: Navigation message sent
   - Verify: Message format correct

5. **Test loading state**
   - Set loading state
   - Verify: Loading indicator shown
   - Verify: Graph not interactive

6. **Test error display**
   - Set error state
   - Verify: Error message displayed
   - Verify: Error styling applied

**Test Approach**: React Testing Library with mocked VS Code API, validate app behavior

### Integration Tests (`tests/integration/`)

#### End-to-End Tests (`e2e/`)

**Test Cases**:
1. **Test full workflow: File → Parse → Visualize**
   - Create test Python file
   - Trigger visualization command
   - Verify: Python service parses file
   - Verify: Graph sent to webview
   - Verify: Graph rendered

2. **Test node click → Navigation**
   - Render graph with known line numbers
   - Click node
   - Verify: Editor navigates to correct line
   - Verify: Code highlighted

3. **Test file save → Auto-refresh**
   - Open visualization
   - Modify source file
   - Save file
   - Verify: Graph automatically updated
   - Verify: New nodes appear

4. **Test error handling end-to-end**
   - Provide invalid Python code
   - Verify: Error propagated through all layers
   - Verify: User sees error message

**Test Approach**: Integration tests with real VS Code extension, validate full workflow

## Test Infrastructure

### Python Testing

**Framework**: `unittest` (standard library)

**Test Structure**:
```
tests/
├── python_service/
│   ├── test_schema.py
│   ├── test_parser.py
│   └── test_server.py
└── conftest.py  # Shared fixtures
```

**Running Tests**:
```bash
python -m pytest tests/
python -m unittest discover tests/
```

**Coverage**:
```bash
coverage run -m pytest tests/
coverage report
```

### TypeScript Testing

**Framework**: Jest or Mocha (to be determined)

**Test Structure**:
```
tests/
├── src/
│   ├── pythonClient.test.ts
│   └── extension.test.ts
webview-ui/src/__tests__/
├── editor.test.ts
├── App.test.tsx
└── nodes/
    └── ASTNode.test.tsx
```

**Running Tests**:
```bash
npm test
```

**Coverage**:
```bash
npm run test:coverage
```

### Integration Testing

**Framework**: VS Code Extension Test Runner

**Test Structure**:
```
tests/integration/
└── e2e/
    ├── workflow.test.ts
    └── navigation.test.ts
```

**Running Tests**:
```bash
npm run test:integration
```

## Test Data and Fixtures

### Python Test Fixtures

**Sample Python Code**:
- Simple expressions (`x + y`)
- Function definitions
- Class definitions
- Complex nested structures
- Edge cases (empty functions, nested classes)

**Expected Graph Structures**:
- Pre-defined expected graphs for comparison
- Graph validation helpers

### TypeScript Test Fixtures

**Mock Data**:
- Sample ReteGraph structures
- Mock VS Code API responses
- Mock Python service responses

**Mock Implementations**:
- Mocked child_process
- Mocked VS Code API
- Mocked Rete.js editor

## Test Validation Criteria

### Unit Tests

- ✅ All tests pass
- ✅ Tests validate functionality, not implementation
- ✅ Tests can fail (not always passing)
- ✅ Tests are independent (no shared state)
- ✅ Tests are fast (< 1 second each)

### Integration Tests

- ✅ End-to-end workflow verified
- ✅ All components communicate correctly
- ✅ Error handling works across layers
- ✅ Performance acceptable (< 5 seconds for full workflow)

### Coverage Goals

- **Python Service**: > 90% code coverage
- **Extension Host**: > 85% code coverage
- **Webview UI**: > 80% code coverage
- **Critical Paths**: 100% coverage (parsing, communication, rendering)

## Continuous Testing

### Pre-Commit Hooks

- Run linting (`ruff check`, `mypy`, TypeScript compiler)
- Run unit tests
- Verify no regressions

### CI/CD Pipeline

- Run full test suite on pull requests
- Run integration tests on merge
- Generate coverage reports
- Performance benchmarks

## Test Maintenance

### Keeping Tests Valid

- **Fix broken tests**: If test fails due to test logic error, fix the test
- **Update tests with code**: When code changes, update tests accordingly
- **Remove obsolete tests**: Delete tests for removed functionality
- **Refactor tests**: Keep tests clean and maintainable

### Test Documentation

- Document test purpose in test docstrings
- Explain complex test scenarios
- Document test fixtures and their purpose

## Performance Testing

### Large File Testing

**Test Cases**:
1. Parse file with 100+ AST nodes
2. Render graph with 100+ nodes
3. Measure parse time (< 1 second)
4. Measure render time (< 2 seconds)
5. Verify UI remains responsive

### Stress Testing

**Test Cases**:
1. Rapid file saves (debouncing)
2. Multiple visualization panels
3. Very large files (1000+ nodes)
4. Memory usage monitoring

## Error Scenario Testing

### Python Service Errors

- Invalid Python syntax
- Service crash recovery
- Communication failures

### Extension Host Errors

- Python service unavailable
- Webview communication failures
- VS Code API errors

### Webview Errors

- Invalid graph data
- Rendering failures
- Message handling errors

## Test Execution Strategy

### Development Workflow

1. **Write test first** (TDD)
2. **Run test** (should fail)
3. **Implement code** (make test pass)
4. **Refactor** (keep tests passing)
5. **Run all tests** (verify no regressions)

### Before Committing

1. Run linting
2. Run type checking
3. Run unit tests
4. Run integration tests (if changed integration code)
5. Verify coverage maintained

### Before Release

1. Run full test suite
2. Run performance tests
3. Run stress tests
4. Verify all acceptance criteria met
