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
  onOpenDNIS, // ✅ added
  onOpenMapping,
}) {
  return (
    <div className="navbar">
      {/* Left side */}
      <div className="navbar-left">
        <img
          src="/favicon.png"
          alt="logo"
          width={102}
          height={102}
          className="navbar-logo"
        />
        <div className="navbar-title">IVR Flow Builder</div>

        {/* Buttons Group */}
        <div className="navbar-buttons">
          {/* IVR Config */}
          <button onClick={onOpenConfig} className="nav-action-btn ivr-btn">
            <Settings size={16} />
            IVR Config
          </button>

          {/* DNIS Config */}
          <button onClick={onOpenDNIS} className="nav-action-btn mapping-btn">
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
      <div className="navbar-right">
        {/* Search */}
        <div className="search-box">
          <Search size={14} />
          <input placeholder="Search flows, nodes, interactions..." />
        </div>
        <button
          className="theme-toggle-btn-nav"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <Bell size={18} className="navbar-icon" />
        <UserCircle size={24} className="navbar-icon" />
      </div>
    </div>
  );
}
