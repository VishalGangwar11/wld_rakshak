# Wild Rakshak
### Real-Time Wildlife Detection and Early Warning System

## Problem Statement
Wild animal intrusions in campuses, villages, highways, farms, and forest-border areas create serious safety risks for humans as well as animals. Existing monitoring systems are either expensive, non-intelligent, or require constant human supervision.

This project aims to develop a smart AI-powered wildlife detection and alert system capable of detecting animals in real time and generating immediate warnings.

---

## Objective
- Detect wild animals in real time
- Reduce human-animal conflicts
- Provide early warning alerts
- Improve safety in sensitive areas

---

## Features
- Real-time animal detection using YOLO
- PIR/mmWave-based motion sensing
- Telegram alert system
- Buzzer warning system
- Camera-based monitoring
- Edge processing using ESP32/computer
- Low-cost prototype

---

## Technologies Used
- Python
- OpenCV
- YOLOv11
- ESP32
- Arduino
- Telegram Bot API

---

## Hardware Components
| Component | Purpose |
|---|---|
| ESP32 | Main controller |
| PIR Sensor | Motion detection |
| mmWave Radar | Long-range motion sensing |
| Camera Module | Capturing live feed |
| Buzzer | Audio alert |
| Power Supply | System power |

---

## Working
1. Motion is detected using PIR/mmWave sensors.
2. Camera activates and captures live footage.
3. YOLO model processes frames in real time.
4. If a wild animal is detected:
   - Telegram alert is sent
   - Warning buzzer activates
5. Authorities/users receive early warning.

---

## Project Structure

```bash
Wild_Rakshak_Project/
│
├── main.py
├── requirements.txt
├── README.md
├── datasets/
├── models/
├── alerts/
└── images/
```

---

## Future Scope
- Night vision integration
- Cloud dashboard
- SMS calling alerts
- Solar-powered deployment
- Forest department integration
- AI-based animal classification

---

## Team Members
- Vishal Gangwar
- Mansi Patwal
- Rishabh Nautiyal
- Diya Bhardwaj
- Surbhi Naithani

---

## Screenshot
<img width="1053" height="786" alt="image" src="https://github.com/user-attachments/assets/713926ac-ceec-4f05-88d5-9248f9330179" />



---

```

---

## Conclusion
Wild Rakshak provides a smart, affordable, and scalable solution for real-time wildlife monitoring and early warning, helping reduce risks for both humans and animals.
