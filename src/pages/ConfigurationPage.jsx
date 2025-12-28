import React, { useState } from "react";
import "./ConfigurationPage.css";

// APi form data that will be sent to api will be as:
// {
//   environment: "production" or "development",
//   numberOption: "all" or "specific",
//   specificNumber: "1234567890" (only if specific is selected)
// }

export default function ConfigurationPage() {
  const [environment, setEnvironment] = useState("production");
  const [numberOption, setNumberOption] = useState("all");
  const [specificNumber, setSpecificNumber] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      environment,
      numberOption,
      ...(numberOption === "specific" && { specificNumber }),
    };

    console.log("Form submitted:", formData);
    // API call will be added here later
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

          {/* Submit Button */}
          <div className="form-actions">
            <button type="submit" className="submit-button">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
