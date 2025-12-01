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

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false }), 2500);
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleAddNew = () => {
    setForm({ mappingName: "", sourceField: "", showInDesigner: false });
    setEditingIndex(list.length);
  };

  const handleSave = () => {
    if (!form.mappingName || !form.sourceField) {
      showAlert("error", "Please fill all required fields!");
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
  };

  const handleDelete = (index) => {
    const updatedList = list.filter((_, i) => i !== index);
    setList(updatedList);
    if (editingIndex === index) setEditingIndex(null);
    showAlert("success", "Entry Deleted!");
  };

  const onEdit = (index) => {
    setForm(list[index]);
    setEditingIndex(index);
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
    items.forEach((item, idx) => {
      const originalIndex = list.findIndex((l) => l.mappingName === item.mappingName);
      updatedList[originalIndex] = item;
    });

    setList(updatedList);
  };

  return (
    <div className="dnis-container">
      <h2 className="title">Fields Mapping</h2>

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
        <span className="toggle-text">Enable Fields Mapping</span>
      </div>

      {enable && (
        <div className="split-container">
          {/* Left Panel */}
          <div className="left-panel">
            <button className="open-btn" onClick={handleAddNew}>Add New Mapping</button>
            <input
              type="text"
              placeholder="Search Mapping Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />

            <div className="filter-section">
              <span>Filter by Source Field:</span>
              <div className="filter-options">
                {sourceFields.map((f) => (
                  <label key={f}>
                    <input type="checkbox" checked={sourceFilter.includes(f)} onChange={() => toggleFilter(f)} />
                    {f}
                  </label>
                ))}
              </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="fieldsList">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    <table className="dnis-table">
                      <thead>
                        <tr>
                          <th onClick={() => requestSort("mappingName")}>
                            Mapping Name {sortConfig.key === "mappingName" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                          </th>
                          <th onClick={() => requestSort("sourceField")}>
                            Source Field {sortConfig.key === "sourceField" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                          </th>
                          <th onClick={() => requestSort("showInDesigner")}>
                            Show in Designer {sortConfig.key === "showInDesigner" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                          </th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRecords.length === 0 && <tr><td colSpan={4}>No Records Found</td></tr>}
                        {currentRecords.map((row, index) => (
                          <Draggable
                            key={row.mappingName + index}
                            draggableId={row.mappingName + index}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <tr
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="fade-row"
                                style={{
                                  background: editingIndex === indexOfFirstRecord + index ? "#e4e8ff" : snapshot.isDragging ? "#d0e1ff" : "transparent",
                                  ...provided.draggableProps.style
                                }}
                              >
                                <td>{row.mappingName}</td>
                                <td>{row.sourceField}</td>
                                <td>{row.showInDesigner ? "Yes" : "No"}</td>
                                <td className="actions">
                                  <Pencil size={18} className="edit" onClick={() => onEdit(indexOfFirstRecord + index)} />
                                  <Trash2 size={18} className="delete" onClick={() => handleDelete(indexOfFirstRecord + index)} />
                                </td>
                              </tr>
                            )}
                          </Draggable>
                        ))}
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

          {/* Right Panel */}
          <div className="right-panel">
            {editingIndex !== null ? (
              <div className="form">
                <h3>Mapping Details</h3>
                <input
                  name="mappingName"
                  placeholder="Mapping Name *"
                  value={form.mappingName}
                  onChange={onChange}
                />
                <div className={`custom-dropdown ${sourceDropdown ? "show-options" : ""}`}>
                  <div className="selected" onClick={() => setSourceDropdown(!sourceDropdown)}>
                    <span>{form.sourceField || "Select Source Field *"}</span>
                    <ChevronDown size={16} />
                  </div>
                  <div className="options">
                    {sourceFields.map((f, i) => (
                      <div key={i} className="option" onClick={() => { setForm({ ...form, sourceField: f }); setSourceDropdown(false); }}>{f}</div>
                    ))}
                  </div>
                </div>
                <label>
                  <input type="checkbox" checked={form.showInDesigner} name="showInDesigner" onChange={onChange} />
                  Show in Designer
                </label>
                <button className="submit-btn" onClick={handleSave}>
                  {editingIndex !== null && editingIndex < list.length ? "Update" : "Save"}
                </button>
              </div>
            ) : (
              <p>Select a mapping from the left panel to view details or edit.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
