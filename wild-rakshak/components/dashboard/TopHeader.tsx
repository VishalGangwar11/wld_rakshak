"use client";
import { useEffect, useState } from "react";
import { Shield, Wifi, Cpu, Satellite } from "lucide-react";

export default function TopHeader() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
      setDate(
        now.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      className="w-full border-b"
      style={{
        background: "linear-gradient(180deg, #0f1923 0%, #0D1117 100%)",
        borderColor: "rgba(0,255,156,0.15)",
      }}
    >
      <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(0,255,156,0.1)", border: "1px solid rgba(0,255,156,0.3)" }}
            >
              <Shield size={20} style={{ color: "#00FF9C" }} />
            </div>
            <span
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full led-blink"
              style={{ background: "#00FF9C", boxShadow: "0 0 6px #00FF9C" }}
            />
          </div>
          <div>
            <h1
              className="font-orbitron font-black text-lg tracking-widest glow-green"
              style={{ color: "#00FF9C", fontFamily: "'Orbitron', sans-serif" }}
            >
              WILD RAKSHAK
            </h1>
            <p className="text-xs tracking-widest" style={{ color: "#4B5563" }}>
              AI WILDLIFE CONFLICT PREVENTION SYSTEM
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="hidden md:flex items-center gap-6">
          <StatusPill icon={<Wifi size={12} />} label="AI ONLINE" color="#00FF9C" />
          <StatusPill icon={<Cpu size={12} />} label="ESP8266 ACTIVE" color="#00FF9C" />
          <StatusPill icon={<Satellite size={12} />} label="GPS LOCK" color="#FFC857" />
        </div>

        {/* Clock */}
        <div className="text-right">
          <div
            className="font-orbitron font-bold text-xl tabular-nums"
            style={{ color: "#00FF9C", fontFamily: "'Orbitron', sans-serif" }}
          >
            {time}
          </div>
          <div className="text-xs" style={{ color: "#4B5563" }}>
            {date}
          </div>
        </div>
      </div>

      {/* Top accent line */}
      <div
        className="h-px w-full"
        style={{ background: "linear-gradient(90deg, transparent, #00FF9C, transparent)" }}
      />
    </header>
  );
}

function StatusPill({
  icon,
  label,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded"
      style={{ background: "rgba(0,255,156,0.05)", border: `1px solid ${color}30` }}
    >
      <span style={{ color }}>{icon}</span>
      <span className="text-xs font-medium tracking-widest" style={{ color, fontFamily: "'Orbitron', sans-serif" }}>
        {label}
      </span>
    </div>
  );
}
