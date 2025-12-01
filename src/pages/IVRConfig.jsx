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
} from "@mui/material";
import { Save, Clear, ArrowBack, ArrowForward } from "@mui/icons-material";
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
const regions = ["US-East", "US-West", "Europe"];

export default function IVRConfig() {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    enable: false,
    ivrName: "",
    appType: "",
    practiceCode: "",
    appCode: "",
    region: "US-East",
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
  const [editingLogIndex, setEditingLogIndex] = useState(null);
  const [ivrLogs, setIvrLogs] = useLocalStorage("ivrConfig_logs", []);
  const [toast, setToast] = useState({ open: false, type: "success", message: "" });
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    appType: [],
    environment: [],
    purpose: [],
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Toast functions
  const showToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => setToast({ open: false, type: "", message: "" }), 2500);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return form.ivrName && form.appType && form.practiceCode && form.appCode;
      case 1:
        return (
          form.environment &&
          form.recordCNA &&
          form.purpose &&
          form.businessHoursFrom &&
          form.businessHoursTo
        );
      case 2:
        return form.dbConnection;
      case 3:
        return form.apiKey && form.insurance && form.insuranceContact;
      case 4:
        return form.timeout && form.retries;
      default:
        return true;
    }
  };

  const handleNext = () =>
    validateStep(activeStep)
      ? setActiveStep((prev) => prev + 1)
      : showToast("warning", "Please fill all required fields before continuing.");

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleClear = () => {
    setForm({
      enable: false,
      ivrName: "",
      appType: "",
      practiceCode: "",
      appCode: "",
      region: "US-East",
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
    setActiveStep(0);
    setEditingLogIndex(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep(activeStep)) {
      showToast("error", "Please complete all required fields before saving.");
      return;
    }

    const logData = {
      appId:
        editingLogIndex !== null
          ? ivrLogs[editingLogIndex].appId
          : Math.floor(Math.random() * 10000),
      appName: form.ivrName,
      appCode: form.appCode,
      appType: form.appType,
      purpose: form.purpose,
      insurance: form.insurance,
      status: form.enable ? "Enabled" : "Disabled",
      timeZone: form.region,
      businessHoursFrom: form.businessHoursFrom,
      businessHoursTo: form.businessHoursTo,
      businessTimeZone: form.region,
      environment: form.environment,
      recordCNA: form.recordCNA,
      practiceCode: form.practiceCode,
    };

    if (editingLogIndex !== null) {
      const copy = [...ivrLogs];
      copy[editingLogIndex] = logData;
      setIvrLogs(copy);
      setEditingLogIndex(null);
      showToast("success", "IVR Log updated successfully!");
    } else {
      setIvrLogs([...ivrLogs, logData]);
      showToast("success", "IVR Configuration saved successfully!");
    }
    handleClear();
  };

  const handleDeleteLog = (index) => {
    const copy = [...ivrLogs];
    copy.splice(index, 1);
    setIvrLogs(copy);
    showToast("success", "IVR log deleted successfully!");
  };

  const handleEditLog = (index) => {
    const log = ivrLogs[index];
    setForm({
      enable: log.status === "Enabled",
      ivrName: log.appName,
      appCode: log.appCode,
      appType: log.appType,
      purpose: log.purpose,
      insurance: log.insurance,
      region: log.timeZone,
      businessHoursFrom: log.businessHoursFrom,
      businessHoursTo: log.businessHoursTo,
      environment: log.environment,
      recordCNA: log.recordCNA,
      practiceCode: log.practiceCode,
    });
    setEditingLogIndex(index);
    setActiveStep(0);
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const filteredLogs = ivrLogs.filter((log) => {
    const searchMatch =
      log.appName.toLowerCase().includes(search.toLowerCase()) ||
      log.appCode.toLowerCase().includes(search.toLowerCase()) ||
      log.appType.toLowerCase().includes(search.toLowerCase());

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
      {label}
    </TableSortLabel>
  );

  return (
    <Box className="ivr-container">
      {/* Toast Alerts */}
      <div className="toast-container">
        {toast.open && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
      </div>

      <Typography variant="h5" gutterBottom>
        IVR Configuration Wizard
      </Typography>
      <Typography variant="body2" color="text.secondary" className="ivr-subtitle">
        Configure DNIS, Database, API, and Advanced settings step by step.
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel className="ivr-stepper">
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper elevation={6} className="ivr-paper">
        <Box component="form" onSubmit={handleSubmit}>
          {/* Step 0 - General */}
          {activeStep === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox checked={form.enable} onChange={handleChange} name="enable" />}
                  label="Enable IVR"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField label="IVR Name" name="ivrName" value={form.ivrName} onChange={handleChange} fullWidth required variant="filled" />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth variant="filled" required>
                  <InputLabel>Application Type</InputLabel>
                  <Select name="appType" value={form.appType} onChange={handleChange}>
                    {appTypes.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField label="Practice Code" name="practiceCode" value={form.practiceCode} onChange={handleChange} fullWidth required variant="filled" />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Application Code" name="appCode" value={form.appCode} onChange={handleChange} fullWidth required variant="filled" />
              </Grid>
            </Grid>
          )}

          {/* Step 1 - Routing */}
          {activeStep === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth variant="filled" required>
                  <InputLabel>Environment</InputLabel>
                  <Select name="environment" value={form.environment} onChange={handleChange}>
                    {environments.map((env) => (
                      <MenuItem key={env} value={env}>{env}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth variant="filled" required>
                  <InputLabel>Record CNA</InputLabel>
                  <Select name="recordCNA" value={form.recordCNA} onChange={handleChange}>
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth variant="filled" required>
                  <InputLabel>Purpose</InputLabel>
                  <Select name="purpose" value={form.purpose} onChange={handleChange}>
                    {purposes.map((p) => (
                      <MenuItem key={p} value={p}>{p}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <TextField type="time" label="Business Hours From" name="businessHoursFrom" value={form.businessHoursFrom} onChange={handleChange} fullWidth required variant="filled" />
              </Grid>
              <Grid item xs={3}>
                <TextField type="time" label="Business Hours To" name="businessHoursTo" value={form.businessHoursTo} onChange={handleChange} fullWidth required variant="filled" />
              </Grid>
            </Grid>
          )}

          {/* Step 2 - Database */}
          {activeStep === 2 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField label="Database Connection" name="dbConnection" value={form.dbConnection} onChange={handleChange} fullWidth required variant="filled" />
              </Grid>
            </Grid>
          )}

          {/* Step 3 - API */}
          {activeStep === 3 && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="API Key" name="apiKey" value={form.apiKey} onChange={handleChange} fullWidth required variant="filled" />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Insurance" name="insurance" value={form.insurance} onChange={handleChange} fullWidth required variant="filled" />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Insurance Contact" name="insuranceContact" value={form.insuranceContact} onChange={handleChange} fullWidth required variant="filled" />
              </Grid>
            </Grid>
          )}

          {/* Step 4 - Advanced */}
          {activeStep === 4 && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Timeout (sec)" name="timeout" value={form.timeout} onChange={handleChange} fullWidth required variant="filled" />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Retries" name="retries" value={form.retries} onChange={handleChange} fullWidth required variant="filled" />
              </Grid>
            </Grid>
          )}

          {/* Buttons */}
          <Box className="ivr-buttons">
            <Button variant="outlined" startIcon={<ArrowBack />} disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            {activeStep === steps.length - 1 ? (
              <Box className="ivr-button-group">
                <Button variant="outlined" color="error" startIcon={<Clear />} onClick={handleClear}>Clear</Button>
                <Button type="submit" variant="contained" color="primary" startIcon={<Save />}>
                  {editingLogIndex !== null ? "Update" : "Save"}
                </Button>
              </Box>
            ) : (
              <Button variant="contained" endIcon={<ArrowForward />} onClick={handleNext}>Next</Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Logs Table */}
      <Paper className="ivr-paper" sx={{ mt: 3, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>IVR Logs</Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <TextField placeholder="Search by App Name/Code/Type" fullWidth value={search} onChange={(e) => setSearch(e.target.value)} />
          </Grid>
          <Grid item xs={2}>
            <FormControl fullWidth>
              <InputLabel>App Type</InputLabel>
              <Select multiple name="appType" value={filters.appType} onChange={handleFilterChange} input={<OutlinedInput label="App Type" />} renderValue={(selected) => selected.join(", ")}>
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
            <FormControl fullWidth>
              <InputLabel>Environment</InputLabel>
              <Select multiple name="environment" value={filters.environment} onChange={handleFilterChange} input={<OutlinedInput label="Environment" />} renderValue={(selected) => selected.join(", ")}>
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
            <FormControl fullWidth>
              <InputLabel>Purpose</InputLabel>
              <Select multiple name="purpose" value={filters.purpose} onChange={handleFilterChange} input={<OutlinedInput label="Purpose" />} renderValue={(selected) => selected.join(", ")}>
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

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {["appId","appName","appCode","appType","purpose","insurance","status","timeZone","businessHoursFrom","businessHoursTo","businessTimeZone","environment","recordCNA","practiceCode"].map((col) => (
                  <TableCell key={col} sx={{ backgroundColor: sortConfig.key === col ? "#f0f8ff" : "" }}>
                    {renderSortLabel(col, col.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()))}
                  </TableCell>
                ))}
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={15} align="center">No Records Found</TableCell>
                </TableRow>
              ) : (
                sortedLogs.map((row, index) => (
                  <TableRow key={index}>
                  {["appId","appName","appCode","appType","purpose","insurance","status","timeZone","businessHoursFrom","businessHoursTo","businessTimeZone","environment","recordCNA","practiceCode"].map((col) => (
                      <TableCell key={col}>{row[col]}</TableCell>
                    ))}
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => handleEditLog(index)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteLog(index)}
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

