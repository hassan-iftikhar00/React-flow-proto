import React from "react";

/**
 * Reusable IVR Input Configuration Component
 * Used for Menu, Collect, and other input-based nodes
 */
export default function IVRInputConfig({
  nodeId,
  nodeData,
  onDataChange,
  showInputLength = false,
  promptLabel = "Prompt Text",
  promptPlaceholder = "Enter prompt text...",
}) {
  const handleChange = (field, value) => {
    onDataChange({ ...nodeData, [field]: value });
  };

  return (
    <>
      {/* Prompt Text */}
      <label>{promptLabel}</label>
      <textarea
        rows="3"
        placeholder={promptPlaceholder}
        value={nodeData.promptText || ""}
        onChange={(e) => handleChange("promptText", e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      {/* Timeout */}
      <label>Timeout (seconds)</label>
      <select
        value={nodeData.timeout || "3"}
        onChange={(e) => handleChange("timeout", e.target.value)}
        style={{ marginBottom: "10px" }}
      >
        <option value="1">1 second</option>
        <option value="2">2 seconds</option>
        <option value="3">3 seconds</option>
        <option value="4">4 seconds</option>
        <option value="5">5 seconds</option>
      </select>

      {/* Input Length (optional) */}
      {showInputLength && (
        <>
          <label>Input Length</label>
          <input
            type="number"
            min="1"
            max="20"
            placeholder="Enter max input length..."
            value={nodeData.inputLength || ""}
            onChange={(e) => handleChange("inputLength", e.target.value)}
            style={{ marginBottom: "10px" }}
          />
        </>
      )}

      {/* Track Invalid Response */}
      <div style={{ marginBottom: "10px" }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <input
            type="checkbox"
            checked={nodeData.trackInvalid || false}
            onChange={(e) => handleChange("trackInvalid", e.target.checked)}
          />
          Track Invalid Response
        </label>
      </div>

      {/* Track No Response */}
      <div style={{ marginBottom: "15px" }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <input
            type="checkbox"
            checked={nodeData.trackNoResponse || false}
            onChange={(e) => handleChange("trackNoResponse", e.target.checked)}
          />
          Track No Response
        </label>
      </div>

      {/* Invalid Response Section */}
      <div
        style={{
          borderTop: "1px solid var(--border-color)",
          paddingTop: "15px",
          marginTop: "15px",
        }}
      >
        <h5
          style={{
            margin: "0 0 10px 0",
            color: "var(--text-color)",
          }}
        >
          Invalid Response:
        </h5>

        <div style={{ marginBottom: "10px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <input
              type="checkbox"
              checked={nodeData.invalidUseStandardMessage || false}
              onChange={(e) =>
                handleChange("invalidUseStandardMessage", e.target.checked)
              }
            />
            Standard Invalid Message Prompt
          </label>
        </div>

        <div style={{ marginLeft: "20px", marginBottom: "10px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "5px",
            }}
          >
            <input
              type="radio"
              name={`invalid-action-${nodeId}`}
              value="repeat"
              checked={nodeData.invalidAction === "repeat"}
              onChange={(e) => handleChange("invalidAction", e.target.value)}
            />
            Repeat
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <input
              type="radio"
              name={`invalid-action-${nodeId}`}
              value="goto"
              checked={nodeData.invalidAction === "goto"}
              onChange={(e) => handleChange("invalidAction", e.target.value)}
            />
            Go To
          </label>
          {nodeData.invalidAction === "goto" && (
            <input
              type="text"
              placeholder="Enter target node"
              value={nodeData.invalidGotoTarget || ""}
              onChange={(e) =>
                handleChange("invalidGotoTarget", e.target.value)
              }
              style={{
                marginLeft: "28px",
                marginTop: "5px",
                width: "calc(100% - 28px)",
              }}
            />
          )}
        </div>
      </div>

      {/* No Response Section */}
      <div
        style={{
          borderTop: "1px solid var(--border-color)",
          paddingTop: "15px",
          marginTop: "15px",
        }}
      >
        <h5
          style={{
            margin: "0 0 10px 0",
            color: "var(--text-color)",
          }}
        >
          No Response:
        </h5>

        <div style={{ marginBottom: "10px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <input
              type="checkbox"
              checked={nodeData.noResponseUseStandardMessage || false}
              onChange={(e) =>
                handleChange("noResponseUseStandardMessage", e.target.checked)
              }
            />
            Standard No Response Message Prompt
          </label>
        </div>

        <div style={{ marginLeft: "20px", marginBottom: "10px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "5px",
            }}
          >
            <input
              type="radio"
              name={`noresponse-action-${nodeId}`}
              value="repeat"
              checked={nodeData.noResponseAction === "repeat"}
              onChange={(e) => handleChange("noResponseAction", e.target.value)}
            />
            Repeat
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <input
              type="radio"
              name={`noresponse-action-${nodeId}`}
              value="goto"
              checked={nodeData.noResponseAction === "goto"}
              onChange={(e) => handleChange("noResponseAction", e.target.value)}
            />
            Go To
          </label>
          {nodeData.noResponseAction === "goto" && (
            <input
              type="text"
              placeholder="Enter target node"
              value={nodeData.noResponseGotoTarget || ""}
              onChange={(e) =>
                handleChange("noResponseGotoTarget", e.target.value)
              }
              style={{
                marginLeft: "28px",
                marginTop: "5px",
                width: "calc(100% - 28px)",
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
