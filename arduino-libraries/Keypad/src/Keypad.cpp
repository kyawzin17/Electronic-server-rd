#include "Keypad.h"

Keypad::Keypad(char *userKeymap, byte *row, byte *col,
               byte numRows, byte numCols)
    : Keypad(userKeymap, static_cast<const byte *>(row),
              static_cast<const byte *>(col), numRows, numCols) {}

Keypad::Keypad(char *userKeymap, const byte *row, const byte *col,
               byte numRows, byte numCols)
    : keymap_(userKeymap),
      numRows_(numRows > 4 ? 4 : numRows),
      numCols_(numCols > 4 ? 4 : numCols),
      debounceTime_(10),
      holdTime_(1000),
      lastScanTime_(0),
      pressedAt_(0),
      currentKey_(NO_KEY),
      stableKey_(NO_KEY),
      state_(IDLE),
      listener_(nullptr) {
  for (byte i = 0; i < 4; ++i) {
    rowPins_[i] = i < numRows_ ? row[i] : 0;
    colPins_[i] = i < numCols_ ? col[i] : 0;
  }

  for (byte r = 0; r < numRows_; ++r) {
    pinMode(rowPins_[r], INPUT_PULLUP);
  }
  for (byte c = 0; c < numCols_; ++c) {
    pinMode(colPins_[c], INPUT);
  }

  for (byte i = 0; i < LIST_MAX; ++i) {
    key[i].kchar = NO_KEY;
    key[i].kstate = IDLE;
    key[i].stateChanged = false;
  }
}

char Keypad::scanMatrix() {
  if (!keymap_ || numRows_ == 0 || numCols_ == 0) {
    return NO_KEY;
  }

  char found = NO_KEY;

  for (byte c = 0; c < numCols_; ++c) {
    // Release all columns before driving the current column LOW.
    for (byte release = 0; release < numCols_; ++release) {
      pinMode(colPins_[release], INPUT);
    }

    pinMode(colPins_[c], OUTPUT);
    digitalWrite(colPins_[c], LOW);
    delayMicroseconds(3);

    for (byte r = 0; r < numRows_; ++r) {
      if (digitalRead(rowPins_[r]) == LOW) {
        found = keymap_[r * numCols_ + c];
        break;
      }
    }

    pinMode(colPins_[c], INPUT);
    if (found != NO_KEY) {
      break;
    }
  }

  return found;
}

void Keypad::updateState(char scanned) {
  unsigned long now = millis();

  if (scanned != currentKey_) {
    currentKey_ = scanned;
    lastScanTime_ = now;
    return;
  }

  if (now - lastScanTime_ < debounceTime_) {
    return;
  }

  if (stableKey_ != currentKey_) {
    stableKey_ = currentKey_;

    if (stableKey_ != NO_KEY) {
      state_ = PRESSED;
      pressedAt_ = now;
      if (listener_) listener_(stableKey_);
    } else {
      state_ = RELEASED;
    }

    key[0].kchar = stableKey_;
    key[0].kstate = state_;
    key[0].stateChanged = true;
  } else if (stableKey_ != NO_KEY && now - pressedAt_ >= holdTime_) {
    state_ = HOLD;
    key[0].kchar = stableKey_;
    key[0].kstate = HOLD;
    key[0].stateChanged = true;
  } else {
    state_ = stableKey_ == NO_KEY ? IDLE : PRESSED;
    key[0].stateChanged = false;
  }
}

char Keypad::getKey() {
  updateState(scanMatrix());
  if (state_ == PRESSED && key[0].stateChanged) {
    key[0].stateChanged = false;
    return stableKey_;
  }
  return NO_KEY;
}

bool Keypad::getKeys() {
  char before = stableKey_;
  updateState(scanMatrix());
  return before != stableKey_ || key[0].stateChanged;
}

KeyState Keypad::getState() {
  return state_;
}

bool Keypad::isPressed(char keyChar) {
  updateState(scanMatrix());
  return stableKey_ == keyChar;
}

void Keypad::waitForKey() {
  while (getKey() == NO_KEY) {
    delay(1);
  }
}

void Keypad::setDebounceTime(uint16_t debounce) {
  debounceTime_ = debounce;
}

void Keypad::setHoldTime(uint16_t hold) {
  holdTime_ = hold;
}

void Keypad::addEventListener(void (*listener)(char)) {
  listener_ = listener;
}

byte Keypad::numKeys() const {
  return stableKey_ == NO_KEY ? 0 : 1;
}
