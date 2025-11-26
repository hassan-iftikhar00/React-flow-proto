import React from "react";

const nodeTypes = [
  { type: "play", label: "Play Prompt", icon: "🎵" },
  { type: "menu", label: "Menu", icon: "📋" },
  { type: "collect", label: "Collect Input", icon: "⌨️" },
  { type: "record", label: "Record", icon: "🎙️" },
  { type: "dtmf", label: "DTMF", icon: "🔢" },
  { type: "ddtmf", label: "DDTMF", icon: "🔣" },
  { type: "wait", label: "Wait", icon: "⏳" },
  { type: "tts", label: "TTS", icon: "🗣️" },
  { type: "stt", label: "STT", icon: "🎙️" },
  { type: "istt", label: "ISTT", icon: "🎤" },
  { type: "terminator", label: "Terminator", icon: "🚦" },
];

export default function NodeSidebar({ onAddNode }) {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="node-sidebar">
      <h3>📌 IVR Controls</h3>
      {nodeTypes.map((n) => (
        <div
          key={n.type}
          className="node-item"
          draggable
          onDragStart={(e) => onDragStart(e, n.type)}
          onClick={() => onAddNode(n.type)} // ✅ comment hata diya
        >
          <span style={{ marginRight: 6 }}>{n.icon}</span>
          {n.label}
        </div>
      ))}
    </aside>
  );
}
