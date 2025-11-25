import { useState, useEffect } from "react";

/**
 * Custom hook to sync state with localStorage
 * @param {string} key - The localStorage key
 * @param {any} initialValue - The initial value if no stored value exists
 * @returns {[any, function]} - Returns [storedValue, setValue]
 */
export function useLocalStorage(key, initialValue) {
  // Get stored value or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

/**
 * Utility function to get item from localStorage
 * @param {string} key - The localStorage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} - The parsed value or default
 */
export function getLocalStorageItem(key, defaultValue = null) {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Utility function to set item in localStorage
 * @param {string} key - The localStorage key
 * @param {any} value - The value to store
 * @returns {boolean} - Success status
 */
export function setLocalStorageItem(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Utility function to remove item from localStorage
 * @param {string} key - The localStorage key
 * @returns {boolean} - Success status
 */
export function removeLocalStorageItem(key) {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Utility function to clear all localStorage
 * @returns {boolean} - Success status
 */
export function clearLocalStorage() {
  try {
    window.localStorage.clear();
    return true;
  } catch (error) {
    console.error("Error clearing localStorage:", error);
    return false;
  }
}
