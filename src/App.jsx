import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import NodeSidebar from "./components/NodeSidebar";
import FlowEditor from "./components/FlowEditor";
import "./styles.css";

export default function App() {
  const [theme, setTheme] = useState("light"); // default theme

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // 🆕 handleAddNode function
  const [flowAction, setFlowAction] = useState(null);

  const handleAddNode = (type) => {
    setFlowAction({ type, action: "add" }); // ye FlowEditor ko bhejenge
  };

  return (
    <div className="app-container">
      {/* Theme toggle moved to navbar or can be removed */}
      <div className="main-content">
        <Navbar theme={theme} setTheme={setTheme} />
        <div className="flow-page">
          {/* Single sidebar with drag & drop blocks */}
          <NodeSidebar onAddNode={handleAddNode} />
          <FlowEditor flowAction={flowAction} setFlowAction={setFlowAction} />
        </div>
      </div>
    </div>
  );
}
