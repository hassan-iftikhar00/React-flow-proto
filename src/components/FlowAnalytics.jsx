import React, { useState, useEffect } from "react";
import {
  ChartLineIcon,
  ChartBarIcon,
  TrendUpIcon,
  TrendDownIcon,
  UsersIcon,
  ClockIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  ThermometerIcon,
} from "@phosphor-icons/react";
import { getLocalStorageItem } from "../hooks/useLocalStorage";

export default function FlowAnalytics({
  currentFlowId,
  nodes,
  edges,
  onClose,
}) {
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState("7days");

  useEffect(() => {
    if (currentFlowId) {
      loadAnalytics();
    }
  }, [currentFlowId, timeRange]);

  const loadAnalytics = () => {
    // Load analytics data from localStorage
    const analyticsKey = `flow_${currentFlowId}_analytics`;
    const data = getLocalStorageItem(analyticsKey, null);

    if (!data) {
      // Generate mock analytics data
      const mockData = generateMockAnalytics();
      setAnalytics(mockData);
    } else {
      setAnalytics(data);
    }
  };

  const generateMockAnalytics = () => {
    const nodeStats = {};
    nodes.forEach((node, index) => {
      const visits = Math.floor(Math.random() * 1000) + 100;
      const completions = Math.floor(visits * (0.6 + Math.random() * 0.3));
      nodeStats[node.id] = {
        visits,
        completions,
        dropoffs: visits - completions,
        avgDuration: Math.floor(Math.random() * 120) + 30,
        type: node.type,
      };
    });

    const pathStats = edges.map((edge) => ({
      from: edge.source,
      to: edge.target,
      traversals: Math.floor(Math.random() * 800) + 50,
    }));

    return {
      totalCalls: 5420,
      completedCalls: 4231,
      averageDuration: 245,
      completionRate: 78.1,
      topDropOffPoints: Object.entries(nodeStats)
        .sort((a, b) => b[1].dropoffs - a[1].dropoffs)
        .slice(0, 5),
      nodeStats,
      pathStats,
      trends: {
        callsChange: 12.5,
        completionChange: -3.2,
        durationChange: 5.8,
      },
    };
  };

  const getNodeName = (nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    return node ? `${node.type.toUpperCase()} (${nodeId})` : nodeId;
  };

  const getHeatmapColor = (traversals, max) => {
    const intensity = traversals / max;
    if (intensity > 0.8) return "#10b981";
    if (intensity > 0.6) return "#22c55e";
    if (intensity > 0.4) return "#fbbf24";
    if (intensity > 0.2) return "#fb923c";
    return "#ef4444";
  };

  if (!analytics) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  const maxTraversals = Math.max(
    ...analytics.pathStats.map((p) => p.traversals)
  );

  return (
    <div className="analytics-overlay">
      <div className="analytics-panel">
        <div className="analytics-header">
          <h3>
            <ChartLineIcon size={24} color="#4ECDC4" weight="duotone" />
            Flow Analytics
          </h3>
          <div className="analytics-header-actions">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="time-range-selector"
            >
              <option value="24hours">Last 24 Hours</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
            <button className="close-btn" onClick={onClose}>
              <XCircleIcon size={24} color="#FF6B6B" weight="duotone" />
            </button>
          </div>
        </div>

        <div className="analytics-body">
          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div
                className="metric-icon"
                style={{ background: "rgba(78, 205, 196, 0.2)" }}
              >
                <PhoneIcon size={28} color="#4ECDC4" weight="duotone" />
              </div>
              <div className="metric-content">
                <div className="metric-label">Total Calls</div>
                <div className="metric-value">
                  {analytics.totalCalls.toLocaleString()}
                </div>
                <div
                  className={`metric-trend ${
                    analytics.trends.callsChange >= 0 ? "positive" : "negative"
                  }`}
                >
                  {analytics.trends.callsChange >= 0 ? (
                    <TrendUpIcon size={16} weight="bold" />
                  ) : (
                    <TrendDownIcon size={16} weight="bold" />
                  )}
                  {Math.abs(analytics.trends.callsChange)}% vs last period
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div
                className="metric-icon"
                style={{ background: "rgba(16, 185, 129, 0.2)" }}
              >
                <CheckCircleIcon size={28} color="#10b981" weight="duotone" />
              </div>
              <div className="metric-content">
                <div className="metric-label">Completion Rate</div>
                <div className="metric-value">{analytics.completionRate}%</div>
                <div
                  className={`metric-trend ${
                    analytics.trends.completionChange >= 0
                      ? "positive"
                      : "negative"
                  }`}
                >
                  {analytics.trends.completionChange >= 0 ? (
                    <TrendUpIcon size={16} weight="bold" />
                  ) : (
                    <TrendDownIcon size={16} weight="bold" />
                  )}
                  {Math.abs(analytics.trends.completionChange)}% vs last period
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div
                className="metric-icon"
                style={{ background: "rgba(251, 191, 36, 0.2)" }}
              >
                <ClockIcon size={28} color="#fbbf24" weight="duotone" />
              </div>
              <div className="metric-content">
                <div className="metric-label">Avg Duration</div>
                <div className="metric-value">
                  {Math.floor(analytics.averageDuration / 60)}m{" "}
                  {analytics.averageDuration % 60}s
                </div>
                <div
                  className={`metric-trend ${
                    analytics.trends.durationChange >= 0
                      ? "negative"
                      : "positive"
                  }`}
                >
                  {analytics.trends.durationChange >= 0 ? (
                    <TrendUpIcon size={16} weight="bold" />
                  ) : (
                    <TrendDownIcon size={16} weight="bold" />
                  )}
                  {Math.abs(analytics.trends.durationChange)}% vs last period
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div
                className="metric-icon"
                style={{ background: "rgba(239, 68, 68, 0.2)" }}
              >
                <UsersIcon size={28} color="#ef4444" weight="duotone" />
              </div>
              <div className="metric-content">
                <div className="metric-label">Drop-offs</div>
                <div className="metric-value">
                  {(
                    analytics.totalCalls - analytics.completedCalls
                  ).toLocaleString()}
                </div>
                <div className="metric-subtitle">
                  {((1 - analytics.completionRate / 100) * 100).toFixed(1)}% of
                  calls
                </div>
              </div>
            </div>
          </div>

          {/* Drop-off Points */}
          <div className="analytics-section">
            <h4>
              <XCircleIcon size={20} color="#ef4444" weight="duotone" />
              Top Drop-off Points
            </h4>
            <div className="dropoff-list">
              {analytics.topDropOffPoints.map(([nodeId, stats], index) => (
                <div key={nodeId} className="dropoff-item">
                  <div className="dropoff-rank">#{index + 1}</div>
                  <div className="dropoff-details">
                    <div className="dropoff-node">{getNodeName(nodeId)}</div>
                    <div className="dropoff-stats">
                      {stats.dropoffs} drop-offs (
                      {((stats.dropoffs / stats.visits) * 100).toFixed(1)}% of
                      visits)
                    </div>
                  </div>
                  <div className="dropoff-bar">
                    <div
                      className="dropoff-bar-fill"
                      style={{
                        width: `${
                          (stats.dropoffs /
                            analytics.topDropOffPoints[0][1].dropoffs) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Node Statistics */}
          <div className="analytics-section">
            <h4>
              <ChartBarIcon size={20} color="#AA96DA" weight="duotone" />
              Node Usage Statistics
            </h4>
            <div className="node-stats-table">
              <table>
                <thead>
                  <tr>
                    <th>Node</th>
                    <th>Visits</th>
                    <th>Completions</th>
                    <th>Drop-offs</th>
                    <th>Avg Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(analytics.nodeStats)
                    .sort((a, b) => b[1].visits - a[1].visits)
                    .slice(0, 10)
                    .map(([nodeId, stats]) => (
                      <tr key={nodeId}>
                        <td className="node-name">{getNodeName(nodeId)}</td>
                        <td>{stats.visits.toLocaleString()}</td>
                        <td className="positive-stat">
                          {stats.completions.toLocaleString()}
                        </td>
                        <td className="negative-stat">
                          {stats.dropoffs.toLocaleString()}
                        </td>
                        <td>{stats.avgDuration}s</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Path Heatmap */}
          <div className="analytics-section">
            <h4>
              <ThermometerIcon size={20} color="#FF6B6B" weight="duotone" />
              Path Usage Heatmap
            </h4>
            <div className="heatmap-legend">
              <span className="legend-label">Less Used</span>
              <div className="legend-gradient"></div>
              <span className="legend-label">Most Used</span>
            </div>
            <div className="path-heatmap">
              {analytics.pathStats
                .sort((a, b) => b.traversals - a.traversals)
                .map((path, index) => (
                  <div key={index} className="heatmap-item">
                    <div className="heatmap-path">
                      <span className="path-from">
                        {getNodeName(path.from)}
                      </span>
                      <ArrowRightIcon size={16} weight="bold" />
                      <span className="path-to">{getNodeName(path.to)}</span>
                    </div>
                    <div className="heatmap-bar-container">
                      <div
                        className="heatmap-bar"
                        style={{
                          width: `${(path.traversals / maxTraversals) * 100}%`,
                          background: getHeatmapColor(
                            path.traversals,
                            maxTraversals
                          ),
                        }}
                      />
                      <span className="heatmap-value">
                        {path.traversals.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
