import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import NodeSidebar from "./components/NodeSidebar";
import FlowEditor from "./components/FlowEditor";
import Dashboard from "./pages/Dashboard";
import FlowBuilder from "./pages/FlowBuilder";
import IVRConfig from "./pages/IVRConfig";
import FieldsMapping from "./pages/FieldsMapping";
import DNISConfig from "./pages/DNISConfig"; // ⭐ NEW IMPORT
import { ArrowLeft } from "lucide-react";

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
  const [openDNIS, setOpenDNIS] = useState(false); // ⭐ NEW STATE
  const [fieldsMappingList, setFieldsMappingList] = useState([]);

  // Popup
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const [currentFlowId, setCurrentFlowId] = useState(null); // Track current flow being edited

  // Apply theme to <html> tag
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleAddNode = (type) => {
    setFlowAction({ type, action: "add" });
  };

  const handleLoadFlow = (flow) => {
    console.log("Loading flow in editor:", flow);
    setCurrentFlowId(flow.id); // Set the current flow ID
    setActive("flows");
  };

  const handleBackToDashboard = () => {
    setActive("dashboard");
    setCurrentFlowId(null);
  };

  const showPopup = (message) => {
    setPopupMessage(message);
    setPopupOpen(true);
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
            onOpenDNIS={() => setOpenDNIS(true)}
            onOpenMapping={() => setOpenMapping(true)}
          />

          {/* Back button in header when in canvas mode */}
          {active === "flows" && (
            <button
              className="header-back-btn"
              onClick={handleBackToDashboard}
              title="Back to Dashboard"
            >
              <ArrowLeft size={20} />
            </button>
          )}
        </div>
        {/* Floating Hamburger */}

        {/* Show floating hamburger only when in flows mode */}
        {/* Hamburger removed from canvas page as requested */}
        {/* {active === "flows" && (
          <FloatingHamburger
            onNavigate={setActive}
            currentPage={active}
            onOpenFlowsSidebar={() => setIsFlowsSidebarOpen(true)}
            isFlowsSidebarOpen={isFlowsSidebarOpen}
          />
//         )} */}
        {/* Switch pages */}
        {active === "dashboard" && <Dashboard onLoadFlow={handleLoadFlow} />}
        {/* Flow Editor */}
        {active === "flows" && (
          <div className="flow-page">
            <NodeSidebar onAddNode={handleAddNode} />
            <FlowEditor
              flowAction={flowAction}
              setFlowAction={setFlowAction}
              currentFlowId={currentFlowId}
              fieldsMappingList={fieldsMappingList}
            />
          </div>
        )}
        {active === "flowbuilder" && (
          <FlowBuilder currentFlowId={currentFlowId} />
        )}
        {active === "ivrconfig" && (
          <div className="ivrconfig-page">
            <IVRConfig />
          </div>
        )}
      </div>

      {/* IVR Config Modal */}
      <Dialog
        open={openConfig}
        onClose={() => setOpenConfig(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          <IVRConfig showPopup={showPopup} />
        </DialogContent>
      </Dialog>

      {/* Fields Mapping Modal */}
      <Dialog
        open={openMapping}
        onClose={() => setOpenMapping(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          <FieldsMapping
            showPopup={showPopup}
            onListChange={setFieldsMappingList}
          />
        </DialogContent>
      </Dialog>

      {/* ⭐ DNIS Configuration Modal */}
      <Dialog
        open={openDNIS}
        onClose={() => setOpenDNIS(false)}
        maxWidth="md"
        fullWidth
      >
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
