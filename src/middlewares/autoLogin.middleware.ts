// src/middlewares/auth.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

// Token ထဲက ပေါ်လာမယ့် Payload ပုံစံကို သတ်မှတ်ခြင်း
interface JwtPayload {
  userId: string;
}

// Express ရဲ့ Request ထဲမှာ user object ကို ထည့်ခွင့်ပြုရန် Extend လုပ်ခြင်း
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const autoLoginMiddleware = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) => {
  console.log(req.headers.authorization);
  try {
    let token;

    // ၁။ Header ထဲမှာ Authorization Bearer Token ပါမပါ စစ်ခြင်း
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]; // "Bearer <TOKEN>" ထဲက TOKEN ကိုပဲ ဖြတ်ယူမယ်
    }

    // Token မပါလာရင် 401 ပေးမယ်
    if (!token) {
      return res.status(401).json({ success: false, message: 'ခွင့်ပြုချက်မရှိပါ၊ Token မပါလာပါ။' });
    }

    // ၂။ Token မှန်မမှန်နှင့် သက်တမ်းရှိမရှိ စစ်ဆေးခြင်း
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    console.log(decoded);
    // ၃။ Database ထဲမှာ ဒီ User တကယ်ရှိသေးရဲ့လား စစ်ဆေးခြင်း
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true, bio: true, createdAt: true, updatedAt: true } // Password ကို ဖယ်ပြီး Data ပဲ ယူမယ်
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'ဒီအသုံးပြုသူသည် စနစ်ထဲမှာ မရှိတော့ပါ။' });
    }

    // ၄။ အားလုံးမှန်ကန်ရင် နောက်က Controller တွေ ယူသုံးလို့ရအောင် req.user ထဲ ထည့်ပေးလိုက်မယ်
    req.user = user;
    
    next(); // <--- အဓိက အပိုင်း- နောက်ထပ် Route/Controller ဆီ ဆက်သွားခိုင်းလိုက်တာ
    
  } catch (error) {
    // Token သက်တမ်းကုန်ရင် သို့မဟုတ် မှားနေရင် ဒီထဲရောက်မယ်
    return res.status(401).json({ success: false, message: 'Token သက်တမ်းကုန်သွားပြီ (သို့) မမှန်ကန်ပါ။' });
  }
};