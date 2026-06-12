import { Router } from "express";
const router= Router();

import { editController } from "./edit.controller.js";

router.patch("/edit_user/:id", editController);

export default router;