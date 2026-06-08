import express from "express";
const app = express();
import cors from "cors";
import user from "./module/user/user.router.js";

app.use(express.json());
app.use(cors());

app.use("/api", user);

export default app;