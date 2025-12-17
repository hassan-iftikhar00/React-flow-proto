import React, { useState, useEffect } from "react";
import {
  ClockCounterClockwise,
  XCircle,
  ArrowCounterClockwise,
  GitDiff,
  Clock,
  User,
} from "@phosphor-icons/react";
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from "../hooks/useLocalStorage";

export default function VersionHistory({ currentFlowId, onRestore, onClose }) {
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersion, setCompareVersion] = useState(null);

  console.log(
    "VersionHistory component rendered, currentFlowId:",
    currentFlowId
  );

  useEffect(() => {
    if (currentFlowId) {
      const historyKey = `flow_${currentFlowId}_history`;
      const savedVersions = getLocalStorageItem(historyKey, []);
      console.log("Loaded versions from localStorage:", savedVersions);
      setVersions(savedVersions);
    }
  }, [currentFlowId]);

  const handleRestore = (version) => {
    if (
      window.confirm(
        `Are you sure you want to restore version from ${new Date(
          version.timestamp
        ).toLocaleString()}?`
      )
    ) {
      console.log("VersionHistory: Calling onRestore with version:", version);
      onRestore(version);
      // Close after a small delay to ensure restore completes
      setTimeout(() => {
        console.log("VersionHistory: Closing panel");
        onClose();
      }, 150);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  const getChangesSummary = (version) => {
    const nodeCount = version.nodes?.length || 0;
    const edgeCount = version.edges?.length || 0;
    return `${nodeCount} node${
      nodeCount !== 1 ? "s" : ""
    }, ${edgeCount} connection${edgeCount !== 1 ? "s" : ""}`;
  };

  return (
    <div className="version-history-overlay">
      <div className="version-history-panel">
        <div className="version-history-header">
          <h3>
            <ClockCounterClockwise size={24} color="#AA96DA" weight="duotone" />
            Version History
          </h3>
          <button className="close-btn" onClick={onClose}>
            <XCircle size={24} color="#FF6B6B" weight="duotone" />
          </button>
        </div>

        <div className="version-history-controls">
          <button
            className={`toggle-compare-btn ${compareMode ? "active" : ""}`}
            onClick={() => {
              setCompareMode(!compareMode);
              setCompareVersion(null);
            }}
          >
            <GitDiff size={18} weight="duotone" />
            {compareMode ? "Exit Compare" : "Compare Versions"}
          </button>
        </div>

        <div className="version-history-body">
          {versions.length === 0 ? (
            <div className="no-versions">
              <ClockCounterClockwise size={48} color="#94a3b8" weight="thin" />
              <p>No version history available</p>
              <small>Changes will be automatically saved</small>
            </div>
          ) : (
            <div className="versions-list">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`version-item ${
                    selectedVersion?.id === version.id ? "selected" : ""
                  } ${
                    compareMode && compareVersion?.id === version.id
                      ? "compare-selected"
                      : ""
                  }`}
                  onClick={() => {
                    if (compareMode) {
                      setCompareVersion(version);
                    } else {
                      setSelectedVersion(version);
                    }
                  }}
                >
                  <div className="version-item-header">
                    <div className="version-badge">
                      {index === 0 ? (
                        <span className="current-badge">Current</span>
                      ) : (
                        <span className="version-number">
                          v{versions.length - index}
                        </span>
                      )}
                    </div>
                    <div className="version-time">
                      <Clock size={14} weight="duotone" />
                      {formatTimestamp(version.timestamp)}
                    </div>
                  </div>

                  <div className="version-details">
                    <div className="version-message">
                      {version.message || "Auto-saved"}
                    </div>
                    <div className="version-meta">
                      <span className="version-summary">
                        {getChangesSummary(version)}
                      </span>
                      {version.user && (
                        <span className="version-user">
                          <User size={12} weight="duotone" />
                          {version.user}
                        </span>
                      )}
                    </div>
                  </div>

                  {index !== 0 && !compareMode && (
                    <button
                      className="restore-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestore(version);
                      }}
                    >
                      <ArrowCounterClockwise size={16} weight="duotone" />
                      Restore
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {compareMode && selectedVersion && compareVersion && (
          <div className="compare-view">
            <div className="compare-header">
              <h4>
                <GitDiff size={20} weight="duotone" />
                Comparing Versions
              </h4>
            </div>
            <div className="compare-content">
              <div className="compare-column">
                <h5>
                  Version {versions.length - versions.indexOf(selectedVersion)}
                </h5>
                <p>{formatTimestamp(selectedVersion.timestamp)}</p>
                <div className="compare-stats">
                  <div>Nodes: {selectedVersion.nodes?.length || 0}</div>
                  <div>Connections: {selectedVersion.edges?.length || 0}</div>
                </div>
              </div>
              <div className="compare-divider">→</div>
              <div className="compare-column">
                <h5>
                  Version {versions.length - versions.indexOf(compareVersion)}
                </h5>
                <p>{formatTimestamp(compareVersion.timestamp)}</p>
                <div className="compare-stats">
                  <div>Nodes: {compareVersion.nodes?.length || 0}</div>
                  <div>Connections: {compareVersion.edges?.length || 0}</div>
                </div>
              </div>
            </div>
            <div className="compare-diff">
              <h5>Changes</h5>
              <div className="diff-summary">
                {(() => {
                  const nodeDiff =
                    (compareVersion.nodes?.length || 0) -
                    (selectedVersion.nodes?.length || 0);
                  const edgeDiff =
                    (compareVersion.edges?.length || 0) -
                    (selectedVersion.edges?.length || 0);
                  return (
                    <>
                      {nodeDiff !== 0 && (
                        <div className={nodeDiff > 0 ? "added" : "removed"}>
                          {nodeDiff > 0 ? "+" : ""}
                          {nodeDiff} node{Math.abs(nodeDiff) !== 1 ? "s" : ""}
                        </div>
                      )}
                      {edgeDiff !== 0 && (
                        <div className={edgeDiff > 0 ? "added" : "removed"}>
                          {edgeDiff > 0 ? "+" : ""}
                          {edgeDiff} connection
                          {Math.abs(edgeDiff) !== 1 ? "s" : ""}
                        </div>
                      )}
                      {nodeDiff === 0 && edgeDiff === 0 && (
                        <div className="no-changes">No structural changes</div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
