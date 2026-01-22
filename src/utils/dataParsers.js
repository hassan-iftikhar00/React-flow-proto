/**
 * Data parsing utilities for transforming backend JSON to frontend format
 */

/**
 * Generates unique ID if not provided
 * @returns {string} Unique ID
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parse backend feed JSON to camelCase table row format
 * Handles keys with spaces like "Call Status", "Claim Number", etc.
 *
 * @param {Object} backendData - Raw JSON from backend feed
 * @returns {Object} Parsed row data with camelCase keys
 */
export function parseBackendFeed(backendData) {
  if (!backendData || typeof backendData !== "object") {
    console.warn("[DataParser] Invalid backend data:", backendData);
    return null;
  }

  try {
    // Extract and transform fields
    const parsed = {
      // Core identifiers
      id: backendData.id || backendData.Id || backendData.ID || generateId(),
      oid: backendData.oid || backendData.OID || backendData.Oid || null,
      templateId:
        backendData.templateId ||
        backendData.TemplateID ||
        backendData["Template ID"] ||
        null,
      templateGroup:
        backendData.templateGroup ||
        backendData["Template Group"] ||
        backendData.TemplateGroup ||
        "Uncategorized",

      // IVR-specific fields
      ivrInsurance:
        backendData.ivrInsurance ||
        backendData["IVR_Insurance"] ||
        backendData["IVR Insurance"] ||
        null,

      // Claim information
      claimNo:
        backendData.claimNo ||
        backendData["Claim No"] ||
        backendData["Claim Number"] ||
        backendData.ClaimNumber ||
        null,
      claimId:
        backendData.claimId ||
        backendData["Claim ID"] ||
        backendData.ClaimId ||
        null,
      referenceNumber:
        backendData.referenceNumber ||
        backendData["Reference Number"] ||
        backendData.ReferenceNumber ||
        null,

      // Financial fields
      submittedAmount: parseFloat(
        backendData.submittedAmount ||
          backendData["Submitted Amount"] ||
          backendData.SubmittedAmount ||
          0,
      ),
      approvedAmount: parseFloat(
        backendData.approvedAmount ||
          backendData["Approved Amount"] ||
          backendData.ApprovedAmount ||
          0,
      ),
      currency: backendData.currency || backendData.Currency || "USD",

      // Call status and tracking
      callStatus:
        backendData.callStatus ||
        backendData["Call Status"] ||
        backendData.CallStatus ||
        "Unknown",
      callDuration: parseInt(
        backendData.callDuration ||
          backendData["Call Duration"] ||
          backendData.CallDuration ||
          0,
      ),
      handlerType:
        backendData.handlerType ||
        backendData["Handler Type"] ||
        backendData.HandlerType ||
        "Bot",

      // Dates
      dateOfService:
        backendData.dateOfService ||
        backendData["Date of Service"] ||
        backendData.DOS ||
        backendData.DateOfService ||
        null,
      submissionDate:
        backendData.submissionDate ||
        backendData["Submission Date"] ||
        backendData.SubmissionDate ||
        null,
      createdAt:
        backendData.createdAt ||
        backendData.CreatedAt ||
        backendData.created_at ||
        new Date().toISOString(),
      updatedAt:
        backendData.updatedAt ||
        backendData.UpdatedAt ||
        backendData.updated_at ||
        null,
      lastUpdated:
        backendData.lastUpdated ||
        backendData.LastUpdated ||
        backendData.last_updated ||
        new Date().toISOString(),

      // Patient/Provider information
      patientName:
        backendData.patientName ||
        backendData["Patient Name"] ||
        backendData.PatientName ||
        null,
      patientId:
        backendData.patientId ||
        backendData["Patient ID"] ||
        backendData.PatientId ||
        null,
      providerId:
        backendData.providerId ||
        backendData["Provider ID"] ||
        backendData.ProviderId ||
        null,
      providerName:
        backendData.providerName ||
        backendData["Provider Name"] ||
        backendData.ProviderName ||
        null,

      // Additional metadata
      phoneNumber:
        backendData.phoneNumber ||
        backendData["Phone Number"] ||
        backendData.PhoneNumber ||
        null,
      callerType:
        backendData.callerType ||
        backendData["Caller Type"] ||
        backendData.CallerType ||
        null,
      priority: backendData.priority || backendData.Priority || "Normal",
      notes:
        backendData.notes || backendData.Notes || backendData.comments || null,

      // Raw data for debugging/full details
      _raw: backendData,
    };

    // Convert date strings to Date objects if needed
    if (parsed.dateOfService && typeof parsed.dateOfService === "string") {
      try {
        parsed.dateOfService = new Date(parsed.dateOfService).toISOString();
      } catch (e) {
        console.warn(
          "[DataParser] Invalid dateOfService:",
          parsed.dateOfService,
        );
      }
    }

    console.log("[DataParser] Parsed backend feed:", parsed);
    return parsed;
  } catch (error) {
    console.error(
      "[DataParser] Error parsing backend data:",
      error,
      backendData,
    );
    return null;
  }
}

/**
 * Convert table row format back to backend format (for updates)
 * @param {Object} rowData - Frontend row data
 * @returns {Object} Backend-formatted data
 */
export function formatForBackend(rowData) {
  if (!rowData || typeof rowData !== "object") {
    return null;
  }

  return {
    ID: rowData.id,
    OID: rowData.oid,
    "Template ID": rowData.templateId,
    "Template Group": rowData.templateGroup,
    IVR_Insurance: rowData.ivrInsurance,
    "Claim Number": rowData.claimNo,
    "Claim ID": rowData.claimId,
    "Reference Number": rowData.referenceNumber,
    "Submitted Amount": rowData.submittedAmount,
    "Approved Amount": rowData.approvedAmount,
    "Call Status": rowData.callStatus,
    "Call Duration": rowData.callDuration,
    "Handler Type": rowData.handlerType,
    "Date of Service": rowData.dateOfService,
    "Submission Date": rowData.submissionDate,
    "Patient Name": rowData.patientName,
    "Patient ID": rowData.patientId,
    "Provider ID": rowData.providerId,
    "Provider Name": rowData.providerName,
    "Phone Number": rowData.phoneNumber,
    "Caller Type": rowData.callerType,
    Priority: rowData.priority,
    Notes: rowData.notes,
  };
}

/**
 * Validate required fields in parsed data
 * @param {Object} parsedData - Parsed row data
 * @returns {Object} Validation result { valid: boolean, errors: string[] }
 */
export function validateParsedData(parsedData) {
  const errors = [];
  const requiredFields = ["id", "templateId", "callStatus"];

  requiredFields.forEach((field) => {
    if (!parsedData[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Parse array of backend records
 * @param {Array} backendArray - Array of backend records
 * @returns {Array} Array of parsed records
 */
export function parseBulkData(backendArray) {
  if (!Array.isArray(backendArray)) {
    console.warn("[DataParser] Expected array but got:", typeof backendArray);
    return [];
  }

  return backendArray
    .map((item) => parseBackendFeed(item))
    .filter((item) => item !== null);
}

/**
 * Extract unique template groups from data
 * @param {Array} dataArray - Array of parsed data
 * @returns {Array} Unique template group names
 */
export function extractTemplateGroups(dataArray) {
  if (!Array.isArray(dataArray)) return [];

  const groups = new Set();
  dataArray.forEach((item) => {
    if (item.templateGroup) {
      groups.add(item.templateGroup);
    }
  });

  return Array.from(groups).sort();
}

/**
 * Format currency value
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = "USD") {
  if (typeof amount !== "number") {
    amount = parseFloat(amount) || 0;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format duration in seconds to human-readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (e.g., "2m 30s")
 */
export function formatDuration(seconds) {
  if (!seconds || seconds === 0) return "0s";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(" ");
}

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'time')
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = "short") {
  if (!date) return "N/A";

  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return "Invalid Date";
  }

  const options = {
    short: { month: "short", day: "numeric", year: "numeric" },
    long: {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
    time: { hour: "2-digit", minute: "2-digit", second: "2-digit" },
  };

  return new Intl.DateTimeFormat(
    "en-US",
    options[format] || options.short,
  ).format(d);
}
