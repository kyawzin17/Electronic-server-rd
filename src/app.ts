import express from "express";
const app = express();
import cors from "cors";
import user from "./module/user/user.router.js";

// Avatar Upload
import avatarUpload from "./module/avatarUpload/upload.router.js";
// Auto Login
import autoLogin from "./module/autoLogin/autoLogin.router.js";
// Login
import login from "./module/login/login.router.js";
// Google Login And Register
import googleLoginAndRegister from "./module/googleLoginAndRegister/google.router.js";
// Bio Edit
import bioEdit from "./module/bioEdit/bio.router.js";



app.use(cors());
app.use(express.json());

app.use("/api", user);
app.use("/api", avatarUpload);
app.use("/api", autoLogin);
app.use("/api", login);
app.use("/api", googleLoginAndRegister);
app.use("/api", bioEdit);

export default app;