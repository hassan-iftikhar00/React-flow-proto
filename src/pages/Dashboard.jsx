import React, { useState } from "react";
import {
  Play,
  Edit3,
  Copy,
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

export default function Dashboard({
  onLoadFlow,
  currentPage,
  isFlowsSidebarOpen,
  setIsFlowsSidebarOpen,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // External vs local state
  const actualIsSidebarOpen =
    isFlowsSidebarOpen !== undefined ? isFlowsSidebarOpen : isSidebarOpen;
  const actualSetIsSidebarOpen = setIsFlowsSidebarOpen || setIsSidebarOpen;

  // Determine if canvas mode
  const isCanvasActive = currentPage === "flows";

  // Sample flows data
  const [flows] = useState([
    {
      id: 1,
      name: "Customer Support IVR",
      description: "Main support flow with routing & menu options",
      status: "active",
      lastModified: "2 hours ago",
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
      lastModified: "1 day ago",
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
      lastModified: "3 days ago",
      created: "Sep 10, 2025",
      nodes: 15,
      connections: 12,
      tags: ["Payment", "Security", "Production"],
    },
  ]);

  // Filtered search
  const filteredFlows = flows.filter(
    (flow) =>
      flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flow.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLoadFlow = (flow) => {
    setSelectedFlow(flow);
    if (onLoadFlow) {
      onLoadFlow(flow);
    }
    actualSetIsSidebarOpen(false);
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
    <>
      {/* Toggle Button */}
      {!isCanvasActive && (
        <button
          className={`sidebar-toggle-btn ${
            isCanvasActive ? "canvas-mode" : "welcome-mode"
          }`}
          onClick={() => actualSetIsSidebarOpen(true)}
          title="Open Flow Manager"
        >
          <Menu size={20} />
          <span>Flows</span>
        </button>
      )}

      {/* Overlay */}
      {actualIsSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => actualSetIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`flows-sidebar ${actualIsSidebarOpen ? "open" : ""}`}>
        <div className="flows-container">
          {/* Header */}
          <div className="flows-header">
            <div className="flows-header-content">
              <h1 className="flows-title">Flow Manager</h1>
              <p className="flows-subtitle">
                Create, manage, and deploy your conversation flows
              </p>
            </div>
            <div className="header-actions">
              <button className="btn-primary pulse">
                <Plus size={20} />
                New Flow
              </button>
              <button
                className="close-btn"
                onClick={() => actualSetIsSidebarOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flows-toolbar">
            <div className="search-container">
              <Search className="search-icon" size={20} />
              <input
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
              <div key={flow.id} className="flow-card fade-in">
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
                      <span key={index} className="flow-tag bounce">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flow-card-footer">
                  <div className="flow-meta">
                    <div className="meta-item">
                      <Calendar size={14} />
                      <span>Modified {flow.lastModified}</span>
                    </div>
                  </div>
                  <div className="flow-actions">
                    <button
                      className="btn-action"
                      onClick={() => handleLoadFlow(flow)}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button className="btn-action">
                      <Play size={16} />
                    </button>
                    <button className="btn-action">
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredFlows.length === 0 && (
            <div className="empty-state fade-in">
              <h3>No flows found</h3>
              <p>
                Try adjusting your search terms or create a new flow to get
                started.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
