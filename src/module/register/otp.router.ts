import { Router } from "express";
import { otpController } from "./otp.controller.js";

const router = Router();

router.post("/otp", otpController);

export default router;
