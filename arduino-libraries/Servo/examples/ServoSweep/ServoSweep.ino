#include <Servo.h>

Servo motor;
int angle = 0;
int direction = 1;

void setup() {
  Serial.begin(9600);
  motor.attach(9, 544, 2400);
}

void loop() {
  motor.write(angle);

  Serial.print("Angle: ");
  Serial.print(angle);
  Serial.print(", pulse: ");
  Serial.print(motor.readMicroseconds());
  Serial.println(" us");

  angle += direction;
  if (angle >= 180) {
    angle = 180;
    direction = -1;
  } else if (angle <= 0) {
    angle = 0;
    direction = 1;
  }

  delay(15);
}
