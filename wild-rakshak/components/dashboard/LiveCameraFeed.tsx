"use client";
import { useState, useEffect } from "react";
import { Video, Eye } from "lucide-react";
import { Detection, THREAT_COLORS } from "@/lib/types";

interface Props {
  detection: Detection | null;
  isActive: boolean;
}

export default function LiveCameraFeed({ detection, isActive }: Props) {
  const [frameCount, setFrameCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFrameCount((f) => f + 1), 100);
    return () => clearInterval(id);
  }, []);

  const threatColor = detection ? THREAT_COLORS[detection.threatLevel] : "#00FF9C";

  return (
    <div
      className="relative overflow-hidden rounded-lg tactical-border"
      style={{
        background: "#0a0e14",
        border: `1px solid ${isActive ? threatColor : "rgba(0,255,156,0.2)"}`,
        aspectRatio: "16/9",
        transition: "border-color 0.3s",
        boxShadow: isActive ? `0 0 20px ${threatColor}30` : "none",
      }}
    >
      {/* Simulated camera feed background */}
      <div
        className="absolute inset-0"
        style={{
          background: isActive
            ? "radial-gradient(ellipse at 40% 50%, #0f1a10 0%, #060a08 100%)"
            : "radial-gradient(ellipse at 50% 50%, #0d1117 0%, #050709 100%)",
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,156,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,156,0.2) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Scan line */}
      <div className="scan-line" />

      {/* Corner brackets */}
      {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map(
        (pos, i) => (
          <div
            key={i}
            className={`absolute ${pos} w-5 h-5`}
            style={{
              borderColor: threatColor,
              borderStyle: "solid",
              borderWidth: i < 2 ? "1px 0 0 1px" : i === 2 ? "0 0 1px 1px" : "0 1px 1px 0",
              opacity: 0.7,
            }}
          />
        )
      )}

      {/* Detection bounding box */}
      {detection && isActive && (
        <div
          className="absolute"
          style={{
            top: "25%",
            left: "30%",
            width: "38%",
            height: "45%",
            border: `2px solid ${threatColor}`,
            boxShadow: `0 0 12px ${threatColor}50`,
            animation: "threatFlash 1s ease-in-out infinite",
          }}
        >
          {/* Label */}
          <div
            className="absolute -top-7 left-0 px-2 py-0.5 text-xs font-bold tracking-widest"
            style={{
              background: threatColor,
              color: "#000",
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "10px",
            }}
          >
            {detection.animal.toUpperCase()} · {Math.round(detection.confidence * 100)}%
          </div>

          {/* Corner marks */}
          {["-top-0.5 -left-0.5", "-top-0.5 -right-0.5", "-bottom-0.5 -left-0.5", "-bottom-0.5 -right-0.5"].map(
            (pos, i) => (
              <div
                key={i}
                className={`absolute ${pos} w-3 h-3`}
                style={{ background: threatColor }}
              />
            )
          )}
        </div>
      )}

      {/* Silhouette of animal when detected */}
      {detection && isActive && (
        <div
          className="absolute text-6xl select-none pointer-events-none"
          style={{
            top: "30%",
            left: "35%",
            opacity: 0.15,
            filter: `drop-shadow(0 0 8px ${threatColor})`,
          }}
        >
          {detection.animal === "Leopard"
            ? "🐆"
            : detection.animal === "Bear"
            ? "🐻"
            : detection.animal === "Elephant"
            ? "🐘"
            : "🦌"}
        </div>
      )}

      {/* Top bar */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2"
        style={{ background: "rgba(0,0,0,0.6)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full led-blink"
            style={{ background: "#FF3B3B", boxShadow: "0 0 4px #FF3B3B" }}
          />
          <span className="text-xs font-bold tracking-widest" style={{ color: "#FF3B3B", fontFamily: "'Orbitron', sans-serif" }}>
            REC
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(0,255,156,0.6)" }}>
          <Eye size={12} />
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "10px" }}>
            CAM-01 · PAURI GARHWAL
          </span>
        </div>
        <span className="text-xs tabular-nums" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>
          FRM:{String(frameCount).padStart(6, "0")}
        </span>
      </div>

      {/* Bottom bar */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2"
        style={{ background: "rgba(0,0,0,0.6)" }}
      >
        <span className="text-xs" style={{ color: "rgba(0,255,156,0.4)", fontFamily: "'Orbitron', sans-serif", fontSize: "10px" }}>
          YOLOv11 · OPENCV · ACTIVE
        </span>
        {detection && isActive && (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded"
            style={{
              background: `${threatColor}20`,
              color: threatColor,
              border: `1px solid ${threatColor}`,
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "10px",
            }}
          >
            ⚠ {detection.threatLevel} THREAT
          </span>
        )}
        {!isActive && (
          <span className="text-xs" style={{ color: "rgba(0,255,156,0.4)", fontSize: "10px" }}>
            MONITORING...
          </span>
        )}
      </div>
    </div>
  );
}
