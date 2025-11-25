import React, { useState } from "react";
import {
  Play,
  Edit3,
  Copy,
  Trash2,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Circle,
  CheckCircle2,
  Clock,
  Calendar,
  Menu,
  X,
} from "lucide-react";
import "./Dashboard.css";
import { useLocalStorage } from "../hooks/useLocalStorage";

export default function Dashboard({ onLoadFlow }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFlow, setSelectedFlow] = useState(null);

  // Sample flows data - now stored in localStorage
  const defaultFlows = [
    {
      id: 1,
      name: "Customer Support IVR",
      description: "Main support flow with routing & menu options",
      status: "active",
      lastModified: new Date().toISOString(),
      created: "Sep 15, 2025",
      nodes: 12,
      connections: 8,
      tags: ["Support", "IVR", "Production"],
    },
    {
      id: 2,
      name: "Appointment Booking",
      description: "Automated scheduling with calendar integration",
      status: "draft",
      lastModified: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      created: "Sep 20, 2025",
      nodes: 8,
      connections: 6,
      tags: ["Booking", "Calendar", "Draft"],
    },
    {
      id: 3,
      name: "Payment Processing Flow",
      description: "Secure payment processing with validations",
      status: "active",
      lastModified: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      created: "Sep 10, 2025",
      nodes: 15,
      connections: 12,
      tags: ["Payment", "Security", "Production"],
    },
  ];

  const [flows, setFlows] = useLocalStorage("dashboard_flows", defaultFlows);

  // Filtered search
  const filteredFlows = flows.filter(
    (flow) =>
      flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flow.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to get relative time
  const getRelativeTime = (isoDate) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const handleCreateNewFlow = () => {
    const newFlow = {
      id: Date.now(),
      name: `New Flow ${flows.length + 1}`,
      description: "A new IVR flow",
      status: "draft",
      lastModified: new Date().toISOString(),
      created: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      nodes: 0,
      connections: 0,
      tags: ["Draft"],
    };
    setFlows([...flows, newFlow]);
    handleLoadFlow(newFlow);
  };

  const handleDuplicateFlow = (flow) => {
    const duplicatedFlow = {
      ...flow,
      id: Date.now(),
      name: `${flow.name} (Copy)`,
      lastModified: new Date().toISOString(),
      created: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: "draft",
    };
    setFlows([...flows, duplicatedFlow]);
  };

  const handleDeleteFlow = (flowId) => {
    if (window.confirm("Are you sure you want to delete this flow?")) {
      setFlows(flows.filter((f) => f.id !== flowId));
    }
  };

  const handleLoadFlow = (flow) => {
    // Update the flow's last modified time
    const updatedFlows = flows.map((f) =>
      f.id === flow.id ? { ...f, lastModified: new Date().toISOString() } : f
    );
    setFlows(updatedFlows);

    setSelectedFlow(flow);
    if (onLoadFlow) {
      onLoadFlow(flow);
    }
    console.log("Loading flow:", flow.name);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="status-icon active" size={16} />;
      case "draft":
        return <Circle className="status-icon draft" size={16} />;
      case "paused":
        return <Clock className="status-icon paused" size={16} />;
      default:
        return <Circle className="status-icon" size={16} />;
    }
  };

  return (
    <div className="dashboard-main">
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="dashboard-header-content">
            <h1 className="dashboard-title">IVR Flow Dashboard</h1>
            <p className="dashboard-subtitle">
              Create, manage, and deploy your conversation flows
            </p>
          </div>
          <div className="header-actions">
            <button className="btn-primary" onClick={handleCreateNewFlow}>
              <Plus size={20} />
              New Flow
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="dashboard-toolbar">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <inputIVR
              Flow
              Dashboard
              type="text"
              placeholder="Search flows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="toolbar-actions">
            <button className="btn-secondary">
              <Filter size={18} />
              Filter
            </button>
          </div>
        </div>

        {/* Flows Grid */}
        <div className="flows-grid">
          {filteredFlows.map((flow) => (
            <div key={flow.id} className="flow-card">
              <div className="flow-card-header">
                <div className="flow-status">
                  {getStatusIcon(flow.status)}
                  <span className={`status-text ${flow.status}`}>
                    {flow.status.charAt(0).toUpperCase() + flow.status.slice(1)}
                  </span>
                </div>
                <button className="flow-menu-btn">
                  <MoreVertical size={16} />
                </button>
              </div>

              <div className="flow-card-content">
                <h3 className="flow-name">{flow.name}</h3>
                <p className="flow-description">{flow.description}</p>

                <div className="flow-stats">
                  <div className="stat">
                    <span className="stat-value">{flow.nodes}</span>
                    <span className="stat-label">Nodes</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{flow.connections}</span>
                    <span className="stat-label">Connections</span>
                  </div>
                </div>

                <div className="flow-tags">
                  {flow.tags.map((tag, index) => (
                    <span key={index} className="flow-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flow-card-footer">
                <div className="flow-meta">
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>Modified {getRelativeTime(flow.lastModified)}</span>
                  </div>
                </div>
                <div className="flow-actions">
                  <button
                    className="btn-action"
                    onClick={() => handleLoadFlow(flow)}
                    title="Edit Flow"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button className="btn-action" title="Run Flow">
                    <Play size={16} />
                  </button>
                  <button
                    className="btn-action"
                    title="Duplicate"
                    onClick={() => handleDuplicateFlow(flow)}
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    className="btn-action"
                    title="Delete"
                    onClick={() => handleDeleteFlow(flow.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredFlows.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-content">
              <h3>No flows found</h3>
              <p>
                Try adjusting your search terms or create a new flow to get
                started.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
