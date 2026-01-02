import React, { useState, useMemo } from "react";
import { Pencil, Trash2, CheckCircle, XCircle, ChevronDown } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./FieldsMapping.css";

export default function FieldsMapping() {
  const [enable, setEnable] = useState(false);
  const [form, setForm] = useState({ mappingName: "", sourceField: "", showInDesigner: false });
  const [editingIndex, setEditingIndex] = useState(null);
  const [list, setList] = useLocalStorage("fieldsMapping_list", []);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [sourceDropdown, setSourceDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState([]);
  const sourceFields = ["MemberName", "MemberID", "AccountNumber", "ClaimID"];
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const [errors, setErrors] = useState({});

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false }), 2500);
  };

  const validateForm = () => {
    let newErrors = {};
    if (!form.mappingName || form.mappingName.trim() === "") {
      newErrors.mappingName = "Mapping Name is required!";
    } else if (form.mappingName.length < 3) {
      newErrors.mappingName = "Minimum 3 characters required!";
    }
    if (!form.sourceField) {
      newErrors.sourceField = "Please select a source field!";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleAddNew = () => {
    setForm({ mappingName: "", sourceField: "", showInDesigner: false });
    setEditingIndex(list.length);
    setErrors({});
  };

  const handleSave = () => {
    if (!validateForm()) {
      showAlert("error", "Please fix the highlighted errors.");
      return;
    }
    const updatedList = [...list];
    if (editingIndex !== null && editingIndex < list.length) {
      updatedList[editingIndex] = form;
      showAlert("success", "Field Mapping Updated!");
    } else {
      updatedList.push(form);
      showAlert("success", "Field Mapping Saved!");
    }
    setList(updatedList);
    setEditingIndex(null);
    setForm({ mappingName: "", sourceField: "", showInDesigner: false });
    setErrors({});
  };

  // --- window.confirm removed ---
  const handleDelete = (index) => {
    const updatedList = list.filter((_, i) => i !== index);
    setList(updatedList);
    if (editingIndex === index) {
      setEditingIndex(null);
      setForm({ mappingName: "", sourceField: "", showInDesigner: false });
    }
    showAlert("success", "Entry Deleted Successfully!");
  };

  const onEdit = (index) => {
    setForm(list[index]);
    setEditingIndex(index);
    setErrors({});
  };

  const toggleFilter = (value) => {
    if (sourceFilter.includes(value)) {
      setSourceFilter(sourceFilter.filter((v) => v !== value));
    } else {
      setSourceFilter([...sourceFilter, value]);
    }
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const filteredList = list.filter((item) => {
    const matchesSearch = item.mappingName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = sourceFilter.length === 0 || sourceFilter.includes(item.sourceField);
    return matchesSearch && matchesFilter;
  });

  const sortedList = useMemo(() => {
    const sortable = [...filteredList];
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
  }, [filteredList, sortConfig]);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = sortedList.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(sortedList.length / recordsPerPage);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(sortedList);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    const updatedList = [...list];
    items.forEach((item) => {
      const originalIndex = list.findIndex((l) => l.mappingName === item.mappingName);
      updatedList[originalIndex] = item;
    });
    setList(updatedList);
  };

  return (
    <div className="dnis-container">
      <h2 className="title">Fields Mapping</h2>

      {alert.show && (
        <div className="alert-wrapper">
          <div className={`alert ${alert.type}`}>
            {alert.type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <span>{alert.message}</span>
          </div>
        </div>
      )}

      <div className="toggle-row">
        <label className="switch">
          <input type="checkbox" checked={enable} onChange={() => setEnable(!enable)} />
          <span className="slider"></span>
        </label>
        <span className="toggle-text">Enable Fields Mapping</span>
      </div>

      {enable && (
        <div className="split-container">
          <div className="left-panel">
            <button className="open-btn" onClick={handleAddNew}>Add New Mapping</button>
            <input
              type="text"
              placeholder="Search Mapping Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />

            <div className="filter-section" style={{marginTop: '15px', fontSize: '13px'}}>
              <span style={{fontWeight: '600', color: '#555'}}>Filter by Source:</span>
              <div style={{display: 'flex', gap: '10px', marginTop: '5px'}}>
                {sourceFields.map((f) => (
                  <label key={f} style={{display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer'}}>
                    <input type="checkbox" checked={sourceFilter.includes(f)} onChange={() => toggleFilter(f)} />
                    {f}
                  </label>
                ))}
              </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="fieldsList">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="table-wrapper">
                    <table className="dnis-table">
                      <thead>
                        <tr>
                          <th onClick={() => requestSort("mappingName")}>
                            Mapping Name {sortConfig.key === "mappingName" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                          </th>
                          <th onClick={() => requestSort("sourceField")}>
                            Source Field {sortConfig.key === "sourceField" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                          </th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRecords.length === 0 && <tr><td colSpan={3} className="no-data-td">No Records Found</td></tr>}
                        {currentRecords.map((row, index) => {
                          const actualIdx = list.indexOf(row);
                          return (
                            <Draggable key={row.mappingName + actualIdx} draggableId={row.mappingName + actualIdx} index={index}>
                              {(provided) => (
                                <tr
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={editingIndex === actualIdx ? "selected-row" : "fade-row"}
                                  onClick={() => onEdit(actualIdx)}
                                >
                                  <td>{row.mappingName}</td>
                                  <td>{row.sourceField}</td>
                                  <td className="actions">
                                    <div className="action-btns">
                                      <Pencil size={18} className="edit-icon" />
                                      <Trash2 
                                        size={18} 
                                        className="delete-icon" 
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          handleDelete(actualIdx); 
                                        }} 
                                      />
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </tbody>
                    </table>
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {totalPages > 1 && (
              <div className="pagination">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Prev</button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} className={currentPage === i + 1 ? "active-page" : ""} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                ))}
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
              </div>
            )}
          </div>

          <div className="right-panel">
            {editingIndex !== null ? (
              <div className="sticky-wrapper">
                <div className="form">
                  <h3>{editingIndex < list.length ? "Edit Mapping" : "New Mapping"}</h3>
                  <div className="input-group">
                    <label>Mapping Name *</label>
                    <input
                      name="mappingName"
                      className={errors.mappingName ? "error-border" : ""}
                      placeholder="Enter mapping name"
                      value={form.mappingName}
                      onChange={onChange}
                    />
                    {errors.mappingName && <span className="error-msg">{errors.mappingName}</span>}
                  </div>
                  <div className="input-group">
                    <label>Source Field *</label>
                    <div className={`custom-dropdown ${sourceDropdown ? "show-options" : ""} ${errors.sourceField ? "error-border" : ""}`}>
                      <div className="selected" onClick={() => setSourceDropdown(!sourceDropdown)}>
                        <span>{form.sourceField || "Select Source..."}</span>
                        <ChevronDown size={16} />
                      </div>
                      <div className="options">
                        {sourceFields.map((f, i) => (
                          <div key={i} className="option" onClick={() => { 
                            setForm({ ...form, sourceField: f }); 
                            setSourceDropdown(false); 
                            setErrors(p => ({...p, sourceField: null}));
                          }}>{f}</div>
                        ))}
                      </div>
                    </div>
                    {errors.sourceField && <span className="error-msg">{errors.sourceField}</span>}
                  </div>
                  <div className="input-group checkbox-group" style={{flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '10px'}}>
                    <input type="checkbox" checked={form.showInDesigner} name="showInDesigner" id="designer" onChange={onChange} style={{width: '18px', height: '18px'}} />
                    <label htmlFor="designer" style={{marginBottom: 0, cursor: 'pointer'}}>Show in Designer</label>
                  </div>
                  <button className="submit-btn" onClick={handleSave}>
                    {editingIndex < list.length ? "Update Changes" : "Save Mapping"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p>Select a mapping to edit or click "Add New Mapping"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}