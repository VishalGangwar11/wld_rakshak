import cv2
import serial
import time
import requests
import os
import winsound  # Built-in Windows library for audio alerts
from ultralytics import YOLO

# ==========================================
# 1. SYSTEM CONFIGURATION
# ==========================================
TOKEN = "8675703482:AAFYjGVb6sDz-d9-VEb6F-RwSaEQSDa6TRU"
CHAT_ID = "6932547823" 

if not os.path.exists('evidence'):
    os.makedirs('evidence')

# Variables for the New Features
night_vision_mode = False
activity_log = [] # Stores last 3 detections
scan_line_y = 0
scan_direction = 10
last_alert_time = 0
alert_cooldown = 60  
detection_counter = 0 
total_detections_today = 0 

# Hardware Link
try:
    # Verify your COM port in Device Manager if it fails to connect
    esp32 = serial.Serial('COM3', 115200, timeout=1) 
    print(">>> Hardware Status: ONLINE.")
except:
    print(">>> Hardware Status: OFFLINE (Visual Only).")

# AI Setup
print(">>> Loading AI Brain...")
model = YOLO('best.pt')
cap = cv2.VideoCapture(0) # Use 1 if you plug in the Zebronics external cam

def send_telegram_alert(text):
    global last_alert_time
    if time.time() - last_alert_time > alert_cooldown:
        url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
        payload = {"chat_id": CHAT_ID, "text": text}
        try:
            requests.post(url, data=payload, timeout=5)
            last_alert_time = time.time()
        except:
            pass

# ==========================================
# 2. MAIN OPERATION LOOP
# ==========================================
while True:
    ret, frame = cap.read()
    if not ret: break

    # --- FEATURE: SOFTWARE NIGHT VISION (CLAHE) ---
    if night_vision_mode:
        # Convert to LAB color space to sharpen the 'L' (Lightness) channel
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
        cl = clahe.apply(l)
        limg = cv2.merge((cl, a, b))
        frame = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)

    # AI Detection
    results = model.predict(frame, conf=0.55, verbose=False)
    current_frame_detect = False
    
    for r in results:
        if len(r.boxes) > 0:
            current_frame_detect = True
            frame = r.plot() 

    # --- PERSISTENCE LOGIC (Anti-False Positive) ---
    if current_frame_detect:
        detection_counter += 1
    else:
        detection_counter = 0

    # --- THE TRIGGER POINT (Verified Detection) ---
    if detection_counter == 5: 
        total_detections_today += 1
        
        # 1. Update Activity Log (Feature)
        t_stamp = time.strftime("%H:%M")
        log_entry = f"{t_stamp} - LEOPARD SEEN"
        if log_entry not in activity_log:
            activity_log.insert(0, log_entry)
            activity_log = activity_log[:3] # Keep only last 3
        
        # 2. Audio Alert (Feature)
        winsound.Beep(1200, 300) # (Frequency, Duration)
        
        # 3. Save Screenshot & Telegram
        timestamp = time.strftime("%H-%M-%S")
        cv2.imwrite(f"evidence/VERIFIED_{timestamp}.jpg", frame)
        if 'esp32' in locals(): esp32.write(b'1')
        send_telegram_alert(f"🚨 WILD RAKSHAK: Verified Leopard at Sector 7 (30.14N, 78.77E).")

    elif detection_counter == 0:
        if 'esp32' in locals(): esp32.write(b'0')

    # ==========================================
    # 3. TACTICAL HUD & LOG DISPLAY
    # ==========================================
    
    # A. Scanning Line
    scan_line_y += scan_direction
    if scan_line_y >= frame.shape[0] or scan_line_y <= 0:
        scan_direction *= -1
    cv2.line(frame, (0, scan_line_y), (frame.shape[1], scan_line_y), (0, 255, 0), 1)

    # B. Header & Night Vision Indicator
    cv2.rectangle(frame, (0, 0), (frame.shape[1], 55), (15, 15, 15), -1)
    status_color = (0, 0, 255) if detection_counter >= 5 else (0, 255, 0)
    status_msg = "!! DANGER: TARGET DETECTED !!" if detection_counter >= 5 else "SYSTEM: ACTIVE PATROL"
    cv2.putText(frame, status_msg, (20, 35), cv2.FONT_HERSHEY_TRIPLEX, 0.7, status_color, 2)
    
    if night_vision_mode:
        cv2.putText(frame, "NV-ACTIVE", (frame.shape[1]-230, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)

    # C. On-Screen Activity Log (Left Side)
    cv2.rectangle(frame, (10, 70), (200, 140), (20, 20, 20), -1)
    cv2.putText(frame, "LAST LOGS:", (15, 85), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
    for i, entry in enumerate(activity_log):
        cv2.putText(frame, entry, (15, 105 + (i*15)), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 0), 1)

    # D. Data Console (Bottom Right)
    cv2.rectangle(frame, (frame.shape[1]-210, frame.shape[0]-65), (frame.shape[1]-10, frame.shape[0]-10), (0,0,0), -1)
    cv2.putText(frame, f"DETECTIONS: {total_detections_today}", (frame.shape[1]-200, frame.shape[0]-45), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 0), 1)
    cv2.putText(frame, "> REGION: PAURI", (frame.shape[1]-200, frame.shape[0]-25), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 0), 1)

    # Display the result
    cv2.imshow("Wild Rakshak - Strategic Command", frame)
    
    # Keyboard Controls
    key = cv2.waitKey(1) & 0xFF
    if key == ord('q'): break
    if key == ord('n'): night_vision_mode = not night_vision_mode # Press 'n' to toggle!

# Cleanup
cap.release()
cv2.destroyAllWindows()
if 'esp32' in locals(): esp32.close()