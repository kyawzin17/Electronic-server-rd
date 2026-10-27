#include "LiquidCrystal_I2C.h"

#define LCD_CLEARDISPLAY 0x01
#define LCD_RETURNHOME 0x02
#define LCD_ENTRYMODESET 0x04
#define LCD_DISPLAYCONTROL 0x08
#define LCD_CURSORSHIFT 0x10
#define LCD_FUNCTIONSET 0x20
#define LCD_SETDDRAMADDR 0x80
#define LCD_ENTRYRIGHT 0x00
#define LCD_ENTRYLEFT 0x02
#define LCD_ENTRYSHIFTINCREMENT 0x01
#define LCD_ENTRYSHIFTDECREMENT 0x00
#define LCD_DISPLAYON 0x04
#define LCD_DISPLAYOFF 0x00
#define LCD_CURSORON 0x02
#define LCD_CURSOROFF 0x00
#define LCD_BLINKON 0x01
#define LCD_BLINKOFF 0x00
#define LCD_DISPLAYMOVE 0x08
#define LCD_CURSORMOVE 0x00
#define LCD_MOVERIGHT 0x04
#define LCD_MOVELEFT 0x00
#define LCD_4BITMODE 0x00
#define LCD_2LINE 0x08
#define LCD_1LINE 0x00

LiquidCrystal_I2C::LiquidCrystal_I2C(
    uint8_t address, uint8_t columns, uint8_t rows, uint8_t)
    : address_(address),
      columns_(columns),
      rows_(rows),
      backlightMask_(0x08),
      displayControl_(LCD_DISPLAYON | LCD_CURSOROFF | LCD_BLINKOFF),
      displayMode_(LCD_ENTRYLEFT | LCD_ENTRYSHIFTDECREMENT),
      functionSet_(LCD_4BITMODE | (rows > 1 ? LCD_2LINE : LCD_1LINE)),
      rowOffsets_{0x00, 0x40, 0x00, 0x40},
      initialized_(false) {}

void LiquidCrystal_I2C::init() {
  Wire.begin();
  begin(columns_, rows_);
}

void LiquidCrystal_I2C::begin(uint8_t columns, uint8_t rows, uint8_t) {
  columns_ = columns;
  rows_ = rows > 0 ? rows : 1;
  rowOffsets_[0] = 0x00;
  rowOffsets_[1] = 0x40;
  rowOffsets_[2] = columns_ > 0 ? columns_ : 0x00;
  rowOffsets_[3] = 0x40 + columns_;

  delay(50);
  expanderWrite(backlightMask_);
  delay(5);
  write4bits(0x03 << 4);
  delay(5);
  write4bits(0x03 << 4);
  delayMicroseconds(150);
  write4bits(0x03 << 4);
  write4bits(0x02 << 4);

  command(LCD_FUNCTIONSET | functionSet_);
  displayControl_ = LCD_DISPLAYON | LCD_CURSOROFF | LCD_BLINKOFF;
  display();
  clear();
  displayMode_ = LCD_ENTRYLEFT | LCD_ENTRYSHIFTDECREMENT;
  command(LCD_ENTRYMODESET | displayMode_);
  initialized_ = true;
}

void LiquidCrystal_I2C::clear() {
  command(LCD_CLEARDISPLAY);
  delayMicroseconds(2000);
}

void LiquidCrystal_I2C::home() {
  command(LCD_RETURNHOME);
  delayMicroseconds(2000);
}

void LiquidCrystal_I2C::noDisplay() {
  displayControl_ &= (uint8_t)~LCD_DISPLAYON;
  command(LCD_DISPLAYCONTROL | displayControl_);
}

void LiquidCrystal_I2C::display() {
  displayControl_ |= LCD_DISPLAYON;
  command(LCD_DISPLAYCONTROL | displayControl_);
}

void LiquidCrystal_I2C::noBlink() {
  displayControl_ &= (uint8_t)~LCD_BLINKON;
  command(LCD_DISPLAYCONTROL | displayControl_);
}

void LiquidCrystal_I2C::blink() {
  displayControl_ |= LCD_BLINKON;
  command(LCD_DISPLAYCONTROL | displayControl_);
}

void LiquidCrystal_I2C::noCursor() {
  displayControl_ &= (uint8_t)~LCD_CURSORON;
  command(LCD_DISPLAYCONTROL | displayControl_);
}

void LiquidCrystal_I2C::cursor() {
  displayControl_ |= LCD_CURSORON;
  command(LCD_DISPLAYCONTROL | displayControl_);
}

void LiquidCrystal_I2C::scrollDisplayLeft() {
  command(LCD_CURSORSHIFT | LCD_DISPLAYMOVE | LCD_MOVELEFT);
}

void LiquidCrystal_I2C::scrollDisplayRight() {
  command(LCD_CURSORSHIFT | LCD_DISPLAYMOVE | LCD_MOVERIGHT);
}

void LiquidCrystal_I2C::leftToRight() {
  displayMode_ |= LCD_ENTRYLEFT;
  command(LCD_ENTRYMODESET | displayMode_);
}

void LiquidCrystal_I2C::rightToLeft() {
  displayMode_ &= (uint8_t)~LCD_ENTRYLEFT;
  command(LCD_ENTRYMODESET | displayMode_);
}

void LiquidCrystal_I2C::autoscroll() {
  displayMode_ |= LCD_ENTRYSHIFTINCREMENT;
  command(LCD_ENTRYMODESET | displayMode_);
}

void LiquidCrystal_I2C::noAutoscroll() {
  displayMode_ &= (uint8_t)~LCD_ENTRYSHIFTINCREMENT;
  command(LCD_ENTRYMODESET | displayMode_);
}

void LiquidCrystal_I2C::backlight() {
  setBacklight(1);
}

void LiquidCrystal_I2C::noBacklight() {
  setBacklight(0);
}

void LiquidCrystal_I2C::setBacklight(uint8_t value) {
  backlightMask_ = value ? 0x08 : 0x00;
  expanderWrite(0);
}

void LiquidCrystal_I2C::setCursor(uint8_t column, uint8_t row) {
  if (row >= rows_) row = rows_ - 1;
  if (row > 3) row = 3;
  command(LCD_SETDDRAMADDR | (column + rowOffsets_[row]));
}

size_t LiquidCrystal_I2C::write(uint8_t value) {
  send(value, 0x01);
  return 1;
}

void LiquidCrystal_I2C::command(uint8_t value) {
  send(value, 0x00);
}

void LiquidCrystal_I2C::send(uint8_t value, uint8_t mode) {
  write4bits((value & 0xF0) | mode);
  write4bits(((value << 4) & 0xF0) | mode);
}

void LiquidCrystal_I2C::write4bits(uint8_t value) {
  expanderWrite(value);
  pulseEnable(value);
}

void LiquidCrystal_I2C::expanderWrite(uint8_t value) {
  Wire.beginTransmission(address_);
  Wire.write(value | backlightMask_);
  Wire.endTransmission();
}

void LiquidCrystal_I2C::pulseEnable(uint8_t value) {
  expanderWrite(value | 0x04);
  delayMicroseconds(1);
  expanderWrite(value & (uint8_t)~0x04);
  delayMicroseconds(50);
}
