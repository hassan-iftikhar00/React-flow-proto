import React, { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Checkbox,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  OutlinedInput,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  FormHelperText,
} from "@mui/material";
import {
  Save,
  Clear,
  ArrowBack,
  ArrowForward,
  ErrorOutline,
} from "@mui/icons-material";
import { useLocalStorage } from "../hooks/useLocalStorage";
import "./IVRConfig.css";

const steps = ["General", "Routing", "Database", "API", "Advanced"];
const appTypes = ["Inbound", "Outbound", "Blended"];
const environments = ["Development", "Production"];
const purposes = [
  "Claim Status",
  "Benefits Verification",
  "Balance Reminder",
  "Appointment Rescheduling",
];

const timeZones = [
  "Eastern Time (US & Canada)",
  "Central Time (US & Canada)",
  "Mountain Time (US & Canada)",
  "Pacific Time (US & Canada)",
  "Greenwich Mean Time (UK)",
  "Central European Time (Berlin, Paris, Rome)",
];

export default function IVRConfig() {
  const [activeStep, setActiveStep] = useState(0);

  // State Initialization
  const [form, setForm] = useState({
    enable: false,
    ivrName: "",
    appType: "",
    practiceCode: "",
    appCode: "",
    timeZone: "",
    environment: "",
    recordCNA: "",
    purpose: "",
    dbConnection: "",
    apiKey: "",
    insurance: "",
    insuranceContact: "",
    timeout: "",
    retries: "",
    businessHoursFrom: "",
    businessHoursTo: "",
  });

  const [errors, setErrors] = useState({});
  const [editingLogIndex, setEditingLogIndex] = useState(null);

  // Wrapped in try-catch internally by custom hook, but handled here for logic
  const [ivrLogs, setIvrLogs] = useLocalStorage("ivrConfig_logs", []);

  // UI State
  const [toast, setToast] = useState({
    open: false,
    type: "success",
    message: "",
  });
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    appType: [],
    environment: [],
    purpose: [],
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // --- HELPER FUNCTIONS ---

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => setToast({ open: false, type: "", message: "" }), 3000);
  };

  // --- VALIDATION LOGIC (UPDATED) ---

  const validateField = (name, value) => {
    let error = "";

    // Required check for non-boolean fields
    if (
      (value === "" || value === null || value === undefined) &&
      name !== "enable"
    ) {
      return "This field is required";
    }

    switch (name) {
      case "ivrName":
        if (!/^[a-zA-Z0-9 ]+$/.test(value))
          error = "Only letters and numbers allowed";
        else if (value.length < 3) error = "Name must be at least 3 characters";
        break;

      case "practiceCode":
        // Practice code validation
        if (value.length < 3)
          error = "Practice Code must be at least 3 characters";
        break;

      case "appCode":
        if (value.length < 2) {
          error = "Code must be at least 2 characters";
        } else {
          // --- UNIQUE VALIDATION CHECK ---
          // Check if code exists in logs (excluding the one currently being edited)
          const isDuplicate = ivrLogs.some(
            (log, index) =>
              log.appCode?.toLowerCase() === value.toLowerCase() &&
              index !== editingLogIndex
          );

          if (isDuplicate) {
            error = "Application Code must be unique (Already exists)";
          }
        }
        break;

      case "businessHoursTo":
        if (form.businessHoursFrom && value <= form.businessHoursFrom) {
          error = "End time must be after Start time";
        }
        break;

      case "dbConnection":
        if (value.length < 10) error = "Invalid connection string (too short)";
        break;

      case "apiKey":
        // Robust API Key Validation
        if (value.length < 2) error = "API Key must be at least 2 characters";
        break;

      case "insurance":
        // --- UPDATED: Minimum 3 characters ---
        if (value.length < 3) {
          error = "Insurance ID must be at least 3 characters";
        }
        break;

      case "insuranceContact":
        // --- UPDATED: Email OR Min 11 Digit Phone ---
        if (value.includes("@")) {
          // Validate as Email
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            error = "Invalid email address format";
          }
        } else {
          // Validate as Phone (Numeric & Min 11 digits)
          // ^\d{11,}$ means start to end, digits only, 11 or more repetitions
          if (!/^\d{11,}$/.test(value)) {
            error = "Phone number must be at least 11 digits";
          }
        }
        break;

      case "timeout":
        if (!/^\d+$/.test(value)) error = "Must be a number";
        else if (parseInt(value) > 300) error = "Max timeout is 300s";
        else if (parseInt(value) < 1) error = "Min timeout is 1s";
        break;

      case "retries":
        if (!/^\d+$/.test(value)) error = "Must be a number";
        else if (parseInt(value) > 10) error = "Max retries is 10";
        break;

      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" || name === "enable" ? checked : value;

    setForm((prev) => ({ ...prev, [name]: newValue }));

    if (type !== "checkbox" && name !== "enable") {
      const errorMsg = validateField(name, newValue);
      setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    }
  };

  const validateCurrentStep = () => {
    const stepFields = {
      0: ["ivrName", "appType", "practiceCode", "appCode"],
      1: [
        "environment",
        "timeZone",
        "recordCNA",
        "purpose",
        "businessHoursFrom",
        "businessHoursTo",
      ],
      2: ["dbConnection"],
      3: ["apiKey", "insurance", "insuranceContact"],
      4: ["timeout", "retries"],
    };

    const currentFields = stepFields[activeStep];
    let newErrors = { ...errors };
    let isValid = true;

    currentFields.forEach((field) => {
      const err = validateField(field, form[field]);
      if (err) {
        newErrors[field] = err;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((prev) => prev + 1);
    } else {
      showToast("error", "Please fix the errors before proceeding.");
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleClear = () => {
    setForm({
      enable: false,
      ivrName: "",
      appType: "",
      practiceCode: "",
      appCode: "",
      timeZone: "",
      environment: "",
      recordCNA: "",
      purpose: "",
      dbConnection: "",
      apiKey: "",
      insurance: "",
      insuranceContact: "",
      timeout: "",
      retries: "",
      businessHoursFrom: "",
      businessHoursTo: "",
    });
    setErrors({});
    setActiveStep(0);
    setEditingLogIndex(null);
  };

  // --- SUBMIT WITH ROBUST ERROR HANDLING ---
  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Final Validation Check
    if (!validateCurrentStep()) {
      showToast("error", "Please complete all required fields correctly.");
      return;
    }

    try {
      // 2. Prepare Data
      // Generating a unique numeric ID using timestamp to ensure uniqueness internally
      const newAppId = Date.now();

      const logData = {
        ...form,
        appId:
          editingLogIndex !== null ? ivrLogs[editingLogIndex].appId : newAppId,
        appName: form.ivrName,
        status: form.enable ? "Enabled" : "Disabled",
        businessTimeZone: form.timeZone,
      };

      const updatedLogs = [...ivrLogs];

      // 3. Update or Add
      if (editingLogIndex !== null) {
        updatedLogs[editingLogIndex] = logData;
      } else {
        updatedLogs.push(logData);
      }

      // 4. Save to Storage (This might throw QuotaExceededError)
      setIvrLogs(updatedLogs);

      // 5. Success UI
      showToast(
        "success",
        editingLogIndex !== null
          ? "IVR Log updated successfully!"
          : "IVR Configuration saved successfully!"
      );
      setEditingLogIndex(null);
      handleClear();
    } catch (error) {
      // 6. Error Handling
      console.error("Critical Error during save:", error);

      // Specific check for Storage Full
      if (
        error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED"
      ) {
        showToast("error", "Storage Full! Please delete old logs.");
      } else {
        showToast("error", "An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleDeleteLog = (index) => {
    try {
      const copy = [...ivrLogs];
      copy.splice(index, 1);
      setIvrLogs(copy);
      showToast("success", "Record deleted successfully.");

      // If we were editing this specific log, clear the form
      if (editingLogIndex === index) {
        handleClear();
      }
    } catch (error) {
      console.error("Delete Error:", error);
      showToast("error", "Failed to delete record.");
    }
  };

  const handleEditLog = (index) => {
    try {
      const log = ivrLogs[index];
      setForm({
        enable: log.status === "Enabled",
        ivrName: log.appName,
        appCode: log.appCode,
        appType: log.appType,
        practiceCode: log.practiceCode || "",
        purpose: log.purpose,
        insurance: log.insurance,
        insuranceContact: log.insuranceContact || "",
        timeZone: log.timeZone || log.businessTimeZone || "",
        environment: log.environment,
        recordCNA: log.recordCNA,
        dbConnection: log.dbConnection || "",
        apiKey: log.apiKey || "",
        timeout: log.timeout || "",
        retries: log.retries || "",
        businessHoursFrom: log.businessHoursFrom,
        businessHoursTo: log.businessHoursTo,
      });
      setEditingLogIndex(index);
      setActiveStep(0);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Edit Load Error:", error);
      showToast("error", "Failed to load record for editing.");
    }
  };

  // --- SORTING & FILTERING ---

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const filteredLogs = ivrLogs.filter((log) => {
    const searchMatch =
      (log.appName || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.appCode || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.appType || "").toLowerCase().includes(search.toLowerCase());

    const typeMatch = filters.appType.length
      ? filters.appType.includes(log.appType)
      : true;
    const envMatch = filters.environment.length
      ? filters.environment.includes(log.environment)
      : true;
    const purposeMatch = filters.purpose.length
      ? filters.purpose.includes(log.purpose)
      : true;

    return searchMatch && typeMatch && envMatch && purposeMatch;
  });

  const sortedLogs = useMemo(() => {
    let sortable = [...filteredLogs];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        const valA = a[sortConfig.key] || "";
        const valB = b[sortConfig.key] || "";
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [filteredLogs, sortConfig]);

  const renderSortLabel = (columnKey, label) => (
    <TableSortLabel
      active={sortConfig.key === columnKey}
      direction={sortConfig.key === columnKey ? sortConfig.direction : "asc"}
      onClick={() => requestSort(columnKey)}
    >
      <b>{label}</b>
    </TableSortLabel>
  );

  return (
    <Box className="ivr-container">
      {/* Toast Notification */}
      {toast.open && (
        <Box
          className="ivr-toast"
          sx={{
            borderLeft: `6px solid ${
              toast.type === "error" ? "#d32f2f" : "#2e7d32"
            }`,
            color: toast.type === "error" ? "#d32f2f" : "#2e7d32",
          }}
        >
          <ErrorOutline sx={{ mr: 1 }} />
          <Typography variant="body2" fontWeight="bold">
            {toast.message}
          </Typography>
        </Box>
      )}

      {/* Header */}
      <Box className="ivr-header-sticky">
        <Typography variant="h5" fontWeight="bold">
          IVR Configuration Wizard
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4, mt: 2 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box component="form" noValidate>
          {/* Step 0 - General */}
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.enable}
                      onChange={handleChange}
                      name="enable"
                    />
                  }
                  label="Enable IVR System"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="IVR Name"
                  name="ivrName"
                  value={form.ivrName}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.ivrName}
                  helperText={errors.ivrName}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required error={!!errors.appType}>
                  <InputLabel>Application Type</InputLabel>
                  <Select
                    name="appType"
                    value={form.appType}
                    onChange={handleChange}
                  >
                    {appTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.appType && (
                    <FormHelperText>{errors.appType}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Practice Code"
                  name="practiceCode"
                  value={form.practiceCode}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.practiceCode}
                  helperText={errors.practiceCode}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Application Code"
                  name="appCode"
                  value={form.appCode}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.appCode}
                  helperText={errors.appCode}
                />
              </Grid>
            </Grid>
          )}

          {/* Step 1 - Routing */}
          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <FormControl fullWidth required error={!!errors.environment}>
                  <InputLabel>Environment</InputLabel>
                  <Select
                    name="environment"
                    value={form.environment}
                    onChange={handleChange}
                  >
                    {environments.map((env) => (
                      <MenuItem key={env} value={env}>
                        {env}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.environment && (
                    <FormHelperText>{errors.environment}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required error={!!errors.timeZone}>
                  <InputLabel>Time Zone</InputLabel>
                  <Select
                    name="timeZone"
                    value={form.timeZone}
                    onChange={handleChange}
                  >
                    {timeZones.map((tz) => (
                      <MenuItem key={tz} value={tz}>
                        {tz}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.timeZone && (
                    <FormHelperText>{errors.timeZone}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required error={!!errors.recordCNA}>
                  <InputLabel>Record CNA</InputLabel>
                  <Select
                    name="recordCNA"
                    value={form.recordCNA}
                    onChange={handleChange}
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                  {errors.recordCNA && (
                    <FormHelperText>{errors.recordCNA}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required error={!!errors.purpose}>
                  <InputLabel>Purpose</InputLabel>
                  <Select
                    name="purpose"
                    value={form.purpose}
                    onChange={handleChange}
                  >
                    {purposes.map((p) => (
                      <MenuItem key={p} value={p}>
                        {p}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.purpose && (
                    <FormHelperText>{errors.purpose}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  type="time"
                  label="Business Hours From"
                  name="businessHoursFrom"
                  InputLabelProps={{ shrink: true }}
                  value={form.businessHoursFrom}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.businessHoursFrom}
                  helperText={errors.businessHoursFrom}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  type="time"
                  label="Business Hours To"
                  name="businessHoursTo"
                  InputLabelProps={{ shrink: true }}
                  value={form.businessHoursTo}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.businessHoursTo}
                  helperText={errors.businessHoursTo}
                />
              </Grid>
            </Grid>
          )}

          {/* Step 2 - Database */}
          {activeStep === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Database Connection String"
                  name="dbConnection"
                  value={form.dbConnection}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.dbConnection}
                  helperText={errors.dbConnection}
                />
              </Grid>
            </Grid>
          )}

          {/* Step 3 - API */}
          {activeStep === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <TextField
                  label="API Key"
                  name="apiKey"
                  value={form.apiKey}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.apiKey}
                  helperText={errors.apiKey}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Insurance ID (Min 3 Chars)"
                  name="insurance"
                  value={form.insurance}
                  onChange={handleChange}
                  fullWidth
                  required
                  // REMOVED: inputProps={{ maxLength: 11 }} to allow dynamic validation
                  error={!!errors.insurance}
                  helperText={errors.insurance}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Insurance Contact (Email OR 11+ Digit Phone)"
                  name="insuranceContact"
                  value={form.insuranceContact}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.insuranceContact}
                  helperText={errors.insuranceContact}
                />
              </Grid>
            </Grid>
          )}

          {/* Step 4 - Advanced */}
          {activeStep === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <TextField
                  label="Timeout (seconds)"
                  name="timeout"
                  value={form.timeout}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.timeout}
                  helperText={errors.timeout}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Max Retries"
                  name="retries"
                  value={form.retries}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.retries}
                  helperText={errors.retries}
                />
              </Grid>
            </Grid>
          )}

          {/* Buttons */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>

            <Box>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<Clear />}
                onClick={handleClear}
                sx={{ mr: 1 }}
              >
                Clear
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Save />}
                  onClick={handleSubmit}
                >
                  {editingLogIndex !== null ? "Update" : "Save"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  endIcon={<ArrowForward />}
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Logs Table */}
      <Paper className="ivr-paper" sx={{ mt: 3, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          IVR Logs
        </Typography>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <TextField
              placeholder="Search by App Name/Code/Type"
              fullWidth
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Grid>
          <Grid item xs={2}>
            <FormControl fullWidth size="small">
              <InputLabel>App Type</InputLabel>
              <Select
                multiple
                name="appType"
                value={filters.appType}
                onChange={handleFilterChange}
                input={<OutlinedInput label="App Type" />}
                renderValue={(selected) => selected.join(", ")}
              >
                {appTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    <Checkbox checked={filters.appType.indexOf(type) > -1} />
                    <ListItemText primary={type} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Environment</InputLabel>
              <Select
                multiple
                name="environment"
                value={filters.environment}
                onChange={handleFilterChange}
                input={<OutlinedInput label="Environment" />}
                renderValue={(selected) => selected.join(", ")}
              >
                {environments.map((env) => (
                  <MenuItem key={env} value={env}>
                    <Checkbox checked={filters.environment.indexOf(env) > -1} />
                    <ListItemText primary={env} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Purpose</InputLabel>
              <Select
                multiple
                name="purpose"
                value={filters.purpose}
                onChange={handleFilterChange}
                input={<OutlinedInput label="Purpose" />}
                renderValue={(selected) => selected.join(", ")}
              >
                {purposes.map((p) => (
                  <MenuItem key={p} value={p}>
                    <Checkbox checked={filters.purpose.indexOf(p) > -1} />
                    <ListItemText primary={p} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Table */}
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {[
                  "appId",
                  "appName",
                  "appCode",
                  "appType",
                  "purpose",
                  "insurance",
                  "status",
                  "timeZone",
                  "businessHoursFrom",
                  "businessHoursTo",
                  "environment",
                  "recordCNA",
                  "practiceCode",
                ].map((col) => (
                  <TableCell
                    key={col}
                    sx={{
                      backgroundColor:
                        sortConfig.key === col ? "#f0f8ff" : "#f5f5f5",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {renderSortLabel(
                      col,
                      col
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())
                    )}
                  </TableCell>
                ))}
                <TableCell
                  align="center"
                  sx={{ backgroundColor: "#f5f5f5", fontWeight: "bold" }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} align="center">
                    No Records Found
                  </TableCell>
                </TableRow>
              ) : (
                sortedLogs.map((row, index) => (
                  <TableRow key={index} hover>
                    {[
                      "appId",
                      "appName",
                      "appCode",
                      "appType",
                      "purpose",
                      "insurance",
                      "status",
                      "timeZone",
                      "businessHoursFrom",
                      "businessHoursTo",
                      "environment",
                      "recordCNA",
                      "practiceCode",
                    ].map((col) => (
                      <TableCell key={col} sx={{ whiteSpace: "nowrap" }}>
                        {row[col] || "-"}
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ minWidth: 150 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => handleEditLog(ivrLogs.indexOf(row))}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteLog(ivrLogs.indexOf(row))}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
