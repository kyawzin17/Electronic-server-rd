import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);

export type CompileOptions = {
  code: string;
  fqbn?: string;
};

export type CompileResult = {
  success: boolean;
  hex?: string;
  fqbn?: string;
  logs?: string;
  error?: string;
};

export class ArduinoCompilationError extends Error {
  public statusCode: number;
  public logs?: string;

  constructor(message: string, statusCode: number = 500, logs?: string) {
    super(message);
    this.name = "ArduinoCompilationError";
    this.statusCode = statusCode;
    this.logs = logs;
  }
}

/**
 * Connected Arduino boards များကို ရှာဖွေပေးသည့် service (Existing Function)
 */
export async function getArduinoBoards() {
  // သင်၏ မူလ getArduinoBoards logic ကို ဒီနေရာတွင် ဆက်လက်ထားရှိပါ
  return { boards: [] };
}

/**
 * Arduino Sketch ကို Temp Folder တွင် ရေးသားပြီး Arduino CLI နှင့် Compile လုပ်ပေးသည့် service
 */
export async function compileSketch(options: CompileOptions): Promise<CompileResult> {
  const { code, fqbn = "arduino:avr:uno" } = options;

  /* ---------------------------------------------
     1. Code Validation
  --------------------------------------------- */
  if (!code || !code.trim()) {
    throw new ArduinoCompilationError("Arduino code is empty.", 400);
  }

  /* ---------------------------------------------
     2. Limit Sketch Size (200 KB)
  --------------------------------------------- */
  if (Buffer.byteLength(code, "utf8") > 200_000) {
    throw new ArduinoCompilationError("Arduino sketch is too large.", 413);
  }

  let tempRoot: string | null = null;

  try {
    /* ---------------------------------------------
       3. Create Temporary Directories
    --------------------------------------------- */
    const id = crypto.randomUUID();
    tempRoot = path.join(os.tmpdir(), "rde-circuit-simulator", id);

    const sketchDirectory = path.join(tempRoot, "Sketch");
    const outputDirectory = path.join(tempRoot, "build");
    await fs.mkdir(sketchDirectory, { recursive: true });
    await fs.mkdir(outputDirectory, { recursive: true });

    /* ---------------------------------------------
       4. Write Sketch File (Sketch/Sketch.ino)
    --------------------------------------------- */
    const sketchPath = path.join(sketchDirectory, "Sketch.ino");
    await fs.writeFile(sketchPath, code, "utf8");

    /* ---------------------------------------------
       5. Execute Arduino CLI Compile
    --------------------------------------------- */
    console.log(`[Arduino CLI] Compiling ${fqbn}`);
    // The repository ships simulator-compatible libraries in
    // backend/arduino-libraries so common Arduino sketches do not depend
    // on each developer having the same global Library Manager state.

    const args = [
      "compile",
      "--fqbn",
      fqbn,
      "--output-dir",
      outputDirectory,
      "--libraries",
      path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "../../arduino-libraries",
      ),
      sketchDirectory,
    ];

    let stdout = "";
    let stderr = "";

    try {
      const result = await execFileAsync("arduino-cli", args, {
        windowsHide: true,
        maxBuffer: 10 * 1024 * 1024,
      });

      stdout = result.stdout ?? "";
      stderr = result.stderr ?? "";
    } catch (error: any) {
      const cliStdout = error?.stdout ?? "";
      const cliStderr = error?.stderr ?? "";

      const message =
        cliStderr ||
        cliStdout ||
        error?.message ||
        "Arduino CLI compilation failed.";

      throw new ArduinoCompilationError(
        message,
        422,
        `${cliStdout}\n${cliStderr}`.trim()
      );
    }

    /* ---------------------------------------------
       6. Find Generated HEX File
    --------------------------------------------- */
    const files = await fs.readdir(outputDirectory);
    const hexFile = files.find((file) => file.toLowerCase().endsWith(".hex"));

    if (!hexFile) {
      throw new ArduinoCompilationError(
        "Compilation succeeded, but no HEX file was generated.",
        500,
        `${stdout}\n${stderr}`.trim()
      );
    }

    /* ---------------------------------------------
       7. Read HEX File Content
    --------------------------------------------- */
    const hexPath = path.join(outputDirectory, hexFile);
    const hex = await fs.readFile(hexPath, "utf8");

    return {
      success: true,
      hex,
      fqbn,
      logs: `${stdout}\n${stderr}`.trim(),
    };
  } finally {
    /* ---------------------------------------------
       8. Cleanup Temp Folder
    --------------------------------------------- */
    if (tempRoot) {
      try {
        await fs.rm(tempRoot, { recursive: true, force: true });
      } catch {
        // Cleanup error များအား ignore လုပ်ပါမည်
      }
    }
  }
}

/**
 * Library catalog used by the RDE Library Manager.
 *
 * "sourceAvailable" only means that the required header is present in the
 * bundled compiler library directory (or supplied by the Arduino AVR core).
 * It does not claim that a library's hardware protocol is fully simulated.
 */
export type ArduinoLibraryInfo = {
  id: string;
  name: string;
  include: string;
  category: "Display" | "Sensor" | "Input" | "LED" | "Time" | "Core";
  description: string;
  author: string;
  sourceAvailable: boolean;
  sourceKind: "bundled" | "arduino-core" | "missing";
  runtimeStatus: "not-verified";
};

const LIBRARY_CATALOG: Array<Omit<ArduinoLibraryInfo, "sourceAvailable" | "sourceKind" | "runtimeStatus"> & { header?: string; core?: boolean }> = [
  { id: "liquidcrystal-i2c", name: "LiquidCrystal I2C", include: "#include <LiquidCrystal_I2C.h>", category: "Display", description: "Control character LCDs over I2C.", author: "Frank de Brabander", header: "LiquidCrystal_I2C/LiquidCrystal_I2C.h" },
  { id: "adafruit-ssd1306", name: "Adafruit SSD1306", include: "#include <Adafruit_SSD1306.h>", category: "Display", description: "Driver for SSD1306 monochrome OLED displays.", author: "Adafruit", header: "Adafruit_SSD1306/Adafruit_SSD1306.h" },
  { id: "adafruit-gfx", name: "Adafruit GFX Library", include: "#include <Adafruit_GFX.h>", category: "Display", description: "Drawing primitives for display libraries.", author: "Adafruit", header: "Adafruit_GFX_Library/Adafruit_GFX.h" },
  { id: "dht-sensor", name: "DHT sensor library", include: "#include <DHT.h>", category: "Sensor", description: "Read temperature and humidity from DHT11/DHT22.", author: "Adafruit", header: "DHT_sensor_library/DHT.h" },
  { id: "keypad", name: "Keypad", include: "#include <Keypad.h>", category: "Input", description: "Scan matrix keypads such as 4x4 and 4x3.", author: "Mark Stanley / Alexander Brevig", header: "Keypad/Keypad.h" },
  { id: "fastled", name: "FastLED", include: "#include <FastLED.h>", category: "LED", description: "Control addressable LED strips.", author: "FastLED community", header: "FastLED/FastLED.h" },
  { id: "irremote", name: "Arduino-IRremote", include: "#include <IRremote.hpp>", category: "Input", description: "Receive and send infrared remote protocols.", author: "Arduino-IRremote contributors", header: "IRremote/IRremote.hpp" },
  { id: "rtclib", name: "RTClib", include: "#include <RTClib.h>", category: "Time", description: "Date/time helpers for RTC modules.", author: "Adafruit", header: "RTClib/RTClib.h" },
  { id: "wire", name: "Wire (I2C)", include: "#include <Wire.h>", category: "Core", description: "Arduino core I2C communication API.", author: "Arduino", core: true },
  { id: "liquidcrystal-parallel", name: "LiquidCrystal", include: "#include <LiquidCrystal.h>", category: "Display", description: "Control HD44780 LCDs using parallel GPIO pins.", author: "Arduino / RDE compatibility implementation", header: "LiquidCrystal/LiquidCrystal.h" },
  { id: "servo", name: "Servo", include: "#include <Servo.h>", category: "Input", description: "Control hobby servo motors.", author: "Arduino", header: "Servo/src/Servo.h" },
  { id: "neopixel", name: "Adafruit NeoPixel", include: "#include <Adafruit_NeoPixel.h>", category: "LED", description: "Control addressable NeoPixel LEDs.", author: "Adafruit", header: "Adafruit_NeoPixel/Adafruit_NeoPixel.h" },
];

export async function getArduinoLibraries(): Promise<ArduinoLibraryInfo[]> {
  const librariesRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../arduino-libraries",
  );

  return Promise.all(LIBRARY_CATALOG.map(async (library) => {
    if (library.core) {
      return {
        id: library.id,
        name: library.name,
        include: library.include,
        category: library.category,
        description: library.description,
        author: library.author,
        sourceAvailable: true,
        sourceKind: "arduino-core" as const,
        runtimeStatus: "not-verified" as const,
      };
    }

    let sourceAvailable = false;
    if (library.header) {
      try {
        await fs.access(path.join(librariesRoot, library.header));
        sourceAvailable = true;
      } catch {
        sourceAvailable = false;
      }
    }

    return {
      id: library.id,
      name: library.name,
      include: library.include,
      category: library.category,
      description: library.description,
      author: library.author,
      sourceAvailable,
      sourceKind: sourceAvailable ? "bundled" as const : "missing" as const,
      runtimeStatus: "not-verified" as const,
    };
  }));
}
