"use client";
import { Terminal } from "lucide-react";
import { ActivityLog, THREAT_COLORS } from "@/lib/types";
import { formatTime } from "@/lib/mockData";

interface Props {
  logs: ActivityLog[];
}

const LOG_ICONS: Record<ActivityLog["type"], string> = {
  detection: "⚠",
  alert: "📡",
  evidence: "📸",
  esp8266: "💡",
  system: "⚙",
};

const LOG_COLORS: Record<ActivityLog["type"], string> = {
  detection: "#FF3B3B",
  alert: "#FFC857",
  evidence: "#00FF9C",
  esp8266: "#60A5FA",
  system: "#6B7280",
};

export default function ActivityLogPanel({ logs }: Props) {
  return (
    <div
      className="rounded-lg p-4 flex flex-col"
      style={{ background: "#161B22", border: "1px solid #21262D", height: "100%" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Terminal size={14} style={{ color: "#00FF9C" }} />
        <span
          className="text-xs font-bold tracking-widest"
          style={{ color: "#9CA3AF", fontFamily: "'Orbitron', sans-serif" }}
        >
          ACTIVITY LOG
        </span>
        <span
          className="ml-auto text-xs px-2 py-0.5 rounded-full"
          style={{ background: "rgba(0,255,156,0.1)", color: "#00FF9C", border: "1px solid rgba(0,255,156,0.2)" }}
        >
          {logs.length}
        </span>
      </div>

      <div
        className="flex-1 overflow-y-auto space-y-1"
        style={{ maxHeight: "260px" }}
      >
        {logs.length === 0 && (
          <div className="text-center py-6 text-xs" style={{ color: "#4B5563" }}>
            No activity yet...
          </div>
        )}
        {[...logs].reverse().map((log) => (
          <LogEntry key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
}

function LogEntry({ log }: { log: ActivityLog }) {
  const color = LOG_COLORS[log.type];
  const icon = LOG_ICONS[log.type];
  return (
    <div
      className="flex items-start gap-2 py-1.5 px-2 rounded text-xs fade-in-up"
      style={{ background: `${color}08`, borderLeft: `2px solid ${color}50` }}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="flex-1" style={{ color: "#E5E7EB" }}>
        {log.message}
      </span>
      <span
        className="shrink-0 tabular-nums"
        style={{ color: "#4B5563", fontFamily: "'Orbitron', sans-serif", fontSize: "9px" }}
      >
        {formatTime(log.timestamp)}
      </span>
    </div>
  );
}
