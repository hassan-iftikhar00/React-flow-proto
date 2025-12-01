import React from "react";
import { Clock, User, Edit3, Plus } from "lucide-react";

export default function ActivityLog({ nodes }) {
  // Extract activity from nodes
  const getActivity = () => {
    const activities = [];

    nodes.forEach((node) => {
      if (node.data.createdBy) {
        activities.push({
          id: `created-${node.id}`,
          type: "created",
          user: node.data.createdBy,
          timestamp: node.data.createdAt,
          nodeType: node.type,
          nodeId: node.id,
        });
      }

      if (
        node.data.lastModifiedBy &&
        node.data.lastModifiedBy.id !== node.data.createdBy?.id
      ) {
        activities.push({
          id: `modified-${node.id}`,
          type: "modified",
          user: node.data.lastModifiedBy,
          timestamp: node.data.lastModifiedAt,
          nodeType: node.type,
          nodeId: node.id,
        });
      }
    });

    // Sort by timestamp descending (most recent first)
    return activities.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  };

  const activities = getActivity();

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return "Unknown time";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getNodeTypeLabel = (type) => {
    const labels = {
      play: "Play Prompt",
      menu: "Menu",
      collect: "Collect Input",
      tts: "Text-to-Speech",
      stt: "Speech-to-Text",
      istt: "Intelligent STT",
      terminator: "Terminator",
      record: "Record",
      dtmf: "DTMF",
      ddtmf: "DDTMF",
      wait: "Wait",
    };
    return labels[type] || type;
  };

  return (
    <div
      style={{
        padding: "16px",
        background: "var(--bg-secondary)",
        borderRadius: "8px",
        maxHeight: "400px",
        overflowY: "auto",
      }}
    >
      <h4
        style={{
          margin: "0 0 16px 0",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "var(--text-color)",
        }}
      >
        <Clock size={18} />
        Activity Log
      </h4>

      {activities.length === 0 ? (
        <p
          style={{
            color: "var(--muted)",
            textAlign: "center",
            padding: "20px",
          }}
        >
          No activity yet
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {activities.map((activity) => (
            <div
              key={activity.id}
              style={{
                padding: "12px",
                background: "var(--bg-color)",
                borderRadius: "6px",
                borderLeft: `3px solid ${
                  activity.type === "created" ? "#10b981" : "#3b82f6"
                }`,
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background:
                    activity.type === "created" ? "#10b98120" : "#3b82f620",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {activity.type === "created" ? (
                  <Plus size={16} color="#10b981" />
                ) : (
                  <Edit3 size={16} color="#3b82f6" />
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--text-color)",
                    marginBottom: "4px",
                  }}
                >
                  <strong>{activity.user.name}</strong>{" "}
                  {activity.type === "created" ? "created" : "modified"}{" "}
                  <span style={{ color: "var(--primary)" }}>
                    {getNodeTypeLabel(activity.nodeType)}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Clock size={11} />
                  {getRelativeTime(activity.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
