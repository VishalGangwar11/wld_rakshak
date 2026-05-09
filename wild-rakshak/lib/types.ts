export type ThreatLevel = "CRITICAL" | "HIGH" | "LOW" | "CLEAR";

export interface Detection {
  id: string;
  animal: string;
  threatLevel: ThreatLevel;
  confidence: number;
  timestamp: Date;
  gps: { lat: number; lng: number };
  region: string;
  imageUrl?: string;
}

export interface ActivityLog {
  id: string;
  type: "detection" | "alert" | "evidence" | "esp8266" | "system";
  message: string;
  timestamp: Date;
  threatLevel?: ThreatLevel;
}

export const THREAT_COLORS: Record<ThreatLevel, string> = {
  CRITICAL: "#FF3B3B",
  HIGH: "#FFC857",
  LOW: "#00FF9C",
  CLEAR: "#4B5563",
};

export const THREAT_BG: Record<ThreatLevel, string> = {
  CRITICAL: "rgba(255,59,59,0.1)",
  HIGH: "rgba(255,200,87,0.1)",
  LOW: "rgba(0,255,156,0.1)",
  CLEAR: "rgba(75,85,99,0.1)",
};

export const ANIMAL_THREAT: Record<string, ThreatLevel> = {
  Leopard: "CRITICAL",
  Bear: "HIGH",
  Elephant: "HIGH",
  Deer: "LOW",
  Boar: "LOW",
  Unknown: "LOW",
};

export const ANIMALS = ["Leopard", "Bear", "Elephant", "Deer", "Boar"];
