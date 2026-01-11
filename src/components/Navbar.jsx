import React from "react";
import { Bell, Sun, Moon } from "@phosphor-icons/react";
import UserProfile from "./UserProfile";
import "./Navbar.css";

export default function Navbar({ theme, setTheme }) {
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
      </div>

      {/* Right side */}
      <div className="navbar-right">
        {/* Theme toggle */}
        <button
          className="theme-toggle-btn-nav"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? (
            <Moon size={20} weight="duotone" />
          ) : (
            <Sun size={20} weight="duotone" />
          )}
        </button>

        <Bell size={20} weight="duotone" className="navbar-icon" />
        <UserProfile />
      </div>
    </div>
  );
}
