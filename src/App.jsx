import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import NodeSidebar from "./components/NodeSidebar";
import FlowEditor from "./components/FlowEditor";
import "./styles.css";

export default function App() {
  const [active, setActive] = useState("flows"); // default page
  const [theme, setTheme] = useState("light");   // default theme

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
      <Sidebar
        active={active}
        setActive={setActive}
        theme={theme}
        setTheme={setTheme}
      />

      <div className="main-content">
        <Navbar />
        {active === "flows" && (
          <div className="flow-page">
            {/* 🆕 pass handleAddNode */}
            <NodeSidebar onAddNode={handleAddNode} />
            <FlowEditor flowAction={flowAction} setFlowAction={setFlowAction} />
          </div>
        )}
      </div>
    </div>
  );
}
