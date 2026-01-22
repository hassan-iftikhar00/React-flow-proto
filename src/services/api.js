import axios from "axios";

/**
 * Axios instance configured with base URL and defaults
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://localhost:44395/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor to add auth token if available
 */
apiClient.interceptors.request.use(
  (config) => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response interceptor for error handling
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error(
        "[API] Server error:",
        error.response.status,
        error.response.data,
      );

      if (error.response.status === 401) {
        // Unauthorized - clear auth and redirect to login
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    } else if (error.request) {
      // Request made but no response received
      console.error("[API] Network error:", error.message);
    } else {
      // Something else happened
      console.error("[API] Error:", error.message);
    }
    return Promise.reject(error);
  },
);

/**
 * API service for real-time portal
 */
const api = {
  /**
   * POST new data entry
   * @param {Object} data - Data payload to create
   * @returns {Promise<Object>} Created data object
   */
  postData: async (data) => {
    try {
      const response = await apiClient.post("/data", data);
      console.log("[API] POST /data success:", response.data);
      return response.data;
    } catch (error) {
      console.error("[API] POST /data failed:", error);
      throw error;
    }
  },

  /**
   * PATCH update call status for specific record
   * @param {string|number} id - Record ID
   * @param {string} status - New status value
   * @returns {Promise<Object>} Updated data object
   */
  patchDataStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/data/${id}/status`, { status });
      console.log(`[API] PATCH /data/${id}/status success:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`[API] PATCH /data/${id}/status failed:`, error);
      throw error;
    }
  },

  /**
   * GET direct database query for record status verification
   * @param {string|number} id - Record ID
   * @returns {Promise<Object>} Record with verified status from database
   */
  getRecordStatus: async (id) => {
    try {
      const dbQueryUrl =
        import.meta.env.VITE_DB_QUERY_URL ||
        `${apiClient.defaults.baseURL}/data`;
      const response = await apiClient.get(`${dbQueryUrl}/${id}/status`);
      console.log(`[API] GET /data/${id}/status success:`, response.data);
      return {
        ...response.data,
        verifiedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`[API] GET /data/${id}/status failed:`, error);
      throw error;
    }
  },

  /**
   * GET all portal data (initial load or sync)
   * @param {Object} filters - Optional filters (templateGroup, dateRange, etc.)
   * @returns {Promise<Array>} Array of data records
   */
  getAllData: async (filters = {}) => {
    try {
      const response = await apiClient.get("/data", { params: filters });
      console.log("[API] GET /data success:", response.data.length, "records");
      return response.data;
    } catch (error) {
      console.error("[API] GET /data failed:", error);
      throw error;
    }
  },

  /**
   * GET template groups for dropdown
   * @returns {Promise<Array>} Array of template group names
   */
  getTemplateGroups: async () => {
    try {
      const response = await apiClient.get("/data/template-groups");
      console.log("[API] GET /data/template-groups success:", response.data);
      return response.data;
    } catch (error) {
      console.error("[API] GET /data/template-groups failed:", error);
      // Return default groups if endpoint not available
      return ["Medical", "Dental", "Vision", "Pharmacy", "Mental Health"];
    }
  },

  /**
   * GET call recording URL or metadata
   * @param {string|number} id - Record ID
   * @returns {Promise<Object>} Recording metadata with URL
   */
  getCallRecording: async (id) => {
    try {
      const response = await apiClient.get(`/data/${id}/recording`);
      console.log(`[API] GET /data/${id}/recording success:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`[API] GET /data/${id}/recording failed:`, error);
      throw error;
    }
  },

  /**
   * GET dashboard metrics from server (optional - can be calculated client-side)
   * @param {Object} params - Query parameters (dateRange, etc.)
   * @returns {Promise<Object>} Dashboard metrics object
   */
  getDashboardMetrics: async (params = {}) => {
    try {
      const response = await apiClient.get("/analytics/metrics", { params });
      console.log("[API] GET /analytics/metrics success:", response.data);
      return response.data;
    } catch (error) {
      console.error("[API] GET /analytics/metrics failed:", error);
      throw error;
    }
  },
};

export default api;
