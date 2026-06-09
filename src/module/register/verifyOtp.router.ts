import { Router } from "express";
import { verifyOtpController } from "./verifyOtp.controller.js";

const router = Router();

router.post("/verify-otp", verifyOtpController);

export default router;