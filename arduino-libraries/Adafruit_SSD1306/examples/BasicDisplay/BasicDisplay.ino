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
  Serial.begin(9600);

  if (!display.begin(SSD1306_SWITCHCAPVCC)) {
    Serial.println("SSD1306 initialization failed");
    while (1) {}
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("Red Dragon");
  display.println("OLED Library Test");
  display.println("Hello, RDE!");
  display.display();

  Serial.println("OLED initialized");
}

void loop() {
}
