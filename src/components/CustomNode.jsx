import React from "react";
import { Handle, Position } from "reactflow";

export function PlayNode({ data }) {
  return (
    <div className="node play-node">
      <strong>▶ Play Prompt</strong>
      <div>{data.text || "No prompt set"}</div>

      {/* Input / Output */}
      <Handle type="target" position={Position.Top} style={{ background: "#555" }} />
      <Handle type="source" position={Position.Bottom} style={{ background: "#555" }} />
    </div>
  );
}

export function MenuNode({ data }) {
  return (
    <div className="node menu-node">
      <strong>📋 Menu</strong>
      <ul>
        {(data.options || []).map((o, i) => (
          <li key={i}>{o.key}: {o.label}</li>
        ))}
      </ul>

      <Handle type="target" position={Position.Top} style={{ background: "#555" }} />
      <Handle type="source" position={Position.Bottom} style={{ background: "#555" }} />
    </div>
  );
}

export function CollectNode({ data }) {
  return (
    <div className="node collect-node">
      <strong>⌨ Collect Input</strong>
      <div>Variable: {data.variable || "var1"}</div>

      <Handle type="target" position={Position.Top} style={{ background: "#555" }} />
      <Handle type="source" position={Position.Bottom} style={{ background: "#555" }} />
    </div>
  );
}

export function DecisionNode({ data }) {
  return (
    <div className="node decision-node">
      <strong>⚖ Decision</strong>
      <div>{data.condition || "No condition set"}</div>

      <Handle type="target" position={Position.Top} style={{ background: "#555" }} />
      <Handle type="source" position={Position.Bottom} style={{ background: "#555" }} />
    </div>
  );
}

export function TransferNode({ data }) {
  return (
    <div className="node transfer-node">
      <strong>📞 Transfer Call</strong>
      <div>{data.number || "No DNIS"}</div>

      <Handle type="target" position={Position.Top} style={{ background: "#555" }} />
      <Handle type="source" position={Position.Bottom} style={{ background: "#555" }} />
    </div>
  );
}

export function EndNode() {
  return (
    <div className="node end-node">
      <strong>⏹ End</strong>

      <Handle type="target" position={Position.Top} style={{ background: "#555" }} />
    </div>
  );
}
