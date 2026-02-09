"""Performance tests for Python AST parser."""

import time
import unittest

from python_service.parser import ReteConverter


def make_large_source(node_count: int) -> str:
    """Generate Python source with many nodes (Name, Constant, etc.)."""
    lines = ["def f():"]
    for i in range(node_count - 1):
        lines.append(f"    x{i} = {i}")
    return "\n".join(lines)


class TestParsePerformance(unittest.TestCase):
    """Parse performance tests."""

    def test_parse_large_file_under_one_second(self) -> None:
        """Parse 100+ nodes in under 1 second."""
        source = make_large_source(120)
        converter = ReteConverter()
        start = time.perf_counter()
        graph = converter.parse_to_rete(source)
        elapsed = time.perf_counter() - start
        self.assertGreaterEqual(len(graph.nodes), 100)
        self.assertLess(elapsed, 1.0, f"Parse took {elapsed:.2f}s, expected < 1s")


if __name__ == "__main__":
    unittest.main()
