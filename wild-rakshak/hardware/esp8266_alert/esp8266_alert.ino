/*
 * WILD RAKSHAK — ESP8266 Alert Firmware
 * 
 * Hardware:
 *   - ESP8266 (NodeMCU or Wemos D1 Mini)
 *   - LED on D4 (GPIO2)
 *   - Buzzer on D5 (GPIO14)
 * 
 * Serial Commands from Python:
 *   ALERT:CRITICAL  -> Fast blink LED + loud buzzer
 *   ALERT:HIGH      -> Medium blink LED + buzzer
 *   ALERT:LOW       -> Slow blink LED
 *   CLEAR           -> Turn off all alerts
 */

#define LED_PIN    2    // D4
#define BUZZER_PIN 14   // D5

String alertLevel = "NONE";
unsigned long lastToggle = 0;
bool ledState = false;

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH);     // Active LOW on NodeMCU
  digitalWrite(BUZZER_PIN, LOW);
  Serial.println("WILD_RAKSHAK_READY");
}

void loop() {
  // Read serial command
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();

    if (cmd == "ALERT:CRITICAL") {
      alertLevel = "CRITICAL";
      Serial.println("ACK:CRITICAL");
    } else if (cmd == "ALERT:HIGH") {
      alertLevel = "HIGH";
      Serial.println("ACK:HIGH");
    } else if (cmd == "ALERT:LOW") {
      alertLevel = "LOW";
      Serial.println("ACK:LOW");
    } else if (cmd == "CLEAR") {
      alertLevel = "NONE";
      digitalWrite(LED_PIN, HIGH);
      digitalWrite(BUZZER_PIN, LOW);
      Serial.println("ACK:CLEAR");
    }
  }

  unsigned long now = millis();
  int interval = 1000;

  if (alertLevel == "CRITICAL") interval = 150;
  else if (alertLevel == "HIGH")    interval = 400;
  else if (alertLevel == "LOW")     interval = 900;

  if (alertLevel != "NONE" && now - lastToggle >= (unsigned long)interval) {
    lastToggle = now;
    ledState = !ledState;
    digitalWrite(LED_PIN, ledState ? LOW : HIGH);  // Active LOW

    if (alertLevel == "CRITICAL") {
      tone(BUZZER_PIN, 1800, 80);
    } else if (alertLevel == "HIGH") {
      tone(BUZZER_PIN, 1200, 150);
    }
    // LOW level: LED only, no buzzer
  }
}
