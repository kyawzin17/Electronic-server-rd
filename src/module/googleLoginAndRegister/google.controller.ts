// controllers/authController.ts
import type{ Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;

  if (!token) {
    res.status(400).json({ success: false, message: "Google Token is required." });
    return;
  }

  try {
    // ၁။ Google Token ကို Verify လုပ်ခြင်း
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(400).json({ success: false, message: "Invalid Google payload." });
      return;
    }

    // Payload ထဲက အချက်အလက်တွေကို ထုတ်ယူခြင်း (Type လုံခြုံအောင် string အဖြစ် သတ်မှတ်ထားနိုင်ပါတယ်)
    const googleId = payload.sub as string;
    const email = payload.email as string;
    const name = payload.name as string;
    const picture = payload.picture as string | undefined;

    if (!email || !name) {
      res.status(400).json({ success: false, message: "Email and Name are required." });
      return;
    }

    // ၂။ Database ထဲမှာ ဒီ googleId နဲ့ User ရှိပြီးသားလား ရှာမယ်
    let user = await prisma.user.findUnique({
      where: { googleId: googleId},
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      // ၃။ googleId မရှိရင် Email နဲ့ ထပ်ရှာမယ် (OTP သမားတွေ အကောင့်လာချိတ်ရင် ပေါင်းပေးဖို့)
      user = await prisma.user.findUnique({
        where: { email: email },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: true,
          bio: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      if (user) {
        // Email ရှိနေရင်: ရှိပြီးသားအကောင့်ကို googleId နဲ့ ပုံ Update သွားလုပ်ပေးမယ်
        user = await prisma.user.update({
          where: { email: email },
          data: {
            googleId: googleId,
            avatarUrl: user.avatarUrl,
          },
        });
      } else {
        // ၄။ အကောင့်အသစ်ဆိုရင် Register လုပ်ပေးမယ်
        user = await prisma.user.create({
          data: {
            name: name,
            email: email,
            googleId: googleId,
          },
        });
      }
    }

    // ၅။ JWT Secret ကို စစ်ဆေးခြင်း (TypeScript က environment variable မရှိမှာ စိုးရိမ်တတ်လို့ပါ)
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in environment variables.");
    }

    // ၆။ JWT Token အသစ် ထုတ်ပေးမယ်
    const systemToken = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: '30d' }
    );

    // ၇။ Frontend ကို ပြန်ပို့မယ်
    res.status(200).json({
      success: true,
      message: "Google Authentication Successful",
      token: systemToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        bio: user.bio,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });

  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ success: false, message: "Invalid Google Token." });
  }
};