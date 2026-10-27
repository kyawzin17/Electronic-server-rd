import { Router } from "express";

import {
  compileArduinoRoute,
  detectBoards,
  listArduinoLibraries,
} from "../controllers/arduino.controller.js";

const router = Router();

// =====================================================
// BOARD LIST
// =====================================================

router.get(
  "/boards",
  detectBoards
);



// =====================================================
// LIBRARIES
// =====================================================

router.get(
  "/libraries",
  listArduinoLibraries
);

// =====================================================
// COMPILE
// =====================================================

router.post(
  "/compile",
  compileArduinoRoute
);

export default router;