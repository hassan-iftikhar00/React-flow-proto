import React from "react";
import { Handle, Position } from "reactflow";
import { Trash2 } from "lucide-react";

export function PlayNode({ data, style }) {
  const backgroundColor = data.style?.backgroundColor || style?.backgroundColor;

  // Create gradient variants for beautiful fade effects
  const createGradient = (color) => {
    if (!color) return "transparent";
    // Create multiple gradient variations
    const lightColor = color + "20"; // Add transparency
    const mediumColor = color + "60";
    return `linear-gradient(135deg, ${color}, ${lightColor}, rgba(255, 255, 255, 0.9))`;
  };

  const nodeStyle = {
    ...style,
    ...data.style,
    fontWeight: data.style?.fontWeight || style?.fontWeight,
    fontStyle: data.style?.fontStyle || style?.fontStyle,
    textDecoration: data.style?.textDecoration || style?.textDecoration,
    fontSize: data.style?.fontSize || style?.fontSize,
    color: data.style?.color || style?.color,
    backgroundColor: backgroundColor,
    "--custom-bg": backgroundColor || "transparent",
    "--gradient-bg": createGradient(backgroundColor),
  };

  const textStyle = {
    fontWeight: data.style?.fontWeight || style?.fontWeight,
    fontStyle: data.style?.fontStyle || style?.fontStyle,
    textDecoration: data.style?.textDecoration || style?.textDecoration,
    fontSize: data.style?.fontSize || style?.fontSize,
    color: data.style?.color || style?.color,
    background: "transparent",
  };

  return (
    <div
      className={`node play-node ${backgroundColor ? "custom-bg" : ""}`}
      style={nodeStyle}
    >
      <button
        className="delete-node-btn"
        onClick={(e) => {
          e.stopPropagation();
          if (data.onDelete) {
            data.onDelete(data.id);
          }
        }}
        title="Delete node"
      >
        <Trash2 size={16} />
      </button>
      <strong style={textStyle}>▶ Play Prompt</strong>
      <div style={textStyle}>{data.text || "No prompt set"}</div>

      {/* Input / Output */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#555" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#555" }}
      />
    </div>
  );
}

export function MenuNode({ data, style }) {
  const backgroundColor = data.style?.backgroundColor || style?.backgroundColor;

  // Create gradient variants for beautiful fade effects
  const createGradient = (color) => {
    if (!color) return "transparent";
    const lightColor = color + "20";
    return `linear-gradient(135deg, ${color}, ${lightColor}, rgba(255, 255, 255, 0.9))`;
  };

  const nodeStyle = {
    ...style,
    ...data.style,
    fontWeight: data.style?.fontWeight || style?.fontWeight,
    fontStyle: data.style?.fontStyle || style?.fontStyle,
    textDecoration: data.style?.textDecoration || style?.textDecoration,
    fontSize: data.style?.fontSize || style?.fontSize,
    color: data.style?.color || style?.color,
    backgroundColor: backgroundColor,
    "--custom-bg": backgroundColor || "transparent",
    "--gradient-bg": createGradient(backgroundColor),
  };

  const textStyle = {
    fontWeight: data.style?.fontWeight || style?.fontWeight,
    fontStyle: data.style?.fontStyle || style?.fontStyle,
    textDecoration: data.style?.textDecoration || style?.textDecoration,
    fontSize: data.style?.fontSize || style?.fontSize,
    color: data.style?.color || style?.color,
    background: "transparent",
  };

  return (
    <div
      className={`node menu-node ${backgroundColor ? "custom-bg" : ""}`}
      style={nodeStyle}
    >
      <button
        className="delete-node-btn"
        onClick={(e) => {
          e.stopPropagation();
          if (data.onDelete) {
            data.onDelete(data.id);
          }
        }}
        title="Delete node"
      >
        <Trash2 size={16} />
      </button>
      <strong style={textStyle}>📋 Menu</strong>
      <ul>
        {(data.options || []).map((o, i) => (
          <li key={i} style={textStyle}>
            {o.key}: {o.label}
          </li>
        ))}
      </ul>

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#555" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#555" }}
      />
    </div>
  );
}

export function CollectNode({ data, style }) {
  const backgroundColor = data.style?.backgroundColor || style?.backgroundColor;

  // Create gradient variants for beautiful fade effects
  const createGradient = (color) => {
    if (!color) return "transparent";
    const lightColor = color + "20";
    return `linear-gradient(135deg, ${color}, ${lightColor}, rgba(255, 255, 255, 0.9))`;
  };

  const nodeStyle = {
    ...style,
    ...data.style,
    fontWeight: data.style?.fontWeight || style?.fontWeight,
    fontStyle: data.style?.fontStyle || style?.fontStyle,
    textDecoration: data.style?.textDecoration || style?.textDecoration,
    fontSize: data.style?.fontSize || style?.fontSize,
    color: data.style?.color || style?.color,
    backgroundColor: backgroundColor,
    "--custom-bg": backgroundColor || "transparent",
    "--gradient-bg": createGradient(backgroundColor),
  };

  const textStyle = {
    fontWeight: data.style?.fontWeight || style?.fontWeight,
    fontStyle: data.style?.fontStyle || style?.fontStyle,
    textDecoration: data.style?.textDecoration || style?.textDecoration,
    fontSize: data.style?.fontSize || style?.fontSize,
    color: data.style?.color || style?.color,
    background: "transparent",
  };

  return (
    <div
      className={`node collect-node ${backgroundColor ? "custom-bg" : ""}`}
      style={nodeStyle}
    >
      <button
        className="delete-node-btn"
        onClick={(e) => {
          e.stopPropagation();
          if (data.onDelete) {
            data.onDelete(data.id);
          }
        }}
        title="Delete node"
      >
        <Trash2 size={16} />
      </button>
      <strong style={textStyle}>⌨ Collect Input</strong>
      <div style={textStyle}>Variable: {data.variable || "var1"}</div>

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#555" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#555" }}
      />
    </div>
  );
}

export function DecisionNode({ data, style }) {
  const backgroundColor = data.style?.backgroundColor || style?.backgroundColor;

  // Create gradient variants for beautiful fade effects
  const createGradient = (color) => {
    if (!color) return "transparent";
    const lightColor = color + "20";
    return `linear-gradient(135deg, ${color}, ${lightColor}, rgba(255, 255, 255, 0.9))`;
  };

  const nodeStyle = {
    ...style,
    ...data.style,
    fontWeight: data.style?.fontWeight || style?.fontWeight,
    fontStyle: data.style?.fontStyle || style?.fontStyle,
    textDecoration: data.style?.textDecoration || style?.textDecoration,
    fontSize: data.style?.fontSize || style?.fontSize,
    color: data.style?.color || style?.color,
    backgroundColor: backgroundColor,
    "--custom-bg": backgroundColor || "transparent",
    "--gradient-bg": createGradient(backgroundColor),
  };

  const textStyle = {
    fontWeight: data.style?.fontWeight || style?.fontWeight,
    fontStyle: data.style?.fontStyle || style?.fontStyle,
    textDecoration: data.style?.textDecoration || style?.textDecoration,
    fontSize: data.style?.fontSize || style?.fontSize,
    color: data.style?.color || style?.color,
    background: "transparent",
  };

  return (
    <div
      className={`node decision-node ${backgroundColor ? "custom-bg" : ""}`}
      style={nodeStyle}
    >
      <button
        className="delete-node-btn"
        onClick={(e) => {
          e.stopPropagation();
          if (data.onDelete) {
            data.onDelete(data.id);
          }
        }}
        title="Delete node"
      >
        <Trash2 size={16} />
      </button>
      <strong style={textStyle}>⚖ Decision</strong>
      <div style={textStyle}>{data.condition || "No condition set"}</div>

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#555" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#555" }}
      />
    </div>
  );
}

export function TransferNode({ data }) {
  return (
    <div className="node transfer-node">
      <button
        className="delete-node-btn"
        onClick={(e) => {
          e.stopPropagation();
          if (data.onDelete) {
            data.onDelete(data.id);
          }
        }}
        title="Delete node"
      >
        <Trash2 size={16} />
      </button>
      <strong>📞 Transfer Call</strong>
      <div>{data.number || "No DNIS"}</div>

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#555" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#555" }}
      />
    </div>
  );
}

export function TTSNode({ data }) {
  return (
    <div className="node tts-node">
      <button
        className="delete-node-btn"
        onClick={(e) => {
          e.stopPropagation();
          if (data.onDelete) {
            data.onDelete(data.id);
          }
        }}
        title="Delete node"
      >
        <Trash2 size={16} />
      </button>
      <strong>🗣️ Text-to-Speech</strong>
      <div>{data.text || "Enter text to speak"}</div>

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#555" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#555" }}
      />
    </div>
  );
}

export function STTNode({ data }) {
  return (
    <div className="node stt-node">
      <button
        className="delete-node-btn"
        onClick={(e) => {
          e.stopPropagation();
          if (data.onDelete) {
            data.onDelete(data.id);
          }
        }}
        title="Delete node"
      >
        <Trash2 size={16} />
      </button>
      <strong>🎙️ Speech-to-Text</strong>
      <div>Variable: {data.variable || "speechText"}</div>

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#555" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#555" }}
      />
    </div>
  );
}

export function SetVariableNode({ data }) {
  return (
    <div className="node set-node">
      <button
        className="delete-node-btn"
        onClick={(e) => {
          e.stopPropagation();
          if (data.onDelete) {
            data.onDelete(data.id);
          }
        }}
        title="Delete node"
      >
        <Trash2 size={16} />
      </button>
      <strong>⚙️ Set Variable</strong>
      <div>
        {data.variable || "variable"} = {data.value || "value"}
      </div>

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#555" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#555" }}
      />
    </div>
  );
}

export function EndNode({ data }) {
  return (
    <div className="node end-node">
      <button
        className="delete-node-btn"
        onClick={(e) => {
          e.stopPropagation();
          if (data.onDelete) {
            data.onDelete(data.id);
          }
        }}
        title="Delete node"
      >
        <Trash2 size={16} />
      </button>
      <strong>⏹ End</strong>

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#555" }}
      />
    </div>
  );
}

export function TerminatorNode({ data }) {
  return (
    <div className="node terminator-node">
      <button
        className="delete-node-btn"
        onClick={(e) => {
          e.stopPropagation();
          if (data.onDelete) {
            data.onDelete(data.id);
          }
        }}
        title="Delete node"
      >
        <Trash2 size={16} />
      </button>
      <strong>🚦 Terminator</strong>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#555" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#555" }}
      />
    </div>
  );
}
