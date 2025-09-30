import React, { useState } from "react";
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
  Fade,
} from "@mui/material";
import { Save, Clear, ArrowBack, ArrowForward } from "@mui/icons-material";

const steps = ["General", "DNIS", "Database", "API", "Advanced"];

export default function IVRConfig() {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    enable: false,
    ivrName: "",
    appType: "",
    practiceCode: "",
    appCode: "",
    dnis: "",
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
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("IVR Config Saved:", form);
    alert("✅ IVR Configuration Saved Successfully!");
  };

  const handleClear = () => {
    setForm({
      enable: false,
      ivrName: "",
      appType: "",
      practiceCode: "",
      appCode: "",
      dnis: "",
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
    });
    setActiveStep(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h5" gutterBottom>
        IVR Configuration Wizard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Follow each step to configure DNIS, Database, and API settings for your IVR flow.
      </Typography>

      {/* Stepper */}
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Form Container */}
      <Paper
        elevation={6}
        sx={{
          p: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #757575ff, #5287d7ff)",
          color: "white",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          {/* General */}
          {activeStep === 0 && (
            <Fade in timeout={500}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.enable}
                        name="enable"
                        onChange={handleChange}
                        sx={{ color: "white" }}
                      />
                    }
                    label="Enable"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="App Name"
                    name="ivrName"
                    value={form.ivrName}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>App Type</InputLabel>
                    <Select
                      name="appType"
                      value={form.appType}
                      onChange={handleChange}
                    >
                      <MenuItem value="Inbound">Inbound</MenuItem>
                      <MenuItem value="Outbound">Outbound</MenuItem>
                      <MenuItem value="Blended">Blended</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Practice Code"
                    name="practiceCode"
                    value={form.practiceCode}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="App Code"
                    name="appCode"
                    value={form.appCode}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Fade>
          )}

          {/* DNIS */}
          {activeStep === 1 && (
            <Fade in timeout={500}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="DNIS"
                    name="dnis"
                    value={form.dnis}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Region</InputLabel>
                    <Select
                      name="region"
                      value={form.region}
                      onChange={handleChange}
                    >
                      <MenuItem value="US-East">US-East</MenuItem>
                      <MenuItem value="US-West">US-West</MenuItem>
                      <MenuItem value="Europe">Europe</MenuItem>
                      <MenuItem value="Asia">Asia</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Environment</InputLabel>
                    <Select
                      name="environment"
                      value={form.environment}
                      onChange={handleChange}
                    >
                      <MenuItem value="Dev">Dev</MenuItem>
                      <MenuItem value="QA">QA</MenuItem>
                      <MenuItem value="Prod">Prod</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Record CNA</InputLabel>
                    <Select
                      name="recordCNA"
                      value={form.recordCNA}
                      onChange={handleChange}
                    >
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Purpose</InputLabel>
                    <Select
                      name="purpose"
                      value={form.purpose}
                      onChange={handleChange}
                    >
                      <MenuItem value="Support">Support</MenuItem>
                      <MenuItem value="Billing">Billing</MenuItem>
                      <MenuItem value="Sales">Sales</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Fade>
          )}

          {/* Database */}
          {activeStep === 2 && (
            <Fade in timeout={500}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Database Connection String"
                    name="dbConnection"
                    value={form.dbConnection}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Fade>
          )}

          {/* API */}
          {activeStep === 3 && (
            <Fade in timeout={500}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="API Key"
                    name="apiKey"
                    value={form.apiKey}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Insurance"
                    name="insurance"
                    value={form.insurance}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Insurance Contact"
                    name="insuranceContact"
                    value={form.insuranceContact}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Fade>
          )}

          {/* Advanced */}
          {activeStep === 4 && (
            <Fade in timeout={500}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Timeout (sec)"
                    name="timeout"
                    value={form.timeout}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Retries"
                    name="retries"
                    value={form.retries}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Fade>
          )}

          {/* Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 4,
            }}
          >
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ArrowBack />}
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{
                transition: "0.3s",
                "&:hover": { transform: "scale(1.05)", boxShadow: 3 },
              }}
            >
              Back
            </Button>

            {activeStep === steps.length - 1 ? (
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Clear />}
                  onClick={handleClear}
                  sx={{
                    transition: "0.3s",
                    "&:hover": { transform: "scale(1.05)", boxShadow: 3 },
                  }}
                >
                  Clear
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                  sx={{
                    transition: "0.3s",
                    "&:hover": { transform: "scale(1.05)", boxShadow: 3 },
                  }}
                >
                  Save
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                color="primary"
                endIcon={<ArrowForward />}
                onClick={handleNext}
                sx={{
                  transition: "0.3s",
                  "&:hover": { transform: "scale(1.05)", boxShadow: 3 },
                }}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
