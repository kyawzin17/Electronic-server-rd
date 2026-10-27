#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_DC 8
#define OLED_CS 10
#define OLED_RESET 4

Adafruit_SSD1306 display(
  SCREEN_WIDTH, SCREEN_HEIGHT, &SPI,
  OLED_DC, OLED_RESET, OLED_CS
);

void setup() {
  if (!display.begin(SSD1306_SWITCHCAPVCC)) {
    while (1) {}
  }

  display.clearDisplay();
  display.drawRect(0, 0, 128, 64, SSD1306_WHITE);
  display.drawLine(0, 0, 127, 63, SSD1306_WHITE);
  display.drawCircle(96, 32, 18, SSD1306_WHITE);
  display.setCursor(8, 8);
  display.setTextColor(SSD1306_WHITE);
  display.print("RDE OLED");
  display.display();
}

void loop() {
}
