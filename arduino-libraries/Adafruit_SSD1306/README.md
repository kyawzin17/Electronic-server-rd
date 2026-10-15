# Adafruit SSD1306 — RDE simulator-compatible implementation

This bundled implementation targets the 128x64 and 128x32 **SPI SSD1306** modules supported by the current Arduino Uno simulator. It uses the bundled `Adafruit_GFX` compatibility layer.

## Common API supported

- Hardware SPI and software SPI constructors
- `begin()`, `display()`, `clearDisplay()`
- `drawPixel()`, `getPixel()`, `getBuffer()`
- Text through inherited `setCursor()`, `setTextSize()`, `setTextColor()`, `print()`, and `println()`
- GFX primitives available in the bundled layer, including lines, rectangles, circles and text
- `drawBitmap()`, `drawXBitmap()`
- `invertDisplay()`, `dim()`, `displayOn()`, `displayOff()`
- `startscrollright()`, `startscrollleft()`, `startscrolldiagright()`, `startscrolldiagleft()`, `stopscroll()`
- Low-level `ssd1306_command()` and `ssd1306_command1()`

## Wiring (Arduino Uno, hardware SPI)

- VCC -> module-rated power pin
- GND -> GND
- D0 / SCLK -> D13
- D1 / MOSI -> D11
- RES -> the reset pin passed to the constructor
- DC -> the data/command pin passed to the constructor
- CS -> the chip-select pin passed to the constructor

SPI pin names can vary between module vendors; follow the labels printed on your module.

## Example

See `examples/BasicDisplay/BasicDisplay.ino` and `examples/Graphics/Graphics.ino`.

## Scope / not yet upstream-complete

This is a simulator-focused SPI compatibility implementation, not a byte-for-byte copy of the full upstream Adafruit SSD1306 distribution. The I2C constructor/transport and some upstream options are not implemented here. The controller command path must also be supported by the simulator's OLED runtime for the physical-looking screen to update. Compile and live runtime verification are still required after changes.
