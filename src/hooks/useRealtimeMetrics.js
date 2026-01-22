import { useMemo } from "react";
import { useRealtimeData } from "../contexts/RealtimeDataContext";

/**
 * Custom hook to aggregate and transform realtime data for dashboard metrics
 * @returns {Object} Dashboard metrics and chart-ready data
 */
export function useRealtimeMetrics() {
  const { dashboardMetrics, portalTableData, loading } = useRealtimeData();

  // Transform metrics for charts
  const chartData = useMemo(() => {
    // Generate sample time series data for call volume (last 24 hours)
    const now = new Date();
    const callVolumeData = Array.from({ length: 24 }, (_, i) => {
      const hour = (now.getHours() - 23 + i + 24) % 24;
      const label =
        hour === 0
          ? "12 AM"
          : hour === 12
            ? "12 PM"
            : hour < 12
              ? `${hour} AM`
              : `${hour - 12} PM`;
      return {
        time: label,
        hour,
        calls: dashboardMetrics.peakHourData[hour]?.callCount || 0,
      };
    });

    // Generate drop rate trend data (last 12 periods)
    const dropRateData = Array.from({ length: 12 }, (_, i) => {
      const period = 12 - i;
      return {
        time: `-${period}h`,
        dropRate: Math.max(
          0,
          dashboardMetrics.dropRate + (Math.random() - 0.5) * 5,
        ),
      };
    });

    return {
      callVolume: callVolumeData,
      dropRate: dropRateData,
      peakHours: dashboardMetrics.peakHourData,
      botVsHuman: dashboardMetrics.botVsHuman,
      templateGroups: dashboardMetrics.templateGroupBreakdown,
    };
  }, [dashboardMetrics]);

  // Calculate additional derived metrics
  const derivedMetrics = useMemo(() => {
    const totalCalls = dashboardMetrics.totalCalls;
    const completionRate = dashboardMetrics.successRate;
    const avgDuration = dashboardMetrics.avgCallDuration;

    // Automation rate (bot handled / total)
    const automationRate =
      totalCalls > 0 ? (dashboardMetrics.botVsHuman.bot / totalCalls) * 100 : 0;

    // First call resolution (assuming completed calls are resolved)
    const fcrRate =
      totalCalls > 0 ? (dashboardMetrics.completedCalls / totalCalls) * 100 : 0;

    // Peak hour
    const peakHour = dashboardMetrics.peakHourData.reduce(
      (max, curr) => (curr.callCount > max.callCount ? curr : max),
      dashboardMetrics.peakHourData[0],
    );

    // Active alerts count
    const activeAlerts = dashboardMetrics.alerts.filter((alert) => {
      if (alert.severity === "error" || alert.severity === "warning") {
        return true;
      }
      return false;
    });

    return {
      automationRate,
      fcrRate,
      peakHour,
      activeAlertsCount: activeAlerts.length,
      avgCallDurationFormatted: formatDuration(avgDuration),
      lastUpdateTime: dashboardMetrics.lastUpdated
        ? new Date(dashboardMetrics.lastUpdated).toLocaleTimeString()
        : "N/A",
    };
  }, [dashboardMetrics]);

  // Helper function to format duration
  function formatDuration(seconds) {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  }

  return {
    // Raw telephony metrics
    totalCalls: dashboardMetrics.totalCalls,
    totalCallsTrend: dashboardMetrics.totalCallsTrend || [],
    activeCalls: dashboardMetrics.activeCalls,
    completedCalls: dashboardMetrics.completedCalls,
    droppedCalls: dashboardMetrics.droppedCalls,
    dropRate: dashboardMetrics.dropRate,
    successRate: dashboardMetrics.successRate,
    connectionRate:
      dashboardMetrics.connectionRate || dashboardMetrics.successRate,
    avgCallDuration: dashboardMetrics.avgCallDuration,
    callDurationDistribution: dashboardMetrics.callDurationDistribution || {},

    // DNIS and Active Calls
    dnisUtilization: dashboardMetrics.dnisUtilization || [],
    activeCallsRealtime: dashboardMetrics.activeCallsRealtime || [],

    // Drop and redial metrics
    droppedInsurances: dashboardMetrics.droppedInsurances || [],
    redialRate: dashboardMetrics.redialRate || 0,
    redialTrend: dashboardMetrics.redialTrend || [],
    firstAttemptSuccess: dashboardMetrics.firstAttemptSuccess || 0,
    abandonmentRate: dashboardMetrics.abandonmentRate || 0,
    concurrentPeaks: dashboardMetrics.concurrentPeaks || [],

    // IVR Workflow metrics
    callsInProgress: dashboardMetrics.callsInProgress || 0,
    callsInProgressPercentage: dashboardMetrics.callsInProgressPercentage || 0,
    callsInProgressTrend: dashboardMetrics.callsInProgressTrend || [],
    claimStatusCompletionRate: dashboardMetrics.claimStatusCompletionRate || 0,
    claimStatusTrend: dashboardMetrics.claimStatusTrend || [],

    // Transcription metrics
    transcriptionQueueLength: dashboardMetrics.transcriptionQueueLength || 0,
    transcriptionQueueTrend: dashboardMetrics.transcriptionQueueTrend || [],
    transcriptionAPIUsage: dashboardMetrics.transcriptionAPIUsage || [],
    avgTranscriptionTime: dashboardMetrics.avgTranscriptionTime || 0,
    transcriptionTimeTrend: dashboardMetrics.transcriptionTimeTrend || [],

    // Error and incomplete metrics
    incompleteInsurances: dashboardMetrics.incompleteInsurances || [],
    errorRateByInsurance: dashboardMetrics.errorRateByInsurance || [],

    // Reattempt metrics
    reattemptRate: dashboardMetrics.reattemptRate || 0,
    reattemptTrend: dashboardMetrics.reattemptTrend || [],
    reattemptOutcome: dashboardMetrics.reattemptOutcome || [],

    // Derived metrics
    ...derivedMetrics,

    // Chart data
    chartData,

    // Alerts
    alerts: dashboardMetrics.alerts,
    recentActivity: dashboardMetrics.recentActivity,

    // Loading state
    loading,
  };
}
