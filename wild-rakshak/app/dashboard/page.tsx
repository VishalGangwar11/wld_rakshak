"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import TopHeader from "@/components/dashboard/TopHeader";
import LiveCameraFeed from "@/components/dashboard/LiveCameraFeed";
import ThreatAnalysisPanel from "@/components/dashboard/ThreatAnalysisPanel";
import GPSPanel from "@/components/dashboard/GPSPanel";
import ActivityLogPanel from "@/components/dashboard/ActivityLogPanel";
import EmergencyControls from "@/components/dashboard/EmergencyControls";
import EvidenceGallery from "@/components/dashboard/EvidenceGallery";
import DetectionStats from "@/components/dashboard/DetectionStats";
import { ActivityLog, Detection, ThreatLevel } from "@/lib/types";
import { generateLog } from "@/lib/mockData";

type DashboardStatus = {
  animal: string;
  confidence: number;
  threat: ThreatLevel | string;
  status: string;
  detections: number;
  latitude: string;
  longitude: string;
  region?: string;
  time: string;
};

const DEFAULT_STATUS: DashboardStatus = {
  animal: "NONE",
  confidence: 0,
  threat: "CLEAR",
  status: "MONITORING",
  detections: 0,
  latitude: "30.1490",
  longitude: "78.7800",
  region: "Pauri Garhwal",
  time: "--",
};

function normalizeThreat(threat: string): ThreatLevel {
  if (threat === "CRITICAL" || threat === "HIGH" || threat === "LOW" || threat === "CLEAR") {
    return threat;
  }
  if (threat === "SAFE" || threat === "MONITORING") return "CLEAR";
  return "LOW";
}

export default function DashboardPage() {
  const [currentDetection, setCurrentDetection] = useState<Detection | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const lastStatusKey = useRef("");
  const manualAlertUntil = useRef(0);

  useEffect(() => {
    setLogs([
      generateLog("system", "WILD RAKSHAK system initialized. YOLOv11 loaded."),
      generateLog("system", "ESP8266 connection established. LED + buzzer ready."),
      generateLog("system", "Telegram bot connected. Alert channel active."),
      generateLog("system", "Camera feed active. Monitoring Pauri Garhwal forest edge."),
    ]);
  }, []);

  const addLog = useCallback((log: ActivityLog) => {
    setLogs((prev) => [...prev.slice(-49), log]);
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/status.json?t=${Date.now()}`, { cache: "no-store" });
        const status: DashboardStatus = { ...DEFAULT_STATUS, ...(await res.json()) };
        const threatLevel = normalizeThreat(String(status.threat));
        const isAlert = status.status === "ALERT" && status.animal !== "NONE";
        const statusKey = `${status.animal}-${status.time}-${status.detections}`;

        setTodayCount(Number(status.detections) || 0);

        if (isAlert && statusKey !== lastStatusKey.current) {
          lastStatusKey.current = statusKey;

          const rawConfidence = Number(status.confidence) || 0;
          const confidence = rawConfidence > 1 ? rawConfidence / 100 : rawConfidence;
          const det: Detection = {
            id: `LIVE-${Date.now()}`,
            animal: status.animal,
            threatLevel,
            confidence,
            timestamp: new Date(),
            gps: {
              lat: Number(status.latitude) || 30.149,
              lng: Number(status.longitude) || 78.78,
            },
            region: status.region || "Pauri Garhwal",
          };

          setCurrentDetection(det);
          setIsActive(true);
          setDetections((prev) => [...prev, det]);
          addLog(generateLog("detection", `${det.animal} detected - confidence ${Math.round(det.confidence * 100)}% - ${det.threatLevel}`, det.threatLevel));
          addLog(generateLog("alert", `Telegram alert sent: ${det.threatLevel} threat detected in ${det.region}`, det.threatLevel));
          addLog(generateLog("esp8266", `ESP8266 activated - LED and buzzer triggered for ${det.threatLevel} threat`, det.threatLevel));
          addLog(generateLog("evidence", `Evidence saved - GPS: ${det.gps.lat.toFixed(4)}, ${det.gps.lng.toFixed(4)} - timestamp embedded`, det.threatLevel));
        }

        if (!isAlert && Date.now() > manualAlertUntil.current) {
          setIsActive(false);
          setCurrentDetection(null);
        }
      } catch (err) {
        console.log("Dashboard status fetch failed:", err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, [addLog]);

  const handleManualAlert = () => {
    addLog(generateLog("alert", "MANUAL ALERT: Forest Department notified via emergency channel"));
  };

  const handleManualLeopard = () => {
    manualAlertUntil.current = Date.now() + 8000;

    const det: Detection = {
      id: `MANUAL-LEOPARD-${Date.now()}`,
      animal: "LEOPARD",
      threatLevel: "CRITICAL",
      confidence: 0.96,
      timestamp: new Date(),
      gps: {
        lat: 30.149,
        lng: 78.78,
      },
      region: "Pauri Garhwal",
    };

    setCurrentDetection(det);
    setIsActive(true);
    setTodayCount((count) => count + 1);
    setDetections((prev) => [...prev, det]);
    addLog(generateLog("detection", "LEOPARD detected manually - confidence 96% - CRITICAL", "CRITICAL"));
    addLog(generateLog("alert", "Manual demo alert: Forest department notified for CRITICAL leopard threat", "CRITICAL"));
    addLog(generateLog("esp8266", "Demo mode: ESP8266 LED and buzzer alert triggered for leopard", "CRITICAL"));
    addLog(generateLog("evidence", "Demo evidence generated - GPS: 30.1490, 78.7800 - timestamp embedded", "CRITICAL"));

    setTimeout(() => {
      if (Date.now() >= manualAlertUntil.current) {
        setIsActive(false);
        setCurrentDetection(null);
      }
    }, 8000);
  };

  return (
    <div className="min-h-screen" style={{ background: "#0D1117" }}>
      <TopHeader />

      {isActive && currentDetection && (
        <div
          className="w-full py-2 px-4 text-center text-sm font-bold tracking-widest card-glow-red"
          style={{
            background: "rgba(255,59,59,0.12)",
            borderBottom: "1px solid rgba(255,59,59,0.4)",
            color: "#FF3B3B",
            fontFamily: "'Orbitron', sans-serif",
            animation: "threatFlash 0.8s ease-in-out infinite",
          }}
        >
          ALERT - {currentDetection.threatLevel} - {currentDetection.animal.toUpperCase()} DETECTED IN {currentDetection.region.toUpperCase()} - ALERT DISPATCHED
        </div>
      )}

      <main className="max-w-[1600px] mx-auto px-4 py-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-7">
            <div className="mb-1 text-xs tracking-widest" style={{ color: "#4B5563", fontFamily: "'Orbitron', sans-serif" }}>
              LIVE SURVEILLANCE FEED
            </div>
            <LiveCameraFeed detection={currentDetection} isActive={isActive} />
          </div>

          <div className="col-span-12 lg:col-span-5 space-y-4">
            <ThreatAnalysisPanel
              detection={currentDetection}
              todayCount={todayCount}
              isActive={isActive}
            />
            <GPSPanel detection={currentDetection} />
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-4">
            <ActivityLogPanel logs={logs} />
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-3">
            <EmergencyControls onAlert={handleManualAlert} onManualLeopard={handleManualLeopard} />
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-2">
            <DetectionStats detections={detections} />
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-3">
            <EvidenceGallery detections={detections} />
          </div>
        </div>

        <div
          className="mt-6 pt-4 flex flex-wrap items-center justify-between gap-2 text-xs"
          style={{ borderTop: "1px solid #21262D", color: "#374151" }}
        >
          <span style={{ fontFamily: "'Orbitron', sans-serif" }}>
            WILD RAKSHAK v1.0 - YOLOv11 - OpenCV - ESP8266
          </span>
          <span>Designed for Pauri Garhwal, Uttarakhand - Himalayan Wildlife Corridor</span>
          <span style={{ fontFamily: "'Orbitron', sans-serif" }}>
            Hackathon Prototype
          </span>
        </div>
      </main>
    </div>
  );
}
