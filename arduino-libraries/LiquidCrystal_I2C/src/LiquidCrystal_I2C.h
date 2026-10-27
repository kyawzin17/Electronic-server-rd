#ifndef RDE_LIQUIDCRYSTAL_I2C_H
#define RDE_LIQUIDCRYSTAL_I2C_H

#include <Arduino.h>
#include <Print.h>
#include <Wire.h>

#ifndef LCD_5x8DOTS
#define LCD_5x8DOTS 0x00
#endif
#ifndef LCD_5x10DOTS
#define LCD_5x10DOTS 0x04
#endif

/*
 * RDE-compatible LiquidCrystal_I2C driver.
 * PCF8574 mapping expected by the RDE LCD1602 I2C runtime:
 * P0=RS, P1=RW, P2=Enable, P3=Backlight, P4..P7=D4..D7.
 */
class LiquidCrystal_I2C : public Print {
public:
  LiquidCrystal_I2C(uint8_t address, uint8_t columns, uint8_t rows,
                    uint8_t charsize = LCD_5x8DOTS);

  void init();
  void begin(uint8_t columns, uint8_t rows, uint8_t charsize = LCD_5x8DOTS);
  void clear();
  void home();
  void noDisplay();
  void display();
  void noBlink();
  void blink();
  void noCursor();
  void cursor();
  void scrollDisplayLeft();
  void scrollDisplayRight();
  void leftToRight();
  void rightToLeft();
  void autoscroll();
  void noAutoscroll();
  void backlight();
  void noBacklight();
  void setBacklight(uint8_t value);
  void setCursor(uint8_t column, uint8_t row);
  size_t write(uint8_t value) override;
  using Print::write;

private:
  uint8_t address_;
  uint8_t columns_;
  uint8_t rows_;
  uint8_t backlightMask_;
  uint8_t displayControl_;
  uint8_t displayMode_;
  uint8_t functionSet_;
  uint8_t rowOffsets_[4];
  bool initialized_;

  void command(uint8_t value);
  void send(uint8_t value, uint8_t mode);
  void write4bits(uint8_t value);
  void expanderWrite(uint8_t value);
  void pulseEnable(uint8_t value);
};

#endif
