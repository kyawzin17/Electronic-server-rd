#include <Servo.h>

Servo motor;

void setup() {
  Serial.begin(9600);

  const uint8_t index = motor.attach(9);
  if (index == INVALID_SERVO) {
    Serial.println("ERROR: Servo attach failed");
    return;
  }

  motor.write(0);
  delay(1000);

  Serial.print("Attached: ");
  Serial.println(motor.attached() ? "yes" : "no");
}

void loop() {
  motor.write(90);
  Serial.print("Angle: ");
  Serial.print(motor.read());
  Serial.print(" degrees, pulse: ");
  Serial.print(motor.readMicroseconds());
  Serial.println(" us");
  delay(1000);

  motor.write(180);
  Serial.print("Angle: ");
  Serial.print(motor.read());
  Serial.print(" degrees, pulse: ");
  Serial.print(motor.readMicroseconds());
  Serial.println(" us");
  delay(1000);
}
