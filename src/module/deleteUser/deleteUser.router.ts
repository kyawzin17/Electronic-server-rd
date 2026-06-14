import { deleteUser } from "./deleteUser.controller.js"
import { Router } from "express"
const router= Router();

router.delete("/user_delete/:id", deleteUser);

export default router;
