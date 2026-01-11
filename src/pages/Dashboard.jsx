import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Play,
  Edit3,
  Copy,
  Trash2,
  Plus,
  Search,
  Filter,
  Circle,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Settings,
} from "lucide-react";
import {
  PhoneIncoming,
  PhoneOutgoing,
  ChatCircleDots,
  Gear,
  Code,
  Hospital,
  CalendarBlank,
  FlowArrow,
  Phone,
  TextColumns,
} from "@phosphor-icons/react";
import "./Dashboard.css";
import { useLocalStorage, getLocalStorageItem } from "../hooks/useLocalStorage";

export default function Dashboard({
  onOpenConfig,
  onEditFlowSettings,
  onOpenDNIS,
  onOpenMapping,
}) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFlow, setSelectedFlow] = useState(null);

  // Get flows from IVR Config instead of hardcoded data
  const [flows, setFlows] = useState([]);

  // Load flows from IVR Config logs
  useEffect(() => {
    const ivrLogs = getLocalStorageItem("ivrConfig_logs", []);
    const mappedFlows = ivrLogs.map((log) => {
      // Get actual node count from localStorage
      const flowNodes = getLocalStorageItem(`flow_${log.appId}_nodes`, []);
      const nodeCount = flowNodes.length;

      return {
        id: log.appId,
        name: log.appName,
        description: `${log.appType} - ${log.purpose}`,
        status: log.status === "Enabled" ? "active" : "draft",
        lastModified: new Date().toISOString(),
        created: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        createdAt: new Date().toISOString(),
        nodes: nodeCount,
        tags: [log.environment],
        createdBy: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
        },
        lastModifiedBy: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
        },
        appCode: log.appCode,
        practiceCode: log.practiceCode,
        environment: log.environment,
      };
    });
    setFlows(mappedFlows);
  }, [currentUser]);

  // Refresh flows when returning to dashboard
  useEffect(() => {
    const handleStorageChange = () => {
      const ivrLogs = getLocalStorageItem("ivrConfig_logs", []);
      const mappedFlows = ivrLogs.map((log) => {
        // Get actual node count from localStorage
        const flowNodes = getLocalStorageItem(`flow_${log.appId}_nodes`, []);
        const nodeCount = flowNodes.length;

        return {
          id: log.appId,
          name: log.appName,
          description: `${log.appType} - ${log.purpose}`,
          status: log.status === "Enabled" ? "active" : "draft",
          lastModified: new Date().toISOString(),
          created: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          createdAt: new Date().toISOString(),
          nodes: nodeCount,
          tags: [log.environment],
          createdBy: {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
          },
          lastModifiedBy: {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
          },
          appCode: log.appCode,
          practiceCode: log.practiceCode,
          environment: log.environment,
        };
      });
      setFlows(mappedFlows);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [currentUser]);

  // Filtered search - memoized to prevent recalculation
  const filteredFlows = useMemo(
    () =>
      flows.filter(
        (flow) =>
          flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          flow.description.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [flows, searchTerm]
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

  const handleCreateNewFlow = useCallback(() => {
    // Open IVR Config modal to create a new flow
    if (onOpenConfig) {
      onOpenConfig();
    }
  }, [onOpenConfig]);

  const handleDuplicateFlow = (flow) => {
    // Get the original log from IVR Config
    const ivrLogs = getLocalStorageItem("ivrConfig_logs", []);
    const originalLog = ivrLogs.find((log) => log.appId === flow.id);

    if (!originalLog) {
      alert("Unable to duplicate flow: Original flow data not found.");
      return;
    }

    // Create a new unique ID
    const newAppId = Date.now();

    // Duplicate the IVR Config log
    const duplicatedLog = {
      ...originalLog,
      appId: newAppId,
      appName: `${originalLog.appName} (Copy)`,
      appCode: `${originalLog.appCode}_copy_${newAppId}`, // Ensure unique app code
      status: "Disabled", // Start as disabled
    };

    // Save to IVR Config logs
    const updatedLogs = [...ivrLogs, duplicatedLog];
    localStorage.setItem("ivrConfig_logs", JSON.stringify(updatedLogs));

    // Duplicate flow nodes if they exist
    const originalNodes = getLocalStorageItem(`flow_${flow.id}_nodes`, []);
    if (originalNodes.length > 0) {
      localStorage.setItem(
        `flow_${newAppId}_nodes`,
        JSON.stringify(originalNodes)
      );
    }

    // Duplicate flow edges if they exist
    const originalEdges = getLocalStorageItem(`flow_${flow.id}_edges`, []);
    if (originalEdges.length > 0) {
      localStorage.setItem(
        `flow_${newAppId}_edges`,
        JSON.stringify(originalEdges)
      );
    }

    // Update local state by reloading from storage
    const now = new Date().toISOString();
    const duplicatedFlow = {
      ...flow,
      id: newAppId,
      name: `${flow.name} (Copy)`,
      lastModified: now,
      created: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      createdAt: now,
      status: "draft",
      createdBy: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
      },
      lastModifiedBy: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
      },
    };
    setFlows([...flows, duplicatedFlow]);
  };

  const handleDeleteFlow = (flowId) => {
    if (window.confirm("Are you sure you want to delete this flow?")) {
      // Remove from IVR Config logs
      const ivrLogs = getLocalStorageItem("ivrConfig_logs", []);
      const updatedLogs = ivrLogs.filter((log) => log.appId !== flowId);
      localStorage.setItem("ivrConfig_logs", JSON.stringify(updatedLogs));

      // Update local state
      setFlows(flows.filter((f) => f.id !== flowId));
    }
  };

  const handleEditFlowSettings = (flowId) => {
    // Open the config modal with flow ID for editing
    if (onEditFlowSettings) {
      onEditFlowSettings(flowId);
    }
  };

  const handleLoadFlow = (flow) => {
    setSelectedFlow(flow);
    navigate(`/flows/${flow.id}`);
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

  const getFlowTypeIcon = (description) => {
    const desc = description.toLowerCase();
    if (desc.includes("inbound")) {
      return { icon: PhoneIncoming, color: "#4ECDC4" };
    } else if (desc.includes("outbound")) {
      return { icon: PhoneOutgoing, color: "#FF6B6B" };
    } else if (desc.includes("chat")) {
      return { icon: ChatCircleDots, color: "#FFE66D" };
    } else {
      return { icon: FlowArrow, color: "#95E1D3" };
    }
  };

  const getPurposeColor = (description) => {
    const desc = description.toLowerCase();
    if (desc.includes("claim")) return "#FF6B9D";
    if (desc.includes("appointment")) return "#AA96DA";
    if (desc.includes("billing")) return "#F38181";
    if (desc.includes("support")) return "#A8D8EA";
    return "#6BCF7F";
  };

  return (
    <div className="dashboard-main">
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="dashboard-header-content">
            <h1 className="dashboard-title">
              <FlowArrow
                size={36}
                color="#6366F1"
                weight="duotone"
                style={{ marginRight: "12px" }}
              />
              IVR Flow Dashboard
            </h1>
            <p className="dashboard-subtitle">
              Create, manage, and deploy your conversation flows
            </p>
          </div>
          <div className="header-actions">
            <button className="btn-primary" onClick={handleCreateNewFlow}>
              <Gear size={20} weight="duotone" />
              New Flow
            </button>
            <button className="btn-secondary" onClick={onOpenDNIS}>
              <Phone size={20} weight="duotone" />
              DNIS Config
            </button>
            <button className="btn-secondary" onClick={onOpenMapping}>
              <TextColumns size={20} weight="duotone" />
              Fields Mapping
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate("/configuration")}
            >
              <Settings size={20} />
              Configuration
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="dashboard-toolbar">
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
        </div>

        {/* Flows Grid */}
        <div className="flows-grid">
          {filteredFlows.map((flow) => {
            const flowTypeInfo = getFlowTypeIcon(flow.description);
            const FlowIcon = flowTypeInfo.icon;
            const purposeColor = getPurposeColor(flow.description);

            return (
              <div
                key={flow.id}
                className="flow-card"
                onClick={() => handleLoadFlow(flow)}
              >
                <div className="flow-card-header">
                  <div className="flow-icon-container">
                    <div
                      className="flow-main-icon"
                      style={{
                        background: `linear-gradient(135deg, ${flowTypeInfo.color}20, ${flowTypeInfo.color}10)`,
                      }}
                    >
                      <FlowIcon
                        size={32}
                        color={flowTypeInfo.color}
                        weight="duotone"
                      />
                    </div>
                  </div>
                  <div className="flow-status-badge">
                    {getStatusIcon(flow.status)}
                  </div>
                </div>

                <div className="flow-card-content">
                  <h3 className="flow-name">{flow.name}</h3>
                  <p className="flow-description">{flow.description}</p>

                  <div className="flow-info-grid">
                    <div className="info-item">
                      <Code size={16} color="#6366F1" weight="duotone" />
                      <div className="info-content">
                        <span className="info-label">App Code</span>
                        <span className="info-value">
                          {flow.appCode || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="info-item">
                      <Hospital size={16} color="#EC4899" weight="duotone" />
                      <div className="info-content">
                        <span className="info-label">Practice</span>
                        <span className="info-value">
                          {flow.practiceCode || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="info-item">
                      <FlowArrow size={16} color="#10B981" weight="duotone" />
                      <div className="info-content">
                        <span className="info-label">Nodes</span>
                        <span className="info-value">{flow.nodes}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <Gear size={16} color="#F59E0B" weight="duotone" />
                      <div className="info-content">
                        <span className="info-label">Environment</span>
                        <span className="info-value">
                          {flow.environment || "Dev"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flow-card-footer">
                  <div className="flow-meta">
                    <Calendar size={14} color="#94A3B8" weight="duotone" />
                    <span>{getRelativeTime(flow.lastModified)}</span>
                  </div>
                  <div className="flow-actions">
                    <button
                      className="btn-action edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLoadFlow(flow);
                      }}
                      title="Edit Flow"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="btn-action settings"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditFlowSettings(flow.id);
                      }}
                      title="Flow Settings"
                    >
                      <Settings size={16} />
                    </button>
                    <button
                      className="btn-action play"
                      onClick={(e) => e.stopPropagation()}
                      title="Run Flow"
                    >
                      <Play size={16} />
                    </button>
                    <button
                      className="btn-action copy"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateFlow(flow);
                      }}
                      title="Duplicate"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      className="btn-action delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFlow(flow.id);
                      }}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
