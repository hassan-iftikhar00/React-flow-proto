import { useState } from "react";
import "./TemplateGroupDropdown.css";

/**
 * TemplateGroupDropdown Component
 * Dropdown to filter data by template group
 *
 * @param {Object} props
 * @param {Array} props.groups - Array of template group names
 * @param {string} props.selectedGroup - Currently selected group
 * @param {Function} props.onGroupChange - Callback when selection changes
 */
export default function TemplateGroupDropdown({
  groups = [],
  selectedGroup = "All",
  onGroupChange,
}) {
  return (
    <div className="template-group-dropdown">
      <label htmlFor="template-group-select" className="dropdown-label">
        Template Group:
      </label>
      <select
        id="template-group-select"
        className="dropdown-select"
        value={selectedGroup}
        onChange={(e) => onGroupChange(e.target.value)}
      >
        <option value="All">All Groups</option>
        {groups.map((group) => (
          <option key={group} value={group}>
            {group}
          </option>
        ))}
      </select>
    </div>
  );
}
