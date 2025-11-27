import React, { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import "./FieldsMapping.css";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

export default function FieldsMapping({
  showPopup: externalShowPopup,
  onListChange,
}) {
  const [form, setForm] = useState({
    mappingName: "",
    sourceField: "",
    showInDesigner: false,
  });

  const [editingIndex, setEditingIndex] = useState(null);
  const [list, setList] = useLocalStorage("fieldsMapping_list", []);
  const [search, setSearch] = useState("");
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
  const [sourceFilter, setSourceFilter] = useState([]);
  const sourceFields = ["MemberName", "MemberID", "AccountNumber", "ClaimID"];

  // Export list whenever it changes
  React.useEffect(() => {
    if (onListChange) {
      onListChange(list);
    }
  }, [list, onListChange]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const toggleFilter = (value) => {
    if (sourceFilter.includes(value)) {
      setSourceFilter(sourceFilter.filter((v) => v !== value));
    } else {
      setSourceFilter([...sourceFilter, value]);
    }
  };

  const showPopup = (title, message, onConfirm = null) =>
    setPopup({ open: true, title, message, onConfirm });

  const closePopup = () => setPopup({ ...popup, open: false, onConfirm: null });

  const onSave = () => {
    if (!form.mappingName || !form.sourceField) {
      showPopup("⚠️ Warning", "Mapping Name and Source Field are required!");
      return;
    }

    if (editingIndex !== null) {
      const copy = [...list];
      copy[editingIndex] = form;
      setList(copy);
      setEditingIndex(null);
      showPopup("✅ Success", "Field mapping updated successfully!");
    } else {
      setList([...list, form]);
      showPopup("✅ Success", "Field mapping saved successfully!");
    }

    setForm({ mappingName: "", sourceField: "", showInDesigner: false });
  };

  const onEdit = (index) => {
    setForm(list[index]);
    setEditingIndex(index);
  };

  const onDelete = (index) => {
    showPopup(
      "⚠️ Delete",
      "Are you sure you want to delete this mapping?",
      () => {
        const copy = [...list];
        copy.splice(index, 1);
        setList(copy);
        closePopup();
      }
    );
  };

  const onClear = () => {
    setForm({ mappingName: "", sourceField: "", showInDesigner: false });
    setEditingIndex(null);
  };

  // Sorting
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  // Filter + Search
  const filteredList = list.filter((item) => {
    const matchesSearch = item.mappingName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesSource =
      sourceFilter.length === 0 || sourceFilter.includes(item.sourceField);
    return matchesSearch && matchesSource;
  });

  const sortedList = React.useMemo(() => {
    let sortable = [...filteredList];
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

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = sortedList.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(sortedList.length / recordsPerPage);

  return (
    <Box className="fields-wrapper">
      {/* HEADER */}
      <Typography variant="h5" className="section-header">
        Fields Mapping
      </Typography>

      {/* FORM CARD */}
      <Paper className="fields-card">
        <FormControl fullWidth sx={{ mb: 2 }}>
          <TextField
            label="Mapping Name *"
            name="mappingName"
            value={form.mappingName}
            onChange={onChange}
          />
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Source Field *</InputLabel>
          <Select
            name="sourceField"
            value={form.sourceField}
            onChange={onChange}
          >
            <MenuItem value="">Select</MenuItem>
            {sourceFields.map((f) => (
              <MenuItem key={f} value={f}>
                {f}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Checkbox
              name="showInDesigner"
              checked={form.showInDesigner}
              onChange={onChange}
            />
          }
          label="Show in Designer"
        />

        <div className="button-row">
          <Button className="clear-btn" onClick={onClear}>
            Clear
          </Button>
          <Button className="save-btn" onClick={onSave}>
            {editingIndex !== null ? "Update" : "Save"}
          </Button>
        </div>
      </Paper>

      {/* FILTERS + LIST CARD */}
      <Paper className="fields-card">
        <TextField
          placeholder="Search keyword"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Multi-select Filter */}
        <div className="filters-row">
          <div className="filter-group">
            <span>Filter by Source Field:</span>
            {sourceFields.map((field) => (
              <label key={field}>
                <input
                  type="checkbox"
                  checked={sourceFilter.includes(field)}
                  onChange={() => toggleFilter(field)}
                />
                {field}
              </label>
            ))}
          </div>
        </div>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell onClick={() => requestSort("mappingName")}>
                  Mapping Name{" "}
                  {sortConfig.key === "mappingName"
                    ? sortConfig.direction === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </TableCell>
                <TableCell>Data Type</TableCell>
                <TableCell>Sample Data</TableCell>
                <TableCell onClick={() => requestSort("sourceField")}>
                  Source Field{" "}
                  {sortConfig.key === "sourceField"
                    ? sortConfig.direction === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </TableCell>
                <TableCell onClick={() => requestSort("showInDesigner")}>
                  Show in Designer{" "}
                  {sortConfig.key === "showInDesigner"
                    ? sortConfig.direction === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </TableCell>
                <TableCell style={{ textAlign: "center" }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {currentRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No Records Found
                  </TableCell>
                </TableRow>
              ) : (
                currentRecords.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.mappingName}</TableCell>
                    <TableCell>String</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{row.sourceField}</TableCell>
                    <TableCell>{row.showInDesigner ? "Yes" : "No"}</TableCell>
                    <TableCell className="actions-cell">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onEdit(indexOfFirstRecord + index)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => onDelete(indexOfFirstRecord + index)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </Button>
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={currentPage === i + 1 ? "active-page" : ""}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </Paper>

      {/* POPUP */}
      <Dialog open={popup.open} onClose={closePopup}>
        <DialogTitle>{popup.title}</DialogTitle>
        <DialogContent>
          <Typography>{popup.message}</Typography>
        </DialogContent>
        <DialogActions>
          {popup.onConfirm ? (
            <>
              <Button onClick={() => popup.onConfirm()} color="error">
                Yes
              </Button>
              <Button onClick={closePopup}>No</Button>
            </>
          ) : (
            <Button onClick={closePopup} autoFocus>
              OK
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
