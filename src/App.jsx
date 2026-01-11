import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import NodeSidebar from "./components/NodeSidebar";
import FlowEditor from "./components/FlowEditor";
import Dashboard from "./pages/Dashboard";
import FlowBuilder from "./pages/Flowbuilder";
import IVRConfig from "./pages/IVRConfig";
import IVRConfigPage from "./pages/IVRConfigPage";
import FieldsMapping from "./pages/FieldsMapping";
import DNISConfig from "./pages/DNISConfig";
import ConfigurationPage from "./pages/ConfigurationPage";

import { Dialog, DialogContent, Typography } from "@mui/material";
import { WarningAmber } from "@mui/icons-material";
import "./styles.css";

// ---------------- FlowEditorPage ----------------
function FlowEditorPage({ onOpenConfig }) {
  const { flowId } = useParams();
  const location = useLocation();
  const [flowAction, setFlowAction] = useState(null);

  const searchParams = new URLSearchParams(location.search);
  const nodeIdFromUrl = searchParams.get("nodeId");
  const isNewFlow = searchParams.get("new");

  useEffect(() => {
    if (isNewFlow === "true") {
      onOpenConfig();
    }
  }, [isNewFlow, onOpenConfig]);

  const handleAddNode = (type) => setFlowAction({ type, action: "add" });

  return (
    <div className="flow-page">
      <NodeSidebar onAddNode={handleAddNode} />
      <FlowEditor
        flowAction={flowAction}
        setFlowAction={setFlowAction}
        currentFlowId={flowId}
        initialSelectedNodeId={nodeIdFromUrl}
      />
    </div>
  );
}

// ---------------- AppContent ----------------
function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [theme, setTheme] = useState("light");
  const location = useLocation();

  const [openConfig, setOpenConfig] = useState(false);
  const [openMapping, setOpenMapping] = useState(false);
  const [openDNIS, setOpenDNIS] = useState(false);

  const [fieldsMappingList, setFieldsMappingList] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const showPopup = (message) => {
    setPopupMessage(message);
    setPopupOpen(true);
  };

  const toggleConfig = () => setOpenConfig((prev) => !prev);
  const toggleMapping = () => setOpenMapping((prev) => !prev);
  const toggleDNIS = () => setOpenDNIS((prev) => !prev);

  if (loading)
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );

  if (!isAuthenticated) return <Login />;

  return (
    <div className="app-container">
      <Navbar
        theme={theme}
        setTheme={setTheme}
        currentPage={location.pathname}
        onOpenConfig={toggleConfig}
        onOpenDNIS={toggleDNIS}
        onOpenMapping={toggleMapping}
      />

      <Routes>
        <Route path="/" element={<Dashboard onOpenConfig={toggleConfig} />} />
        <Route
          path="/dashboard"
          element={<Dashboard onOpenConfig={toggleConfig} />}
        />
        <Route
          path="/flows/:flowId"
          element={<FlowEditorPage onOpenConfig={toggleConfig} />}
        />
        <Route path="/builder" element={<FlowBuilder />} />
        <Route path="/ivr-config" element={<IVRConfigPage />} />
        <Route path="/configuration" element={<ConfigurationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* IVR Config Modal */}
      <Dialog open={openConfig} onClose={toggleConfig} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <IVRConfig showPopup={showPopup} />
        </DialogContent>
      </Dialog>

      {/* Fields Mapping Modal */}
      <Dialog
        open={openMapping}
        onClose={toggleMapping}
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

      {/* DNIS Config Modal */}
      <Dialog open={openDNIS} onClose={toggleDNIS} maxWidth="md" fullWidth>
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

// ---------------- App ----------------
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
