import app from "./app.js";
import express from "express";
const server = express();

server.use("/", app);

const port= process.env.PORT || 3000;

server.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});
