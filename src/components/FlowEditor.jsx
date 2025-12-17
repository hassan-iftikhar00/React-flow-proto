import React, { useCallback, useRef, useEffect, useState } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import Toolbar from "./Toolbar";
import {
  PlayNode,
  MenuNode,
  CollectNode,
  DecisionNode,
  TransferNode,
  TTSNode,
  STTNode,
  SetVariableNode,
  EndNode,
  TerminatorNode,
} from "./CustomNode";

let id = 5;
const getId = () => `${id++}`;

const initialNodes = [
  {
    id: "1",
    type: "play",
    data: {
      label: "Start",
      text: "Welcome to the call flow",
    },
    position: { x: 100, y: 50 },
  },
  {
    id: "2",
    type: "decision",
    data: {
      label: "Decision",
      condition: "Check user input",
    },
    position: { x: 100, y: 200 },
  },
];

const initialEdges = [
  {
    id: "edge-1-2",
    source: "1",
    target: "2",
    animated: true,
    markerEnd: { type: MarkerType.Arrow },
    style: { stroke: "#06b6d4", strokeWidth: 2 },
  },
];

const nodeTypes = {
  play: PlayNode,
  menu: MenuNode,
  collect: CollectNode,
  decision: DecisionNode,
  transfer: TransferNode,
  tts: TTSNode,
  stt: STTNode,
  set: SetVariableNode,
  end: EndNode,
  terminator: TerminatorNode,
};

function FlowEditorContent({ flowAction, setFlowAction }) {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const lastNodeIdRef = useRef(null);

  // On initial mount, set lastNodeIdRef to the hardcoded Decision node's id
  useEffect(() => {
    if (nodes.length >= 2) {
      // Decision node is the second node in initialNodes
      lastNodeIdRef.current = nodes[1].id;
    }
  }, []);

  // Get the currently selected element (node or edge)
  const selectedElement = selectedNode
    ? {
        ...selectedNode,
        // Get the current node from state to reflect updates
        ...(nodes.find((n) => n.id === selectedNode.id) || {}),
      }
    : selectedEdge
    ? {
        ...selectedEdge,
        type: "edge",
        // Get the current edge from state to reflect updates
        ...(edges.find((e) => e.id === selectedEdge.id) || {}),
      }
    : null;
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  // Toolbar state
  const [showGrid, setShowGrid] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // add edge
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            markerEnd: { type: MarkerType.Arrow },
          },
          eds
        )
      ),
    [setEdges]
  );

  // 🆕 sidebar click -> add node
  useEffect(() => {
    if (flowAction?.action === "add" && flowAction?.type) {
      // Prevent adding nodes if Terminator or End node exists
      const hasTerminatorOrEnd = nodes.some(
        (n) => n.type === "terminator" || n.type === "end"
      );
      if (hasTerminatorOrEnd) {
        setFlowAction(null);
        return;
      }
      // Create appropriate default data based on node type
      const getDefaultData = (type) => {
        switch (type) {
          case "play":
            return { text: "Enter your prompt here" };
          case "menu":
            return { options: [{ key: "1", label: "Option 1" }] };
          case "collect":
            return { variable: "userInput" };
          case "decision":
            return { condition: "Enter condition" };
          case "transfer":
            return { number: "Enter phone number" };
          case "tts":
            return { text: "Text to convert to speech" };
          case "stt":
            return { variable: "speechText" };
          case "set":
            return { variable: "myVariable", value: "myValue" };
          case "terminator":
            return { label: "Terminator" };
          default:
            return {};
        }
      };

      setNodes((nds) => {
        // Calculate vertical offset to avoid overlap
        const baseX = 250;
        const baseY = 100;
        const nodeSpacing = 120;
        const offsetY = baseY + nds.length * nodeSpacing;
        const newNode = {
          id: getId(),
          type: flowAction.type,
          position: { x: baseX, y: offsetY },
          data: getDefaultData(flowAction.type),
        };

        let updatedNodes = nds.concat(newNode);
        // Only connect to previous node
        if (lastNodeIdRef.current) {
          setEdges((eds) =>
            eds.concat({
              id: `edge-${lastNodeIdRef.current}-${newNode.id}`,
              source: lastNodeIdRef.current,
              target: newNode.id,
              animated: true,
              markerEnd: { type: MarkerType.Arrow },
              style: { stroke: "#06b6d4", strokeWidth: 2 },
            })
          );
        }
        lastNodeIdRef.current = newNode.id;
        return updatedNodes;
      });
      setFlowAction(null); // reset action
    }
  }, [flowAction, setNodes, setFlowAction, setEdges, nodes]);

  // Handle node deletion
  const handleDeleteNode = useCallback((nodeId) => {
    setNodes((nds) => {
      const filteredNodes = nds.filter((node) => node.id !== nodeId);
      // Update lastNodeIdRef to the most recently added node (excluding hardcoded nodes)
      if (filteredNodes.length > 2) {
        // Find the last added node (after hardcoded ones)
        const lastAddedNode = filteredNodes.slice(2).at(-1);
        lastNodeIdRef.current = lastAddedNode ? lastAddedNode.id : filteredNodes[1].id;
      } else {
        // If only hardcoded nodes remain, set to Decision node
        lastNodeIdRef.current = filteredNodes[1]?.id;
      }
      return filteredNodes;
    });
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    // Clear selection if the deleted node was selected
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [setNodes, setEdges, selectedNode]);

  // Update nodes to include delete handler and sequence number
  const nodesWithDeleteHandler = nodes.map((node, idx) => ({
    ...node,
    data: {
      ...node.data,
      id: node.id,
      onDelete: handleDeleteNode,
      sequence: idx + 1,
    },
  }));

  // Toolbar functions
  const handleSave = () => {
    const flowData = { nodes, edges };
    const dataStr = JSON.stringify(flowData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ivr-flow.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const flowData = JSON.parse(e.target.result);
            setNodes(flowData.nodes || []);
            setEdges(flowData.edges || []);
          } catch (error) {
            alert("Invalid file format");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExport = () => {
    const flowData = { nodes, edges };
    console.log("Exporting flow:", flowData);
    alert("Flow exported to console");
  };

  const handleImport = () => {
    alert("Import functionality - to be implemented");
  };

  const handleZoomIn = () => {
    zoomIn();
  };

  const handleZoomOut = () => {
    zoomOut();
  };

  const handleFitView = () => {
    fitView();
  };

  const handleUndo = () => {
    console.log("Undo");
  };

  const handleRedo = () => {
    console.log("Redo");
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all nodes and connections?"
      )
    ) {
      setNodes([]);
      setEdges([]);
    }
  };

  const handleAutoLayout = () => {
    console.log("Auto layout - to be implemented");
  };

  const handleToggleGrid = () => {
    setShowGrid(!showGrid);
  };

  const handleToggleMiniMap = () => {
    setShowMiniMap(!showMiniMap);
  };

  const handleValidateFlow = () => {
    const validation = {
      nodes: nodes.length,
      edges: edges.length,
      startNodes: nodes.filter((n) => !edges.some((e) => e.target === n.id))
        .length,
      endNodes: nodes.filter((n) => !edges.some((e) => e.source === n.id))
        .length,
    };
    alert(
      `Flow Validation:\n• ${validation.nodes} nodes\n• ${validation.edges} connections\n• ${validation.startNodes} start points\n• ${validation.endNodes} end points`
    );
  };

  const handleRunFlow = () => {
    alert("Flow simulation - to be implemented");
  };

  // Advanced toolbar handlers
  const handleUpdateElement = (updates) => {
    if (selectedNode) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNode.id
            ? {
                ...node,
                style: {
                  ...node.style,
                  ...updates,
                },
                data: {
                  ...node.data,
                  style: {
                    ...node.data.style,
                    ...updates,
                  },
                },
              }
            : node
        )
      );
    } else if (selectedEdge) {
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === selectedEdge.id
            ? {
                ...edge,
                // Handle style properties
                style: {
                  ...edge.style,
                  ...(updates.stroke && { stroke: updates.stroke }),
                  ...(updates.strokeWidth && {
                    strokeWidth: updates.strokeWidth,
                  }),
                  ...(updates.strokeDasharray && {
                    strokeDasharray: updates.strokeDasharray,
                  }),
                },
                // Handle other edge properties
                ...(updates.animated !== undefined && {
                  animated: updates.animated,
                }),
              }
            : edge
        )
      );

      // Update the selectedEdge state to reflect changes in toolbar
      setSelectedEdge((prev) =>
        prev
          ? {
              ...prev,
              style: {
                ...prev.style,
                ...updates,
              },
              ...(updates.animated !== undefined && {
                animated: updates.animated,
              }),
            }
          : null
      );
    }
  };

  const handleAddShape = (shapeType) => {
    console.log("Add shape:", shapeType);
    // Implementation for adding shapes
  };

  const handleAddLabel = () => {
    console.log("Add label");
    // Implementation for adding labels
  };

  const handleAddArrow = () => {
    console.log("Add arrow");
    // Implementation for adding arrows
  };

  return (
    <div className="flow-editor-wrapper">
      <Toolbar
        selectedElement={selectedElement}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onToggleGrid={handleToggleGrid}
        onToggleMiniMap={handleToggleMiniMap}
        onAutoLayout={handleAutoLayout}
        showGrid={showGrid}
        showMiniMap={showMiniMap}
        canUndo={false}
        canRedo={false}
        onUpdateElement={handleUpdateElement}
        onAddShape={handleAddShape}
        onAddLabel={handleAddLabel}
        onAddArrow={handleAddArrow}
      />
      <div className="flow-container" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodesWithDeleteHandler}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => {
            setSelectedNode(node);
            setSelectedEdge(null);
          }}
          onEdgeClick={(_, edge) => {
            setSelectedEdge(edge);
            setSelectedNode(null);
          }}
          onPaneClick={() => {
            setSelectedNode(null);
            setSelectedEdge(null);
          }}
          nodeTypes={nodeTypes}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          minZoom={0.3}
          maxZoom={2}
          fitView
          fitViewOptions={{
            padding: 0.2,
            minZoom: 0.5,
            maxZoom: 1.2,
          }}
        >
          {showMiniMap && (
            <MiniMap
              nodeStrokeWidth={3}
              style={{
                height: 100,
                width: 150,
              }}
              pannable
              zoomable
            />
          )}
          {/* <Controls /> */}
          {showGrid && (
            <Background gap={24} color="#64748b" variant="dots" size={2} />
          )}
        </ReactFlow>

        {/* Enhanced config panel */}
        {selectedNode && (
          <div className="config-panel">
            <div className="config-header">
              <h4>⚙️ Configure {selectedNode.type}</h4>
              <button
                className="config-close-btn"
                onClick={() => setSelectedNode(null)}
                title="Close"
              >
                ✕
              </button>
            </div>

            {(selectedNode.type === "play" || selectedNode.type === "terminator") && (
              <>
                <label>Prompt Text:</label>
                <input
                  type="text"
                  value={selectedNode.data.text || ""}
                  onChange={(e) =>
                    setNodes((nds) =>
                      nds.map((n) =>
                        n.id === selectedNode.id
                          ? { ...n, data: { ...n.data, text: e.target.value } }
                          : n
                      )
                    )
                  }
                />
              </>
            )}

            {selectedNode.type === "collect" && (
              <>
                <label>Variable Name:</label>
                <input
                  type="text"
                  value={selectedNode.data.variable || ""}
                  onChange={(e) =>
                    setNodes((nds) =>
                      nds.map((n) =>
                        n.id === selectedNode.id
                          ? {
                              ...n,
                              data: { ...n.data, variable: e.target.value },
                            }
                          : n
                      )
                    )
                  }
                />
              </>
            )}

            {selectedNode.type === "decision" && (
              <>
                <label>Condition:</label>
                <input
                  type="text"
                  value={selectedNode.data.condition || ""}
                  onChange={(e) =>
                    setNodes((nds) =>
                      nds.map((n) =>
                        n.id === selectedNode.id
                          ? {
                              ...n,
                              data: { ...n.data, condition: e.target.value },
                            }
                          : n
                      )
                    )
                  }
                />
              </>
            )}

            {selectedNode.type === "transfer" && (
              <>
                <label>Phone Number:</label>
                <input
                  type="text"
                  value={selectedNode.data.number || ""}
                  onChange={(e) =>
                    setNodes((nds) =>
                      nds.map((n) =>
                        n.id === selectedNode.id
                          ? {
                              ...n,
                              data: { ...n.data, number: e.target.value },
                            }
                          : n
                      )
                    )
                  }
                />
              </>
            )}

            {selectedNode.type === "tts" && (
              <>
                <label>Text to Speak:</label>
                <input
                  type="text"
                  value={selectedNode.data.text || ""}
                  onChange={(e) =>
                    setNodes((nds) =>
                      nds.map((n) =>
                        n.id === selectedNode.id
                          ? { ...n, data: { ...n.data, text: e.target.value } }
                          : n
                      )
                    )
                  }
                />
              </>
            )}

            {selectedNode.type === "stt" && (
              <>
                <label>Store Speech in Variable:</label>
                <input
                  type="text"
                  value={selectedNode.data.variable || ""}
                  onChange={(e) =>
                    setNodes((nds) =>
                      nds.map((n) =>
                        n.id === selectedNode.id
                          ? {
                              ...n,
                              data: { ...n.data, variable: e.target.value },
                            }
                          : n
                      )
                    )
                  }
                />
              </>
            )}

            {selectedNode.type === "set" && (
              <>
                <label>Variable Name:</label>
                <input
                  type="text"
                  value={selectedNode.data.variable || ""}
                  onChange={(e) =>
                    setNodes((nds) =>
                      nds.map((n) =>
                        n.id === selectedNode.id
                          ? {
                              ...n,
                              data: { ...n.data, variable: e.target.value },
                            }
                          : n
                      )
                    )
                  }
                />
                <label>Value:</label>
                <input
                  type="text"
                  value={selectedNode.data.value || ""}
                  onChange={(e) =>
                    setNodes((nds) =>
                      nds.map((n) =>
                        n.id === selectedNode.id
                          ? { ...n, data: { ...n.data, value: e.target.value } }
                          : n
                      )
                    )
                  }
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Main FlowEditor component wrapped with ReactFlowProvider
export default function FlowEditor({ flowAction, setFlowAction }) {
  return (
    <ReactFlowProvider>
      <FlowEditorContent
        flowAction={flowAction}
        setFlowAction={setFlowAction}
      />
    </ReactFlowProvider>
  );
}
