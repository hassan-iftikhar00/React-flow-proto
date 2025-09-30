import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import NodeSidebar from "./components/NodeSidebar";
import FlowEditor from "./components/FlowEditor";
import Dashboard from "./pages/Dashboard";
import FlowBuilder from "./pages/FlowBuilder";

import IVRConfig from "./pages/IVRConfig";
import FloatingHamburger from "./components/FloatingHamburger";
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
  const [isFlowsSidebarOpen, setIsFlowsSidebarOpen] = useState(false);

  const handleAddNode = (type) => {
    setFlowAction({ type, action: "add" });
  };

  const handleLoadFlow = (flow) => {
    console.log("Loading flow in editor:", flow);
    setActive("flows");
    // TODO: add flow loading logic here
  };

  const handleOpenFlowsSidebar = () => {
    setIsFlowsSidebarOpen(true);
  };

  return (
    <div className="app-container">
      {/* Main content */}
      <div className="main-content">
        {/* Always show navbar */}
        <div className="navbar-wrapper">
          <Navbar
            theme={theme}
            setTheme={setTheme}
            setActive={setActive}
            onLoadFlow={handleLoadFlow}
            currentPage={active}
          />
        </div>

        {/* Show floating hamburger only when in flows mode */}
        {active === "flows" && (
          <FloatingHamburger
            onNavigate={setActive}
            currentPage={active}
            onOpenFlowsSidebar={handleOpenFlowsSidebar}
            isFlowsSidebarOpen={isFlowsSidebarOpen}
          />
        )}

        {/* Dashboard is now always available as a sidebar */}
        {active !== "flows" && (
          <Dashboard onLoadFlow={handleLoadFlow} currentPage={active} />
        )}

        {/* Dashboard component for flows sidebar even in flows mode */}
        {active === "flows" && (
          <Dashboard
            onLoadFlow={handleLoadFlow}
            currentPage={active}
            isFlowsSidebarOpen={isFlowsSidebarOpen}
            setIsFlowsSidebarOpen={setIsFlowsSidebarOpen}
          />
        )}

        {/* Switch pages */}
        {active === "dashboard" && (
          <div className="welcome-page">
            <div className="welcome-content">
              <h1>Welcome to Ascend BPO IVR Flow Builder</h1>
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
