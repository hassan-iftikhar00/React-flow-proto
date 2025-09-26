import React from "react";

const nodeTypes = [
  { type: "play", label: "Play Prompt", icon: "🎵" },
  { type: "menu", label: "Menu", icon: "📋" },
  { type: "collect", label: "Collect Input", icon: "⌨️" },
  { type: "decision", label: "Decision", icon: "🔀" },
  { type: "transfer", label: "Transfer Call", icon: "📞" },
  { type: "tts", label: "TTS", icon: "🗣️" },
  { type: "stt", label: "STT", icon: "🎙️" },
  { type: "set", label: "Set Variable", icon: "⚙️" },
  { type: "end", label: "End", icon: "⏹" },
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
