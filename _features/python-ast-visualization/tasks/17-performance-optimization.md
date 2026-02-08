# Background

This task optimizes performance for large ASTs (100+ nodes) to ensure the visualization remains responsive and fast. Performance optimizations may include parser optimizations, rendering optimizations, and worker support. This task depends on all previous implementation tasks. Following TDD principles, tests must be written before implementation.

# This Task

1. Profile Python parser performance:
   - Identify bottlenecks in parser
   - Measure parse time for various file sizes
   - Optimize node ID generation if needed
   - Optimize connection creation

2. Optimize node ID generation:
   - Ensure deterministic and fast ID generation
   - Cache ID mappings if beneficial
   - Avoid unnecessary string operations

3. Implement worker support for large graphs (if needed):
   - Use Web Workers for graph processing
   - Offload heavy computations to worker
   - Maintain UI responsiveness

4. Optimize React component rendering:
   - Use React.memo for node components
   - Use useMemo for expensive computations
   - Avoid unnecessary re-renders
   - Implement virtual scrolling if needed

5. Debounce graph updates:
   - Debounce rapid graph updates
   - Batch multiple updates
   - Prevent UI freezing

6. Optimize Rete.js rendering:
   - Configure Rete.js for performance
   - Use efficient rendering strategies
   - Limit visible nodes if needed

**Acceptance Criteria**:
- Large files parse in < 1 second
- Large graphs render in < 2 seconds
- UI remains responsive during parsing/rendering
- Performance tests pass
- No memory leaks

# Testing Needed

1. Write performance test: `tests/performance/performance.test.py::test_parse_large_file`
   - Parse file with 100+ nodes
   - Measure parse time
   - Verify < 1 second
   - Test with 500+ nodes

2. Write performance test: `tests/performance/performance.test.ts::test_render_large_graph`
   - Render graph with 100+ nodes
   - Measure render time
   - Verify < 2 seconds
   - Test with 500+ nodes

3. Write test: `tests/performance/performance.test.ts::test_worker_support` (if implemented)
   - Verify worker support works
   - Test worker communication
   - Verify performance improvement

4. Write test: `tests/performance/performance.test.ts::test_debouncing_behavior`
   - Verify debouncing works correctly
   - Test debounce timing
   - Verify no performance degradation

5. Write test: `tests/performance/performance.test.ts::test_memory_usage`
   - Monitor memory usage during parsing
   - Monitor memory usage during rendering
   - Verify no memory leaks
   - Test with very large files

6. Write test: `tests/performance/performance.test.ts::test_ui_responsiveness`
   - Parse large file
   - Verify UI remains responsive
   - Test user interactions during parsing
   - Verify no UI freezing

7. Manual validation: Performance testing:
   - Test with various file sizes
   - Measure parse and render times
   - Verify UI responsiveness
   - Test with very large files (1000+ nodes)
