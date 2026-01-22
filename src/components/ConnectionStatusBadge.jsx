import { useSignalR } from "../contexts/SignalRContext";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import "./ConnectionStatusBadge.css";

/**
 * ConnectionStatusBadge Component
 * Displays real-time SignalR connection status
 */
export default function ConnectionStatusBadge() {
  const {
    connectionStatus,
    isConnected,
    isConnecting,
    isReconnecting,
    isDisconnected,
  } = useSignalR();

  const getStatusConfig = () => {
    if (isConnected) {
      return {
        icon: Wifi,
        label: "Connected",
        className: "status-connected",
      };
    }
    if (isReconnecting) {
      return {
        icon: RefreshCw,
        label: "Reconnecting",
        className: "status-reconnecting",
      };
    }
    if (isConnecting) {
      return {
        icon: RefreshCw,
        label: "Connecting",
        className: "status-connecting",
      };
    }
    return {
      icon: WifiOff,
      label: "Disconnected",
      className: "status-disconnected",
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`connection-status-badge ${config.className}`}>
      <Icon
        size={14}
        className={isReconnecting || isConnecting ? "icon-spin" : ""}
      />
      <span className="status-label">{config.label}</span>
    </div>
  );
}
