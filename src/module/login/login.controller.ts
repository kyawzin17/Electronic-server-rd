import { loginSchema } from "./login.validation.js";
import { prisma } from "../../lib/prisma.js";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

export const loginController = async (req: Request, res: Response) => {
    const { email, password } = loginSchema.parse(req.body);
    const secret= process.env.JWT_SECRET;
    if (!email || !password) {
        return res.status(400).json({ message: "Email နှင့် Password ကို ဖြည့်ပါ။" });
    }
    // DB မှာ User ရှိမရှိ စစ်ဆေးရန် (သို့) User ကို ဖန်တီးရန်
    // ဥပမာအနေဖြင့် Prisma ကို အသုံးပြု၍ User ကို ရှာဖွေခြင်း
        const user = await prisma.user.findUnique({ where: { email } });
     if (!user) {
         return res.status(404).json({ message: "User မရှိပါ။" });
     }

     const isPasswordValid = await bcrypt.compare(password, user.password || "");
     if (!isPasswordValid) {
         return res.status(401).json({ message: "Password မှားယွင်းပါ။" });
     }
    // Login အောင်မြင်ပါက Token ထုတ်ပေးရန် (jsonwebtoken ကို အသုံးပြု၍)
     const token = jwt.sign({ userId: user.id }, secret!, { expiresIn: '30d' });
     const noPassword= {...user, password: ""};
     return res.status(200).json({ message: "Login အောင်မြင်ပါသည်။", token, noPassword });
};