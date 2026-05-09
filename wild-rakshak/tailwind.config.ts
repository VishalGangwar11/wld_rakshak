import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0D1117",
        card: "#161B22",
        "neon-green": "#00FF9C",
        "danger-red": "#FF3B3B",
        "warning-yellow": "#FFC857",
        "text-primary": "#E5E7EB",
        "border-dim": "#21262D",
      },
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      animation: {
        "scan-line": "scanLine 3s linear infinite",
        "pulse-ring": "pulseRing 2s ease-out infinite",
        "blink-led": "blinkLed 0.5s ease-in-out infinite",
        "threat-flash": "threatFlash 1s ease-in-out infinite",
      },
      keyframes: {
        scanLine: {
          "0%": { top: "0%" },
          "100%": { top: "100%" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
        blinkLed: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.1" },
        },
        threatFlash: {
          "0%, 100%": { borderColor: "#FF3B3B" },
          "50%": { borderColor: "transparent" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
