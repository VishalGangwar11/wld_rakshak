"use client";
import { AlertTriangle, TrendingUp, Activity } from "lucide-react";
import { Detection, THREAT_COLORS, THREAT_BG, ThreatLevel } from "@/lib/types";

interface Props {
  detection: Detection | null;
  todayCount: number;
  isActive: boolean;
}

const THREAT_LABELS: Record<ThreatLevel, string> = {
  CRITICAL: "CRITICAL — IMMEDIATE ACTION REQUIRED",
  HIGH: "HIGH — ALERT AUTHORITIES",
  LOW: "LOW — MONITOR SITUATION",
  CLEAR: "CLEAR — NO THREAT DETECTED",
};

export default function ThreatAnalysisPanel({ detection, todayCount, isActive }: Props) {
  const threat = detection?.threatLevel ?? "CLEAR";
  const color = THREAT_COLORS[threat];
  const bg = THREAT_BG[threat];

  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: "#161B22",
        border: `1px solid ${isActive ? color + "40" : "rgba(33,38,45,1)"}`,
        transition: "border-color 0.4s",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={14} style={{ color }} />
        <span
          className="text-xs font-bold tracking-widest"
          style={{ color: "#9CA3AF", fontFamily: "'Orbitron', sans-serif" }}
        >
          THREAT ANALYSIS
        </span>
      </div>

      {/* Threat Level Badge */}
      <div
        className="rounded p-3 mb-4 text-center"
        style={{ background: bg, border: `1px solid ${color}30` }}
      >
        <div
          className="text-sm font-black tracking-widest mb-1"
          style={{ color, fontFamily: "'Orbitron', sans-serif" }}
        >
          {threat}
        </div>
        <div className="text-xs" style={{ color: "#6B7280" }}>
          {THREAT_LABELS[threat]}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatBox
          label="DETECTED ANIMAL"
          value={detection ? detection.animal.toUpperCase() : "—"}
          color={color}
        />
        <StatBox
          label="CONFIDENCE"
          value={detection ? `${Math.round(detection.confidence * 100)}%` : "—"}
          color={color}
        />
        <StatBox
          label="DETECTIONS TODAY"
          value={String(todayCount)}
          color="#FFC857"
        />
        <StatBox
          label="STATUS"
          value={isActive ? "ACTIVE" : "MONITORING"}
          color={isActive ? "#FF3B3B" : "#00FF9C"}
        />
      </div>

      {/* Confidence bar */}
      {detection && (
        <div>
          <div className="flex justify-between text-xs mb-1" style={{ color: "#4B5563" }}>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "10px" }}>CONFIDENCE SCORE</span>
            <span style={{ color }}>{Math.round(detection.confidence * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: "#21262D" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.round(detection.confidence * 100)}%`,
                background: `linear-gradient(90deg, ${color}80, ${color})`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="rounded p-2.5"
      style={{ background: "#0D1117", border: "1px solid #21262D" }}
    >
      <div className="text-xs mb-1" style={{ color: "#4B5563", fontFamily: "'Orbitron', sans-serif", fontSize: "9px" }}>
        {label}
      </div>
      <div className="font-bold text-sm" style={{ color, fontFamily: "'Orbitron', sans-serif" }}>
        {value}
      </div>
    </div>
  );
}
