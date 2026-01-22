import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Activity } from "lucide-react";
import { useRealtimeMetrics } from "../hooks/useRealtimeMetrics";
import CallVolumeChart from "../components/dashboard/CallVolumeChart";
import DropRateChart from "../components/dashboard/DropRateChart";
import PeakHoursHeatmap from "../components/dashboard/PeakHoursHeatmap";
import BotVsHumanDonut from "../components/dashboard/BotVsHumanDonut";
import SimpleDonut from "../components/dashboard/SimpleDonut";
import GaugeChart from "../components/dashboard/GaugeChart";
import HorizontalBarChart from "../components/dashboard/HorizontalBarChart";
import StackedBarChart from "../components/dashboard/StackedBarChart";
import ReattemptFunnel from "../components/dashboard/ReattemptFunnel";
import "./IVRExecutiveDashboard.css";

/**
 * IVR Executive Dashboard - Medical Billing IVR System
 * Displays all 22 KPIs across telephony and workflow metrics
 */
export default function IVRExecutiveDashboard() {
  const navigate = useNavigate();
  const metrics = useRealtimeMetrics();

  // Filters state
  const [filters, setFilters] = useState({
    dateRange: "today",
    insurance: "all",
    practice: "all",
    dnis: "all",
    callType: "all",
  });

  if (metrics.loading) {
    return (
      <div className="ivr-dashboard loading">
        <div className="loading-spinner">
          <Activity size={48} />
          <p>Loading dashboard metrics...</p>
        </div>
      </div>
    );
  }

  // Check for critical alerts
  const criticalAlerts =
    metrics.alerts?.filter(
      (a) => a.severity === "warning" || a.severity === "error",
    ) || [];

  return (
    <div className="ivr-dashboard-new">
      {/* Header with title and filters */}
      <div className="dashboard-top-bar">
        <div className="dashboard-header-left">
          <h1 className="dashboard-title">MEDICAL BILLING IVR SYSTEM</h1>
          <button
            className="portal-link-btn"
            onClick={() => navigate("/portal")}
          >
            View Detailed Portal →
          </button>
        </div>
        <div className="dashboard-filters">
          <select
            value={filters.dateRange}
            onChange={(e) =>
              setFilters({ ...filters, dateRange: e.target.value })
            }
            className="filter-select"
          >
            <option value="today">Date Range</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
          <select
            value={filters.insurance}
            onChange={(e) =>
              setFilters({ ...filters, insurance: e.target.value })
            }
            className="filter-select"
          >
            <option value="all">Insurance</option>
            <option value="unitedhealth">UnitedHealthcare</option>
            <option value="aetna">Aetna</option>
            <option value="cigna">Cigna</option>
          </select>
          <select
            value={filters.practice}
            onChange={(e) =>
              setFilters({ ...filters, practice: e.target.value })
            }
            className="filter-select"
          >
            <option value="all">Practice</option>
            <option value="practice1">Practice 1</option>
            <option value="practice2">Practice 2</option>
          </select>
          <select
            value={filters.dnis}
            onChange={(e) => setFilters({ ...filters, dnis: e.target.value })}
            className="filter-select"
          >
            <option value="all">DNIS</option>
            <option value="221">221</option>
            <option value="231">231</option>
            <option value="144">144</option>
          </select>
          <select
            value={filters.callType}
            onChange={(e) =>
              setFilters({ ...filters, callType: e.target.value })
            }
            className="filter-select"
          >
            <option value="all">Call Type</option>
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
          </select>
        </div>
      </div>

      {/* Alert Banner */}
      {criticalAlerts.length > 0 && (
        <div className="alert-banner">
          <AlertTriangle size={20} />
          <span>{criticalAlerts[0].message}</span>
        </div>
      )}

      {/* Two-column layout */}
      <div className="dashboard-columns">
        {/* LEFT COLUMN: TELEPHONY METRICS */}
        <div className="dashboard-column">
          <h2 className="column-title">TELEPHONY METRICS</h2>

          {/* 1. Total Calls Initiated */}
          <div className="metric-card">
            <div className="metric-header">
              <h3>Total Calls Initiated</h3>
            </div>
            <div className="metric-split">
              <div className="metric-kpi-large">
                <div className="kpi-value">
                  {metrics.totalCalls?.toLocaleString()}
                </div>
                <div className="kpi-label">Total Calls Initiated</div>
              </div>
              <div className="metric-chart-small">
                <CallVolumeChart
                  data={metrics.totalCallsTrend || []}
                  height={100}
                />
              </div>
            </div>
          </div>

          {/* 2 & 3: Connection Rate and 50-Secotay (combined row) */}
          <div className="metric-row-2">
            <div className="metric-card">
              <h3>Successful Call Connection Rate</h3>
              <GaugeChart
                value={metrics.connectionRate}
                thresholds={{ green: 95, yellow: 90 }}
              />
            </div>
            <div className="metric-card">
              <h3>50-Secotay</h3>
              <div className="placeholder-chart">
                <CallVolumeChart
                  data={metrics.totalCallsTrend?.slice(0, 10) || []}
                  height={150}
                />
              </div>
            </div>
          </div>

          {/* 4 & 5: Call Drop Rate and DNIS */}
          <div className="metric-row-2">
            <div className="metric-card">
              <h3>Call Drop Rate</h3>
              <div className="kpi-large-inline">{metrics.dropRate}%</div>
              <HorizontalBarChart
                data={metrics.droppedInsurances}
                dataKey="value"
                nameKey="name"
                unit="%"
                threshold={10}
                height={180}
              />
            </div>
            <div className="metric-card">
              <h3>DNIS Utilization</h3>
              <div className="bot-label">🤖 Bot</div>
              <HorizontalBarChart
                data={metrics.dnisUtilization}
                dataKey="value"
                nameKey="name"
                showPercentage
                height={180}
              />
            </div>
          </div>

          {/* 6 & 7: Peak Hours and Active Calls Real-Time */}
          <div className="metric-row-2">
            <div className="metric-card">
              <h3>Peak Calling Hours</h3>
              <PeakHoursHeatmap data={metrics.chartData?.peakHours || []} />
            </div>
            <div className="metric-card">
              <h3>Active Calls Real-Time</h3>
              <StackedBarChart
                data={metrics.activeCallsRealtime}
                categories={["UnitedHealthcare", "Aetna", "Medicare", "Other"]}
                colors={["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]}
                height={200}
              />
            </div>
          </div>

          {/* 8 & 9: Redial Rate and First Attempt Success */}
          <div className="metric-row-2">
            <div className="metric-card">
              <h3>Redial Rate</h3>
              <div className="metric-with-trend">
                <div className="kpi-value-medium">{metrics.redialRate}%</div>
                <div className="trend-label">Trendline</div>
                <DropRateChart data={metrics.redialTrend} height={100} />
              </div>
            </div>
            <div className="metric-card">
              <h3>First Attempt Success Rate</h3>
              <div className="donut-with-label">
                <SimpleDonut
                  data={[
                    {
                      name: "Call management",
                      value: metrics.firstAttemptSuccess,
                    },
                    {
                      name: "Failed",
                      value: 100 - metrics.firstAttemptSuccess,
                    },
                  ]}
                  colors={["#f59e0b", "#e5e7eb"]}
                />
                <div className="donut-percentage">
                  {metrics.firstAttemptSuccess}%
                </div>
                <div className="donut-sub-label">
                  {(100 - metrics.firstAttemptSuccess).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* 10: Top Dropped Insurances */}
          <div className="metric-card">
            <h3>Top Dropped Insurances</h3>
            <HorizontalBarChart
              data={metrics.droppedInsurances}
              dataKey="value"
              nameKey="name"
              unit="%"
              threshold={10}
              height={180}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: IVR WORKFLOW METRICS */}
        <div className="dashboard-column">
          <h2 className="column-title">IVR WORKFLOW METRICS</h2>

          {/* 11 & 12: Calls In Progress */}
          <div className="metric-row-2">
            <div className="metric-card">
              <h3>Calls In Progress vs Total</h3>
              <div className="metric-with-trend">
                <SimpleDonut
                  data={[
                    {
                      name: "In Progress",
                      value: metrics.callsInProgressPercentage,
                    },
                    {
                      name: "Completed",
                      value: 100 - metrics.callsInProgressPercentage,
                    },
                  ]}
                  colors={["#3b82f6", "#e5e7eb"]}
                />
                <div className="kpi-value-medium">
                  {metrics.callsInProgressPercentage}%
                </div>
                <DropRateChart
                  data={metrics.callsInProgressTrend}
                  height={80}
                />
              </div>
            </div>
            <div className="metric-card">
              <h3>Calls in Progress</h3>
              <div className="metric-with-trend">
                <GaugeChart
                  value={metrics.claimStatusCompletionRate}
                  thresholds={{ green: 85, yellow: 75 }}
                />
                <DropRateChart data={metrics.claimStatusTrend} height={80} />
              </div>
            </div>
          </div>

          {/* 13 & 14: Transcription Queue and API Usage */}
          <div className="metric-row-2">
            <div className="metric-card">
              <h3>Transcription Queue Length</h3>
              <div className="metric-with-trend">
                <div className="kpi-value-large">
                  {metrics.transcriptionQueueLength}
                </div>
                <div className="time-label">Last 24 h</div>
                <DropRateChart
                  data={metrics.transcriptionQueueTrend}
                  height={80}
                />
              </div>
            </div>
            <div className="metric-card">
              <h3>Transcription API Usage</h3>
              <StackedBarChart
                data={metrics.transcriptionAPIUsage}
                categories={["value"]}
                colors={["#3b82f6", "#f59e0b", "#ef4444"]}
                horizontal
                height={180}
              />
            </div>
          </div>

          {/* 15 & 16: Avg Transcription Time and Top Incomplete */}
          <div className="metric-row-2">
            <div className="metric-card">
              <h3>Avg Transcription Time</h3>
              <div className="metric-with-trend">
                <div className="kpi-value-medium">
                  {metrics.avgTranscriptionTime}%
                </div>
                <div className="time-range">June /01</div>
                <DropRateChart
                  data={metrics.transcriptionTimeTrend}
                  height={80}
                />
              </div>
            </div>
            <div className="metric-card">
              <h3>Top Incomplete Insurances</h3>
              <HorizontalBarChart
                data={metrics.incompleteInsurances}
                dataKey="value"
                nameKey="name"
                height={180}
              />
            </div>
          </div>

          {/* 17: Reattempt Rate */}
          <div className="metric-card">
            <h3>Reattempt Rate</h3>
            <div className="metric-with-trend">
              <div className="kpi-value-medium">{metrics.reattemptRate}%</div>
              <div className="range-labels">
                <span>Attempt 1</span>
                <span>70%</span>
                <span>89%</span>
              </div>
              <DropRateChart data={metrics.reattemptTrend} height={100} />
            </div>
          </div>

          {/* 18: Reattempt Outcome Improvement */}
          <div className="metric-card">
            <h3>Reattempt Outcome Improvement</h3>
            <ReattemptFunnel data={metrics.reattemptOutcome} />
          </div>
        </div>
      </div>
    </div>
  );
}
