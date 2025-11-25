import React from "react";
import {
  Bell,
  UserCircle,
  Search,
  Sun,
  Moon,
  Settings,
  Map,
} from "lucide-react";
import "./Navbar.css";

export default function Navbar({
  theme,
  setTheme,
  setActive,
  onOpenConfig,
  onOpenDNIS,       // ✅ added
  onOpenMapping,
}) {
  return (
    <div className="navbar">
      {/* Left side */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ fontWeight: 700 }}>IVR Flow Builder</div>

        {/* Search */}
        <div className="search-box">
          <Search size={14} />
          <input placeholder="Search flows, nodes, interactions..." />
        </div>

        {/* Buttons Group */}
        <div style={{ display: "flex", gap: 8, marginLeft: 16 }}>
          {/* IVR Config */}
          <button onClick={onOpenConfig} className="nav-action-btn ivr-btn">
            <Settings size={16} />
            IVR Config
          </button>

          {/* DNIS Config – FIXED */}
          <button
            onClick={onOpenDNIS}        // ✅ Corrected handler
            className="nav-action-btn mapping-btn"
          >
            <Map size={16} />
            DNIS Config
          </button>

          {/* Fields Mapping */}
          <button
            onClick={onOpenMapping}
            className="nav-action-btn mapping-btn"
          >
            <Map size={16} />
            Fields Mapping
          </button>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          className="theme-toggle-btn-nav"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <Bell size={18} />
        <UserCircle size={24} />
      </div>
    </div>
  );
}
