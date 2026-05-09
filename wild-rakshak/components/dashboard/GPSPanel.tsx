"use client";
import { MapPin, Navigation, Crosshair } from "lucide-react";
import { Detection } from "@/lib/types";

interface Props {
  detection: Detection | null;
}

export default function GPSPanel({ detection }: Props) {
  const lat = detection?.gps.lat ?? 30.1575;
  const lng = detection?.gps.lng ?? 78.7733;

  return (
    <div
      className="rounded-lg p-4"
      style={{ background: "#161B22", border: "1px solid #21262D" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={14} style={{ color: "#FFC857" }} />
        <span
          className="text-xs font-bold tracking-widest"
          style={{ color: "#9CA3AF", fontFamily: "'Orbitron', sans-serif" }}
        >
          GPS INTELLIGENCE
        </span>
        <span
          className="ml-auto text-xs px-2 py-0.5 rounded"
          style={{
            background: "rgba(255,200,87,0.1)",
            color: "#FFC857",
            border: "1px solid rgba(255,200,87,0.3)",
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "9px",
          }}
        >
          HIGH RISK ZONE
        </span>
      </div>

      {/* Mini map visual */}
      <div
        className="relative rounded mb-3 overflow-hidden"
        style={{
          height: "80px",
          background: "#0a1008",
          border: "1px solid rgba(0,255,156,0.15)",
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,255,156,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,156,0.3) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        {/* Crosshair marker */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div
              className="absolute rounded-full pulse-ring"
              style={{
                width: "24px",
                height: "24px",
                top: "-12px",
                left: "-12px",
                border: "2px solid rgba(255,59,59,0.5)",
              }}
            />
            <Crosshair size={16} style={{ color: "#FF3B3B" }} />
          </div>
        </div>
        <div
          className="absolute bottom-1 right-2 text-xs"
          style={{ color: "rgba(0,255,156,0.4)", fontFamily: "'Orbitron', sans-serif", fontSize: "9px" }}
        >
          PAURI GARHWAL
        </div>
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <CoordBox label="LATITUDE" value={lat.toFixed(6)} />
        <CoordBox label="LONGITUDE" value={lng.toFixed(6)} />
      </div>

      <div
        className="flex items-center gap-2 p-2 rounded text-xs"
        style={{ background: "rgba(255,59,59,0.08)", border: "1px solid rgba(255,59,59,0.2)" }}
      >
        <Navigation size={12} style={{ color: "#FF3B3B" }} />
        <span style={{ color: "#FF3B3B", fontFamily: "'Orbitron', sans-serif", fontSize: "9px" }}>
          UTTARAKHAND · HIMALAYAN HIGH-RISK CORRIDOR
        </span>
      </div>
    </div>
  );
}

function CoordBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded p-2"
      style={{ background: "#0D1117", border: "1px solid #21262D" }}
    >
      <div className="text-xs mb-0.5" style={{ color: "#4B5563", fontFamily: "'Orbitron', sans-serif", fontSize: "9px" }}>
        {label}
      </div>
      <div className="font-bold text-sm tabular-nums" style={{ color: "#00FF9C", fontFamily: "'Orbitron', sans-serif" }}>
        {value}
      </div>
    </div>
  );
}
