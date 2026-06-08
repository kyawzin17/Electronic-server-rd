import { Router } from "express";
const router = Router();
import { getUser } from "./user.controller";

router.get("/user", getUser);

export default router;
