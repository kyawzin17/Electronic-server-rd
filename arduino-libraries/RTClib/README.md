# RDE RTClib compatibility library

This is a simulator-focused compatibility implementation of the commonly used Adafruit RTClib API for the DS1307 RTC component currently available in Red Dragon Electronics.

## Supported API

- `DateTime`: Unix timestamp and calendar constructors, date/time getters, validity checks, 12-hour helpers, comparisons, TimeSpan arithmetic, `toString()`, and `timestamp()`.
- `TimeSpan`: constructors, day/hour/minute/second accessors, total seconds, comparisons, addition, and subtraction.
- `RTC_DS1307`: `begin()`, `adjust()`, `now()`, `isrunning()`, square-wave mode helpers, and 56-byte NVRAM read/write helpers.
- DS1307 communication is performed through Arduino `Wire` I2C transactions, using the simulator's DS1307 register runtime.

## Limitations

This is not a drop-in copy of the entire upstream Adafruit RTClib. Other RTC chip classes (for example `RTC_DS3231`, `RTC_PCF8523`, and `RTC_PCF8563`) and their chip-specific alarm/temperature features are not implemented by this compatibility layer. DS1307 support should be validated with the simulator's compile and runtime test cases before being described as production-verified.
