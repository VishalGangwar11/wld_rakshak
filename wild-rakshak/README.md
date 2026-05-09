# 🐾 WILD RAKSHAK

> **AI-Powered Human-Wildlife Conflict Prevention System**  
> Designed for Pauri Garhwal, Uttarakhand — Himalayan Wildlife Corridor

---

## Overview

WILD RAKSHAK is a full-stack, real-time AI wildlife detection and early warning system that uses YOLOv11 and OpenCV to detect dangerous wildlife at forest-village edges, triggering immediate multi-channel alerts.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 App Router, React 18, TypeScript |
| Styling | Tailwind CSS, Framer Motion, lucide-react |
| AI/Vision | YOLOv11, OpenCV, Python |
| Hardware | ESP8266, Serial, LED + Buzzer |
| Alerts | Telegram Bot API |
| Backend | Next.js API Routes |
| Database | PostgreSQL (Prisma ORM) |

---

## Quick Start

### 1. Frontend (Next.js Dashboard)

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

### 2. Python AI Pipeline

```bash
cd ai
pip install -r requirements.txt
python detect.py
```

### 3. ESP8266 Hardware

Flash `hardware/esp8266_alert/esp8266_alert.ino` using Arduino IDE.  
Set `ESP8266_PORT` in `.env` to your serial port (e.g. `/dev/ttyUSB0` or `COM3`).

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
DATABASE_URL=postgresql://...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
ESP8266_PORT=/dev/ttyUSB0
```

---

## Threat Level Mapping

| Animal | Threat Level |
|---|---|
| Leopard | 🔴 CRITICAL |
| Bear | 🟡 HIGH |
| Elephant | 🟡 HIGH |
| Deer / Boar | 🟢 LOW |

---

## System Architecture

```
Camera Feed
    │
    ▼
OpenCV Frame Processing
    │
    ▼
YOLOv11 Object Detection
    │
    ├── False Positive Filter (5 consecutive frames)
    │
    ▼
Verified Detection
    │
    ├──► Telegram Alert  (bot message + evidence photo)
    ├──► ESP8266         (LED blink + buzzer)
    ├──► Evidence Store  (GPS-tagged image + timestamp)
    └──► Dashboard API   (live frontend update)
```

---

## Dashboard Features

- 🎥 Live AI surveillance camera feed with bounding boxes
- ⚠️ Real-time threat level analysis (CRITICAL / HIGH / LOW)
- 📍 GPS intelligence panel — Pauri Garhwal coordinates
- 📋 Activity logs (detections, alerts, ESP8266, evidence)
- 🚨 Emergency controls — Forest Dept alert, siren, GPS share
- 🖼️ Geo-tagged evidence gallery
- 📊 Detection statistics by animal type

---

## Future Scope

- Real GPS hardware (NEO-6M module)
- Thermal night vision camera
- Drone surveillance integration
- AI animal movement prediction
- Multi-camera monitoring
- Mobile app (React Native)
- Solar-powered edge deployment

---

## Project Vision

WILD RAKSHAK is built to **protect both humans and wildlife** in vulnerable Himalayan communities by providing an early warning infrastructure that:

- Reduces animal attack risks for rural villagers
- Supports forest department response
- Creates forensic evidence for incident documentation
- Enables proactive rather than reactive wildlife management

---

*Built with ❤️ for Uttarakhand's forest communities*
