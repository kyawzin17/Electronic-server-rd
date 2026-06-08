import { Router } from "express";
const router = Router();
import { getUser } from "./user.controller.js";

router.get("/user", getUser);

export default router;
