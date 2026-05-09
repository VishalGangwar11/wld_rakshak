"use client";
import { useState } from "react";
import { Send, Bell, MapPin, Clock, Shield, AlertTriangle } from "lucide-react";

interface Props {
  onAlert: () => void;
  onManualLeopard: () => void;
}

export default function EmergencyControls({ onAlert, onManualLeopard }: Props) {
  const [alertSent, setAlertSent] = useState(false);
  const [sirenActive, setSirenActive] = useState(false);
  const [leopardActive, setLeopardActive] = useState(false);

  const handleAlert = () => {
    setAlertSent(true);
    onAlert();
    setTimeout(() => setAlertSent(false), 3000);
  };

  const handleSiren = () => {
    setSirenActive(true);
    setTimeout(() => setSirenActive(false), 5000);
  };

  const handleLeopardDemo = () => {
    setLeopardActive(true);
    onManualLeopard();
    setTimeout(() => setLeopardActive(false), 5000);
  };

  return (
    <div
      className="rounded-lg p-4"
      style={{ background: "#161B22", border: "1px solid #21262D" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Shield size={14} style={{ color: "#FF3B3B" }} />
        <span
          className="text-xs font-bold tracking-widest"
          style={{ color: "#9CA3AF", fontFamily: "'Orbitron', sans-serif" }}
        >
          EMERGENCY CONTROLS
        </span>
      </div>

      <div className="space-y-2">
        <ActionButton
          icon={<AlertTriangle size={13} />}
          label="DEMO: LEOPARD DETECTED"
          color="#FF3B3B"
          active={leopardActive}
          activeLabel="LEOPARD ALERT ACTIVE"
          onClick={handleLeopardDemo}
        />
        <ActionButton
          icon={<Send size={13} />}
          label="SEND ALERT TO FOREST DEPT"
          color="#FF3B3B"
          active={alertSent}
          activeLabel="ALERT SENT ✓"
          onClick={handleAlert}
        />
        <ActionButton
          icon={<Bell size={13} />}
          label="ACTIVATE EMERGENCY SIREN"
          color="#FFC857"
          active={sirenActive}
          activeLabel={sirenActive ? "SIREN ACTIVE..." : "ACTIVATE EMERGENCY SIREN"}
          onClick={handleSiren}
        />
        <ActionButton
          icon={<MapPin size={13} />}
          label="SHARE GPS LOCATION"
          color="#00FF9C"
          onClick={() => {}}
        />
        <ActionButton
          icon={<Clock size={13} />}
          label="VIEW INCIDENT HISTORY"
          color="#60A5FA"
          onClick={() => {}}
        />
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  color,
  active,
  activeLabel,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  active?: boolean;
  activeLabel?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-bold tracking-wider transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
      style={{
        background: active ? `${color}20` : `${color}10`,
        border: `1px solid ${active ? color : color + "40"}`,
        color: active ? color : color + "CC",
        fontFamily: "'Orbitron', sans-serif",
        fontSize: "10px",
        boxShadow: active ? `0 0 12px ${color}30` : "none",
        transition: "all 0.2s",
      }}
    >
      <span style={{ color }}>{icon}</span>
      {active && activeLabel ? activeLabel : label}
    </button>
  );
}
