import React, { useState, useMemo, useEffect } from "react";
import { Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  XCircle as XCircleIcon,
  CheckCircle,
  Warning,
  Phone,
} from "@phosphor-icons/react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import "./DNISConfig.css";

export default function DNISConfig({ onClose }) {
  const [enable, setEnable] = useState(false);

  // --- Data Fetching & State ---
  const [storedData, setStoredData] = useLocalStorage("dnisConfig_data", []);
  const [storedLogs] = useLocalStorage("ivrConfig_logs", []);

  const [data, setData] = useState(Array.isArray(storedData) ? storedData : []);
  const [ivrLogs] = useState(Array.isArray(storedLogs) ? storedLogs : []);

  // UI & Error States
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [errors, setErrors] = useState({});
  const [selectedDNISIndex, setSelectedDNISIndex] = useState(null);

  // Dropdown States
  const [envDropdown, setEnvDropdown] = useState(false);
  const [filterDropdown, setFilterDropdown] = useState(false);
  const [appDropdown, setAppDropdown] = useState(false);

  const [filter, setFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const environments = ["Production", "Development"];
  const filters = ["All", ...environments];

  useEffect(() => {
    setStoredData(data);
  }, [data, setStoredData]);

  const ivrAppNames = useMemo(() => {
    return Array.from(
      new Set(ivrLogs.map((log) => log?.appName).filter(Boolean))
    );
  }, [ivrLogs]);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false }), 2500);
  };

  // --- Action Handlers ---

  const handleChange = (e) => {
    if (selectedDNISIndex === null || !data[selectedDNISIndex]) return;
    const { name, value } = e.target;

    let finalValue = value;
    if (name === "dnis") {
      finalValue = value.replace(/[^0-9]/g, ""); // Sirf numbers allow karega
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));

    const updatedData = [...data];
    updatedData[selectedDNISIndex] = {
      ...updatedData[selectedDNISIndex],
      [name]: finalValue,
    };
    setData(updatedData);
  };

  const handleSave = () => {
    if (selectedDNISIndex === null) return;

    const current = data[selectedDNISIndex];
    let newErrors = {};

    if (!current?.dnis?.trim()) newErrors.dnis = "DNIS number is required!";
    else if (current.dnis.length < 4 || current.dnis.length > 15)
      newErrors.dnis = "DNIS must be 4-15 digits!";

    if (!current?.appName) newErrors.appName = "Please select an application!";
    if (!current?.environment)
      newErrors.environment = "Please select an environment!";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showAlert("error", "Please fix the highlighted errors.");
      return;
    }

    const isDuplicate = data.some(
      (item, idx) =>
        item.dnis === current.dnis &&
        item.environment === current.environment &&
        idx !== selectedDNISIndex
    );

    if (isDuplicate) {
      setErrors({ dnis: "DNIS already exists in this environment!" });
      showAlert("error", "Duplicate Configuration!");
      return;
    }

    setErrors({});
    showAlert("success", "Configuration saved successfully!");
  };

  const handleAddNew = () => {
    const newEntry = { dnis: "", appName: "", environment: "", remarks: "" };
    const updatedData = [...data, newEntry];
    setData(updatedData);
    setSelectedDNISIndex(updatedData.length - 1);
    setErrors({});
  };

  const handleDelete = (index) => {
    const updatedData = data.filter((_, i) => i !== index);
    setData(updatedData);
    if (selectedDNISIndex === index) setSelectedDNISIndex(null);
    else if (selectedDNISIndex > index)
      setSelectedDNISIndex(selectedDNISIndex - 1);
    showAlert("success", "Entry removed!");
  };

  // --- Filter & Sort ---
  const filteredData = useMemo(
    () =>
      filter === "All" ? data : data.filter((d) => d.environment === filter),
    [data, filter]
  );

  const sortedData = useMemo(() => {
    let items = [...filteredData];
    if (sortConfig.key) {
      items.sort((a, b) => {
        const aVal = (a[sortConfig.key] || "").toString().toLowerCase();
        const bVal = (b[sortConfig.key] || "").toString().toLowerCase();
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [filteredData, sortConfig]);

  return (
    <div
      className="dnis-container"
      style={{
        background: "var(--card-bg, #ffffff)",
        borderRadius: "16px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        maxHeight: "90vh",
      }}
    >
      <div
        className="dnis-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 28px",
          borderBottom: "1px solid var(--border-color, #e2e8f0)",
        }}
      >
        <h3
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            margin: 0,
            fontSize: "20px",
            fontWeight: 700,
            color: "black",
          }}
        >
          <Phone size={24} color="#4ECDC4" weight="duotone" />
          DNIS Configuration
        </h3>
        {onClose && (
          <button
            className="close-btn"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              borderRadius: "8px",
              padding: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <XCircleIcon size={24} color="#FF6B6B" weight="duotone" />
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
        {alert.show && (
          <div
            style={{
              position: "fixed",
              top: 24,
              right: 24,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 20px",
              borderRadius: "8px",
              backgroundColor: alert.type === "error" ? "#fee2e2" : "#d1fae5",
              border: `2px solid ${
                alert.type === "error" ? "#ef4444" : "#10b981"
              }`,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
          >
            {alert.type === "success" ? (
              <CheckCircle size={24} color="#10b981" weight="duotone" />
            ) : (
              <Warning size={24} color="#ef4444" weight="duotone" />
            )}
            <span
              style={{
                fontWeight: 600,
                color: alert.type === "error" ? "#991b1b" : "#065f46",
              }}
            >
              {alert.message}
            </span>
          </div>
        )}

        <div className="toggle-row">
          <label className="switch">
            <input
              type="checkbox"
              checked={enable}
              onChange={() => setEnable(!enable)}
            />
            <span className="slider"></span>
          </label>
          <span className="toggle-text">Enable DNIS Configuration</span>
        </div>

        {enable && (
          <div className="split-container">
            {/* LEFT PANEL: TABLE SECTION */}
            <div className="left-panel">
              <div className="panel-actions">
                <button className="open-btn" onClick={handleAddNew}>
                  + Add New DNIS
                </button>

                <div
                  className={`custom-dropdown filter-dropdown ${
                    filterDropdown ? "show-options" : ""
                  }`}
                >
                  <div
                    className="selected"
                    onClick={() => setFilterDropdown(!filterDropdown)}
                  >
                    <span>Filter: {filter}</span>
                    <ChevronDown size={14} />
                  </div>
                  <div className="options">
                    {filters.map((f, i) => (
                      <div
                        key={i}
                        className="option"
                        onClick={() => {
                          setFilter(f);
                          setFilterDropdown(false);
                        }}
                      >
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="table-wrapper">
                <table className="dnis-table">
                  <thead>
                    <tr>
                      <th
                        onClick={() =>
                          setSortConfig({
                            key: "dnis",
                            direction:
                              sortConfig.direction === "asc" ? "desc" : "asc",
                          })
                        }
                      >
                        DNIS{" "}
                        {sortConfig.key === "dnis" &&
                          (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th>App Name</th>
                      <th>Env</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.length > 0 ? (
                      sortedData.map((row) => {
                        const actualIdx = data.indexOf(row);
                        return (
                          <tr
                            key={actualIdx}
                            className={
                              selectedDNISIndex === actualIdx
                                ? "selected-row"
                                : ""
                            }
                          >
                            <td onClick={() => setSelectedDNISIndex(actualIdx)}>
                              {row.dnis || "---"}
                            </td>
                            <td onClick={() => setSelectedDNISIndex(actualIdx)}>
                              {row.appName || "---"}
                            </td>
                            <td onClick={() => setSelectedDNISIndex(actualIdx)}>
                              {row.environment || "---"}
                            </td>
                            <td>
                              <div className="action-btns">
                                <Pencil
                                  size={18}
                                  className="edit-icon"
                                  onClick={() =>
                                    setSelectedDNISIndex(actualIdx)
                                  }
                                />
                                <Trash2
                                  size={18}
                                  className="delete-icon"
                                  onClick={() => handleDelete(actualIdx)}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className="no-data-td">
                          No records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT PANEL: STICKY FORM SECTION */}
            <div className="right-panel">
              <div className="sticky-wrapper">
                {selectedDNISIndex !== null && data[selectedDNISIndex] ? (
                  <div className="form">
                    <h3>
                      {data[selectedDNISIndex].dnis
                        ? "Edit Configuration"
                        : "New Configuration"}
                    </h3>

                    <div className="input-group">
                      <label>DNIS Number</label>
                      <input
                        name="dnis"
                        type="text"
                        placeholder="e.g. 1800123456"
                        className={errors.dnis ? "error-border" : ""}
                        value={data[selectedDNISIndex].dnis || ""}
                        onChange={handleChange}
                      />
                      {errors.dnis && (
                        <span className="error-msg">{errors.dnis}</span>
                      )}
                    </div>

                    <div className="input-group">
                      <label>Application Name</label>
                      <div
                        className={`custom-dropdown ${
                          appDropdown ? "show-options" : ""
                        } ${errors.appName ? "error-border" : ""}`}
                      >
                        <div
                          className="selected"
                          onClick={() => setAppDropdown(!appDropdown)}
                        >
                          <span>
                            {data[selectedDNISIndex].appName || "Select App..."}
                          </span>
                          <ChevronDown size={16} />
                        </div>
                        <div className="options">
                          {ivrAppNames.map((app, i) => (
                            <div
                              key={i}
                              className="option"
                              onClick={() => {
                                const upd = [...data];
                                upd[selectedDNISIndex].appName = app;
                                setData(upd);
                                setAppDropdown(false);
                                setErrors((prev) => ({
                                  ...prev,
                                  appName: null,
                                }));
                              }}
                            >
                              {app}
                            </div>
                          ))}
                        </div>
                      </div>
                      {errors.appName && (
                        <span className="error-msg">{errors.appName}</span>
                      )}
                    </div>

                    <div className="input-group">
                      <label>Environment</label>
                      <div
                        className={`custom-dropdown ${
                          envDropdown ? "show-options" : ""
                        } ${errors.environment ? "error-border" : ""}`}
                      >
                        <div
                          className="selected"
                          onClick={() => setEnvDropdown(!envDropdown)}
                        >
                          <span>
                            {data[selectedDNISIndex].environment ||
                              "Select Env..."}
                          </span>
                          <ChevronDown size={16} />
                        </div>
                        <div className="options">
                          {environments.map((env, i) => (
                            <div
                              key={i}
                              className="option"
                              onClick={() => {
                                const upd = [...data];
                                upd[selectedDNISIndex].environment = env;
                                setData(upd);
                                setEnvDropdown(false);
                                setErrors((prev) => ({
                                  ...prev,
                                  environment: null,
                                }));
                              }}
                            >
                              {env}
                            </div>
                          ))}
                        </div>
                      </div>
                      {errors.environment && (
                        <span className="error-msg">{errors.environment}</span>
                      )}
                    </div>

                    <div className="input-group">
                      <label>Remarks</label>
                      <textarea
                        name="remarks"
                        placeholder="Internal notes..."
                        value={data[selectedDNISIndex].remarks || ""}
                        onChange={handleChange}
                      />
                    </div>

                    <button className="submit-btn" onClick={handleSave}>
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <div className="empty-state">
                    <Pencil size={40} opacity={0.1} />
                    <p>Select a row to edit or click "Add New DNIS".</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
