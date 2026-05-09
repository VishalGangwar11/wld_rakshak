import cv2
import serial
import time
import requests
import os
import winsound
from ultralytics import YOLO

# ==========================================
# 1. SYSTEM CONFIGURATION
# ==========================================

TOKEN = "8675703482:AAFYjGVb6sDz-d9-VEb6F-RwSaEQSDa6TRU"
CHAT_ID = "6932547823" 

MODEL_PATH = "best.pt"

# CHANGE COM PORT IF NEEDED
SERIAL_PORT = "COM4"

BAUD_RATE = 115200

CONFIDENCE_THRESHOLD = 0.55
ALERT_COOLDOWN = 60

# ==========================================
# CREATE EVIDENCE FOLDER
# ==========================================

if not os.path.exists('evidence'):

    os.makedirs('evidence')

# ==========================================
# GLOBAL VARIABLES
# ==========================================

night_vision_mode = False

activity_log = []

scan_line_y = 0
scan_direction = 10

last_alert_time = 0

detection_counter = 0

total_detections_today = 0

# ==========================================
# CONNECT ARDUINO UNO
# ==========================================

try:

    arduino = serial.Serial(
        SERIAL_PORT,
        BAUD_RATE,
        timeout=1
    )

    time.sleep(2)

    print(">>> ARDUINO UNO CONNECTED SUCCESSFULLY")

except Exception as e:

    arduino = None

    print(">>> HARDWARE STATUS: OFFLINE")

    print(e)

# ==========================================
# LOAD YOLO MODEL
# ==========================================

print(">>> LOADING AI MODEL...")

try:

    model = YOLO(MODEL_PATH)

except Exception as e:

    print(">>> MODEL LOAD FAILED")

    print(e)

    exit()

# ==========================================
# CAMERA SETUP
# ==========================================

cap = cv2.VideoCapture(0)

if not cap.isOpened():

    print(">>> CAMERA NOT FOUND")

    exit()

# ==========================================
# TELEGRAM ALERT FUNCTION
# ==========================================

def send_telegram_alert(text):

    global last_alert_time

    if time.time() - last_alert_time > ALERT_COOLDOWN:

        url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"

        payload = {

            "chat_id": CHAT_ID,
            "text": text
        }

        try:

            requests.post(
                url,
                data=payload,
                timeout=5
            )

            last_alert_time = time.time()

            print(">>> TELEGRAM ALERT SENT")

        except:

            print(">>> TELEGRAM FAILED")

# ==========================================
# MAIN LOOP
# ==========================================

while True:

    ret, frame = cap.read()

    if not ret:

        break

    # ==========================================
    # AUTO NIGHT DETECTION
    # ==========================================

    gray_check = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2GRAY
    )

    brightness = gray_check.mean()

    if brightness < 120:

        night_vision_mode = True

    else:

        night_vision_mode = False

    # ==========================================
    # NIGHT VISION EFFECT
    # ==========================================

    if night_vision_mode:

        gray = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2GRAY
        )

        clahe = cv2.createCLAHE(
            clipLimit=4.0,
            tileGridSize=(8, 8)
        )

        enhanced = clahe.apply(gray)

        night_frame = cv2.merge([

            enhanced // 3,
            enhanced,
            enhanced // 3
        ])

        frame = cv2.GaussianBlur(
            night_frame,
            (3, 3),
            0
        )

    # ==========================================
    # YOLO DETECTION
    # ==========================================

    results = model.predict(
        frame,
        conf=CONFIDENCE_THRESHOLD,
        verbose=False
    )

    current_frame_detect = False

    detected_animal = "UNKNOWN"

    for r in results:

        boxes = r.boxes

        for box in boxes:

            current_frame_detect = True

            cls_id = int(box.cls[0])

            detected_animal = model.names[cls_id]

            confidence = float(box.conf[0])

            # ==========================================
            # DRAW BOUNDING BOX
            # ==========================================

            x1, y1, x2, y2 = map(
                int,
                box.xyxy[0]
            )

            color = (0, 0, 255)

            cv2.rectangle(
                frame,
                (x1, y1),
                (x2, y2),
                color,
                2
            )

            label = f"{detected_animal} {confidence:.2f}"

            cv2.putText(
                frame,
                label,
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                color,
                2
            )

    # ==========================================
    # FALSE POSITIVE FILTER
    # ==========================================

    if current_frame_detect:

        detection_counter += 1

    else:

        detection_counter = 0

    # ==========================================
    # VERIFIED DETECTION
    # ==========================================

    if detection_counter == 5:

        total_detections_today += 1

        timestamp = time.strftime("%H:%M:%S")

        log_entry = f"{timestamp} - {detected_animal.upper()}"

        if log_entry not in activity_log:

            activity_log.insert(0, log_entry)

            activity_log = activity_log[:5]

        # ==========================================
        # DEMO GPS COORDINATES
        # ==========================================

        latitude = "30.1490N"
        longitude = "78.7800E"

        # ==========================================
        # DISPLAY GPS ON IMAGE
        # ==========================================

        cv2.rectangle(
            frame,
            (10, frame.shape[0] - 90),
            (470, frame.shape[0] - 10),
            (0, 0, 0),
            -1
        )

        cv2.putText(
            frame,
            f"GPS: {latitude}, {longitude}",
            (20, frame.shape[0] - 55),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 255),
            2
        )

        cv2.putText(
            frame,
            "REGION: PAURI GARHWAL",
            (20, frame.shape[0] - 25),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 0),
            2
        )

        # ==========================================
        # SAVE EVIDENCE
        # ==========================================

        save_time = time.strftime("%H-%M-%S")

        filename = f"evidence/VERIFIED_{save_time}.jpg"

        cv2.imwrite(filename, frame)

        print(f">>> EVIDENCE SAVED: {filename}")

        # ==========================================
        # SOUND ALERT
        # ==========================================

        winsound.Beep(1200, 300)

        # ==========================================
        # ARDUINO SIGNALS
        # ==========================================

        if arduino:

            animal = detected_animal.lower()

            if animal == "leopard":

                arduino.write(b'L')

            elif animal == "elephant":

                arduino.write(b'E')

            elif animal == "bear":

                arduino.write(b'B')

            else:

                arduino.write(b'0')

        # ==========================================
        # TELEGRAM ALERT
        # ==========================================

        send_telegram_alert(

            f"🚨 WILD RAKSHAK ALERT 🚨\n\n"
            f"Animal: {detected_animal.upper()}\n"
            f"Coordinates: {latitude}, {longitude}\n"
            f"Region: Pauri Garhwal\n"
            f"Status: VERIFIED DETECTION"
        )

    # ==========================================
    # SAFE MODE
    # ==========================================

    elif detection_counter == 0:

        if arduino:

            arduino.write(b'0')

    # ==========================================
    # SCANNING LINE EFFECT
    # ==========================================

    scan_line_y += scan_direction

    if (
        scan_line_y >= frame.shape[0]
        or
        scan_line_y <= 0
    ):

        scan_direction *= -1

    cv2.line(
        frame,
        (0, scan_line_y),
        (frame.shape[1], scan_line_y),
        (0, 255, 0),
        1
    )

    # ==========================================
    # TOP HUD
    # ==========================================

    cv2.rectangle(
        frame,
        (0, 0),
        (frame.shape[1], 70),
        (15, 15, 15),
        -1
    )

    if detection_counter >= 5:

        status_msg = "!! DANGER DETECTED !!"

        status_color = (0, 0, 255)

    else:

        status_msg = "SYSTEM ACTIVE"

        status_color = (0, 255, 0)

    cv2.putText(
        frame,
        status_msg,
        (20, 35),
        cv2.FONT_HERSHEY_TRIPLEX,
        0.7,
        status_color,
        2
    )

    # ==========================================
    # NIGHT VISION STATUS
    # ==========================================

    if night_vision_mode:

        cv2.putText(
            frame,
            "NV-ACTIVE",
            (frame.shape[1] - 220, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 0),
            2
        )

    # ==========================================
    # ACTIVITY LOG PANEL
    # ==========================================

    cv2.rectangle(
        frame,
        (10, 80),
        (320, 200),
        (20, 20, 20),
        -1
    )

    cv2.putText(
        frame,
        "LAST LOGS:",
        (20, 105),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (255, 255, 255),
        2
    )

    for i, entry in enumerate(activity_log):

        cv2.putText(
            frame,
            entry,
            (20, 135 + (i * 20)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (0, 255, 0),
            1
        )

    # ==========================================
    # DATA PANEL
    # ==========================================

    cv2.rectangle(
        frame,
        (frame.shape[1] - 260, frame.shape[0] - 100),
        (frame.shape[1] - 10, frame.shape[0] - 10),
        (0, 0, 0),
        -1
    )

    cv2.putText(
        frame,
        f"DETECTIONS: {total_detections_today}",
        (frame.shape[1] - 240, frame.shape[0] - 60),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (0, 255, 0),
        1
    )

    cv2.putText(
        frame,
        "> REGION: PAURI",
        (frame.shape[1] - 240, frame.shape[0] - 30),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (0, 255, 0),
        1
    )

    # ==========================================
    # SHOW WINDOW
    # ==========================================

    cv2.imshow(
        "WILD RAKSHAK - Strategic Command",
        frame
    )

    # ==========================================
    # EXIT KEY
    # ==========================================

    key = cv2.waitKey(1) & 0xFF

    if key == ord('q'):

        break

# ==========================================
# CLEANUP
# ==========================================

cap.release()

cv2.destroyAllWindows()

if arduino:

    arduino.close()
