import { Router } from "express";
import { completeRegisterController } from "./completeRegister.controller.js";

const router= Router();

router.post("/register", completeRegisterController);

export default router;