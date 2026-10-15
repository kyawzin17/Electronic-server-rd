#ifndef RDE_KEYPAD_H
#define RDE_KEYPAD_H

#include <Arduino.h>

/*
 * RDE simulator-compatible implementation of the common Mark Stanley /
 * Alexander Brevig Keypad API. Matrix input is read through Arduino GPIO,
 * so the simulator's existing Wokwi membrane-keypad contact model is used.
 */

#define LIST_MAX 10
#define makeKeymap(x) ((char *)(x))

enum KeyState : uint8_t {
  IDLE = 0,
  PRESSED,
  HOLD,
  RELEASED
};

struct Key {
  char kchar;
  KeyState kstate;
  bool stateChanged;
};

class Keypad {
public:
  Keypad(char *userKeymap, byte *row, byte *col,
         byte numRows, byte numCols);
  Keypad(char *userKeymap, const byte *row, const byte *col,
         byte numRows, byte numCols);

  char getKey();
  bool getKeys();
  KeyState getState();
  bool isPressed(char keyChar);
  void waitForKey();

  void setDebounceTime(uint16_t debounce);
  void setHoldTime(uint16_t hold);
  void addEventListener(void (*listener)(char));

  byte numKeys() const;
  Key key[LIST_MAX];

private:
  char *keymap_;
  byte rowPins_[4];
  byte colPins_[4];
  byte numRows_;
  byte numCols_;
  uint16_t debounceTime_;
  uint16_t holdTime_;
  unsigned long lastScanTime_;
  unsigned long pressedAt_;
  char currentKey_;
  char stableKey_;
  KeyState state_;
  void (*listener_)(char);

  char scanMatrix();
  void updateState(char scanned);
};

#endif
