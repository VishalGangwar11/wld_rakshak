"use client";
import { Camera, Image as ImageIcon } from "lucide-react";
import { Detection, THREAT_COLORS } from "@/lib/types";
import { formatTime, formatDate } from "@/lib/mockData";

interface Props {
  detections: Detection[];
}

export default function EvidenceGallery({ detections }: Props) {
  const evidence = detections.slice(-6).reverse();

  return (
    <div
      className="rounded-lg p-4"
      style={{ background: "#161B22", border: "1px solid #21262D" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Camera size={14} style={{ color: "#00FF9C" }} />
        <span
          className="text-xs font-bold tracking-widest"
          style={{ color: "#9CA3AF", fontFamily: "'Orbitron', sans-serif" }}
        >
          EVIDENCE GALLERY
        </span>
        <span
          className="ml-auto text-xs"
          style={{ color: "#4B5563", fontFamily: "'Orbitron', sans-serif", fontSize: "9px" }}
        >
          {evidence.length} CAPTURES
        </span>
      </div>

      {evidence.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-8 rounded"
          style={{ background: "#0D1117", border: "1px dashed #21262D" }}
        >
          <ImageIcon size={24} style={{ color: "#21262D" }} className="mb-2" />
          <p className="text-xs" style={{ color: "#4B5563" }}>
            No evidence captured yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {evidence.map((det) => (
            <EvidenceCard key={det.id} detection={det} />
          ))}
        </div>
      )}
    </div>
  );
}

function EvidenceCard({ detection }: { detection: Detection }) {
  const color = THREAT_COLORS[detection.threatLevel];
  const emoji =
    detection.animal === "Leopard"
      ? "🐆"
      : detection.animal === "Bear"
      ? "🐻"
      : detection.animal === "Elephant"
      ? "🐘"
      : "🦌";

  return (
    <div
      className="rounded overflow-hidden cursor-pointer hover:scale-105 transition-transform"
      style={{ border: `1px solid ${color}30` }}
    >
      {/* Simulated image */}
      <div
        className="relative flex items-center justify-center"
        style={{ height: "70px", background: "#0a0e14" }}
      >
        <span className="text-3xl" style={{ filter: "grayscale(0.5)" }}>
          {emoji}
        </span>
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,255,156,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,156,0.5) 1px, transparent 1px)",
            backgroundSize: "12px 12px",
          }}
        />
        {/* Threat badge */}
        <div
          className="absolute top-1 right-1 text-xs px-1"
          style={{
            background: color,
            color: "#000",
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "7px",
            fontWeight: "bold",
          }}
        >
          {detection.threatLevel}
        </div>
      </div>

      {/* Info */}
      <div className="p-1.5" style={{ background: "#0D1117" }}>
        <div className="text-xs font-bold" style={{ color, fontFamily: "'Orbitron', sans-serif", fontSize: "9px" }}>
          {detection.animal}
        </div>
        <div className="text-xs" style={{ color: "#4B5563", fontSize: "8px" }}>
          {formatTime(detection.timestamp)}
        </div>
        <div className="text-xs tabular-nums" style={{ color: "#374151", fontSize: "7px" }}>
          {detection.gps.lat.toFixed(4)}, {detection.gps.lng.toFixed(4)}
        </div>
      </div>
    </div>
  );
}
