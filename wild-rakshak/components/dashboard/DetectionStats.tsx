"use client";
import { BarChart2 } from "lucide-react";
import { Detection } from "@/lib/types";

interface Props {
  detections: Detection[];
}

const ANIMALS = ["Leopard", "Bear", "Elephant", "Deer", "Boar"];
const ANIMAL_COLOR: Record<string, string> = {
  Leopard: "#FF3B3B",
  Bear: "#FFC857",
  Elephant: "#FFC857",
  Deer: "#00FF9C",
  Boar: "#00FF9C",
};

export default function DetectionStats({ detections }: Props) {
  const counts: Record<string, number> = {};
  for (const a of ANIMALS) counts[a] = 0;
  detections.forEach((d) => {
    if (counts[d.animal] !== undefined) counts[d.animal]++;
  });
  const maxCount = Math.max(...Object.values(counts), 1);

  return (
    <div
      className="rounded-lg p-4"
      style={{ background: "#161B22", border: "1px solid #21262D" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 size={14} style={{ color: "#00FF9C" }} />
        <span
          className="text-xs font-bold tracking-widest"
          style={{ color: "#9CA3AF", fontFamily: "'Orbitron', sans-serif" }}
        >
          DETECTION STATISTICS
        </span>
      </div>

      <div className="space-y-3">
        {ANIMALS.map((animal) => (
          <div key={animal}>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: "#E5E7EB" }}>{animal}</span>
              <span style={{ color: ANIMAL_COLOR[animal], fontFamily: "'Orbitron', sans-serif" }}>
                {counts[animal]}
              </span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: "#21262D" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(counts[animal] / maxCount) * 100}%`,
                  background: ANIMAL_COLOR[animal],
                  opacity: 0.8,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-4 pt-3 flex justify-between text-xs"
        style={{ borderTop: "1px solid #21262D" }}
      >
        <span style={{ color: "#4B5563" }}>TOTAL DETECTIONS</span>
        <span
          className="font-bold"
          style={{ color: "#00FF9C", fontFamily: "'Orbitron', sans-serif" }}
        >
          {detections.length}
        </span>
      </div>
    </div>
  );
}
