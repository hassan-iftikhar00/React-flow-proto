import React, { useCallback, useRef, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
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
  RecordNode,
  DTMFNode,
  DDTMFNode,
  WaitNode,
  TTSNode,
  STTNode,
  ISSTNode,
  TerminatorNode,
} from "./CustomNode";
import {
  useLocalStorage,
  getLocalStorageItem,
  setLocalStorageItem,
} from "../hooks/useLocalStorage";
import { Settings, X } from "lucide-react";
import { GearIcon, XCircleIcon } from "@phosphor-icons/react";
import IVRInputConfig from "./IVRInputConfig";
import VersionHistory from "./VersionHistory";
import FlowAnalytics from "./FlowAnalytics";
import ActivityLog from "./ActivityLog";
import CommentsPanel from "./CommentsPanel";
import InlineSearch from "./InlineSearch";
import { getNodeCommentCount } from "../utils/commentStorage";

// Load the last used ID from localStorage
let id = parseInt(getLocalStorageItem("flowEditor_lastNodeId", "5"));
const getId = () => {
  const newId = `${id++}`;
  setLocalStorageItem("flowEditor_lastNodeId", id.toString());
  return newId;
};

const defaultInitialNodes = [
  {
    id: "1",
    type: "play",
    data: {
      label: "Start",
      text: "Welcome to the call flow",
      br: true, // Default BR value
    },
    position: { x: 100, y: 50 },
  },
];

const defaultInitialEdges = [];

const nodeTypes = {
  play: PlayNode,
  menu: MenuNode,
  collect: CollectNode,
  record: RecordNode,
  dtmf: DTMFNode,
  ddtmf: DDTMFNode,
  wait: WaitNode,
  tts: TTSNode,
  stt: STTNode,
  istt: ISSTNode,
  terminator: TerminatorNode,
};

function FlowEditorContent({
  flowAction,
  setFlowAction,
  currentFlowId,
  fieldsMappingList = [],
  initialSelectedNodeId = null,
}) {
  const { currentUser } = useAuth();
  const reactFlowWrapper = useRef(null);
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  // Load nodes and edges from localStorage based on current flow ID
  const getStorageKey = (suffix) =>
    currentFlowId ? `flow_${currentFlowId}_${suffix}` : `flowEditor_${suffix}`;

  const [nodes, setNodes, onNodesChange] = useNodesState(
    getLocalStorageItem(getStorageKey("nodes"), defaultInitialNodes)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    getLocalStorageItem(getStorageKey("edges"), defaultInitialEdges)
  );
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const lastNodeIdRef = useRef(null);

  // Auto-select node from URL parameter
  useEffect(() => {
    if (initialSelectedNodeId && nodes.length > 0 && fitView) {
      const nodeToSelect = nodes.find((n) => n.id === initialSelectedNodeId);
      if (nodeToSelect) {
        setSelectedNode(nodeToSelect);
        // Center and zoom to the node
        setTimeout(() => {
          fitView({
            padding: 0.3,
            nodes: [nodeToSelect],
            duration: 500,
          });
        }, 100);
      }
    }
  }, [initialSelectedNodeId, nodes, fitView]);

  // Update selectedNode when nodes change to reflect current data
  useEffect(() => {
    if (selectedNode) {
      const updatedNode = nodes.find((n) => n.id === selectedNode.id);
      if (updatedNode) {
        setSelectedNode(updatedNode);
      }
    }
  }, [nodes]);

  // On initial mount, set lastNodeIdRef to the last node in the flow
  useEffect(() => {
    if (nodes.length >= 1) {
      // Set to the last node instead of first - this is where user is working
      lastNodeIdRef.current = nodes[nodes.length - 1].id;
    }
  }, []);

  // Update lastNodeIdRef when user selects a node (they're working on that part of flow)
  useEffect(() => {
    if (selectedNode) {
      lastNodeIdRef.current = selectedNode.id;
    }
  }, [selectedNode]);

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

  // Toolbar state
  const [showGrid, setShowGrid] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [configTab, setConfigTab] = useState("config"); // "config" or "comments"
  const lastSaveRef = useRef(Date.now());

  // Function to save version snapshot
  const saveVersionSnapshot = useCallback(
    (message = "Auto-saved") => {
      if (!currentFlowId) return;

      const historyKey = `flow_${currentFlowId}_history`;
      const existingVersions = getLocalStorageItem(historyKey, []);

      const newVersion = {
        id: `v_${Date.now()}`,
        timestamp: Date.now(),
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
        message: message,
        user: "Current User", // Can be replaced with actual user from auth
      };

      // Keep last 50 versions
      const updatedVersions = [newVersion, ...existingVersions].slice(0, 50);
      setLocalStorageItem(historyKey, updatedVersions);
    },
    [nodes, edges, currentFlowId]
  );

  // Auto-save nodes and edges to localStorage whenever they change
  useEffect(() => {
    setLocalStorageItem(getStorageKey("nodes"), nodes);

    // Auto-save version snapshot every 2 minutes or on significant changes
    const now = Date.now();
    if (now - lastSaveRef.current > 120000 && nodes.length > 0) {
      // 2 minutes
      saveVersionSnapshot();
      lastSaveRef.current = now;
    }
  }, [nodes, currentFlowId, saveVersionSnapshot]);

  useEffect(() => {
    setLocalStorageItem(getStorageKey("edges"), edges);
  }, [edges, currentFlowId]);

  // Load flow data when currentFlowId changes
  useEffect(() => {
    if (currentFlowId) {
      const savedNodes = getLocalStorageItem(
        getStorageKey("nodes"),
        defaultInitialNodes
      );
      const savedEdges = getLocalStorageItem(
        getStorageKey("edges"),
        defaultInitialEdges
      );
      setNodes(savedNodes);
      setEdges(savedEdges);
    }
  }, [currentFlowId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + F: Open search
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setShowSearch(true);
      }

      // ESC: Close search/panels
      if (e.key === "Escape") {
        setShowSearch(false);
        setShowVersionHistory(false);
        setShowAnalytics(false);
        setShowActivityLog(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
            return {
              text: "Enter your prompt here",
              br: true, // Default BR value for new play nodes
            };
          case "menu":
            return {
              promptText: "Please select an option",
              timeout: "3",
              trackInvalid: false,
              trackNoResponse: false,
              invalidUseStandardMessage: false,
              invalidAction: "repeat",
              invalidGotoTarget: "",
              noResponseUseStandardMessage: false,
              noResponseAction: "repeat",
              noResponseGotoTarget: "",
              options: [
                { id: 1, key: "1", label: "Option 1", targetNodeId: "" },
              ],
            };
          case "collect":
            return { variable: "userInput" };
          case "tts":
            return { text: "Text to convert to speech" };
          case "stt":
            return {
              promptText: "",
              promptText2: "",
              aiPromptEnabled: false,
              addDefaultFlowField: "",
              addAlternativeFlowField: "",
              defaultFlowDynamic: false,
              defaultFlow: "",
              alternativeFlowDynamic: false,
              alternativeFlow: "",
              maxLength: "10",
            };
          case "istt":
            return {
              promptText: "",
              promptText2: "",
              aiPrompt:
                'You are an intelligent assistant integrated into a medical billing IVR automation system.You receive transcribed audio from an insurance IVR during claim status retrieval, and patient and claim information is already verified. Analyze the transcription and determine the correct action.  If the IVR provides the status of a claim—such as paid, denied, in review, or rejected—even if it includes multiple line items under the same claim, return: recordClaimStatus().  If the IVR indicates that multiple separate claims were found and begins listing them individually(e.g., different claim dates or billed amounts), return: recordMultipleClaimStatuses().  If the IVR found multiple claims and requests a selection based on billed amount(e.g., "Press 1 for $450"), return: selectClaimByBilledAmount().If the IVR requests the billed amount or other input(e.g., "Please enter the billed amount"), return: passBilledAmount().If the IVR states that the claim status cannot be provided due to restrictions(e.g., provider or patient request), return: logRestrictedStatus().For any other situation, return: disconnectCallOnInvalidEntry().',
              maxLength: "10",
              maxSilence: "3",
              functions: [{ id: 1, name: "Function 1", targetNodeId: "" }],
            };
          case "terminator":
            return { label: "Terminator" };
          default:
            return {};
        }
      };

      // Calculate position for new node based on last selected node
      let newPosition = { x: 250, y: 100 };
      if (lastNodeIdRef.current) {
        const lastNode = nodes.find((n) => n.id === lastNodeIdRef.current);
        if (lastNode) {
          // Place new node below and slightly to the right of the last node
          newPosition = {
            x: lastNode.position.x + 50,
            y: lastNode.position.y + 150,
          };
        }
      }

      const newNode = {
        id: getId(),
        type: flowAction.type,
        position: newPosition,
        data: {
          ...getDefaultData(flowAction.type),
          createdBy: {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
          },
          createdAt: new Date().toISOString(),
          lastModifiedBy: {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
          },
          lastModifiedAt: new Date().toISOString(),
        },
      };

      setNodes((nds) => {
        // Connect to last added node
        let updatedNodes = nds.concat(newNode);
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

      // Save snapshot when adding new node
      setTimeout(
        () => saveVersionSnapshot(`Added ${flowAction.type} node`),
        100
      );

      // Automatically select the new node to open config panel
      setSelectedNode(newNode);

      setFlowAction(null); // reset action
    }
  }, [
    flowAction,
    setNodes,
    setFlowAction,
    setEdges,
    nodes,
    saveVersionSnapshot,
  ]);

  // Handle node deletion
  const handleDeleteNode = useCallback(
    (nodeId) => {
      setNodes((nds) => {
        const filteredNodes = nds.filter((node) => node.id !== nodeId);
        // Update lastNodeIdRef to the most recently added node
        if (filteredNodes.length > 1) {
          // Find the last added node (after hardcoded ones)
          const lastAddedNode = filteredNodes.slice(1).at(-1);
          lastNodeIdRef.current = lastAddedNode
            ? lastAddedNode.id
            : filteredNodes[0].id;
        } else if (filteredNodes.length === 1) {
          // If only one node remains, set to that node
          lastNodeIdRef.current = filteredNodes[0]?.id;
        }
        return filteredNodes;
      });
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
      // Save snapshot when deleting node
      setTimeout(() => saveVersionSnapshot(`Deleted node`), 100);
      // Clear selection if the deleted node was selected
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
      }
    },
    [setNodes, setEdges, selectedNode, saveVersionSnapshot]
  );

  // Handle node selection from search
  const handleSearchNodeSelect = useCallback(
    (node) => {
      setSelectedNode(node);
      setSelectedEdge(null);

      // Center the node in view
      if (fitView && node.position) {
        setTimeout(() => {
          fitView({
            padding: 0.3,
            nodes: [node],
            duration: 500,
          });
        }, 100);
      }
    },
    [fitView]
  );

  // Handle restore version
  const handleRestoreVersion = useCallback(
    (version) => {
      console.log("Restoring version:", version);
      console.log("Current nodes before restore:", nodes.length);
      console.log("Current edges before restore:", edges.length);

      // Deep clone the version data to ensure React detects the change
      const restoredNodes = JSON.parse(JSON.stringify(version.nodes));
      const restoredEdges = JSON.parse(JSON.stringify(version.edges));

      // Ensure edge IDs are unique
      const uniqueEdges = restoredEdges.map((edge, index) => {
        if (!edge.id || edge.id === "undefined") {
          return { ...edge, id: `edge-${edge.source}-${edge.target}-${index}` };
        }
        return edge;
      });

      console.log("Restored nodes:", restoredNodes.length);
      console.log("Restored edges:", uniqueEdges.length);

      setNodes(restoredNodes);
      setEdges(uniqueEdges);
      setSelectedNode(null);
      setSelectedEdge(null);

      // Immediately save to localStorage
      setLocalStorageItem(getStorageKey("nodes"), restoredNodes);
      setLocalStorageItem(getStorageKey("edges"), uniqueEdges);

      console.log("Version restored and saved to localStorage");

      // Save a new snapshot marking the restoration
      setTimeout(() => {
        saveVersionSnapshot(
          `Restored version from ${new Date(
            version.timestamp
          ).toLocaleString()}`
        );
        console.log("Restoration snapshot saved");
      }, 100);
    },
    [
      setNodes,
      setEdges,
      saveVersionSnapshot,
      currentFlowId,
      nodes.length,
      edges.length,
    ]
  );

  // Update nodes to include delete handler
  const nodesWithDeleteHandler = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      id: node.id,
      onDelete: handleDeleteNode,
      commentCount: currentFlowId
        ? getNodeCommentCount(currentFlowId, node.id)
        : 0,
      onCommentClick: () => {
        setSelectedNode(node);
        setSelectedEdge(null);
        setConfigTab("comments");
      },
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
                  lastModifiedBy: {
                    id: currentUser.id,
                    name: currentUser.name,
                    email: currentUser.email,
                  },
                  lastModifiedAt: new Date().toISOString(),
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
        onShowVersionHistory={() => {
          console.log(
            "Version History button clicked, current state:",
            showVersionHistory
          );
          setShowVersionHistory(true);
        }}
        onShowAnalytics={() => setShowAnalytics(true)}
        onShowActivityLog={() => {
          console.log("Activity Log button clicked!");
          setShowActivityLog(true);
          console.log("showActivityLog state:", showActivityLog);
        }}
        onShowSearch={() => setShowSearch(true)}
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
              nodeColor={(node) => {
                const colors = {
                  play: "#10b981",
                  menu: "#3b82f6",
                  collect: "#f59e0b",
                  record: "#ef4444",
                  dtmf: "#8b5cf6",
                  ddtmf: "#ec4899",
                  wait: "#6366f1",
                  tts: "#14b8a6",
                  stt: "#06b6d4",
                  istt: "#f97316",
                  terminator: "#64748b",
                };
                return colors[node.type] || "#64748b";
              }}
              style={{
                height: 150,
                width: 200,
                border: "1px solid #334155",
                borderRadius: "8px",
                background: "#0f172a",
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

        {/* Version History Panel */}
        {showVersionHistory && (
          <VersionHistory
            currentFlowId={currentFlowId}
            onRestore={handleRestoreVersion}
            onClose={() => {
              console.log("Closing Version History");
              setShowVersionHistory(false);
            }}
          />
        )}
        {console.log(
          "Rendering FlowEditor, showVersionHistory:",
          showVersionHistory
        )}

        {/* Analytics Panel */}
        {showAnalytics && (
          <FlowAnalytics
            currentFlowId={currentFlowId}
            nodes={nodes}
            edges={edges}
            onClose={() => setShowAnalytics(false)}
          />
        )}

        {/* Activity Log Panel */}
        {showActivityLog && (
          <div className="analytics-overlay">
            <div className="analytics-panel">
              <div className="analytics-header">
                <h3>Activity Log</h3>
                <button
                  onClick={() => setShowActivityLog(false)}
                  className="close-analytics-btn"
                  title="Close Activity Log"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="analytics-content">
                <ActivityLog nodes={nodes} />
              </div>
            </div>
          </div>
        )}

        {/* Inline Search */}
        {showSearch && (
          <InlineSearch
            currentFlowId={currentFlowId}
            onNodeSelect={handleSearchNodeSelect}
            onClose={() => setShowSearch(false)}
          />
        )}

        {/* Enhanced config panel */}
        {selectedNode && (
          <div className="config-panel">
            <div className="config-header">
              <div className="config-tabs">
                <button
                  className={`config-tab ${
                    configTab === "config" ? "active" : ""
                  }`}
                  onClick={() => setConfigTab("config")}
                >
                  <GearIcon size={18} weight="duotone" />
                  Settings
                </button>
                <button
                  className={`config-tab ${
                    configTab === "comments" ? "active" : ""
                  }`}
                  onClick={() => setConfigTab("comments")}
                >
                  <Settings size={18} />
                  Comments
                  {getNodeCommentCount(currentFlowId, selectedNode.id) > 0 && (
                    <span className="comment-badge">
                      {getNodeCommentCount(currentFlowId, selectedNode.id)}
                    </span>
                  )}
                </button>
              </div>
              <button
                className="config-close-btn"
                onClick={() => {
                  setSelectedNode(null);
                  setConfigTab("config");
                }}
                title="Close"
              >
                <XCircleIcon size={24} color="#FF6B6B" weight="duotone" />
              </button>
            </div>

            {configTab === "config" && (
              <div className="config-body">
                {(selectedNode.type === "play" ||
                  selectedNode.type === "terminator") && (
                  <>
                    <label>Prompt Text</label>
                    <input
                      type="text"
                      placeholder="Enter the prompt text..."
                      value={selectedNode.data.text || ""}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: { ...n.data, text: e.target.value },
                                }
                              : n
                          )
                        )
                      }
                    />

                    {/* BR Field for Play Node */}
                    {selectedNode.type === "play" && (
                      <>
                        <label>BR (Barge-In)</label>
                        <select
                          value={
                            selectedNode.data.br !== undefined
                              ? selectedNode.data.br.toString()
                              : "true"
                          }
                          onChange={(e) =>
                            setNodes((nds) =>
                              nds.map((n) =>
                                n.id === selectedNode.id
                                  ? {
                                      ...n,
                                      data: {
                                        ...n.data,
                                        br: e.target.value === "true",
                                      },
                                    }
                                  : n
                              )
                            )
                          }
                        >
                          <option value="true">Enabled</option>
                          <option value="false">Disabled</option>
                        </select>
                      </>
                    )}
                  </>
                )}

                {/* Enhanced Menu Node Configuration */}
                {selectedNode.type === "menu" && (
                  <>
                    <IVRInputConfig
                      nodeId={selectedNode.id}
                      nodeData={selectedNode.data}
                      onDataChange={(newData) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    ...newData,
                                    lastModifiedBy: {
                                      id: currentUser.id,
                                      name: currentUser.name,
                                      email: currentUser.email,
                                    },
                                    lastModifiedAt: new Date().toISOString(),
                                  },
                                }
                              : n
                          )
                        )
                      }
                      promptLabel="Prompt Text"
                      promptPlaceholder="Enter menu prompt text..."
                    />

                    <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>
                      Menu Options
                    </h4>

                    {(selectedNode.data.options || []).map((option, index) => (
                      <div
                        key={option.id}
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          padding: "12px",
                          marginBottom: "10px",
                          background: "#f8fafc",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "8px",
                          }}
                        >
                          <strong>Option {option.key}</strong>
                          <button
                            onClick={() => {
                              const newOptions =
                                selectedNode.data.options.filter(
                                  (o) => o.id !== option.id
                                );
                              setNodes((nds) =>
                                nds.map((n) =>
                                  n.id === selectedNode.id
                                    ? {
                                        ...n,
                                        data: {
                                          ...n.data,
                                          options: newOptions,
                                        },
                                      }
                                    : n
                                )
                              );
                            }}
                            style={{
                              padding: "4px 8px",
                              background: "#fee",
                              border: "1px solid #fcc",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            Remove
                          </button>
                        </div>

                        <label>Key (Number):</label>
                        <input
                          type="text"
                          value={option.key || ""}
                          onChange={(e) => {
                            const newOptions = [...selectedNode.data.options];
                            newOptions[index].key = e.target.value;
                            setNodes((nds) =>
                              nds.map((n) =>
                                n.id === selectedNode.id
                                  ? {
                                      ...n,
                                      data: { ...n.data, options: newOptions },
                                    }
                                  : n
                              )
                            );
                          }}
                          style={{ marginBottom: "8px" }}
                        />

                        <label>Label:</label>
                        <input
                          type="text"
                          value={option.label || ""}
                          onChange={(e) => {
                            const newOptions = [...selectedNode.data.options];
                            newOptions[index].label = e.target.value;
                            setNodes((nds) =>
                              nds.map((n) =>
                                n.id === selectedNode.id
                                  ? {
                                      ...n,
                                      data: { ...n.data, options: newOptions },
                                    }
                                  : n
                              )
                            );
                          }}
                          style={{ marginBottom: "8px" }}
                        />

                        <label>Target Node:</label>
                        <select
                          value={option.targetNodeId || ""}
                          onChange={(e) => {
                            const newOptions = [...selectedNode.data.options];
                            newOptions[index].targetNodeId = e.target.value;
                            setNodes((nds) =>
                              nds.map((n) =>
                                n.id === selectedNode.id
                                  ? {
                                      ...n,
                                      data: { ...n.data, options: newOptions },
                                    }
                                  : n
                              )
                            );
                          }}
                        >
                          <option value="">Select target node...</option>
                          {nodes
                            .filter((n) => n.id !== selectedNode.id)
                            .map((n, idx) => (
                              <option key={n.id} value={n.id}>
                                {idx + 1}. {n.type.toUpperCase()} -{" "}
                                {n.data.text ||
                                  n.data.promptText ||
                                  n.data.variable ||
                                  n.data.label ||
                                  "Node"}
                              </option>
                            ))}
                        </select>
                      </div>
                    ))}

                    <button
                      onClick={() => {
                        const options = selectedNode.data.options || [];
                        const newId =
                          options.length > 0
                            ? Math.max(...options.map((o) => o.id)) + 1
                            : 1;
                        const newKey = String(
                          options.length > 0
                            ? Math.max(
                                ...options.map((o) => parseInt(o.key) || 0)
                              ) + 1
                            : 1
                        );
                        const newOption = {
                          id: newId,
                          key: newKey,
                          label: `Option ${newKey}`,
                          targetNodeId: "",
                        };
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    options: [...options, newOption],
                                  },
                                }
                              : n
                          )
                        );
                      }}
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#06b6d4",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "500",
                        marginTop: "10px",
                      }}
                    >
                      + Add Menu Option
                    </button>
                  </>
                )}

                {selectedNode.type === "collect" && (
                  <>
                    <label>Variable Name</label>
                    <input
                      type="text"
                      placeholder="Enter variable name..."
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
                      style={{ marginBottom: "15px" }}
                    />

                    <IVRInputConfig
                      nodeId={selectedNode.id}
                      nodeData={selectedNode.data}
                      onDataChange={(newData) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? { ...n, data: { ...n.data, ...newData } }
                              : n
                          )
                        )
                      }
                      showInputLength={true}
                      promptLabel="Collection Prompt"
                      promptPlaceholder="Enter prompt for input collection..."
                    />
                  </>
                )}

                {selectedNode.type === "record" && (
                  <>
                    <div style={{ marginBottom: "15px" }}>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedNode.data.dynamic || false}
                          onChange={(e) =>
                            setNodes((nds) =>
                              nds.map((n) =>
                                n.id === selectedNode.id
                                  ? {
                                      ...n,
                                      data: {
                                        ...n.data,
                                        dynamic: e.target.checked,
                                      },
                                    }
                                  : n
                              )
                            )
                          }
                        />
                        Dynamic
                      </label>
                    </div>

                    <label>Record Text</label>
                    <input
                      type="text"
                      placeholder="Enter record text..."
                      value={selectedNode.data.recordText || ""}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    recordText: e.target.value,
                                  },
                                }
                              : n
                          )
                        )
                      }
                    />

                    <label>BR (Barge-In)</label>
                    <select
                      value={
                        selectedNode.data.br !== undefined
                          ? selectedNode.data.br.toString()
                          : "true"
                      }
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    br: e.target.value === "true",
                                  },
                                }
                              : n
                          )
                        )
                      }
                    >
                      <option value="true">Enabled</option>
                      <option value="false">Disabled</option>
                    </select>

                    <label>Max Length (seconds)</label>
                    <input
                      type="number"
                      min="1"
                      max="300"
                      placeholder="Enter max recording length..."
                      value={selectedNode.data.maxLength || ""}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    maxLength: e.target.value,
                                  },
                                }
                              : n
                          )
                        )
                      }
                    />

                    <label>Silence (seconds)</label>
                    <select
                      value={selectedNode.data.silence || "3"}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: { ...n.data, silence: e.target.value },
                                }
                              : n
                          )
                        )
                      }
                    >
                      <option value="3">3 seconds</option>
                      <option value="4">4 seconds</option>
                      <option value="5">5 seconds</option>
                      <option value="6">6 seconds</option>
                      <option value="7">7 seconds</option>
                    </select>

                    <label>Beep</label>
                    <select
                      value={
                        selectedNode.data.beep !== undefined
                          ? selectedNode.data.beep.toString()
                          : "true"
                      }
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    beep: e.target.value === "true",
                                  },
                                }
                              : n
                          )
                        )
                      }
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>

                    <label>Play Back</label>
                    <select
                      value={
                        selectedNode.data.playBack !== undefined
                          ? selectedNode.data.playBack.toString()
                          : "true"
                      }
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    playBack: e.target.value === "true",
                                  },
                                }
                              : n
                          )
                        )
                      }
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  </>
                )}

                {selectedNode.type === "dtmf" && (
                  <>
                    <label>Prompt Text</label>
                    <textarea
                      rows="3"
                      placeholder="Enter prompt text..."
                      value={selectedNode.data.promptText || ""}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    promptText: e.target.value,
                                  },
                                }
                              : n
                          )
                        )
                      }
                    />

                    <div style={{ marginBottom: "15px" }}>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedNode.data.convertToKeypunch || false}
                          onChange={(e) =>
                            setNodes((nds) =>
                              nds.map((n) =>
                                n.id === selectedNode.id
                                  ? {
                                      ...n,
                                      data: {
                                        ...n.data,
                                        convertToKeypunch: e.target.checked,
                                      },
                                    }
                                  : n
                              )
                            )
                          }
                        />
                        Convert to Keypunch
                      </label>
                    </div>

                    <label>DTMF</label>
                    <input
                      type="text"
                      placeholder="Enter DTMF value (e.g., 01265)..."
                      value={selectedNode.data.dtmfValue || ""}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    dtmfValue: e.target.value,
                                  },
                                }
                              : n
                          )
                        )
                      }
                    />
                  </>
                )}

                {selectedNode.type === "ddtmf" && (
                  <>
                    <div style={{ marginBottom: "15px" }}>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedNode.data.convertToKeypunch || false}
                          onChange={(e) =>
                            setNodes((nds) =>
                              nds.map((n) =>
                                n.id === selectedNode.id
                                  ? {
                                      ...n,
                                      data: {
                                        ...n.data,
                                        convertToKeypunch: e.target.checked,
                                      },
                                    }
                                  : n
                              )
                            )
                          }
                        />
                        Convert to Keypunch
                      </label>
                    </div>

                    <label>Dial Pad Type</label>
                    <select
                      value={selectedNode.data.dialPadType || "Standard"}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    dialPadType: e.target.value,
                                  },
                                }
                              : n
                          )
                        )
                      }
                    >
                      <option value="Standard">Standard</option>
                      <option value="Classic">Classic</option>
                    </select>

                    <div style={{ marginBottom: "15px" }}>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedNode.data.multiTap || false}
                          onChange={(e) =>
                            setNodes((nds) =>
                              nds.map((n) =>
                                n.id === selectedNode.id
                                  ? {
                                      ...n,
                                      data: {
                                        ...n.data,
                                        multiTap: e.target.checked,
                                      },
                                    }
                                  : n
                              )
                            )
                          }
                        />
                        Multi-Tap
                      </label>
                    </div>

                    <label>Mapping</label>
                    <select
                      value={selectedNode.data.mapping || ""}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: { ...n.data, mapping: e.target.value },
                                }
                              : n
                          )
                        )
                      }
                    >
                      <option value="">Select mapping...</option>
                      {fieldsMappingList.map((mapping, index) => (
                        <option key={index} value={mapping.mappingName}>
                          {mapping.mappingName}
                        </option>
                      ))}
                    </select>

                    <label>String Function</label>
                    <select
                      value={selectedNode.data.stringFunction || "None"}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    stringFunction: e.target.value,
                                  },
                                }
                              : n
                          )
                        )
                      }
                    >
                      <option value="None">None</option>
                      <option value="Substring">Substring</option>
                    </select>

                    <div style={{ marginBottom: "10px" }}>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedNode.data.removeAlphabets || false}
                          onChange={(e) =>
                            setNodes((nds) =>
                              nds.map((n) =>
                                n.id === selectedNode.id
                                  ? {
                                      ...n,
                                      data: {
                                        ...n.data,
                                        removeAlphabets: e.target.checked,
                                      },
                                    }
                                  : n
                              )
                            )
                          }
                        />
                        Remove Alphabets
                      </label>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedNode.data.removeDigits || false}
                          onChange={(e) =>
                            setNodes((nds) =>
                              nds.map((n) =>
                                n.id === selectedNode.id
                                  ? {
                                      ...n,
                                      data: {
                                        ...n.data,
                                        removeDigits: e.target.checked,
                                      },
                                    }
                                  : n
                              )
                            )
                          }
                        />
                        Remove Digits
                      </label>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={
                            selectedNode.data.removeSpecialChars || false
                          }
                          onChange={(e) =>
                            setNodes((nds) =>
                              nds.map((n) =>
                                n.id === selectedNode.id
                                  ? {
                                      ...n,
                                      data: {
                                        ...n.data,
                                        removeSpecialChars: e.target.checked,
                                      },
                                    }
                                  : n
                              )
                            )
                          }
                        />
                        Remove Special Characters
                      </label>
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedNode.data.appendHashKey || false}
                          onChange={(e) =>
                            setNodes((nds) =>
                              nds.map((n) =>
                                n.id === selectedNode.id
                                  ? {
                                      ...n,
                                      data: {
                                        ...n.data,
                                        appendHashKey: e.target.checked,
                                      },
                                    }
                                  : n
                              )
                            )
                          }
                        />
                        Append # key
                      </label>
                    </div>
                  </>
                )}

                {selectedNode.type === "wait" && (
                  <>
                    <label>Prompt Text</label>
                    <textarea
                      rows="3"
                      placeholder="Enter prompt text..."
                      value={selectedNode.data.promptText || ""}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    promptText: e.target.value,
                                  },
                                }
                              : n
                          )
                        )
                      }
                    />

                    <label>Time (seconds)</label>
                    <input
                      type="number"
                      min="1"
                      max="999"
                      placeholder="Enter wait time (1-999s)..."
                      value={selectedNode.data.time || ""}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: { ...n.data, time: e.target.value },
                                }
                              : n
                          )
                        )
                      }
                    />
                  </>
                )}

                {/* {selectedNode.type === "decision" && (
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
              )} */}

                {selectedNode.type === "tts" && (
                  <>
                    <div style={{ marginBottom: "15px" }}>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedNode.data.dynamic || false}
                          onChange={(e) =>
                            setNodes((nds) =>
                              nds.map((n) =>
                                n.id === selectedNode.id
                                  ? {
                                      ...n,
                                      data: {
                                        ...n.data,
                                        dynamic: e.target.checked,
                                      },
                                    }
                                  : n
                              )
                            )
                          }
                        />
                        Dynamic
                      </label>
                    </div>

                    <label>TTS Text</label>
                    <textarea
                      rows="3"
                      placeholder="Enter TTS text..."
                      value={selectedNode.data.ttsText || ""}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: { ...n.data, ttsText: e.target.value },
                                }
                              : n
                          )
                        )
                      }
                    />

                    <label>Variable</label>
                    <select
                      value={selectedNode.data.variable || "DD|4"}
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
                    >
                      <option value="DD|4">DD|4</option>
                      <option value="W|1">W|1</option>
                      <option value="W|2">W|2</option>
                      <option value="T|3">T|3</option>
                      <option value="DD|4">DD|4</option>
                      <option value="W|5">W|5</option>
                      <option value="TTS|6">TTS|6</option>
                    </select>

                    <label>Type</label>
                    <select
                      value={selectedNode.data.type || "Ordinal"}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: { ...n.data, type: e.target.value },
                                }
                              : n
                          )
                        )
                      }
                    >
                      <option value="Ordinal">Ordinal</option>
                      <option value="Ordinal (only alphabet)">
                        Ordinal (only alphabet)
                      </option>
                      <option value="Ordinal (only numeric)">
                        Ordinal (only numeric)
                      </option>
                      <option value="Date">Date</option>
                      <option value="Time">Time</option>
                      <option value="Free Text">Free Text</option>
                      <option value="Amount">Amount</option>
                      <option value="Percentage">Percentage</option>
                    </select>

                    <label>Input Text</label>
                    <input
                      type="text"
                      placeholder="Enter input text..."
                      value={selectedNode.data.inputText || ""}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    inputText: e.target.value,
                                  },
                                }
                              : n
                          )
                        )
                      }
                    />

                    <label>String Function</label>
                    <select
                      value={selectedNode.data.stringFunction || "None"}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    stringFunction: e.target.value,
                                  },
                                }
                              : n
                          )
                        )
                      }
                    >
                      <option value="None">None</option>
                      <option value="Substring">Substring</option>
                    </select>
                  </>
                )}

                {selectedNode.type === "stt" && (
                  <>
                    <label>Prompt Text:</label>
                    <textarea
                      rows="3"
                      value={selectedNode.data.promptText || ""}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    promptText: e.target.value,
                                  },
                                }
                              : n
                          )
                        )
                      }
                    />

                    <label>Prompt Text:</label>
                    <textarea
                      rows="3"
                      value={selectedNode.data.promptText2 || ""}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    promptText2: e.target.value,
                                  },
                                }
                              : n
                          )
                        )
                      }
                    />

                    <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>
                      Flow Decision Based On
                    </h4>

                    <label>
                      <input
                        type="checkbox"
                        checked={selectedNode.data.aiPromptEnabled || false}
                        onChange={(e) =>
                          setNodes((nds) =>
                            nds.map((n) =>
                              n.id === selectedNode.id
                                ? {
                                    ...n,
                                    data: {
                                      ...n.data,
                                      aiPromptEnabled: e.target.checked,
                                    },
                                  }
                                : n
                            )
                          )
                        }
                      />
                      AI Prompt
                    </label>

                    <h4 style={{ marginTop: "15px", marginBottom: "10px" }}>
                      AI Prompt
                    </h4>

                    <label>Add Default Flow Field Text:</label>
                    <textarea
                      rows="3"
                      value={selectedNode.data.addDefaultFlowField || ""}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    addDefaultFlowField: e.target.value,
                                  },
                                }
                              : n
                          )
                        )
                      }
                    />

                    <label>Add Alternative Flow Field Text:</label>
                    <textarea
                      rows="3"
                      value={selectedNode.data.addAlternativeFlowField || ""}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    addAlternativeFlowField: e.target.value,
                                  },
                                }
                              : n
                          )
                        )
                      }
                    />

                    <label>
                      <input
                        type="checkbox"
                        checked={selectedNode.data.defaultFlowDynamic || false}
                        onChange={(e) =>
                          setNodes((nds) =>
                            nds.map((n) =>
                              n.id === selectedNode.id
                                ? {
                                    ...n,
                                    data: {
                                      ...n.data,
                                      defaultFlowDynamic: e.target.checked,
                                    },
                                  }
                                : n
                            )
                          )
                        }
                      />
                      Dynamic
                    </label>

                    <label>Default Flow:</label>
                    <input
                      type="text"
                      value={selectedNode.data.defaultFlow || ""}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    defaultFlow: e.target.value,
                                  },
                                }
                              : n
                          )
                        )
                      }
                    />

                    <label>
                      <input
                        type="checkbox"
                        checked={
                          selectedNode.data.alternativeFlowDynamic || false
                        }
                        onChange={(e) =>
                          setNodes((nds) =>
                            nds.map((n) =>
                              n.id === selectedNode.id
                                ? {
                                    ...n,
                                    data: {
                                      ...n.data,
                                      alternativeFlowDynamic: e.target.checked,
                                    },
                                  }
                                : n
                            )
                          )
                        }
                      />
                      Dynamic
                    </label>

                    <label>Alternative Flow:</label>
                    <input
                      type="text"
                      value={selectedNode.data.alternativeFlow || ""}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    alternativeFlow: e.target.value,
                                  },
                                }
                              : n
                          )
                        )
                      }
                    />

                    <label>Max Length (seconds):</label>
                    <input
                      type="number"
                      min="1"
                      max="999"
                      value={selectedNode.data.maxLength || "10"}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    maxLength: e.target.value,
                                  },
                                }
                              : n
                          )
                        )
                      }
                    />
                  </>
                )}

                {selectedNode.type === "istt" && (
                  <>
                    <label>Prompt Text:</label>
                    <textarea
                      rows="3"
                      value={selectedNode.data.promptText || ""}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    promptText: e.target.value,
                                  },
                                }
                              : n
                          )
                        )
                      }
                    />

                    <label>Prompt Text:</label>
                    <textarea
                      rows="3"
                      value={selectedNode.data.promptText2 || ""}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    promptText2: e.target.value,
                                  },
                                }
                              : n
                          )
                        )
                      }
                    />

                    <label>AI Prompt:</label>
                    <textarea
                      rows="8"
                      value={selectedNode.data.aiPrompt || ""}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: { ...n.data, aiPrompt: e.target.value },
                                }
                              : n
                          )
                        )
                      }
                    />

                    <label>Max Length (seconds):</label>
                    <input
                      type="number"
                      min="1"
                      max="999"
                      value={selectedNode.data.maxLength || "10"}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    maxLength: e.target.value,
                                  },
                                }
                              : n
                          )
                        )
                      }
                    />

                    <label>Max Silence (seconds):</label>
                    <input
                      type="number"
                      min="1"
                      value={selectedNode.data.maxSilence || "3"}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    maxSilence: e.target.value,
                                  },
                                }
                              : n
                          )
                        )
                      }
                    />

                    <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>
                      Function Routing
                    </h4>

                    {(selectedNode.data.functions || []).map((func, index) => (
                      <div
                        key={func.id}
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          padding: "12px",
                          marginBottom: "10px",
                          background: "#f8fafc",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "8px",
                          }}
                        >
                          <strong>{func.name}</strong>
                          {selectedNode.data.functions.length > 1 && (
                            <button
                              onClick={() => {
                                const newFunctions =
                                  selectedNode.data.functions.filter(
                                    (f) => f.id !== func.id
                                  );
                                setNodes((nds) =>
                                  nds.map((n) =>
                                    n.id === selectedNode.id
                                      ? {
                                          ...n,
                                          data: {
                                            ...n.data,
                                            functions: newFunctions,
                                          },
                                        }
                                      : n
                                  )
                                );
                              }}
                              style={{
                                padding: "4px 8px",
                                background: "#fee",
                                border: "1px solid #fcc",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px",
                              }}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <label>Target Node:</label>
                        <select
                          value={func.targetNodeId || ""}
                          onChange={(e) => {
                            const newFunctions = [
                              ...selectedNode.data.functions,
                            ];
                            newFunctions[index].targetNodeId = e.target.value;
                            setNodes((nds) =>
                              nds.map((n) =>
                                n.id === selectedNode.id
                                  ? {
                                      ...n,
                                      data: {
                                        ...n.data,
                                        functions: newFunctions,
                                      },
                                    }
                                  : n
                              )
                            );
                          }}
                        >
                          <option value="">Select target node...</option>
                          {nodes
                            .filter((n) => n.id !== selectedNode.id)
                            .map((n, idx) => (
                              <option key={n.id} value={n.id}>
                                {idx + 1}. {n.type.toUpperCase()} -{" "}
                                {n.data.text ||
                                  n.data.promptText ||
                                  n.data.variable ||
                                  n.data.label ||
                                  "Node"}
                              </option>
                            ))}
                        </select>
                      </div>
                    ))}

                    <button
                      onClick={() => {
                        const functions = selectedNode.data.functions || [];
                        const newId =
                          functions.length > 0
                            ? Math.max(...functions.map((f) => f.id)) + 1
                            : 1;
                        const newFunction = {
                          id: newId,
                          name: `Function ${newId}`,
                          targetNodeId: "",
                        };
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    functions: [...functions, newFunction],
                                  },
                                }
                              : n
                          )
                        );
                      }}
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#06b6d4",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "500",
                        marginTop: "10px",
                      }}
                    >
                      + Add Function
                    </button>
                  </>
                )}
              </div>
            )}

            {configTab === "comments" && (
              <CommentsPanel
                flowId={currentFlowId}
                nodeId={selectedNode.id}
                nodeName={selectedNode.type}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Main FlowEditor component wrapped with ReactFlowProvider
export default function FlowEditor({
  flowAction,
  setFlowAction,
  currentFlowId,
  fieldsMappingList,
  initialSelectedNodeId,
}) {
  return (
    <ReactFlowProvider>
      <FlowEditorContent
        flowAction={flowAction}
        setFlowAction={setFlowAction}
        currentFlowId={currentFlowId}
        fieldsMappingList={fieldsMappingList}
        initialSelectedNodeId={initialSelectedNodeId}
      />
    </ReactFlowProvider>
  );
}
