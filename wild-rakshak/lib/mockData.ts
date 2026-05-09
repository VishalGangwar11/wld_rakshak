import { Detection, ActivityLog, ANIMAL_THREAT, ANIMALS } from "./types";

let detectionCount = 0;
let logCount = 0;

const REGION = "Pauri Garhwal";
const BASE_LAT = 30.1575;
const BASE_LNG = 78.7733;

export function generateDetection(): Detection {
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const confidence = 0.72 + Math.random() * 0.27;
  detectionCount++;
  return {
    id: `DET-${String(detectionCount).padStart(4, "0")}`,
    animal,
    threatLevel: ANIMAL_THREAT[animal] ?? "LOW",
    confidence: parseFloat(confidence.toFixed(2)),
    timestamp: new Date(),
    gps: {
      lat: parseFloat((BASE_LAT + (Math.random() - 0.5) * 0.05).toFixed(6)),
      lng: parseFloat((BASE_LNG + (Math.random() - 0.5) * 0.05).toFixed(6)),
    },
    region: REGION,
  };
}

export function generateLog(
  type: ActivityLog["type"],
  message: string,
  threatLevel?: ActivityLog["threatLevel"]
): ActivityLog {
  logCount++;
  return {
    id: `LOG-${String(logCount).padStart(5, "0")}`,
    type,
    message,
    timestamp: new Date(),
    threatLevel,
  };
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
