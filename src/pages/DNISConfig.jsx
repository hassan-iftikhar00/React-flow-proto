import React, { useState } from "react";
import {
  Pencil,
  Trash2,
  ChevronDown,
  CheckCircle,
  XCircle,
  ChevronUp,
  ChevronDown as DownIcon,
} from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import "./DNISConfig.css";

export default function DNISConfig() {
  const [enable, setEnable] = useState(false);

  // DNIS data
  const [data, setData] = useLocalStorage("dnisConfig_data", []);

  // IVR logs
  const [ivrLogs] = useLocalStorage("ivrConfig_logs", []);

  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [envDropdown, setEnvDropdown] = useState(false);
  const [selectedDNISIndex, setSelectedDNISIndex] = useState(null);
  const [filterDropdown, setFilterDropdown] = useState(false);
  const [filter, setFilter] = useState("All");
  const [appDropdown, setAppDropdown] = useState(false);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const environments = ["Production", "Development"];
  const filters = ["All", ...environments];

  const ivrAppNames = Array.from(new Set(ivrLogs.map((log) => log.appName)));

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false }), 2500);
  };

  const handleChange = (e) => {
    if (selectedDNISIndex === null) return;
    const updatedData = [...data];
    updatedData[selectedDNISIndex][e.target.name] = e.target.value;
    setData(updatedData);
  };

  const handleSave = () => {
    if (selectedDNISIndex === null) {
      showAlert("error", "No DNIS selected!");
      return;
    }

    const dnis = data[selectedDNISIndex];
    if (!dnis.dnis || !dnis.appName || !dnis.environment) {
      showAlert("error", "Please fill all required fields!");
      return;
    }

    showAlert("success", "DNIS Saved Successfully!");
  };

  const handleAddNew = () => {
    const newDNIS = { dnis: "", appName: "", environment: "", remarks: "" };
    setData([...data, newDNIS]);
    setSelectedDNISIndex(data.length);
  };

  const handleDelete = (index) => {
    const updatedData = data.filter((_, i) => i !== index);
    setData(updatedData);
    if (selectedDNISIndex === index) setSelectedDNISIndex(null);
    showAlert("success", "Entry Deleted!");
  };

  const selectEnvironment = (env) => {
    if (selectedDNISIndex === null) return;
    const updatedData = [...data];
    updatedData[selectedDNISIndex].environment = env;
    setData(updatedData);
    setEnvDropdown(false);
  };

  const selectAppName = (app) => {
    if (selectedDNISIndex === null) return;
    const updatedData = [...data];
    updatedData[selectedDNISIndex].appName = app;
    setData(updatedData);
    setAppDropdown(false);
  };

  const selectFilter = (f) => {
    setFilter(f);
    setFilterDropdown(false);
  };

  const filteredData =
    filter === "All" ? data : data.filter((d) => d.environment === filter);

  // Sorting
  const sortedData = React.useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key] || "";
        const valB = b[sortConfig.key] || "";
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortArrow = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? <ChevronUp size={12} /> : <DownIcon size={12} />;
    }
    return null;
  };

  return (
    <div className="dnis-container">
      <h2 className="title">DNIS Configuration</h2>

      {alert.show && (
        <div className={`alert ${alert.type}`}>
          {alert.type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <span>{alert.message}</span>
        </div>
      )}

      <div className="toggle-row">
        <label className="switch">
          <input type="checkbox" checked={enable} onChange={() => setEnable(!enable)} />
          <span className="slider"></span>
        </label>
        <span className="toggle-text">Enable DNIS Configuration</span>
      </div>

      {enable && (
        <div className="split-container">
          {/* LEFT PANEL */}
          <div className="left-panel">
            <button className="open-btn" onClick={handleAddNew}>
              Add New DNIS
            </button>

            {data.length > 0 && (
              <div className={`custom-dropdown ${filterDropdown ? "show-options" : ""}`} style={{ margin: "16px 0" }}>
                <div className="selected" onClick={() => setFilterDropdown(!filterDropdown)}>
                  <span>{filter}</span>
                  <ChevronDown size={16} />
                </div>
                <div className="options">
                  {filters.map((f, i) => (
                    <div key={i} className="option" onClick={() => selectFilter(f)}>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredData.length > 0 && (
              <table className="dnis-table">
                <thead>
                  <tr>
                    <th onClick={() => requestSort("dnis")}>
                      DNIS {getSortArrow("dnis")}
                    </th>
                    <th onClick={() => requestSort("appName")}>
                      App Name {getSortArrow("appName")}
                    </th>
                    <th onClick={() => requestSort("environment")}>
                      Environment {getSortArrow("environment")}
                    </th>
                    <th onClick={() => requestSort("remarks")}>
                      Remarks {getSortArrow("remarks")}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((row, index) => (
                    <tr
                      key={index}
                      style={{
                        background: selectedDNISIndex === index ? "#e4e8ff" : "transparent",
                      }}
                    >
                      <td>{row.dnis}</td>
                      <td>{row.appName}</td>
                      <td>{row.environment}</td>
                      <td>{row.remarks}</td>
                      <td className="actions">
                        <Pencil size={18} onClick={() => setSelectedDNISIndex(index)} />
                        <Trash2 size={18} onClick={() => handleDelete(index)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div className="right-panel">
            {selectedDNISIndex !== null ? (
              <div className="form">
                <h3>DNIS Details</h3>

                <input
                  name="dnis"
                  placeholder="DNIS *"
                  value={data[selectedDNISIndex].dnis}
                  onChange={handleChange}
                />

                {/* APP NAME DROPDOWN */}
                <div className={`custom-dropdown ${appDropdown ? "show-options" : ""}`}>
                  <div className="selected" onClick={() => setAppDropdown(!appDropdown)}>
                    <span>{data[selectedDNISIndex].appName || "Select App Name *"}</span>
                    <ChevronDown size={16} />
                  </div>
                  <div className="options">
                    {ivrAppNames.length === 0 ? (
                      <div className="option disabled">No IVR Apps Found</div>
                    ) : (
                      ivrAppNames.map((app, i) => (
                        <div key={i} className="option" onClick={() => selectAppName(app)}>
                          {app}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* ENV DROPDOWN */}
                <div className={`custom-dropdown ${envDropdown ? "show-options" : ""}`}>
                  <div className="selected" onClick={() => setEnvDropdown(!envDropdown)}>
                    <span>{data[selectedDNISIndex].environment || "Select Environment *"}</span>
                    <ChevronDown size={16} />
                  </div>
                  <div className="options">
                    {environments.map((env, i) => (
                      <div key={i} className="option" onClick={() => selectEnvironment(env)}>
                        {env}
                      </div>
                    ))}
                  </div>
                </div>

                <textarea
                  name="remarks"
                  placeholder="Remarks"
                  value={data[selectedDNISIndex].remarks}
                  onChange={handleChange}
                />

                <button className="submit-btn" onClick={handleSave}>
                  Save / Update
                </button>
              </div>
            ) : (
              <p>Select a DNIS from left panel to edit</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
