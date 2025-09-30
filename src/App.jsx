import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import NodeSidebar from "./components/NodeSidebar";
import FlowEditor from "./components/FlowEditor";
import Dashboard from "./pages/Dashboard";
import FlowBuilder from "./pages/FlowBuilder";
import IVRConfig from "./pages/IVRConfig"; 
import "./styles.css";

export default function App() {
  const [active, setActive] = useState("dashboard"); // default page = Dashboard
  const [theme, setTheme] = useState("light"); // default theme

  // Apply theme to <html> tag
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // For FlowBuilder and FlowEditor actions
  const [flowAction, setFlowAction] = useState(null);

  const handleAddNode = (type) => {
    setFlowAction({ type, action: "add" });
  };

  const handleLoadFlow = (flow) => {
    console.log("Loading flow in editor:", flow);
    setActive("flows");
    // TODO: add flow loading logic here
  };

  return (
    <div className="app-container">
      {/* Sticky Navbar */}
      <div className="navbar-wrapper">
        <Navbar theme={theme} setTheme={setTheme} setActive={setActive} />
      </div>

      {/* Main content below navbar */}
      <div className="main-content">
        <Dashboard onLoadFlow={handleLoadFlow} currentPage={active} />

        {/* Switch pages */}
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

        {active === "flows" && (
          <div className="flow-page">
            <NodeSidebar onAddNode={handleAddNode} />
            <FlowEditor flowAction={flowAction} setFlowAction={setFlowAction} />
          </div>
        )}

        {active === "flowbuilder" && <FlowBuilder />}

        {active === "ivrconfig" && (
          <div className="ivrconfig-page">
            <IVRConfig />
          </div>
        )}
      </div>
    </div>
  );
}
