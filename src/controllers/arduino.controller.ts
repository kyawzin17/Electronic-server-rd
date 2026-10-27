import type { Request, Response } from "express";
import {
  getArduinoBoards,
  compileSketch,
  ArduinoCompilationError,
  getArduinoLibraries,
} from "../services/arduino.service.js";

type CompileRequest = {
  code: string;
  fqbn?: string;
  libraries?: string[];
};

type CompileResponse = {
  success: boolean;
  hex?: string | undefined;
  fqbn?: string | undefined;
  logs?: string | undefined;
  error?: string | undefined;
};

// =====================================================
// GET BOARDS CONTROLLER
// =====================================================

export async function detectBoards(_req: Request, res: Response) {
  try {
    const result = await getArduinoBoards();

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[Arduino Controller] Detect boards error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to detect Arduino boards",
    });
  }
}

// =====================================================
// LIBRARY CATALOG CONTROLLER
// =====================================================

export async function listArduinoLibraries(_req: Request, res: Response) {
  try {
    const libraries = await getArduinoLibraries();
    return res.json({
      success: true,
      libraries,
      note: "sourceAvailable confirms a compiler header is present; runtimeStatus must be verified against simulated hardware.",
    });
  } catch (error) {
    console.error("[Arduino Controller] Library catalog error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load Arduino library catalog",
    });
  }
}

// =====================================================
// COMPILE CONTROLLER
// =====================================================

export async function compileArduinoRoute(req: Request, res: Response) {
  try {
    const body = req.body as CompileRequest;

    const code = typeof body.code === "string" ? body.code : "";
    const fqbn =
      typeof body.fqbn === "string" && body.fqbn.trim().length > 0
        ? body.fqbn
        : "arduino:avr:uno";

    // Service သို့ ခေါ်ယူအသုံးပြုခြင်း
    const result = await compileSketch({
      code,
      fqbn,
      libraries: Array.isArray(body.libraries) ? body.libraries : [],
    });

    const response: CompileResponse = {
      success: true,
      hex: result.hex,
      fqbn: result.fqbn,
      logs: result.logs,
    };

    return res.json(response);
  } catch (error: any) {
    console.error("[Arduino CLI] Server error:", error);

    // Service မှ သီးသန့် Throw လုပ်ထားသော Custom Error ဖြစ်ပါက
    if (error instanceof ArduinoCompilationError) {
      const response: CompileResponse = {
        success: false,
        error: error.message,
        logs: error.logs,
      };

      return res.status(error.statusCode).json(response);
    }

    // Unhandled / Unexpected server error များအတွက်
    const response: CompileResponse = {
      success: false,
      error: error?.message || "Unexpected compiler server error.",
    };

    return res.status(500).json(response);
  }
}