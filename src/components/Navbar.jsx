import React from "react";
import { Bell, UserCircle, Search, Sun, Moon } from "lucide-react";

export default function Navbar({ theme, setTheme }) {
  return (
    <div className="navbar">
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ fontWeight: 700 }}>IVR Flow Builder</div>
        <div className="search-box">
          <Search size={14} />
          <input placeholder="Search flows, nodes, interactions..." />
        </div>
      </div>

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
