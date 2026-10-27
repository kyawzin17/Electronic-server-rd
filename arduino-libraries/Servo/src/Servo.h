#ifndef RDE_SERVO_H
#define RDE_SERVO_H

#define Servo_VERSION 1

#include <Arduino.h>
#include <stdint.h>

#define MIN_PULSE_WIDTH 544
#define MAX_PULSE_WIDTH 2400
#define DEFAULT_PULSE_WIDTH 1500
#define REFRESH_INTERVAL 20000
#define MAX_SERVOS 12
#define INVALID_SERVO 255

/*
 * Simulator-compatible implementation of the standard Arduino Servo API.
 * On ATmega328P/Arduino Uno, Timer1 generates servo pulses on any valid
 * digital pin. Timer1 is reserved while at least one Servo is attached.
 */
class Servo {
public:
  Servo();

  uint8_t attach(int pin);
  uint8_t attach(int pin, int min, int max);

  void detach();

  void write(int value);
  void writeMicroseconds(int value);

  int read();
  int readMicroseconds();

  bool attached();

private:
  uint8_t servoIndex_;
  int minPulse_;
  int maxPulse_;
};

#endif
