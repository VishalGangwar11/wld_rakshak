#define RED_LED 8
#define GREEN_LED 7
#define BUZZER 9

char data;

void setup() {

  Serial.begin(115200);

  pinMode(RED_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);

  // SAFE MODE DEFAULT
  digitalWrite(GREEN_LED, HIGH);
  digitalWrite(RED_LED, LOW);

  noTone(BUZZER);

  Serial.println("SYSTEM READY");
}

void loop() {

  if (Serial.available() > 0) {

    data = Serial.read();

    Serial.print("Received: ");
    Serial.println(data);

    // ======================================
    // LEOPARD ALERT
    // ======================================
    if (data == 'L') {

      digitalWrite(GREEN_LED, LOW);

      for (int i = 0; i < 5; i++) {

        digitalWrite(RED_LED, HIGH);

        tone(BUZZER, 1200);

        delay(250);

        digitalWrite(RED_LED, LOW);

        noTone(BUZZER);

        delay(250);
      }

      digitalWrite(RED_LED, HIGH);
    }

    // ======================================
    // ELEPHANT ALERT
    // ======================================
    else if (data == 'E') {

      digitalWrite(GREEN_LED, LOW);

      for (int i = 0; i < 3; i++) {

        digitalWrite(RED_LED, HIGH);

        tone(BUZZER, 800);

        delay(500);

        digitalWrite(RED_LED, LOW);

        noTone(BUZZER);

        delay(500);
      }

      digitalWrite(RED_LED, HIGH);
    }

    // ======================================
    // BEAR ALERT
    // ======================================
    else if (data == 'B') {

      digitalWrite(GREEN_LED, LOW);

      for (int i = 0; i < 2; i++) {

        digitalWrite(RED_LED, HIGH);

        tone(BUZZER, 1000);

        delay(700);

        digitalWrite(RED_LED, LOW);

        noTone(BUZZER);

        delay(700);
      }

      digitalWrite(RED_LED, HIGH);
    }

    // ======================================
    // SAFE MODE
    // ======================================
    else if (data == '0') {

      digitalWrite(RED_LED, LOW);

      digitalWrite(GREEN_LED, HIGH);

      noTone(BUZZER);
    }
  }
}