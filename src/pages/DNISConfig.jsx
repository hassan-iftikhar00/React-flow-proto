import React, { useState, useMemo } from "react";
import { Pencil, Trash2, ChevronDown } from "lucide-react";
import "./DNISConfig.css";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";

export default function DNISConfig() {
  const [enable, setEnable] = useState(false);

  const [form, setForm] = useState({
    dnis: "",
    appName: "",
    environment: "",
    remarks: "",
  });

  const [editingIndex, setEditingIndex] = useState(null);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const [popup, setPopup] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // Multi-select filters
  const [selectedApps, setSelectedApps] = useState([]);
  const [selectedEnvs, setSelectedEnvs] = useState([]);

  const appList = ["CRM", "Billing", "Support"];
  const envList = ["Dev", "QA", "UAT", "Prod"];

  // Handle form input
  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Show popup
  const showPopup = (title, message, onConfirm = null) =>
    setPopup({ open: true, title, message, onConfirm });

  const closePopup = () =>
    setPopup({ ...popup, open: false, onConfirm: null });

  // Save or update record
  const onSave = () => {
    if (!form.dnis || !form.environment) {
      showPopup("⚠️ Warning", "DNIS and Environment are required!");
      return;
    }

    if (editingIndex !== null) {
      const copy = [...records];
      copy[editingIndex] = form;
      setRecords(copy);
      setEditingIndex(null);
      showPopup("✅ Success", "DNIS record updated successfully!");
    } else {
      setRecords([...records, form]);
      showPopup("✅ Success", "DNIS record saved successfully!");
    }

    setForm({ dnis: "", appName: "", environment: "", remarks: "" });
  };

  // Edit record
  const onEdit = (index) => {
    setForm(records[index]);
    setEditingIndex(index);
  };

  // Delete record
  const onDelete = (index) => {
    showPopup(
      "⚠️ Confirm Delete",
      "Are you sure you want to delete this DNIS record?",
      () => {
        setRecords(records.filter((_, i) => i !== index));
        closePopup();
        showPopup("✅ Success", "DNIS record deleted successfully!");
      }
    );
  };

  const onClear = () => {
    setForm({ dnis: "", appName: "", environment: "", remarks: "" });
    setEditingIndex(null);
  };

  // Toggle filters
  const toggleAppFilter = (app) => {
    if (selectedApps.includes(app)) {
      setSelectedApps(selectedApps.filter((a) => a !== app));
    } else {
      setSelectedApps([...selectedApps, app]);
    }
  };

  const toggleEnvFilter = (env) => {
    if (selectedEnvs.includes(env)) {
      setSelectedEnvs(selectedEnvs.filter((e) => e !== env));
    } else {
      setSelectedEnvs([...selectedEnvs, env]);
    }
  };

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesSearch = [rec.dnis, rec.appName, rec.environment, rec.remarks]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesApp =
        selectedApps.length === 0 || selectedApps.includes(rec.appName);

      const matchesEnv =
        selectedEnvs.length === 0 || selectedEnvs.includes(rec.environment);

      return matchesSearch && matchesApp && matchesEnv;
    });
  }, [records, searchTerm, selectedApps, selectedEnvs]);

  // Sort records
  const sortedRecords = useMemo(() => {
    const sortable = [...filteredRecords];
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
  }, [filteredRecords, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = sortedRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(sortedRecords.length / recordsPerPage);

  return (
    <div className="dnis-wrapper">
      {/* DNIS CONFIG */}
      <div className="section-header">
        <ChevronDown size={20} />
        <span>DNIS Configuration</span>
      </div>

      <div className="dnis-card">
        <label className="enable-box">
          <input
            type="checkbox"
            checked={enable}
            onChange={(e) => setEnable(e.target.checked)}
          />
          Enable
        </label>

        <div className="form-row">
          <div className="field">
            <label>
              DNIS <span className="req">*</span>
            </label>
            <input
              name="dnis"
              value={form.dnis}
              onChange={onChange}
              placeholder="Enter Text Here"
            />
          </div>

          <div className="field">
            <label>App Name</label>
            <select name="appName" value={form.appName} onChange={onChange}>
              <option value="">Select</option>
              {appList.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div className="field wide">
            <label>Remarks</label>
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={onChange}
              placeholder="Type here..."
            />
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label>
              Environment <span className="req">*</span>
            </label>
            <select
              name="environment"
              value={form.environment}
              onChange={onChange}
            >
              <option value="">Select</option>
              {envList.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="button-row">
          <button className="clear-btn" onClick={onClear}>
            Clear
          </button>
          <button className="save-btn" onClick={onSave}>
            {editingIndex !== null ? "Update" : "Save"}
          </button>
        </div>
      </div>

      {/* DNIS LOGS */}
      <div className="section-header">
        <ChevronDown size={20} />
        <span>DNIS Logs</span>
      </div>

      <div className="logs-card">
        {/* Search */}
        <input
          className="search-box"
          placeholder="Search keyword"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Filters */}
        <div className="filters-row">
          <div className="filter-group">
            <span>Filter by App:</span>
            {appList.map((app) => (
              <label key={app}>
                <input
                  type="checkbox"
                  checked={selectedApps.includes(app)}
                  onChange={() => toggleAppFilter(app)}
                />
                {app}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <span>Filter by Environment:</span>
            {envList.map((env) => (
              <label key={env}>
                <input
                  type="checkbox"
                  checked={selectedEnvs.includes(env)}
                  onChange={() => toggleEnvFilter(env)}
                />
                {env}
              </label>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="dnis-table">
            <thead>
              <tr>
                <th onClick={() => requestSort("appName")}>
                  App Name {sortConfig.key === "appName" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => requestSort("dnis")}>
                  DNIS {sortConfig.key === "dnis" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                </th>
                <th>Status</th>
                <th onClick={() => requestSort("environment")}>
                  Environment {sortConfig.key === "environment" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => requestSort("remarks")}>
                  Remarks {sortConfig.key === "remarks" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                </th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-record">
                    No records found
                  </td>
                </tr>
              ) : (
                currentRecords.map((rec, index) => (
                  <tr
                    key={indexOfFirstRecord + index}
                    className={(index % 2 === 0 ? "even-row" : "odd-row")}
                  >
                    <td>{rec.appName}</td>
                    <td>{rec.dnis}</td>
                    <td>{enable ? "Enabled" : "Disabled"}</td>
                    <td>{rec.environment}</td>
                    <td>{rec.remarks}</td>
                    <td className="actions-cell">
                      <button
                        className="edit-btn"
                        onClick={() => onEdit(indexOfFirstRecord + index)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => onDelete(indexOfFirstRecord + index)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={currentPage === i + 1 ? "active-page" : ""}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* POPUP */}
      <Dialog open={popup.open} onClose={closePopup}>
        <DialogTitle>{popup.title}</DialogTitle>
        <DialogContent>
          <Typography>{popup.message}</Typography>
        </DialogContent>
        <DialogActions>
          {popup.onConfirm ? (
            <>
              <Button
                onClick={() => {
                  popup.onConfirm();
                }}
                variant="contained"
                color="error"
              >
                Yes
              </Button>
              <Button onClick={closePopup} variant="contained">
                No
              </Button>
            </>
          ) : (
            <Button onClick={closePopup} variant="contained" autoFocus>
              OK
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
