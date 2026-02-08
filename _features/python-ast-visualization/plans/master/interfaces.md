# Interface Definitions

## Overview

This document defines all public interfaces, function signatures, data models, and contracts for the Python AST visualization feature. All interfaces follow TypeScript/Python type hints and enable clear contracts between components.

## Python Service Interfaces

### Schema Models (`python_service/schema.py`)

#### ReteNode

```python
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

class Socket(BaseModel):
    """Socket definition for Rete.js node inputs/outputs."""
    pass  # Empty for now, can be extended with socket metadata

class NodeData(BaseModel):
    """Data payload for a Rete node."""
    ast_type: str = Field(..., description="AST node type (e.g., 'BinOp', 'FunctionDef')")
    lineno: Optional[int] = Field(None, description="Source line number")
    col_offset: Optional[int] = Field(None, description="Source column offset")
    
    class Config:
        extra = "allow"  # Allow type-specific fields

class ReteNode(BaseModel):
    """Rete.js node structure."""
    id: str = Field(..., description="Unique node identifier")
    label: str = Field(..., description="Display label for the node")
    inputs: Dict[str, Socket] = Field(default_factory=dict, description="Input sockets")
    outputs: Dict[str, Socket] = Field(default_factory=dict, description="Output sockets")
    data: NodeData = Field(..., description="Node data payload")
    position: Optional[Dict[str, float]] = Field(None, description="Optional x,y position")
```

#### ReteConnection

```python
class ReteConnection(BaseModel):
    """Connection between two Rete nodes."""
    source: str = Field(..., description="Source node ID")
    source_output: str = Field(..., description="Source socket name")
    target: str = Field(..., description="Target node ID")
    target_input: str = Field(..., description="Target socket name")
```

#### ReteGraph

```python
from typing import List

class ReteGraph(BaseModel):
    """Complete Rete.js graph structure."""
    nodes: List[ReteNode] = Field(default_factory=list, description="List of nodes")
    connections: List[ReteConnection] = Field(default_factory=list, description="List of connections")
```

### Parser Interface (`python_service/parser.py`)

#### ReteConverter

```python
import ast
from typing import List
from .schema import ReteGraph, ReteNode, ReteConnection

class ReteConverter(ast.NodeVisitor):
    """Converts Python AST to Rete.js graph structure."""
    
    def __init__(self) -> None:
        """Initialize converter with empty graph."""
        self.nodes: List[ReteNode] = []
        self.connections: List[ReteConnection] = []
        self._node_id_map: Dict[int, str] = {}  # AST node ID -> Rete node ID
    
    def parse_to_rete(self, source_code: str) -> ReteGraph:
        """
        Parse Python source code and convert to Rete graph.
        
        Args:
            source_code: Python source code string
            
        Returns:
            ReteGraph with nodes and connections
            
        Raises:
            SyntaxError: If source code is invalid Python
        """
        pass
    
    def visit_BinOp(self, node: ast.BinOp) -> None:
        """Handle binary operation nodes."""
        pass
    
    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        """Handle function definition nodes."""
        pass
    
    def visit_ClassDef(self, node: ast.ClassDef) -> None:
        """Handle class definition nodes."""
        pass
    
    # Additional visit_* methods for other AST node types
```

### Server Interface (`python_service/server.py`)

```python
from typing import Dict, Any
from .parser import ReteConverter
from .schema import ReteGraph

class ASTParseServer:
    """Server for handling AST parse requests."""
    
    def __init__(self, parser: ReteConverter) -> None:
        """
        Initialize server with parser instance.
        
        Args:
            parser: ReteConverter instance for parsing
        """
        self.parser = parser
    
    def handle_parse_request(self, source_code: str) -> Dict[str, Any]:
        """
        Handle parse request and return graph data.
        
        Args:
            source_code: Python source code to parse
            
        Returns:
            Dictionary with 'result' containing ReteGraph or 'error' with error info
        """
        pass
    
    def start_server(self) -> None:
        """Start the server (stdio or JSON-RPC)."""
        pass
    
    def stop_server(self) -> None:
        """Stop the server gracefully."""
        pass
```

## Extension Host Interfaces

### Python Client (`src/pythonClient.ts`)

```typescript
import { ChildProcess } from 'child_process';

export interface ReteGraph {
    nodes: ReteNode[];
    connections: ReteConnection[];
}

export interface ReteNode {
    id: string;
    label: string;
    inputs: Record<string, Socket>;
    outputs: Record<string, Socket>;
    data: NodeData;
    position?: { x: number; y: number };
}

export interface ReteConnection {
    source: string;
    sourceOutput: string;
    target: string;
    targetInput: string;
}

export interface NodeData {
    astType: string;
    lineno?: number;
    colOffset?: number;
    [key: string]: unknown;
}

export interface Socket {
    // Empty for now, can be extended
}

export interface ParseRequest {
    method: 'parse';
    params: {
        sourceCode: string;
    };
}

export interface ParseResponse {
    result?: ReteGraph;
    error?: {
        code: number;
        message: string;
    };
}

export class PythonClient {
    private process: ChildProcess | null = null;
    
    /**
     * Spawn Python service process.
     * @returns Promise that resolves when service is ready
     */
    async spawnService(): Promise<void>;
    
    /**
     * Parse Python source code to Rete graph.
     * @param sourceCode Python source code string
     * @returns Promise resolving to ReteGraph
     * @throws Error if parsing fails or service unavailable
     */
    async parseAST(sourceCode: string): Promise<ReteGraph>;
    
    /**
     * Stop Python service process.
     */
    stopService(): void;
    
    /**
     * Check if Python service is running.
     * @returns true if service is active
     */
    isServiceRunning(): boolean;
}
```

### Extension Entry Point (`src/extension.ts`)

```typescript
import * as vscode from 'vscode';
import { PythonClient } from './pythonClient';

export interface VSCodeMessage {
    type: 'updateGraph' | 'error' | 'navigateToSource';
    graph?: ReteGraph;
    error?: string;
    nodeId?: string;
    lineno?: number;
    colOffset?: number;
}

export function activate(context: vscode.ExtensionContext): void {
    /**
     * Activate extension and register commands.
     */
}

export function deactivate(): void {
    /**
     * Cleanup extension resources.
     */
}

function createVisualizationPanel(
    context: vscode.ExtensionContext,
    pythonClient: PythonClient
): vscode.WebviewPanel {
    /**
     * Create and configure webview panel for visualization.
     */
}

function registerCommands(
    context: vscode.ExtensionContext,
    pythonClient: PythonClient
): void {
    /**
     * Register VS Code commands (e.g., 'python-ast.visualize').
     */
}
```

## Webview UI Interfaces

### Rete Editor (`webview-ui/src/editor.ts`)

```typescript
import { NodeEditor } from 'rete';
import { ReteGraph } from '../types';

export interface ASTEditor {
    /**
     * Initialize Rete.js editor in container.
     * @param container HTML element to render editor in
     */
    initialize(container: HTMLElement): void;
    
    /**
     * Load graph data into editor.
     * @param graph Rete graph structure
     */
    loadGraph(graph: ReteGraph): void;
    
    /**
     * Clear current graph.
     */
    clearGraph(): void;
    
    /**
     * Get current graph data.
     * @returns Current graph structure
     */
    getGraph(): ReteGraph;
    
    /**
     * Register handler for node click events.
     * @param handler Function called with node ID and data
     */
    onNodeClick(handler: (nodeId: string, data: NodeData) => void): void;
}

export class ReteASTEditor implements ASTEditor {
    private editor: NodeEditor | null = null;
    private nodeClickHandlers: Array<(nodeId: string, data: NodeData) => void> = [];
    
    initialize(container: HTMLElement): void;
    loadGraph(graph: ReteGraph): void;
    clearGraph(): void;
    getGraph(): ReteGraph;
    onNodeClick(handler: (nodeId: string, data: NodeData) => void): void;
}
```

### Node Components (`webview-ui/src/nodes/`)

```typescript
import { Node } from 'rete';
import { NodeData } from '../types';

export interface ASTNodeComponent {
    /**
     * Update node data.
     * @param data New node data
     */
    updateData(data: NodeData): void;
    
    /**
     * Highlight node (selected state).
     * @param active Whether node is active/selected
     */
    highlight(active: boolean): void;
}

export interface NodeComponentProps {
    node: Node;
    data: NodeData;
    selected?: boolean;
}

// Base AST Node Component
export function ASTNode(props: NodeComponentProps): JSX.Element;

// Specific node type components
export function BinOpNode(props: NodeComponentProps): JSX.Element;
export function FunctionDefNode(props: NodeComponentProps): JSX.Element;
export function ClassDefNode(props: NodeComponentProps): JSX.Element;
export function CallNode(props: NodeComponentProps): JSX.Element;
export function NameNode(props: NodeComponentProps): JSX.Element;
```

### App Component (`webview-ui/src/App.tsx`)

```typescript
import { ReteGraph, VSCodeMessage } from '../types';

export interface AppState {
    graph: ReteGraph | null;
    loading: boolean;
    error: string | null;
}

export function App(): JSX.Element {
    /**
     * Main React app component.
     * Handles message communication with extension host.
     */
}

function handleMessage(message: VSCodeMessage): void {
    /**
     * Handle messages from extension host.
     */
}

function updateGraph(graph: ReteGraph): void {
    /**
     * Update graph in editor.
     */
}

function handleNodeClick(nodeId: string, lineno?: number, colOffset?: number): void {
    /**
     * Send navigation message to extension host.
     */
}

function sendMessage(message: VSCodeMessage): void {
    /**
     * Send message to extension host.
     */
}
```

## Type Definitions (`webview-ui/src/types.ts`)

```typescript
export interface ReteGraph {
    nodes: ReteNode[];
    connections: ReteConnection[];
}

export interface ReteNode {
    id: string;
    label: string;
    inputs: Record<string, Socket>;
    outputs: Record<string, Socket>;
    data: NodeData;
    position?: { x: number; y: number };
}

export interface ReteConnection {
    source: string;
    sourceOutput: string;
    target: string;
    targetInput: string;
}

export interface NodeData {
    astType: string;
    lineno?: number;
    colOffset?: number;
    [key: string]: unknown;
}

export interface Socket {
    // Empty for now
}

export interface VSCodeMessage {
    type: 'updateGraph' | 'error' | 'navigateToSource';
    graph?: ReteGraph;
    error?: string;
    nodeId?: string;
    lineno?: number;
    colOffset?: number;
}
```

## Interface Contracts

### Data Validation Contract

- **Python Side**: All data validated via Pydantic models before sending
- **TypeScript Side**: Type checking ensures interface compliance
- **Boundary Validation**: Data validated at component boundaries only
- **No Re-validation**: Once validated, data is trusted (per project practices)

### Communication Contract

- **Request/Response**: All communication follows JSON-RPC-like protocol
- **Error Handling**: Errors returned in standard format with codes
- **Message Types**: Well-defined message types for extension ↔ webview
- **Async Operations**: All I/O operations are async/await

### Lifecycle Contract

- **Initialization**: Components initialize in dependency order
- **Cleanup**: All resources cleaned up on deactivation/shutdown
- **Error Recovery**: Components handle errors gracefully without crashing

## Dependency Relationships

```
Python Service:
  parser.py → schema.py
  server.py → parser.py, schema.py

Extension Host:
  extension.ts → pythonClient.ts
  extension.ts → vscode API

Webview UI:
  App.tsx → editor.ts, nodes/
  editor.ts → rete libraries
  nodes/ → rete, react
```

## Interface Stability

- **Public Interfaces**: Stable, changes require coordination
- **Internal Interfaces**: Can change without notice
- **Model Interfaces**: Stable, changes require migration plan
- **Communication Protocol**: Versioned for future compatibility
