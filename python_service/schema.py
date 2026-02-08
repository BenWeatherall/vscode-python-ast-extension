"""Pydantic models for Rete.js graph structure.

These models define the data contract between the Python AST parsing service
and the TypeScript/webview components.
"""

from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class Socket(BaseModel):
    """Socket definition for Rete.js node inputs/outputs.

    Empty for now, extensible for future socket metadata.
    """

    pass


class NodeData(BaseModel):
    """Data payload for a Rete node.

    Attributes:
        ast_type: AST node type (e.g., 'BinOp', 'FunctionDef').
        lineno: Source line number, if available.
        col_offset: Source column offset, if available.
    """

    model_config = ConfigDict(extra="allow")

    ast_type: str = Field(..., description="AST node type (e.g., 'BinOp', 'FunctionDef')")
    lineno: Optional[int] = Field(None, description="Source line number")
    col_offset: Optional[int] = Field(None, description="Source column offset")


class ReteNode(BaseModel):
    """Rete.js node structure.

    Attributes:
        id: Unique node identifier.
        label: Display label for the node.
        inputs: Input sockets dictionary.
        outputs: Output sockets dictionary.
        data: Node data payload.
        position: Optional x,y position for layout.
    """

    id: str = Field(..., description="Unique node identifier")
    label: str = Field(..., description="Display label for the node")
    inputs: Dict[str, Socket] = Field(default_factory=dict, description="Input sockets")
    outputs: Dict[str, Socket] = Field(default_factory=dict, description="Output sockets")
    data: NodeData = Field(..., description="Node data payload")
    position: Optional[Dict[str, float]] = Field(None, description="Optional x,y position")


class ReteConnection(BaseModel):
    """Connection between two Rete nodes.

    Attributes:
        source: Source node ID.
        source_output: Source socket name.
        target: Target node ID.
        target_input: Target socket name.
    """

    source: str = Field(..., description="Source node ID")
    source_output: str = Field(..., description="Source socket name")
    target: str = Field(..., description="Target node ID")
    target_input: str = Field(..., description="Target socket name")


class ReteGraph(BaseModel):
    """Complete Rete.js graph structure.

    Attributes:
        nodes: List of nodes in the graph.
        connections: List of connections between nodes.
    """

    nodes: List[ReteNode] = Field(default_factory=list, description="List of nodes")
    connections: List[ReteConnection] = Field(
        default_factory=list, description="List of connections"
    )
