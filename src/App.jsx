import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import NodeSidebar from "./components/NodeSidebar";
import FlowEditor from "./components/FlowEditor";
import Dashboard from "./pages/Dashboard";
import FlowBuilder from "./pages/FlowBuilder";
import "./styles.css";

export default function App() {
  const [active, setActive] = useState("dashboard"); // default page = Dashboard
  const [theme, setTheme] = useState("light"); // default theme

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // For FlowBuilder and FlowEditor
  const [flowAction, setFlowAction] = useState(null);

  const handleAddNode = (type) => {
    setFlowAction({ type, action: "add" });
  };

  const handleLoadFlow = (flow) => {
    console.log("Loading flow in editor:", flow);
    // Switch to flows page to show the editor
    setActive("flows");
    // You can add flow loading logic here
  };

  return (
    <div className="app-container">
      {/* Theme toggle moved to navbar or can be removed */}
      <div className="main-content">
        <Navbar theme={theme} setTheme={setTheme} />

        {/* Dashboard is now always available as a sidebar */}
        <Dashboard onLoadFlow={handleLoadFlow} currentPage={active} />

        {/* Dashboard page */}
        {active === "dashboard" && (
          <div className="welcome-page">
            <div className="welcome-content">
              <h1>Welcome to Genesys Flow Professional</h1>
              <p>
                Use the Flow Manager to create and manage your conversation
                flows.
              </p>
              <p>Click the "Flows" button in the top-left to get started.</p>
            </div>
          </div>
        )}

        {/* Flows page (separate full editor) */}
        {active === "flows" && (
          <div className="flow-page">
            <NodeSidebar onAddNode={handleAddNode} />
            <FlowEditor flowAction={flowAction} setFlowAction={setFlowAction} />
          </div>
        )}

        {/* FlowBuilder page (if you want it separately) */}
        {active === "flowbuilder" && <FlowBuilder />}
      </div>
    </div>
  );
}
