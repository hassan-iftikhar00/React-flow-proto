import React, { useState } from "react";
import {
  Settings,
  Phone,
  Database,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  HouseIcon,
  FlowArrowIcon,
  GearIcon,
  PhoneCallIcon,
  FileTextIcon,
  TranslateIcon,
  FunctionIcon,
  PlayIcon,
  ListBulletsIcon,
  KeyboardIcon,
  MicrophoneIcon,
  SpeakerHighIcon,
  TimerIcon,
  WaveformIcon,
  RobotIcon,
  ChartBarIcon,
  CheckCircleIcon,
  FunctionIcon,
  ShuffleIcon,
  PowerIcon,
} from "@phosphor-icons/react";

export default function Sidebar({ active, setActive, theme, setTheme }) {
  const [openCategory, setOpenCategory] = useState(null);
  const toggleCategory = (title) =>
    setOpenCategory(openCategory === title ? null : title);

  const categories = [
    // Dashboard & Flows → direct items (no expand)
    {
      title: "main",
      items: [
        {
          key: "dashboard",
          label: "Dashboard",
          Icon: HouseIcon,
          color: "#FF6B6B",
        },
        { key: "flows", label: "Flows", Icon: FlowArrowIcon, color: "#4ECDC4" },
      ],
    },
    {
      title: "🔧 System",
      items: [
        { key: "ivrconfig", label: "IVR Config", Icon: Gear, color: "#AA96DA" },
        { key: "dnis", label: "DNIS", Icon: PhoneCallIcon, color: "#FFE66D" },
        {
          key: "fields-mapping",
          label: "Fields Mapping",
          Icon: FileTextIcon,
          color: "#95E1D3",
        },
        {
          key: "language",
          label: "Language",
          Icon: TranslateIcon,
          color: "#FCBAD3",
        },
        { key: "setting", label: "Setting", Icon: GearIcon, color: "#A8D8EA" },
        {
          key: "variable",
          label: "Variable",
          Icon: FunctionIcon,
          color: "#FFD93D",
        },
      ],
    },
    {
      title: "🎭 Interactions",
      items: [
        { key: "play", label: "Play", Icon: PlayIcon, color: "#FF6B6B" },
        { key: "menu", label: "Menu", Icon: ListBulletsIcon, color: "#4ECDC4" },
        { key: "input", label: "Input", Icon: KeyboardIcon, color: "#FFE66D" },
        {
          key: "dtmf",
          label: "DTMF / DDTMF",
          Icon: ChartBarIcon,
          color: "#95E1D3",
        },
        {
          key: "record",
          label: "Record",
          Icon: MicrophoneIcon,
          color: "#FF6B9D",
        },
        {
          key: "audio",
          label: "Audio",
          Icon: SpeakerHighIcon,
          color: "#FCBAD3",
        },
        { key: "wait", label: "Wait", Icon: TimerIcon, color: "#AA96DA" },
      ],
    },
    {
      title: "🗣 Voice",
      items: [
        { key: "tts", label: "TTS", Icon: SpeakerHighIcon, color: "#FCBAD3" },
        { key: "stt", label: "STT", Icon: WaveformIcon, color: "#A8D8EA" },
        { key: "istt", label: "iSTT", Icon: RobotIcon, color: "#FFD93D" },
      ],
    },
    {
      title: "🗄 Data",
      items: [
        {
          key: "db-node",
          label: "DB Node (Fetch billing / payment)",
          Icon: DatabaseIcon,
        },
      ],
    },
    {
      title: "🔀 Logic",
      items: [
        { key: "function", label: "Function", Icon: FunctionSquareIcon },
        { key: "if", label: "If", Icon: ShuffleIcon },
        { key: "confirmation", label: "Confirmation", Icon: CheckCircleIcon },
      ],
    },
    {
      title: "📞 Call Control",
      items: [
        { key: "transfer-call", label: "Transfer_call", Icon: PhoneIcon },
        { key: "terminator", label: "Terminator", Icon: PowerIcon },
      ],
    },
  ];

  return (
    <aside className="rf-sidebar">
      <div className="rf-sidebar-header">
        <div className="rf-logo" />
        <div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            Professional IVR
          </div>
          <h1 className="rf-title">Flow Builder</h1>
        </div>
      </div>

      <div className="rf-sidebar-list">
        {categories.map((cat) => (
          <div key={cat.title} style={{ marginBottom: 8 }}>
            {/* agar category 'main' hai (Dashboard + Flows) toh direct items dikhayenge */}
            {cat.title === "main" ? (
              cat.items.map(({ key, label, Icon, color }) => (
                <div
                  key={key}
                  className={
                    "rf-sidebar-item " + (active === key ? "active" : "")
                  }
                  onClick={() => setActive(key)}
                >
                  <Icon size={20} color={color} weight="duotone" />
                  <div>{label}</div>
                </div>
              ))
            ) : (
              <>
                <div
                  className="rf-category-header"
                  onClick={() => toggleCategory(cat.title)}
                >
                  <span>{cat.title}</span>
                  {openCategory === cat.title ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </div>
                {openCategory === cat.title && (
                  <div>
                    {cat.items.map(({ key, label, Icon, color }) => (
                      <div
                        key={key}
                        className={
                          "rf-sidebar-item " + (active === key ? "active" : "")
                        }
                        onClick={() => setActive(key)}
                      >
                        <Icon size={18} color={color} weight="duotone" />
                        <div>{label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="rf-sidebar-bottom">
        <button
          className="theme-toggle-btn"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
        </button>
      </div>
    </aside>
  );
}
