import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useRealtimeData } from "../contexts/RealtimeDataContext";
import ConnectionStatusBadge from "../components/ConnectionStatusBadge";
import TemplateGroupDropdown from "../components/portal/TemplateGroupDropdown";
import DataTable from "../components/portal/DataTable";
import { ArrowLeft, Database, RefreshCw, Download } from "lucide-react";
import "./DetailedTemplatePortal.css";

/**
 * DetailedTemplatePortal Page
 * Full data table view with template group filtering
 */
export default function DetailedTemplatePortal() {
  const navigate = useNavigate();
  const { portalTableData, offlineChanges, loading, refreshMetrics } =
    useRealtimeData();
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  // Extract unique template groups from data
  const templateGroups = useMemo(() => {
    const groups = new Set();
    portalTableData.forEach((row) => {
      if (row.templateId) {
        // Extract group from templateId (e.g., "CLAIMS-001" -> "CLAIMS")
        const group = row.templateId.split("-")[0];
        groups.add(group);
      }
    });
    return Array.from(groups).sort();
  }, [portalTableData]);

  // Filter data by selected group
  const filteredData = useMemo(() => {
    if (selectedGroup === "All") {
      return portalTableData;
    }
    return portalTableData.filter((row) =>
      row.templateId?.startsWith(selectedGroup),
    );
  }, [portalTableData, selectedGroup]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshMetrics();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Handle export to CSV
  const handleExport = () => {
    if (filteredData.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = [
      "ID",
      "OID",
      "Template ID",
      "IVR Insurance",
      "Claim No",
      "Call Status",
      "Submitted Amount",
      "Date of Service",
      "Call Duration",
      "Created At",
    ];
    const csvRows = [
      headers.join(","),
      ...filteredData.map((row) =>
        [
          row.id,
          row.oid,
          row.templateId,
          row.ivrInsurance,
          row.claimNo,
          row.callStatus,
          row.submittedAmount,
          row.dateOfService,
          row.callDuration,
          row.createdAt,
        ].join(","),
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portal-data-${selectedGroup}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="detailed-portal-page">
      <div className="detailed-portal-container">
        {/* Header */}
        <header className="portal-header">
          <div className="header-left">
            <button
              className="back-button"
              onClick={() => navigate("/ivr-dashboard")}
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>
            <div className="header-title">
              <Database size={28} />
              <div>
                <h1>Detailed Template Portal</h1>
                <p className="header-subtitle">
                  Real-time data table • {filteredData.length} records
                </p>
              </div>
            </div>
          </div>
          <div className="header-right">
            <ConnectionStatusBadge />
          </div>
        </header>

        {/* Controls Bar */}
        <div className="portal-controls">
          <TemplateGroupDropdown
            groups={templateGroups}
            selectedGroup={selectedGroup}
            onGroupChange={setSelectedGroup}
          />
          <div className="controls-actions">
            <button
              className="control-button"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw size={16} className={refreshing ? "icon-spin" : ""} />
              Refresh
            </button>
            <button
              className="control-button control-button-primary"
              onClick={handleExport}
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Offline Changes Alert */}
        {offlineChanges.length > 0 && (
          <div className="offline-alert">
            <strong>{offlineChanges.length}</strong> row(s) changed while
            offline. Highlighted rows show data that was modified during
            disconnection.
          </div>
        )}

        {/* Data Table */}
        <div className="portal-table-wrapper">
          <DataTable
            data={filteredData}
            offlineChanges={offlineChanges}
            loading={loading}
          />
        </div>

        {/* Footer Stats */}
        <footer className="portal-footer">
          <div className="footer-stat">
            <span className="stat-label">Total Records</span>
            <span className="stat-value">{portalTableData.length}</span>
          </div>
          <div className="footer-stat">
            <span className="stat-label">Filtered Records</span>
            <span className="stat-value">{filteredData.length}</span>
          </div>
          <div className="footer-stat">
            <span className="stat-label">Template Groups</span>
            <span className="stat-value">{templateGroups.length}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
