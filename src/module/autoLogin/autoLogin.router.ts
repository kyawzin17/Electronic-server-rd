import { Router } from "express";
import { autoLoginMiddleware } from "../../middlewares/autoLogin.middleware.js";
import { autoLoginController } from "./autoLogin.controller.js";

const router = Router();

router.get("/auto_login", autoLoginMiddleware, autoLoginController);

export default router;