import React from "react";
import {
  PlayIcon,
  ListIcon,
  KeyboardIcon,
  MicrophoneIcon,
  BinaryIcon,
  TimerIcon,
  SpeakerHighIcon,
  ScalesIcon,
  WaveformIcon,
  XIcon,
  GearIcon,
  ChartBarIcon,
  RobotIcon,
} from "@phosphor-icons/react";

const nodeTypes = [
  { type: "play", label: "Play", icon: PlayIcon, color: "#FF6B6B" },
  { type: "menu", label: "Menu", icon: ListIcon, color: "#4ECDC4" },
  { type: "collect", label: "Collect", icon: KeyboardIcon, color: "#FFE66D" },
  { type: "record", label: "Record", icon: MicrophoneIcon, color: "#FF6B9D" },
  { type: "dtmf", label: "DTMF", icon: BinaryIcon, color: "#95E1D3" },
  { type: "ddtmf", label: "DDTMF", icon: ChartBarIcon, color: "#F38181" },
  { type: "wait", label: "Wait", icon: TimerIcon, color: "#AA96DA" },
  { type: "tts", label: "TTS", icon: SpeakerHighIcon, color: "#FCBAD3" },
  { type: "stt", label: "STT", icon: WaveformIcon, color: "#A8D8EA" },
  { type: "istt", label: "ISTT", icon: RobotIcon, color: "#FFD93D" },
  { type: "terminator", label: "End", icon: XIcon, color: "#6BCF7F" },
];

export default function NodeSidebar({ onAddNode }) {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="node-sidebar">
      <h3 className="sidebar-header">IVR Widget Library</h3>
      <div className="node-sidebar-grid">
        {nodeTypes.map((n) => {
          const IconComponent = n.icon;
          return (
            <div
              key={n.type}
              className="node-item"
              draggable
              onDragStart={(e) => onDragStart(e, n.type)}
              onClick={() => onAddNode(n.type)}
              title={`${n.label}`}
            >
              <div className="node-icon">
                <IconComponent size={24} color={n.color} weight="duotone" />
              </div>
              <div className="node-label">{n.label}</div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
