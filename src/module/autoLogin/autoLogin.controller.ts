// src/controllers/auth.controller.ts
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middlewares/autoLogin.middleware.js'; // သင့်ဖိုင်ပတ်လမ်းကြောင်း ပြင်ပေးပါ
import jwt from 'jsonwebtoken';

export const autoLoginController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // အရှေ့က autoLoginMiddleware က အောင်မြင်ခဲ့ရင် req.user ထဲမှာ user data အဆင်သင့် ရှိနေပါပြီ
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: 'အသုံးပြုသူကို ရှာမတွေ့ပါ။' });
    }

    // သက်တမ်း ရက် ၃၀ ထပ်တိုးပေးဖို့အတွက် Token အသစ် ထုတ်ပေးခြင်း (Sliding Expiration)
    const newToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' } // ရက် ၃၀ သက်တမ်းတိုး
    );

    // Frontend ဆီကို Email/Password မပါဘဲ ဒီ Data တွေပဲ တန်းပြန်ပို့ပေးလိုက်ပါမယ်
    return res.status(200).json({
      success: true,
      user,         // { id, name, email, role } ပါဝင်မည်
      token: newToken // Frontend က ရရင် local storage မှာ အစားထိုးသိမ်းရမယ့် Token သစ်
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error ဖြစ်ပွားပါသည်' });
  }
};