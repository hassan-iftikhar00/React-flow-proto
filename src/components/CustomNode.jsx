import React, { useState, useEffect, useRef } from "react";
import { Handle, Position } from "reactflow";
import { Trash2, MessageCircle } from "lucide-react";
import {
  PlayIcon,
  ListBulletsIcon,
  KeyboardIcon,
  MicrophoneIcon,
  HashIcon,
  ChartBarIcon,
  TimerIcon,
  SpeakerHighIcon,
  WaveformIcon,
  RobotIcon,
  XCircleIcon,
} from "@phosphor-icons/react";

// Comment Badge Component
function CommentBadge({ count, onClick }) {
  if (!count || count === 0) return null;

  return (
    <div
      className="node-comment-badge"
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
      title={`${count} comment${count !== 1 ? "s" : ""} - Click to view`}
    >
      <MessageCircle size={12} />
      <span>{count}</span>
    </div>
  );
}

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

      {/* Comment Badge */}
      <CommentBadge
        count={data.commentCount}
        onClick={() => {
          if (data.onCommentClick) {
            data.onCommentClick();
          }
        }}
      />

      <strong style={textStyle}>
        <PlayIcon
          size={18}
          color="#FF6B6B"
          weight="duotone"
          style={{
            display: "inline-block",
            verticalAlign: "middle",
            marginRight: "6px",
          }}
        />
        Play Prompt
      </strong>
      <div style={textStyle}>{data.text || "No prompt set"}</div>

      {/* User info badge */}
      {data.createdBy && (
        <div
          style={{
            fontSize: "10px",
            color: "#666",
            marginTop: "8px",
            padding: "4px 8px",
            background: "rgba(59, 130, 246, 0.1)",
            borderRadius: "4px",
            borderLeft: "2px solid #3b82f6",
          }}
          title={`Created by ${data.createdBy.name}\n${
            data.createdAt ? new Date(data.createdAt).toLocaleString() : ""
          }`}
        >
          👤 {data.createdBy.name.split(" ")[0]}
        </div>
      )}

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
  const options = data.options || [];

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
    minWidth: "180px",
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
      <CommentBadge count={data.commentCount} onClick={data.onCommentClick} />
      <strong style={textStyle}>
        <ListBulletsIcon
          size={18}
          color="#4ECDC4"
          weight="duotone"
          style={{
            display: "inline-block",
            verticalAlign: "middle",
            marginRight: "6px",
          }}
        />
        Menu
      </strong>
      <div style={{ ...textStyle, fontSize: "11px", marginTop: "4px" }}>
        {data.promptText || "No prompt set"}
      </div>
      {data.timeout && (
        <div
          style={{
            ...textStyle,
            fontSize: "10px",
            opacity: 0.7,
            marginTop: "2px",
          }}
        >
          Timeout: {data.timeout}s
        </div>
      )}

      {options.length > 0 && (
        <div
          style={{
            marginTop: "8px",
            fontSize: "10px",
            borderTop: "1px solid #ddd",
            paddingTop: "6px",
          }}
        >
          {options.map((option) => (
            <div
              key={option.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "2px",
              }}
            >
              <span style={{ opacity: 0.7 }}>
                {option.key}: {option.label}
              </span>
              <span
                style={{
                  fontWeight: "500",
                  color: option.targetNodeId ? "#059669" : "#dc2626",
                }}
              >
                {option.targetNodeId ? "✓" : "✗"}
              </span>
            </div>
          ))}
        </div>
      )}

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#555" }}
      />

      {/* Multiple output handles for each menu option */}
      {options.map((option, index) => (
        <Handle
          key={option.id}
          type="source"
          position={Position.Right}
          id={`option-${option.id}`}
          style={{
            background: option.targetNodeId ? "#059669" : "#94a3b8",
            top: `${40 + index * 15}%`,
            right: "-8px",
            width: "12px",
            height: "12px",
            border: "2px solid white",
          }}
          title={`${option.key}: ${option.label}`}
        />
      ))}
    </div>
  );
}

export function WaitNode({ data, style }) {
  const backgroundColor = data.style?.backgroundColor || style?.backgroundColor;

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
      className={`node wait-node ${backgroundColor ? "custom-bg" : ""}`}
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
      <CommentBadge count={data.commentCount} onClick={data.onCommentClick} />
      <strong style={textStyle}>
        <TimerIcon
          size={18}
          color="#AA96DA"
          weight="duotone"
          style={{
            display: "inline-block",
            verticalAlign: "middle",
            marginRight: "6px",
          }}
        />
        Wait
      </strong>
      <div style={textStyle}>{data.time ? `${data.time}s` : "No time set"}</div>

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

export function DDTMFNode({ data, style }) {
  const backgroundColor = data.style?.backgroundColor || style?.backgroundColor;

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
      className={`node ddtmf-node ${backgroundColor ? "custom-bg" : ""}`}
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
      <CommentBadge count={data.commentCount} onClick={data.onCommentClick} />
      <strong style={textStyle}>
        <ChartBarIcon
          size={18}
          color="#F38181"
          weight="duotone"
          style={{
            display: "inline-block",
            verticalAlign: "middle",
            marginRight: "6px",
          }}
        />
        DDTMF
      </strong>
      <div style={textStyle}>{data.mapping || "No mapping set"}</div>

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

export function DTMFNode({ data, style }) {
  const backgroundColor = data.style?.backgroundColor || style?.backgroundColor;

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
      className={`node dtmf-node ${backgroundColor ? "custom-bg" : ""}`}
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
      <CommentBadge count={data.commentCount} onClick={data.onCommentClick} />
      <strong style={textStyle}>
        <HashIcon
          size={18}
          color="#95E1D3"
          weight="duotone"
          style={{
            display: "inline-block",
            verticalAlign: "middle",
            marginRight: "6px",
          }}
        />
        DTMF
      </strong>
      <div style={textStyle}>{data.dtmfValue || "No DTMF set"}</div>

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

export function RecordNode({ data, style }) {
  const backgroundColor = data.style?.backgroundColor || style?.backgroundColor;

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
      className={`node record-node ${backgroundColor ? "custom-bg" : ""}`}
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
      <CommentBadge count={data.commentCount} onClick={data.onCommentClick} />
      <strong style={textStyle}>🎙 Record</strong>
      <div style={textStyle}>{data.recordText || "Recording..."}</div>

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
      <CommentBadge count={data.commentCount} onClick={data.onCommentClick} />
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
      <CommentBadge count={data.commentCount} onClick={data.onCommentClick} />
      <strong>
        <SpeakerHighIcon
          size={18}
          color="#FCBAD3"
          weight="duotone"
          style={{
            display: "inline-block",
            verticalAlign: "middle",
            marginRight: "6px",
          }}
        />
        Text-to-Speech
      </strong>
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
      <CommentBadge count={data.commentCount} onClick={data.onCommentClick} />
      <strong>
        <WaveformIcon
          size={18}
          color="#A8D8EA"
          weight="duotone"
          style={{
            display: "inline-block",
            verticalAlign: "middle",
            marginRight: "6px",
          }}
        />
        Speech-to-Text
      </strong>
      <div>{data.promptText || "Enter prompt"}</div>

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

export function ISSTNode({ data }) {
  const functions = data.functions || [];

  return (
    <div className="node istt-node" style={{ minWidth: "180px" }}>
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
      <CommentBadge count={data.commentCount} onClick={data.onCommentClick} />
      <strong>
        <RobotIcon
          size={18}
          color="#FFD93D"
          weight="duotone"
          style={{
            display: "inline-block",
            verticalAlign: "middle",
            marginRight: "6px",
          }}
        />
        ISTT
      </strong>
      <div style={{ fontSize: "11px", marginTop: "4px" }}>
        {data.promptText || "Enter prompt"}
      </div>

      {functions.length > 0 && (
        <div
          style={{
            marginTop: "8px",
            fontSize: "10px",
            borderTop: "1px solid #ddd",
            paddingTop: "6px",
          }}
        >
          {functions.map((func, index) => (
            <div
              key={func.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "2px",
              }}
            >
              <span style={{ opacity: 0.7 }}>{func.name}:</span>
              <span
                style={{
                  fontWeight: "500",
                  color: func.targetNodeId ? "#059669" : "#dc2626",
                }}
              >
                {func.targetNodeId ? "✓" : "✗"}
              </span>
            </div>
          ))}
        </div>
      )}

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#555" }}
      />

      {/* Multiple output handles for each function */}
      {functions.map((func, index) => (
        <Handle
          key={func.id}
          type="source"
          position={Position.Right}
          id={`function-${func.id}`}
          style={{
            background: func.targetNodeId ? "#059669" : "#94a3b8",
            top: `${40 + index * 20}%`,
            right: "-8px",
            width: "12px",
            height: "12px",
            border: "2px solid white",
          }}
          title={func.name}
        />
      ))}
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
      <CommentBadge count={data.commentCount} onClick={data.onCommentClick} />
      <strong>
        <XCircleIcon
          size={18}
          color="#6BCF7F"
          weight="duotone"
          style={{
            display: "inline-block",
            verticalAlign: "middle",
            marginRight: "6px",
          }}
        />
        Terminator
      </strong>
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

export function ShapeNode({ data, style }) {
  // Use shape type for custom style
  const nodeStyle = {
    ...style,
    ...data.style,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
    minHeight: 40,
    background: "#f3f4f6",
    border: "1px solid #d1d5db",
    ...(data.shape === "circle"
      ? { borderRadius: "50%" }
      : data.shape === "rectangle"
      ? { borderRadius: 6 }
      : data.shape === "triangle"
      ? { clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }
      : data.shape === "hexagon"
      ? {
          clipPath:
            "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
        }
      : {}),
  };
  return (
    <div className="node shape-node" style={nodeStyle}>
      <button
        className="delete-node-btn"
        style={{ position: "absolute", top: 2, right: 2, zIndex: 2 }}
        onClick={(e) => {
          e.stopPropagation();
          if (data.onDelete) data.onDelete(data.id);
        }}
        title="Delete shape"
      >
        <Trash2 size={16} />
      </button>
      <span style={{ fontWeight: 600, fontSize: 15 }}>{data.label}</span>
    </div>
  );
}

// LabelNode: For label nodes with delete bin
export function LabelNode({ data, style }) {
  const [editing, setEditing] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const textareaRef = React.useRef(null);

  // Auto-resize textarea
  React.useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [editing]);

  // Save label text to node data
  const save = () => {
    setEditing(false);
    // Only update if changed
    if (
      data.onLabelChange &&
      textareaRef.current &&
      textareaRef.current.value !== data.label
    ) {
      data.onLabelChange(data.id, textareaRef.current.value);
    }
  };

  // Prevent double deletion and event propagation
  const handleDelete = React.useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      // Use a small delay to ensure React Flow doesn't capture the click
      setTimeout(() => {
        if (data.onDelete) {
          data.onDelete(data.id);
        }
      }, 0);
    },
    [data]
  );

  // Prevent node selection when clicking the label container
  const handleContainerClick = React.useCallback(
    (e) => {
      // Only stop propagation if not clicking the edit area
      if (!editing && e.target.classList.contains("label-node")) {
        e.stopPropagation();
      }
    },
    [editing]
  );

  // Get custom colors or use defaults
  const backgroundColor = data.style?.backgroundColor || "#fef3c7";
  const borderColor = data.style?.borderColor || "#f59e0b";
  const textColor = data.style?.color || "#92400e";

  const labelBoxStyle = {
    fontFamily: "inherit",
    fontWeight: 600,
    fontSize: data.style?.fontSize || 14,
    background: backgroundColor,
    border: `2px solid ${borderColor}`,
    borderRadius: "4px 12px 12px 4px",
    padding: "10px 16px 10px 20px",
    display: "inline-block",
    boxShadow:
      isHovered && !editing
        ? "0 4px 12px rgba(245, 158, 11, 0.25)"
        : "0 2px 4px rgba(0, 0, 0, 0.08)",
    cursor: editing ? "text" : "pointer",
    maxWidth: 280,
    minWidth: 80,
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
    textAlign: "center",
    overflowWrap: "break-word",
    transition: "all 0.2s ease",
    color: textColor,
    transform: isHovered && !editing ? "translateY(-1px)" : "translateY(0)",
    position: "relative",
  };

  // Label tag notch style
  const notchStyle = {
    content: '""',
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: 0,
    height: 0,
    borderTop: "16px solid transparent",
    borderBottom: "16px solid transparent",
    borderLeft: `10px solid ${borderColor}`,
  };

  return (
    <div
      className="node label-node"
      style={{
        minWidth: 80,
        minHeight: 36,
        background: "transparent",
        border: "none",
        boxShadow: "none",
        padding: 0,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleContainerClick}
    >
      <button
        className="delete-node-btn"
        onClick={handleDelete}
        title="Delete label"
      >
        <Trash2 size={16} />
      </button>
      {editing ? (
        <textarea
          ref={textareaRef}
          defaultValue={data.label}
          autoFocus
          style={{
            ...labelBoxStyle,
            resize: "none",
            outline: "none",
            height: "auto",
            minHeight: 36,
            maxWidth: 280,
            overflow: "hidden",
            fontFamily: "inherit",
            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)",
          }}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              save();
            }
            if (e.key === "Escape") {
              setEditing(false);
            }
          }}
        />
      ) : (
        <span
          style={labelBoxStyle}
          onClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
          title="Click to edit label"
        >
          <span style={notchStyle}></span>
          {data.label || "Label"}
        </span>
      )}
    </div>
  );
}
