import React, { useCallback, useRef, useEffect, useState } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  PlayNode,
  MenuNode,
  CollectNode,
  DecisionNode,
  TransferNode,
  EndNode,
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
];

const nodeTypes = {
  play: PlayNode,
  menu: MenuNode,
  collect: CollectNode,
  decision: DecisionNode,
  transfer: TransferNode,
  end: EndNode,
};

export default function FlowEditor({ flowAction, setFlowAction }) {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);

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
          default:
            return {};
        }
      };

      const newNode = {
        id: getId(),
        type: flowAction.type,
        position: { x: 250, y: 100 },
        data: getDefaultData(flowAction.type),
      };
      setNodes((nds) => nds.concat(newNode));
      setFlowAction(null); // reset action
    }
  }, [flowAction, setNodes, setFlowAction]);

  return (
    <div className="flow-container" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => setSelectedNode(node)}
        nodeTypes={nodeTypes}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background gap={12} />
      </ReactFlow>

      {/* Enhanced config panel */}
      {selectedNode && (
        <div className="config-panel">
          <h4>⚙️ Configure {selectedNode.type}</h4>

          {selectedNode.type === "play" && (
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
                        ? { ...n, data: { ...n.data, number: e.target.value } }
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
  );
}
