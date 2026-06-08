import bioAddController from "./bio.controller.js";

import express from "express";

const bioRouter = express.Router();

bioRouter.patch("/profile_bio/:id", bioAddController);

export default bioRouter;
