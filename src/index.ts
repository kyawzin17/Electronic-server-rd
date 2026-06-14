import app from "./app.js";
import express from "express";
const server = express();
import 'dotenv/config';


server.use("/", app);

const port= process.env.PORT || 3335;

server.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});
