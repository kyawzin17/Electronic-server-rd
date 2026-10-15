#include <Servo.h>

Servo horizontal;
Servo vertical;

void setup() {
  Serial.begin(9600);

  horizontal.attach(9);
  vertical.attach(10);
}

void loop() {
  horizontal.write(30);
  vertical.write(150);
  delay(1000);

  horizontal.write(150);
  vertical.write(30);
  delay(1000);
}
