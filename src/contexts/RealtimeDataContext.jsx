import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useSignalR } from "./SignalRContext";
import { parseBackendFeed } from "../utils/dataParsers";

const RealtimeDataContext = createContext(null);

const CACHE_KEY = "realtime_portal_cache";
const METRICS_CACHE_KEY = "realtime_metrics_cache";

// ============================================================================
// 🔴 TEMPORARY MOCK DATA - REMOVE BEFORE PRODUCTION 🔴
// ============================================================================
const USE_MOCK_DATA = true; // Set to false when backend is ready

// Generate hourly call volume for last 24 hours
const generateHourlyData = () => {
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      timestamp: hour.toISOString(),
      hour: hour.getHours(),
      calls:
        Math.floor(Math.random() * 100) +
        50 +
        (hour.getHours() >= 9 && hour.getHours() <= 17 ? 100 : 0),
    });
  }
  return data;
};

// Mock peak hour data showing realistic call patterns
const mockPeakHourData = [
  { hour: 0, callCount: 12, weekday: 0 },
  { hour: 1, callCount: 8, weekday: 0 },
  { hour: 2, callCount: 5, weekday: 0 },
  { hour: 3, callCount: 4, weekday: 0 },
  { hour: 4, callCount: 6, weekday: 0 },
  { hour: 5, callCount: 15, weekday: 0 },
  { hour: 6, callCount: 32, weekday: 0 },
  { hour: 7, callCount: 58, weekday: 0 },
  { hour: 8, callCount: 89, weekday: 0 },
  { hour: 9, callCount: 124, weekday: 0 },
  { hour: 10, callCount: 145, weekday: 0 },
  { hour: 11, callCount: 156, weekday: 0 },
  { hour: 12, callCount: 142, weekday: 0 },
  { hour: 13, callCount: 138, weekday: 0 },
  { hour: 14, callCount: 152, weekday: 0 },
  { hour: 15, callCount: 147, weekday: 0 },
  { hour: 16, callCount: 134, weekday: 0 },
  { hour: 17, callCount: 98, weekday: 0 },
  { hour: 18, callCount: 67, weekday: 0 },
  { hour: 19, callCount: 45, weekday: 0 },
  { hour: 20, callCount: 34, weekday: 0 },
  { hour: 21, callCount: 28, weekday: 0 },
  { hour: 22, callCount: 21, weekday: 0 },
  { hour: 23, callCount: 16, weekday: 0 },
];

// Mock insurance data
const mockInsuranceData = {
  dropRates: [
    { name: "UnitedHealthcare", value: 12.3, total: 2450 },
    { name: "Aetna", value: 8.7, total: 1890 },
    { name: "Cigna", value: 5.2, total: 1650 },
    { name: "Redial", value: 3.8, total: 1200 },
  ],
  incompleteRates: [
    { name: "UnitedHealthcare", value: 234, percentage: 18.5 },
    { name: "Aetna", value: 156, percentage: 12.3 },
    { name: "Cigna", value: 98, percentage: 7.8 },
  ],
  errorRates: [
    { name: "Medicare", value: 15.2, errors: 187 },
    { name: "Medicaid", value: 11.8, errors: 142 },
    { name: "Blue Cross", value: 8.4, errors: 98 },
  ],
};

// Mock DNIS utilization
const mockDNISData = [
  { name: "221", value: 2450, percentage: 32.1 },
  { name: "231", value: 1890, percentage: 24.8 },
  { name: "144", value: 1650, percentage: 21.7 },
  { name: "Bot", value: 1240, percentage: 16.3 },
];

// Mock active calls real-time by insurance
const mockActiveCallsData = [
  { time: "2:50", UnitedHealthcare: 45, Aetna: 32, Medicare: 28, Other: 25 },
  { time: "2:51", UnitedHealthcare: 48, Aetna: 35, Medicare: 30, Other: 27 },
  { time: "2:52", UnitedHealthcare: 52, Aetna: 38, Medicare: 32, Other: 28 },
];

// Mock transcription data
const mockTranscriptionData = {
  queueLength: 58,
  apiUsage: [
    { name: "OpenAI Whisper", value: 1247, percentage: 45.2 },
    { name: "Google Cloud", value: 892, percentage: 32.3 },
    { name: "Azure Speech", value: 621, percentage: 22.5 },
  ],
  avgTime: 2.9, // seconds
  queueHistory: generateHourlyData().map((d) => ({
    time: `${d.hour}h`,
    queue: Math.floor(Math.random() * 100) + 20,
  })),
};

// Mock metrics with all 22 data points
const mockMetrics = {
  // Telephony Metrics (1-13)
  totalCalls: 16350,
  totalCallsTrend: generateHourlyData(),
  activeCalls: 130,
  completedCalls: 15234,
  droppedCalls: 816,
  dropRate: 5.0,
  successRate: 93.1,
  connectionRate: 93.0,
  avgCallDuration: 245, // seconds
  callDurationDistribution: {
    min: 12,
    max: 842,
    median: 223,
    p90: 467,
    p95: 598,
  },
  peakHourData: mockPeakHourData,
  dnisUtilization: mockDNISData,
  activeCallsRealtime: mockActiveCallsData,
  botVsHuman: { bot: 5232, human: 11118 },
  droppedInsurances: mockInsuranceData.dropRates,
  redialRate: 12.1,
  redialTrend: generateHourlyData().map((d) => ({
    time: `${d.hour}h`,
    rate: 10 + Math.random() * 5,
  })),
  firstAttemptSuccess: 78.9,
  abandonmentRate: 11.2,
  concurrentPeaks: generateHourlyData().map((d) => ({
    time: `${d.hour}:00`,
    concurrent: d.calls,
  })),

  // IVR Workflow Metrics (14-22)
  callsInProgress: 23,
  callsInProgressPercentage: 14.2,
  callsInProgressTrend: generateHourlyData().map((d) => ({
    time: `${d.hour}h`,
    inProgress: Math.floor(d.calls * 0.15),
  })),
  claimStatusCompletionRate: 84.3,
  claimStatusTrend: generateHourlyData().map((d) => ({
    time: `${d.hour}h`,
    rate: 80 + Math.random() * 10,
  })),
  transcriptionQueueLength: mockTranscriptionData.queueLength,
  transcriptionQueueTrend: mockTranscriptionData.queueHistory,
  transcriptionAPIUsage: mockTranscriptionData.apiUsage,
  avgTranscriptionTime: mockTranscriptionData.avgTime,
  transcriptionTimeTrend: generateHourlyData().map((d) => ({
    time: `${d.hour}h`,
    time: 2 + Math.random() * 2,
  })),
  incompleteInsurances: mockInsuranceData.incompleteRates,
  errorRateByInsurance: mockInsuranceData.errorRates,
  reattemptRate: 9.6,
  reattemptTrend: generateHourlyData().map((d) => ({
    time: `${d.hour}h`,
    rate: 8 + Math.random() * 4,
  })),
  reattemptOutcome: [
    { attempt: 1, successRate: 60 },
    { attempt: 2, successRate: 78 },
    { attempt: 3, successRate: 85 },
  ],

  // Legacy fields
  templateGroupBreakdown: {
    "Customer Support": 487,
    "Sales Inquiries": 324,
    "Technical Help": 256,
    "Billing Questions": 180,
  },
  recentActivity: [
    {
      id: 1,
      timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
      message: "High call volume detected",
      type: "warning",
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      message: "Transcription queue normalized",
      type: "success",
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      message: "Drop rate decreased to 5.0%",
      type: "success",
    },
  ],
  alerts: [
    {
      id: 1,
      severity: "warning",
      message: "Drop rate > 10% for Medcare Insurance",
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      insurance: "Medcare",
    },
  ],
  lastUpdated: new Date().toISOString(),
};
// ============================================================================
// 🔴 END TEMPORARY MOCK DATA 🔴
// ============================================================================

/**
 * Initial dashboard metrics structure
 */
const initialMetrics = USE_MOCK_DATA
  ? mockMetrics
  : {
      totalCalls: 0,
      activeCalls: 0,
      completedCalls: 0,
      droppedCalls: 0,
      dropRate: 0,
      successRate: 0,
      avgCallDuration: 0,
      peakHourData: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        callCount: 0,
      })),
      botVsHuman: { bot: 0, human: 0 },
      templateGroupBreakdown: {},
      recentActivity: [],
      alerts: [],
      lastUpdated: null,
    };

/**
 * RealtimeData Provider Component
 * Manages real-time portal data with localStorage fallback
 */
export function RealtimeDataProvider({ children }) {
  const { on, off, isConnected, connectionStatus } = useSignalR();

  // ============================================================================
  // 🔴 TEMPORARY MOCK TABLE DATA - REMOVE BEFORE PRODUCTION 🔴
  // ============================================================================
  const mockPortalTableData = USE_MOCK_DATA
    ? [
        {
          id: "call-001",
          callId: "CALL-2024-001",
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          dnis: "1-800-555-0001",
          templateGroup: "Customer Support",
          template: "General Support Flow",
          status: "completed",
          duration: 235,
          exitReason: "Transferred to Agent",
          isBot: false,
        },
        {
          id: "call-002",
          callId: "CALL-2024-002",
          timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
          dnis: "1-800-555-0002",
          templateGroup: "Sales Inquiries",
          template: "Product Info",
          status: "completed",
          duration: 182,
          exitReason: "Self-Service Complete",
          isBot: true,
        },
        {
          id: "call-003",
          callId: "CALL-2024-003",
          timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
          dnis: "1-800-555-0001",
          templateGroup: "Technical Help",
          template: "Troubleshooting Flow",
          status: "dropped",
          duration: 45,
          exitReason: "Customer Hangup",
          isBot: true,
        },
        {
          id: "call-004",
          callId: "CALL-2024-004",
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          dnis: "1-800-555-0003",
          templateGroup: "Billing Questions",
          template: "Account Balance",
          status: "completed",
          duration: 312,
          exitReason: "Transferred to Agent",
          isBot: false,
        },
        {
          id: "call-005",
          callId: "CALL-2024-005",
          timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
          dnis: "1-800-555-0002",
          templateGroup: "Customer Support",
          template: "FAQ Assistance",
          status: "active",
          duration: 0,
          exitReason: null,
          isBot: true,
        },
        {
          id: "call-006",
          callId: "CALL-2024-006",
          timestamp: new Date(Date.now() - 22 * 60000).toISOString(),
          dnis: "1-800-555-0001",
          templateGroup: "Sales Inquiries",
          template: "Pricing Information",
          status: "completed",
          duration: 198,
          exitReason: "Self-Service Complete",
          isBot: true,
        },
        {
          id: "call-007",
          callId: "CALL-2024-007",
          timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
          dnis: "1-800-555-0004",
          templateGroup: "Technical Help",
          template: "Password Reset",
          status: "completed",
          duration: 156,
          exitReason: "Self-Service Complete",
          isBot: true,
        },
        {
          id: "call-008",
          callId: "CALL-2024-008",
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          dnis: "1-800-555-0003",
          templateGroup: "Billing Questions",
          template: "Payment Processing",
          status: "dropped",
          duration: 67,
          exitReason: "System Error",
          isBot: false,
        },
        {
          id: "call-009",
          callId: "CALL-2024-009",
          timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
          dnis: "1-800-555-0001",
          templateGroup: "Customer Support",
          template: "General Support Flow",
          status: "completed",
          duration: 289,
          exitReason: "Transferred to Agent",
          isBot: false,
        },
        {
          id: "call-010",
          callId: "CALL-2024-010",
          timestamp: new Date(Date.now() - 40 * 60000).toISOString(),
          dnis: "1-800-555-0002",
          templateGroup: "Sales Inquiries",
          template: "New Customer Onboarding",
          status: "completed",
          duration: 423,
          exitReason: "Transferred to Agent",
          isBot: false,
        },
      ]
    : [];

  const mockTemplateGroups = USE_MOCK_DATA
    ? [
        { id: 1, name: "Customer Support", count: 487 },
        { id: 2, name: "Sales Inquiries", count: 324 },
        { id: 3, name: "Technical Help", count: 256 },
        { id: 4, name: "Billing Questions", count: 180 },
      ]
    : [];
  // ============================================================================
  // 🔴 END TEMPORARY MOCK TABLE DATA 🔴
  // ============================================================================

  const [portalTableData, setPortalTableData] = useState(mockPortalTableData);
  const [dashboardMetrics, setDashboardMetrics] = useState(initialMetrics);
  const [templateGroups, setTemplateGroups] = useState(mockTemplateGroups);
  const [offlineChanges, setOfflineChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const serverStateRef = useRef(null);
  const wasOfflineRef = useRef(false);

  /**
   * Load cached data from localStorage
   */
  const loadCachedData = useCallback(() => {
    try {
      // 🔴 If using mock data, skip loading from cache to preserve mock data
      if (USE_MOCK_DATA) {
        console.log("[RealtimeData] Using mock data - skipping cache load");
        setLoading(false);
        return;
      }

      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedMetrics = localStorage.getItem(METRICS_CACHE_KEY);

      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        setPortalTableData(parsed.tableData || []);
        setTemplateGroups(parsed.templateGroups || []);
        console.log("[RealtimeData] Loaded cached portal data");
      }

      if (cachedMetrics) {
        const parsed = JSON.parse(cachedMetrics);
        setDashboardMetrics(parsed);
        console.log("[RealtimeData] Loaded cached metrics");
      }
    } catch (error) {
      console.error("[RealtimeData] Failed to load cached data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Save data to localStorage cache
   */
  const saveToCache = useCallback(
    (tableData, metrics) => {
      // 🔴 Don't save mock data to cache
      if (USE_MOCK_DATA) {
        return;
      }

      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            tableData,
            templateGroups,
            timestamp: new Date().toISOString(),
          }),
        );
        localStorage.setItem(METRICS_CACHE_KEY, JSON.stringify(metrics));
        console.log("[RealtimeData] Saved data to cache");
      } catch (error) {
        console.error("[RealtimeData] Failed to save to cache:", error);
      }
    },
    [templateGroups],
  );

  /**
   * Calculate dashboard metrics from table data
   */
  const calculateMetrics = useCallback((tableData) => {
    const now = new Date();
    const currentHour = now.getHours();

    // Initialize metrics
    const metrics = {
      totalCalls: tableData.length,
      activeCalls: 0,
      completedCalls: 0,
      droppedCalls: 0,
      dropRate: 0,
      successRate: 0,
      avgCallDuration: 0,
      peakHourData: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        callCount: 0,
      })),
      botVsHuman: { bot: 0, human: 0 },
      templateGroupBreakdown: {},
      recentActivity: [],
      alerts: [],
      lastUpdated: now.toISOString(),
    };

    let totalDuration = 0;

    // Calculate metrics from table data
    tableData.forEach((row) => {
      // Call status counts
      if (row.callStatus === "Active") metrics.activeCalls++;
      if (row.callStatus === "Completed") metrics.completedCalls++;
      if (row.callStatus === "Dropped") metrics.droppedCalls++;

      // Duration
      if (row.callDuration) totalDuration += row.callDuration;

      // Bot vs Human
      if (row.handlerType === "Bot") metrics.botVsHuman.bot++;
      if (row.handlerType === "Human") metrics.botVsHuman.human++;

      // Template group breakdown
      if (row.templateGroup) {
        if (!metrics.templateGroupBreakdown[row.templateGroup]) {
          metrics.templateGroupBreakdown[row.templateGroup] = 0;
        }
        metrics.templateGroupBreakdown[row.templateGroup]++;
      }

      // Peak hours (from createdAt timestamp)
      if (row.createdAt) {
        const callHour = new Date(row.createdAt).getHours();
        if (metrics.peakHourData[callHour]) {
          metrics.peakHourData[callHour].callCount++;
        }
      }
    });

    // Calculate rates
    if (metrics.totalCalls > 0) {
      metrics.dropRate = (metrics.droppedCalls / metrics.totalCalls) * 100;
      metrics.successRate = (metrics.completedCalls / metrics.totalCalls) * 100;
      metrics.avgCallDuration = totalDuration / metrics.totalCalls;
    }

    // Generate alerts
    if (metrics.dropRate > 10) {
      metrics.alerts.push({
        id: "high-drop-rate",
        severity: "warning",
        message: `Drop rate is ${metrics.dropRate.toFixed(1)}% (threshold: 10%)`,
        timestamp: now.toISOString(),
      });
    }

    if (metrics.successRate < 85 && metrics.totalCalls > 10) {
      metrics.alerts.push({
        id: "low-success-rate",
        severity: "error",
        message: `Success rate is ${metrics.successRate.toFixed(1)}% (threshold: 85%)`,
        timestamp: now.toISOString(),
      });
    }

    // Recent activity (last 10 records)
    metrics.recentActivity = tableData.slice(0, 10).map((row) => ({
      id: row.id,
      type: row.callStatus,
      message: `${row.ivrInsurance || "Unknown"} - ${row.callStatus}`,
      timestamp: row.createdAt,
    }));

    return metrics;
  }, []);

  /**
   * Add new row to table (prepend)
   */
  const addRow = useCallback(
    (rawData) => {
      const parsedRow = parseBackendFeed(rawData);

      setPortalTableData((prev) => {
        const newData = [parsedRow, ...prev];
        const newMetrics = calculateMetrics(newData);
        setDashboardMetrics(newMetrics);
        saveToCache(newData, newMetrics);
        return newData;
      });

      console.log("[RealtimeData] Added new row:", parsedRow);
    },
    [calculateMetrics, saveToCache],
  );

  /**
   * Update row status
   */
  const updateRowStatus = useCallback(
    (templateId, newStatus) => {
      setPortalTableData((prev) => {
        const index = prev.findIndex((row) => row.templateId === templateId);

        if (index === -1) {
          console.warn(
            `[RealtimeData] Row with templateId ${templateId} not found`,
          );
          return prev;
        }

        const newData = [...prev];
        newData[index] = {
          ...newData[index],
          callStatus: newStatus,
          lastUpdated: new Date().toISOString(),
        };

        // Mark as offline change if we were disconnected
        if (wasOfflineRef.current) {
          setOfflineChanges((changes) => {
            if (!changes.includes(newData[index].id)) {
              return [...changes, newData[index].id];
            }
            return changes;
          });
        }

        const newMetrics = calculateMetrics(newData);
        setDashboardMetrics(newMetrics);
        saveToCache(newData, newMetrics);

        console.log(
          `[RealtimeData] Updated status for templateId ${templateId} to ${newStatus}`,
        );
        return newData;
      });
    },
    [calculateMetrics, saveToCache],
  );

  /**
   * Refresh metrics manually
   */
  const refreshMetrics = useCallback(() => {
    const newMetrics = calculateMetrics(portalTableData);
    setDashboardMetrics(newMetrics);
    saveToCache(portalTableData, newMetrics);
  }, [portalTableData, calculateMetrics, saveToCache]);

  /**
   * Clear offline cache and sync with server
   */
  const clearOfflineCache = useCallback(() => {
    setOfflineChanges([]);
    console.log("[RealtimeData] Cleared offline changes");
  }, []);

  /**
   * Sync with server state after reconnection
   */
  const syncWithServer = useCallback(
    async (serverData) => {
      if (!serverData) return;

      // Compare with cached data
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        const changedRows = [];

        // Find rows that changed while offline
        serverData.forEach((serverRow) => {
          const cachedRow = parsed.tableData.find((r) => r.id === serverRow.id);
          if (
            cachedRow &&
            JSON.stringify(cachedRow) !== JSON.stringify(serverRow)
          ) {
            changedRows.push(serverRow.id);
          }
        });

        if (changedRows.length > 0) {
          setOfflineChanges(changedRows);
          console.log(
            `[RealtimeData] Detected ${changedRows.length} changes while offline`,
          );
        }
      }

      // Update with server data
      setPortalTableData(serverData);
      const newMetrics = calculateMetrics(serverData);
      setDashboardMetrics(newMetrics);
      saveToCache(serverData, newMetrics);
      serverStateRef.current = serverData;
    },
    [calculateMetrics, saveToCache],
  );

  /**
   * Handle SignalR DataCreated event
   */
  const handleDataCreated = useCallback(
    (data) => {
      console.log("[RealtimeData] DataCreated event received:", data);
      addRow(data);
    },
    [addRow],
  );

  /**
   * Handle SignalR DataStatusUpdated event
   */
  const handleDataStatusUpdated = useCallback(
    (update) => {
      console.log("[RealtimeData] DataStatusUpdated event received:", update);
      const { templateId, callStatus, id } = update;
      updateRowStatus(templateId || id, callStatus);
    },
    [updateRowStatus],
  );

  // Subscribe to SignalR events
  useEffect(() => {
    if (isConnected && on) {
      on("DataCreated", handleDataCreated);
      on("DataStatusUpdated", handleDataStatusUpdated);

      console.log("[RealtimeData] Subscribed to SignalR events");

      return () => {
        off("DataCreated", handleDataCreated);
        off("DataStatusUpdated", handleDataStatusUpdated);
        console.log("[RealtimeData] Unsubscribed from SignalR events");
      };
    }
  }, [isConnected, on, off, handleDataCreated, handleDataStatusUpdated]);

  // Handle connection status changes
  useEffect(() => {
    if (
      connectionStatus === "Disconnected" ||
      connectionStatus === "Reconnecting"
    ) {
      wasOfflineRef.current = true;
      // Save current state to cache
      saveToCache(portalTableData, dashboardMetrics);
    } else if (connectionStatus === "Connected" && wasOfflineRef.current) {
      // Reconnected - trigger sync (would need server endpoint)
      console.log("[RealtimeData] Reconnected - ready to sync with server");
      wasOfflineRef.current = false;

      // TODO: Fetch current server state and sync
      // syncWithServer(await fetchServerState());
    }
  }, [connectionStatus, portalTableData, dashboardMetrics, saveToCache]);

  // Load cached data on mount
  useEffect(() => {
    loadCachedData();
  }, [loadCachedData]);

  // Auto-refresh metrics every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (portalTableData.length > 0) {
        refreshMetrics();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [portalTableData, refreshMetrics]);

  const value = {
    portalTableData,
    setPortalTableData,
    dashboardMetrics,
    templateGroups,
    setTemplateGroups,
    offlineChanges,
    loading,
    addRow,
    updateRowStatus,
    refreshMetrics,
    clearOfflineCache,
    syncWithServer,
  };

  return (
    <RealtimeDataContext.Provider value={value}>
      {children}
    </RealtimeDataContext.Provider>
  );
}

/**
 * Custom hook to access RealtimeData context
 */
export function useRealtimeData() {
  const context = useContext(RealtimeDataContext);
  if (!context) {
    throw new Error(
      "useRealtimeData must be used within a RealtimeDataProvider",
    );
  }
  return context;
}

export default RealtimeDataContext;
