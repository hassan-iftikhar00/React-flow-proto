import { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Eye, Phone } from "lucide-react";
import api from "../../services/api";
import {
  formatCurrency,
  formatDate,
  formatDuration,
} from "../../utils/dataParsers";
import "./DataTable.css";

/**
 * DataTable Component
 * MUI DataGrid with row actions (View Status, Call Recording)
 *
 * @param {Object} props
 * @param {Array} props.data - Table data rows
 * @param {Array} props.offlineChanges - Array of row IDs that changed while offline
 * @param {boolean} props.loading - Loading state
 */
export default function DataTable({
  data = [],
  offlineChanges = [],
  loading = false,
}) {
  const [statusDialog, setStatusDialog] = useState({
    open: false,
    data: null,
    loading: false,
    error: null,
  });
  const [recordingDialog, setRecordingDialog] = useState({
    open: false,
    data: null,
    loading: false,
    error: null,
  });

  // Handle View Status button click
  const handleViewStatus = async (row) => {
    setStatusDialog({ open: true, data: null, loading: true, error: null });

    try {
      const result = await api.getRecordStatus(row.id);
      setStatusDialog({
        open: true,
        data: result,
        loading: false,
        error: null,
      });
    } catch (error) {
      setStatusDialog({
        open: true,
        data: null,
        loading: false,
        error: error.message,
      });
    }
  };

  // Handle Call Recording button click
  const handleViewRecording = async (row) => {
    setRecordingDialog({ open: true, data: null, loading: true, error: null });

    try {
      const result = await api.getCallRecording(row.id);
      setRecordingDialog({
        open: true,
        data: result,
        loading: false,
        error: null,
      });
    } catch (error) {
      setRecordingDialog({
        open: true,
        data: null,
        loading: false,
        error: error.message,
      });
    }
  };

  // Define columns
  const columns = [
    { field: "id", headerName: "ID", width: 120, sortable: true },
    { field: "oid", headerName: "OID", width: 100 },
    { field: "templateId", headerName: "Template ID", width: 130 },
    { field: "ivrInsurance", headerName: "IVR Insurance", width: 150 },
    { field: "claimNo", headerName: "Claim No", width: 130 },
    {
      field: "callStatus",
      headerName: "Call Status",
      width: 130,
      renderCell: (params) => (
        <span className={`status-badge status-${params.value?.toLowerCase()}`}>
          {params.value}
        </span>
      ),
    },
    {
      field: "submittedAmount",
      headerName: "Submitted Amount",
      width: 150,
      valueFormatter: (value) => formatCurrency(value),
    },
    {
      field: "dateOfService",
      headerName: "Date of Service",
      width: 130,
      valueFormatter: (value) => (value ? formatDate(value, "short") : "N/A"),
    },
    {
      field: "callDuration",
      headerName: "Duration",
      width: 100,
      valueFormatter: (value) => formatDuration(value),
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 160,
      valueFormatter: (value) => (value ? formatDate(value, "long") : "N/A"),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <div className="action-buttons">
          <Button
            size="small"
            variant="outlined"
            startIcon={<Eye size={16} />}
            onClick={() => handleViewStatus(params.row)}
            sx={{ fontSize: "11px", padding: "4px 8px" }}
          >
            View Status
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Phone size={16} />}
            onClick={() => handleViewRecording(params.row)}
            sx={{ fontSize: "11px", padding: "4px 8px" }}
          >
            Recording
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="data-table-container">
      <DataGrid
        rows={data}
        columns={columns}
        pagination
        pageSizeOptions={[25, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
        }}
        loading={loading}
        getRowClassName={(params) =>
          offlineChanges.includes(params.row.id) ? "row-offline-changed" : ""
        }
        disableRowSelectionOnClick
        sx={{
          border: "none",
          "& .MuiDataGrid-cell": {
            borderColor: "#e5e7eb",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f9fafb",
            borderColor: "#e5e7eb",
            fontWeight: 600,
          },
        }}
      />

      {/* View Status Dialog */}
      <Dialog
        open={statusDialog.open}
        onClose={() => setStatusDialog({ ...statusDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Database Status Verification</DialogTitle>
        <DialogContent>
          {statusDialog.loading && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "40px",
              }}
            >
              <CircularProgress />
            </div>
          )}
          {statusDialog.error && (
            <Alert severity="error">{statusDialog.error}</Alert>
          )}
          {statusDialog.data && (
            <div className="status-verification">
              <div className="status-item">
                <span className="status-label">ID:</span>
                <span className="status-value">{statusDialog.data.id}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Call Status:</span>
                <span
                  className={`status-badge status-${statusDialog.data.callStatus?.toLowerCase()}`}
                >
                  {statusDialog.data.callStatus}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Last Verified:</span>
                <span className="status-value">
                  {formatDate(statusDialog.data.verifiedAt, "long")}
                </span>
              </div>
              {statusDialog.data.notes && (
                <div className="status-item">
                  <span className="status-label">Notes:</span>
                  <span className="status-value">
                    {statusDialog.data.notes}
                  </span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setStatusDialog({ ...statusDialog, open: false })}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Call Recording Dialog */}
      <Dialog
        open={recordingDialog.open}
        onClose={() => setRecordingDialog({ ...recordingDialog, open: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Call Recording</DialogTitle>
        <DialogContent>
          {recordingDialog.loading && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "40px",
              }}
            >
              <CircularProgress />
            </div>
          )}
          {recordingDialog.error && (
            <Alert severity="error">{recordingDialog.error}</Alert>
          )}
          {recordingDialog.data && (
            <div className="recording-player">
              {recordingDialog.data.url ? (
                <audio controls style={{ width: "100%" }}>
                  <source src={recordingDialog.data.url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <Alert severity="info">
                  No recording available for this call.
                </Alert>
              )}
              {recordingDialog.data.duration && (
                <p
                  style={{
                    marginTop: "12px",
                    fontSize: "14px",
                    color: "#6b7280",
                  }}
                >
                  Duration: {formatDuration(recordingDialog.data.duration)}
                </p>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setRecordingDialog({ ...recordingDialog, open: false })
            }
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
