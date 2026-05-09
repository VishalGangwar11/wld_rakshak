"""
WILD RAKSHAK — Python AI Detection Pipeline
YOLOv11 + OpenCV + ESP8266 Serial + Telegram Alerts

Requirements:
    pip install ultralytics opencv-python pyserial requests python-dotenv

Usage:
    python ai/detect.py
"""

import os
import time
import json
import base64
import datetime
import threading
import serial
import requests
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv(path=None):
        if path is None:
            path = Path(".env")
        path = Path(path)
        if not path.exists():
            return
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))

PROJECT_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(PROJECT_ROOT / ".env.local")
load_dotenv()

# -------------------------------------------------------------------
# Configuration
# -------------------------------------------------------------------
CAMERA_INDEX = int(os.getenv("CAMERA_INDEX", "0"))
CAMERA_SOURCE = os.getenv("CAMERA_SOURCE", "").strip()
DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"
FORCE_DEMO_MODE = os.getenv("FORCE_DEMO_MODE", "false").lower() == "true"
DEMO_SEND_TELEGRAM = os.getenv("DEMO_SEND_TELEGRAM", "false").lower() == "true"
YOLO_MODEL = os.getenv("YOLO_MODEL", "yolo11n.pt")
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.55"))
DETECTION_FRAMES_REQUIRED = int(os.getenv("DETECTION_FRAMES_REQUIRED", "5"))

ESP8266_PORT = os.getenv("ESP8266_PORT", "/dev/ttyUSB0")
ESP8266_BAUD = int(os.getenv("ESP8266_BAUD", "115200"))
ESP8266_ENABLED = os.getenv("ESP8266_ENABLED", "true").lower() == "true"

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

API_BASE_URL = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")
DASHBOARD_STATUS_PATH = Path(
    os.getenv("DASHBOARD_STATUS_PATH", str(PROJECT_ROOT / "public" / "status.json"))
)

GPS_LAT = float(os.getenv("GPS_LAT", "30.1575"))
GPS_LNG = float(os.getenv("GPS_LNG", "78.7733"))
GPS_REGION = os.getenv("GPS_REGION", "Pauri Garhwal")

EVIDENCE_DIR = Path("evidence")
EVIDENCE_DIR.mkdir(exist_ok=True)

# -------------------------------------------------------------------
# Threat Mapping
# -------------------------------------------------------------------
WILDLIFE_CLASSES = {
    "leopard": "CRITICAL",
    "bear": "HIGH",
    "elephant": "HIGH",
    "deer": "LOW",
    "boar": "LOW",
}

# COCO class names that map to wildlife (for demo with pretrained models)
COCO_WILDLIFE_MAP = {
    "cat": ("Leopard", "CRITICAL"),   # demo fallback
    "bear": ("Bear", "HIGH"),
    "elephant": ("Elephant", "HIGH"),
    "horse": ("Deer", "LOW"),
}


# -------------------------------------------------------------------
# ESP8266 Controller
# -------------------------------------------------------------------
class ESP8266Controller:
    def __init__(self, port: str, baud: int):
        self.port = port
        self.baud = baud
        self.ser = None
        self._connect()

    def _connect(self):
        try:
            self.ser = serial.Serial(self.port, self.baud, timeout=1)
            print(f"[ESP8266] Connected on {self.port}")
        except Exception as e:
            print(f"[ESP8266] Connection failed: {e}. Running in simulation mode.")
            self.ser = None

    def send(self, command: str):
        if self.ser and self.ser.is_open:
            self.ser.write(f"{command}\n".encode())
        else:
            print(f"[ESP8266 SIM] Command: {command}")

    def alert(self, threat_level: str):
        if threat_level == "CRITICAL":
            self.send("L")  # Leopard / critical pattern
        elif threat_level == "HIGH":
            self.send("B")  # High-risk pattern
        else:
            self.send("0")

    def clear(self):
        self.send("0")

    def close(self):
        if self.ser:
            self.ser.close()


# -------------------------------------------------------------------
# Telegram Alert
# -------------------------------------------------------------------
def send_telegram_alert(animal: str, threat_level: str, confidence: float,
                         image_path: str | None = None):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("[Telegram] Token/chat not set. Skipping.")
        return

    text = (
        f"🚨 *WILD RAKSHAK ALERT* 🚨\n\n"
        f"⚠️ *Threat:* {threat_level}\n"
        f"🐾 *Animal:* {animal}\n"
        f"📊 *Confidence:* {round(confidence * 100)}%\n"
        f"📍 *Location:* {GPS_REGION}\n"
        f"🗺 *GPS:* {GPS_LAT}, {GPS_LNG}\n"
        f"🕒 *Time:* {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        f"Take immediate precautionary action."
    )

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"

    if image_path and Path(image_path).exists():
        with open(image_path, "rb") as img:
            requests.post(
                f"{url}/sendPhoto",
                data={"chat_id": TELEGRAM_CHAT_ID, "caption": text, "parse_mode": "Markdown"},
                files={"photo": img},
                timeout=10,
            )
    else:
        requests.post(
            f"{url}/sendMessage",
            json={"chat_id": TELEGRAM_CHAT_ID, "text": text, "parse_mode": "Markdown"},
            timeout=10,
        )


# -------------------------------------------------------------------
# Evidence Capture
# -------------------------------------------------------------------
def save_evidence(frame, animal: str, threat_level: str, confidence: float):
    import cv2
    import numpy as np

    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = EVIDENCE_DIR / f"{ts}_{animal}_{threat_level}.jpg"

    # Embed GPS and threat info onto image
    overlay = frame.copy()
    h, w = frame.shape[:2]

    # Semi-transparent overlay at bottom
    cv2.rectangle(overlay, (0, h - 80), (w, h), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.6, frame, 0.4, 0, frame)

    threat_colors = {
        "CRITICAL": (0, 0, 255),
        "HIGH": (0, 165, 255),
        "LOW": (0, 255, 0),
    }
    color = threat_colors.get(threat_level, (255, 255, 255))

    cv2.putText(frame, f"WILD RAKSHAK | {threat_level} THREAT",
                (10, h - 55), cv2.FONT_HERSHEY_SIMPLEX, 0.55, color, 2)
    cv2.putText(frame, f"Animal: {animal}  Confidence: {round(confidence*100)}%",
                (10, h - 35), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1)
    cv2.putText(frame, f"GPS: {GPS_LAT}, {GPS_LNG}  |  {GPS_REGION}  |  {ts}",
                (10, h - 12), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (180, 180, 180), 1)

    cv2.imwrite(str(filename), frame)
    print(f"[Evidence] Saved: {filename}")
    return str(filename)


# -------------------------------------------------------------------
# Post detection to Next.js API
# -------------------------------------------------------------------
def post_detection_to_api(animal: str, threat_level: str, confidence: float):
    try:
        requests.post(
            f"{API_BASE_URL}/api/detections",
            json={
                "animal": animal,
                "threatLevel": threat_level,
                "confidence": confidence,
                "latitude": GPS_LAT,
                "longitude": GPS_LNG,
                "region": GPS_REGION,
            },
            timeout=5,
        )
    except Exception as e:
        print(f"[API] Post failed: {e}")


def write_dashboard_status(
    animal: str,
    threat_level: str,
    confidence: float,
    total_detections: int,
    status: str = "ALERT",
):
    DASHBOARD_STATUS_PATH.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "animal": animal.upper() if status == "ALERT" else "NONE",
        "confidence": round(confidence * 100, 2) if status == "ALERT" else 0,
        "threat": threat_level if status == "ALERT" else "CLEAR",
        "status": status,
        "detections": total_detections,
        "latitude": str(GPS_LAT),
        "longitude": str(GPS_LNG),
        "region": GPS_REGION,
        "time": datetime.datetime.now().strftime("%H:%M:%S") if status == "ALERT" else "--",
    }
    with open(DASHBOARD_STATUS_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)


def open_camera_capture(cv2):
    if CAMERA_SOURCE:
        source = int(CAMERA_SOURCE) if CAMERA_SOURCE.isdigit() else CAMERA_SOURCE
        cap = cv2.VideoCapture(source)
        if cap.isOpened():
            return cap, str(CAMERA_SOURCE)
        cap.release()

    candidates = []
    if os.name == "nt":
        candidates.extend([
            (CAMERA_INDEX, cv2.CAP_DSHOW, f"camera {CAMERA_INDEX} via DirectShow"),
            (CAMERA_INDEX, cv2.CAP_MSMF, f"camera {CAMERA_INDEX} via Media Foundation"),
        ])
    candidates.append((CAMERA_INDEX, None, f"camera {CAMERA_INDEX}"))

    for idx in range(5):
        if idx != CAMERA_INDEX:
            if os.name == "nt":
                candidates.append((idx, cv2.CAP_DSHOW, f"camera {idx} via DirectShow"))
            candidates.append((idx, None, f"camera {idx}"))

    tried = set()
    for source, backend, label in candidates:
        key = (source, backend)
        if key in tried:
            continue
        tried.add(key)

        cap = cv2.VideoCapture(source, backend) if backend is not None else cv2.VideoCapture(source)
        if cap.isOpened():
            ok, _ = cap.read()
            if ok:
                cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
                cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
                return cap, label
        cap.release()

    return None, "no camera"


def run_demo_mode(cv2):
    import numpy as np

    print("[DEMO] Camera not available. Running dashboard demo mode.")
    esp = ESP8266Controller(ESP8266_PORT, ESP8266_BAUD) if ESP8266_ENABLED else None
    total_detections = 0
    demo_animals = [
        ("Leopard", "CRITICAL", 0.96),
        ("Bear", "HIGH", 0.88),
        ("Elephant", "HIGH", 0.91),
    ]

    write_dashboard_status("NONE", "CLEAR", 0, total_detections, "MONITORING")

    try:
        while True:
            for animal, threat_level, confidence in demo_animals:
                total_detections += 1
                frame = np.zeros((720, 1280, 3), dtype=np.uint8)
                frame[:] = (12, 17, 23)
                cv2.rectangle(frame, (330, 180), (900, 520), (0, 0, 255), 3)
                cv2.putText(frame, "WILD RAKSHAK DEMO MODE", (40, 70),
                            cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 156), 3)
                cv2.putText(frame, f"{animal.upper()} DETECTED", (360, 160),
                            cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 3)
                cv2.putText(frame, f"Confidence: {round(confidence * 100)}%", (360, 560),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

                evidence_path = save_evidence(frame.copy(), animal, threat_level, confidence)
                write_dashboard_status(animal, threat_level, confidence, total_detections)

                if esp:
                    esp.alert(threat_level)

                if DEMO_SEND_TELEGRAM:
                    threading.Thread(
                        target=send_telegram_alert,
                        args=(animal, threat_level, confidence, evidence_path),
                        daemon=True,
                    ).start()

                print(f"[DEMO] {animal} alert sent to dashboard.")
                time.sleep(5)

                write_dashboard_status("NONE", "CLEAR", 0, total_detections, "MONITORING")
                if esp:
                    esp.clear()
                time.sleep(4)
    except KeyboardInterrupt:
        print("[DEMO] Stopped.")
    finally:
        write_dashboard_status("NONE", "CLEAR", 0, total_detections, "MONITORING")
        if esp:
            esp.close()


# -------------------------------------------------------------------
# Main Detection Loop
# -------------------------------------------------------------------
def run():
    try:
        from ultralytics import YOLO
        import cv2
    except ImportError:
        print("ERROR: Install ultralytics and opencv-python first.")
        return

    if FORCE_DEMO_MODE:
        run_demo_mode(cv2)
        return

    print("[WILD RAKSHAK] Initializing AI pipeline...")
    model_path = Path(YOLO_MODEL)
    if not model_path.is_absolute():
        root_model = PROJECT_ROOT / YOLO_MODEL
        ai_model = Path(__file__).resolve().parent / YOLO_MODEL
        model_path = root_model if root_model.exists() else ai_model

    try:
        model = YOLO(str(model_path))
    except Exception as e:
        print(f"[YOLO] Model load failed: {e}")
        if DEMO_MODE:
            run_demo_mode(cv2)
        return

    cap, camera_label = open_camera_capture(cv2)

    if cap is None:
        print(f"[Camera] Cannot open webcam. Tried camera index {CAMERA_INDEX} and fallbacks.")
        print("[Camera] Tip: close Zoom/Teams/Camera app/browser tabs, then run again.")
        if DEMO_MODE:
            run_demo_mode(cv2)
        return

    esp = ESP8266Controller(ESP8266_PORT, ESP8266_BAUD) if ESP8266_ENABLED else None
    detection_counter: dict[str, int] = {}
    alerted: set[str] = set()
    total_detections_today = 0
    write_dashboard_status("NONE", "CLEAR", 0, total_detections_today, "MONITORING")

    print(f"[WILD RAKSHAK] Camera active: {camera_label}. Monitoring for wildlife...")

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            results = model(frame, verbose=False)[0]
            active_animals = set()

            for box in results.boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                cls_name = model.names[cls_id].lower()

                # Map to wildlife
                mapped = None
                for key, val in COCO_WILDLIFE_MAP.items():
                    if key in cls_name:
                        mapped = val
                        break
                for key, val in WILDLIFE_CLASSES.items():
                    if key in cls_name:
                        mapped = (cls_name.capitalize(), val)
                        break

                if not mapped or conf < CONFIDENCE_THRESHOLD:
                    continue

                animal, threat_level = mapped
                active_animals.add(animal)

                detection_counter[animal] = detection_counter.get(animal, 0) + 1

                if (
                    detection_counter[animal] >= DETECTION_FRAMES_REQUIRED
                    and animal not in alerted
                ):
                    print(f"[DETECTION] {animal} — {threat_level} — {round(conf*100)}%")
                    alerted.add(animal)
                    total_detections_today += 1

                    evidence_path = save_evidence(frame.copy(), animal, threat_level, conf)
                    write_dashboard_status(animal, threat_level, conf, total_detections_today)

                    if esp:
                        esp.alert(threat_level)

                    threading.Thread(
                        target=send_telegram_alert,
                        args=(animal, threat_level, conf, evidence_path),
                        daemon=True,
                    ).start()

                    threading.Thread(
                        target=post_detection_to_api,
                        args=(animal, threat_level, conf),
                        daemon=True,
                    ).start()

                # Draw bounding box
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                colors = {"CRITICAL": (0, 0, 255), "HIGH": (0, 165, 255), "LOW": (0, 255, 0)}
                c = colors.get(threat_level, (255, 255, 255))
                cv2.rectangle(frame, (x1, y1), (x2, y2), c, 2)
                cv2.putText(frame, f"{animal} {round(conf*100)}%",
                            (x1, y1 - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.55, c, 2)

            # Reset cleared animals
            for a in list(alerted):
                if a not in active_animals:
                    alerted.discard(a)
                    detection_counter[a] = 0
                    write_dashboard_status("NONE", "CLEAR", 0, total_detections_today, "MONITORING")
                    if esp:
                        esp.clear()

            cv2.imshow("WILD RAKSHAK — Live Detection", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    finally:
        cap.release()
        cv2.destroyAllWindows()
        if esp:
            esp.close()
        print("[WILD RAKSHAK] Shutdown complete.")


if __name__ == "__main__":
    run()
