import React, { createContext, useContext, useState, useEffect } from "react";
import { authenticateUser, getUserById, hasPermission } from "../auth/users";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Verify user still exists
        const validUser = getUserById(userData.id);
        if (validUser) {
          setCurrentUser(validUser);
        } else {
          localStorage.removeItem("currentUser");
        }
      } catch (error) {
        console.error("Error loading user session:", error);
        localStorage.removeItem("currentUser");
      }
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const user = authenticateUser(username, password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, error: "Invalid username or password" };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  const checkPermission = (permission) => {
    return hasPermission(currentUser, permission);
  };

  const value = {
    currentUser,
    login,
    logout,
    checkPermission,
    isAuthenticated: !!currentUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
