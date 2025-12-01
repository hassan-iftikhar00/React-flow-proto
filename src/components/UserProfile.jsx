import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { LogOut, User, Shield, Briefcase, Calendar } from "lucide-react";

export default function UserProfile() {
  const { currentUser, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  if (!currentUser) return null;

  const getRoleBadgeColor = () => {
    switch (currentUser.role) {
      case "admin":
        return "#4ECDC4";
      case "editor":
        return "#FF6B6B";
      case "viewer":
        return "#8b5cf6";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="user-profile-container" ref={dropdownRef}>
      <button
        className="user-profile-trigger"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="user-avatar"
        />
        <span className="user-name-short">{currentUser.name}</span>
      </button>

      {showDropdown && (
        <div className="user-profile-dropdown">
          <div className="user-profile-header">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="user-avatar-large"
            />
            <div className="user-profile-info">
              <h3>{currentUser.name}</h3>
              <p>{currentUser.email}</p>
            </div>
          </div>

          <div className="user-profile-details">
            <div className="user-detail-item">
              <Shield size={16} />
              <span className="user-detail-label">Role:</span>
              <span
                className="user-role-badge"
                style={{ backgroundColor: getRoleBadgeColor() }}
              >
                {currentUser.role}
              </span>
            </div>

            <div className="user-detail-item">
              <Briefcase size={16} />
              <span className="user-detail-label">Department:</span>
              <span>{currentUser.department}</span>
            </div>

            <div className="user-detail-item">
              <User size={16} />
              <span className="user-detail-label">Username:</span>
              <span>@{currentUser.username}</span>
            </div>

            <div className="user-detail-item">
              <Calendar size={16} />
              <span className="user-detail-label">Member since:</span>
              <span>
                {new Date(currentUser.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="user-profile-divider"></div>

          <button className="user-profile-logout" onClick={logout}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
