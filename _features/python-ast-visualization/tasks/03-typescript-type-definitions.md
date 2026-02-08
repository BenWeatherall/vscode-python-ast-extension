# Background

This task defines TypeScript interfaces matching the Python Pydantic models created in Task 02. These interfaces ensure type safety across the TypeScript/JavaScript codebase and maintain consistency with the Python service. This task depends on Task 02 (Python Schema Models) to ensure the TypeScript types match the Python model structure.

# This Task

1. Create `webview-ui/src/types.ts` with the following TypeScript interfaces:
   - `Socket` interface: Empty interface matching Python Socket model
   - `NodeData` interface with:
     - `astType: string` - AST node type (camelCase conversion from Python snake_case)
     - `lineno?: number` - Optional source line number
     - `colOffset?: number` - Optional source column offset
     - `[key: string]: unknown` - Index signature for extra fields
   - `ReteNode` interface with:
     - `id: string` - Unique node identifier
     - `label: string` - Display label
     - `inputs: Record<string, Socket>` - Input sockets
     - `outputs: Record<string, Socket>` - Output sockets
     - `data: NodeData` - Node data payload
     - `position?: { x: number; y: number }` - Optional position
   - `ReteConnection` interface with:
     - `source: string` - Source node ID
     - `sourceOutput: string` - Source socket name (camelCase)
     - `target: string` - Target node ID
     - `targetInput: string` - Target socket name (camelCase)
   - `ReteGraph` interface with:
     - `nodes: ReteNode[]` - Array of nodes
     - `connections: ReteConnection[]` - Array of connections
   - `VSCodeMessage` interface for extension ↔ webview communication with:
     - `type: 'updateGraph' | 'error' | 'navigateToSource'` - Message type
     - `graph?: ReteGraph` - Optional graph data
     - `error?: string` - Optional error message
     - `nodeId?: string` - Optional node ID for navigation
     - `lineno?: number` - Optional line number for navigation
     - `colOffset?: number` - Optional column offset for navigation

2. Create type conversion utilities (if needed) to handle snake_case ↔ camelCase conversion:
   - Function to convert Python JSON (snake_case) to TypeScript objects (camelCase)
   - Function to convert TypeScript objects (camelCase) to Python JSON (snake_case)

3. Ensure field names match Python models (with proper case conversion in serialization layer)

**Acceptance Criteria**:
- All TypeScript interfaces defined
- Types compile without errors
- Types match Python model structure (with case conversion)
- Type guards work correctly (if implemented)
- JSON serialization compatible with Python output
- VSCodeMessage interface supports all message types

# Testing Needed

1. Write test: `webview-ui/src/__tests__/types.test.ts::test_type_compatibility_with_python_models`
   - Verify TypeScript types match Python model structure
   - Test that all required fields are present
   - Test that optional fields are correctly marked as optional

2. Write test: `webview-ui/src/__tests__/types.test.ts::test_json_serialization`
   - Serialize TypeScript interfaces to JSON
   - Deserialize JSON to TypeScript interfaces
   - Verify data integrity through round-trip conversion

3. Write test: `webview-ui/src/__tests__/types.test.ts::test_type_guards` (if implemented)
   - Create runtime type guards for validation
   - Test type guards correctly identify valid/invalid objects
   - Test type guards handle edge cases

4. Write test: `webview-ui/src/__tests__/types.test.ts::test_case_conversion` (if conversion utilities created)
   - Test snake_case to camelCase conversion
   - Test camelCase to snake_case conversion
   - Verify all fields converted correctly
   - Test edge cases (empty objects, nested structures)

5. Manual validation: Verify TypeScript compiler:
   - Run `tsc --noEmit` and verify no type errors
   - Verify all interfaces are properly exported
