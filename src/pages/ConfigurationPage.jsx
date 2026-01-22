import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./ConfigurationPage.css";

// API expects:
// POST https://localhost:44395/api/Default
// Body: {
//   "EnvType": "Prod" or "Dev",
//   "DNIS": "1234567890"
// }

export default function ConfigurationPage() {
  const navigate = useNavigate();
  const [environment, setEnvironment] = useState("production");
  const [numberOption, setNumberOption] = useState("all");
  const [specificNumber, setSpecificNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate specific number if selected
    if (numberOption === "specific" && !specificNumber) {
      setError("Please enter a specific number");
      return;
    }

    setLoading(true);
    try {
      // Map form values to API format
      const apiData = {
        EnvType: environment === "production" ? "Prod" : "Dev",
        ...(numberOption === "specific" && { DNIS: specificNumber }),
      };

      console.log("Sending to API:", apiData);

      const response = await fetch("https://localhost:44395/api/Default", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log("API Response:", result);

      setSuccess(true);
      setResponseData(result);
      setShowModal(true);
      // Optionally reset form or navigate
      // navigate('/some-page');
    } catch (err) {
      console.error("API call failed:", err);
      setError(err.message || "Failed to submit configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleNumberChange = (e) => {
    const value = e.target.value;
    // Allow only digits and limit to 10 characters
    if (/^\d{0,10}$/.test(value)) {
      setSpecificNumber(value);
    }
  };

  return (
    <div className="configuration-page">
      <button
        onClick={() => navigate(-1)}
        className="back-button-top"
        aria-label="Go back"
      >
        <ArrowLeft size={20} />
        Back
      </button>
      <div className="configuration-container">
        <div className="configuration-header">
          <h1>Configuration</h1>
        </div>

        <form onSubmit={handleSubmit} className="configuration-form">
          {/* Environment Selection */}
          <div className="form-section">
            <label className="section-label">Environment</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="environment"
                  value="production"
                  checked={environment === "production"}
                  onChange={(e) => setEnvironment(e.target.value)}
                />
                <span className="radio-label">Production</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="environment"
                  value="development"
                  checked={environment === "development"}
                  onChange={(e) => setEnvironment(e.target.value)}
                />
                <span className="radio-label">Development</span>
              </label>
            </div>
          </div>

          {/* Number Option Selection */}
          <div className="form-section">
            <label className="section-label" htmlFor="number-option">
              Number Option
            </label>
            <select
              id="number-option"
              value={numberOption}
              onChange={(e) => setNumberOption(e.target.value)}
              className="dropdown-select"
            >
              <option value="all">All</option>
              <option value="specific">Specific Number</option>
            </select>
          </div>

          {/* Specific Number Input (conditional) */}
          {numberOption === "specific" && (
            <div className="form-section">
              <label className="section-label" htmlFor="specific-number">
                Specific Number
              </label>
              <input
                id="specific-number"
                type="text"
                value={specificNumber}
                onChange={handleNumberChange}
                placeholder="Enter up to 10 digits"
                maxLength={10}
                pattern="\d{0,10}"
                className="number-input"
              />
              <span className="input-hint">
                {specificNumber.length}/10 digits
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="form-section">
              <div className="error-message">{error}</div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="form-section">
              <div className="success-message">
                Configuration submitted successfully!
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>

      {/* Response Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>API Response</h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <pre className="response-json">
                {JSON.stringify(responseData, null, 2)}
              </pre>
            </div>
            <div className="modal-footer">
              <button
                className="modal-button"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
