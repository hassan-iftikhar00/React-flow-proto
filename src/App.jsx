import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import NodeSidebar from "./components/NodeSidebar";
import FlowEditor from "./components/FlowEditor";
import Dashboard from "./pages/Dashboard";
import FlowBuilder from "./pages/FlowBuilder";
import IVRConfig from "./pages/IVRConfig";
import FieldsMapping from "./pages/FieldsMapping";
import DNISConfig from "./pages/DNISConfig";

import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { WarningAmber } from "@mui/icons-material";
import "./styles.css";

// Flow Editor Page Component
function FlowEditorPage() {
  const { flowId } = useParams();
  const location = useLocation();
  const [flowAction, setFlowAction] = useState(null);

  // Extract nodeId from URL query parameter
  const searchParams = new URLSearchParams(location.search);
  const nodeIdFromUrl = searchParams.get("nodeId");

  const handleAddNode = (type) => {
    setFlowAction({ type, action: "add" });
  };

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

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [theme, setTheme] = useState("light");
  const location = useLocation();

  const [openConfig, setOpenConfig] = useState(false);
  const [openMapping, setOpenMapping] = useState(false);
  const [openDNIS, setOpenDNIS] = useState(false);
  const [fieldsMappingList, setFieldsMappingList] = useState([]);

  // Popup
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // Apply theme to <html> tag and load from localStorage
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

  // Show loading state
  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="app-container">
      <div className="main-content">
        {/* Navbar */}
        <div className="navbar-wrapper">
          <Navbar
            theme={theme}
            setTheme={setTheme}
            currentPage={location.pathname}
            onOpenConfig={() => setOpenConfig(true)}
            onOpenDNIS={() => setOpenDNIS(true)}
            onOpenMapping={() => setOpenMapping(true)}
          />
        </div>

        {/* Routes */}
        <Routes>
          <Route
            path="/"
            element={<Dashboard onOpenConfig={() => setOpenConfig(true)} />}
          />
          <Route path="/flows/:flowId" element={<FlowEditorPage />} />
          <Route path="/builder" element={<FlowBuilder />} />
          <Route path="/config" element={<IVRConfig />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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

      {/* DNIS Configuration Modal */}
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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
