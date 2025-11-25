import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import NodeSidebar from "./components/NodeSidebar";
import FlowEditor from "./components/FlowEditor";
import Dashboard from "./pages/Dashboard";
import FlowBuilder from "./pages/FlowBuilder";
import IVRConfig from "./pages/IVRConfig";
import FieldsMapping from "./pages/FieldsMapping";
import DNISConfig from "./pages/DNISConfig";   // ⭐ NEW IMPORT
import FloatingHamburger from "./components/FloatingHamburger";

import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { WarningAmber } from "@mui/icons-material";
import "./styles.css";

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [theme, setTheme] = useState("light");
  const [flowAction, setFlowAction] = useState(null);
  const [isFlowsSidebarOpen, setIsFlowsSidebarOpen] = useState(false);

  const [openConfig, setOpenConfig] = useState(false);
  const [openMapping, setOpenMapping] = useState(false);
  const [openDNIS, setOpenDNIS] = useState(false);  // ⭐ NEW STATE

  // Popup
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleAddNode = (type) => {
    setFlowAction({ type, action: "add" });
  };

  const handleLoadFlow = (flow) => {
    console.log("Loading flow:", flow);
    setActive("flows");
  };

  const showPopup = (message) => {
    setPopupMessage(message);
    setPopupOpen(true);
    setTimeout(() => setPopupOpen(false), 3000);
  };

  return (
    <div className="app-container">
      
      <div className="main-content">

        {/* Navbar */}
        <div className="navbar-wrapper">
          <Navbar
            theme={theme}
            setTheme={setTheme}
            setActive={setActive}
            currentPage={active}
            onOpenConfig={() => setOpenConfig(true)}
            onOpenMapping={() => setOpenMapping(true)}
            onOpenDNIS={() => setOpenDNIS(true)}       // ⭐ NEW
          />
        </div>

        {/* Floating Hamburger */}
        {active === "flows" && (
          <FloatingHamburger
            onNavigate={setActive}
            currentPage={active}
            onOpenFlowsSidebar={() => setIsFlowsSidebarOpen(true)}
            isFlowsSidebarOpen={isFlowsSidebarOpen}
          />
        )}

        {/* Dashboard */}
        {active !== "flows" && (
          <Dashboard onLoadFlow={handleLoadFlow} currentPage={active} />
        )}

        {active === "flows" && (
          <Dashboard
            onLoadFlow={handleLoadFlow}
            currentPage={active}
            isFlowsSidebarOpen={isFlowsSidebarOpen}
            setIsFlowsSidebarOpen={setIsFlowsSidebarOpen}
          />
        )}

        {/* Welcome Page */}
        {active === "dashboard" && (
          <div className="welcome-page">
            <div className="welcome-content">
              <h1>Welcome to Ascend BPO IVR Flow Builder</h1>
              <p>Use the Flow Manager to create and manage your conversation flows.</p>
              <p>Click the "Flows" button in the top-left to get started.</p>
            </div>
          </div>
        )}

        {/* Flow Editor */}
        {active === "flows" && (
          <div className="flow-page">
            <NodeSidebar onAddNode={handleAddNode} />
            <FlowEditor flowAction={flowAction} setFlowAction={setFlowAction} />
          </div>
        )}

        {active === "flowbuilder" && <FlowBuilder />}
      </div>

      {/* IVR Config Modal */}
      <Dialog open={openConfig} onClose={() => setOpenConfig(false)} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <IVRConfig showPopup={showPopup} />
        </DialogContent>
      </Dialog>

      {/* Fields Mapping Modal */}
      <Dialog open={openMapping} onClose={() => setOpenMapping(false)} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <FieldsMapping showPopup={showPopup} />
        </DialogContent>
      </Dialog>

      {/* ⭐ DNIS Configuration Modal */}
      <Dialog open={openDNIS} onClose={() => setOpenDNIS(false)} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <DNISConfig showPopup={showPopup} />
        </DialogContent>
      </Dialog>

      {/* Popup */}
      <Dialog open={popupOpen} onClose={() => setPopupOpen(false)}>
        <DialogContent>
          <WarningAmber sx={{ fontSize: 50, color: "#ffcc00" }} />
          <Typography variant="h6">{popupMessage}</Typography>
        </DialogContent>
      </Dialog>
    </div>
  );
}
