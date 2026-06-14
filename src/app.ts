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
import userRouter from "./module/editProfile/edit.router.js";
// OTP
import otpRouter from "./module/register/otp.router.js";
import verifyOtpRouter from "./module/register/verifyOtp.router.js";
// Password Fill
import passwordFillRouter from "./module/register/completeRegister.router.js";
// Delete User
import deleteUserRouter from "./module/deleteUser/deleteUser.router.js";



app.use(cors());
app.use(express.json());

app.use("/api", user);
app.use("/api", avatarUpload);
app.use("/api", autoLogin);
app.use("/api", login);
app.use("/api", otpRouter);
app.use("/api", verifyOtpRouter);   
app.use("/api", passwordFillRouter);
app.use("/api", googleLoginAndRegister);
app.use("/api", bioEdit);
app.use("/api", userRouter);
app.use("/api", deleteUserRouter);

export default app;