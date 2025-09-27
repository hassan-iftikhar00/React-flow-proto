import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import NodeSidebar from "./components/NodeSidebar";
import FlowEditor from "./components/FlowEditor";
import Dashboard from "./pages/Dashboard";
import FlowBuilder from "./pages/FlowBuilder";
import "./styles.css";

export default function App() {
  const [active, setActive] = useState("dashboard"); // default page = Dashboard
  const [theme, setTheme] = useState("light");       // default theme

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // For FlowBuilder and FlowEditor
  const [flowAction, setFlowAction] = useState(null);

  const handleAddNode = (type) => {
    setFlowAction({ type, action: "add" });
  };

  return (
    <div className="app-container">
      <Sidebar
        active={active}
        setActive={setActive}
        theme={theme}
        setTheme={setTheme}
      />

      <div className="main-content">
        <Navbar />
        {/* Dashboard page */}
        {active === "dashboard" && <Dashboard />}

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