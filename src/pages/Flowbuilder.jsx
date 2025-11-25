import React, { useState } from "react";
import NodeSidebar from "../components/NodeSidebar";
import FlowEditor from "../components/FlowEditor";

export default function FlowBuilder({ currentFlowId }) {
  const [flowAction, setFlowAction] = useState(null);

  const handleAddNode = (type) => {
    setFlowAction({ type, action: "add" });
  };

  return (
    <div className="flow-page">
      <NodeSidebar onAddNode={handleAddNode} />
      <FlowEditor
        flowAction={flowAction}
        setFlowAction={setFlowAction}
        currentFlowId={currentFlowId}
      />
    </div>
  );
}
