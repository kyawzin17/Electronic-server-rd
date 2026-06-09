import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js'; // သင့်ရဲ့ prisma client လမ်းကြောင်း

interface CustomJwtPayload {
  email: string;
  name: string;
  // အခြား payload ထဲမှာ ပါဝင်မယ့် fields တွေရှိရင်လည်း ထည့်ရေးနိုင်ပါတယ် (ဥပမာ id: string;)
}

export const completeRegisterController = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    
    // Header ထဲကနေ ယာယီ Signup Token ကို ဆွဲထုတ်ခြင်း
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'ခွင့်ပြုချက်မရှိပါ၊ ယာယီ Token မပါလာပါ။' });
    }
    
    const signupToken = authHeader.split(' ')[1] || '';

    // ၁။ Token မှန်မမှန်နှင့် သက်တမ်းရှိမရှိ စစ်ဆေးခြင်း
    // ဒီနေရာမှာ decode ဖြစ်သွားရင် အရှေ့က သိမ်းခဲ့တဲ့ email နဲ့ name ကို ပြန်ရပါမယ်
    const decoded = jwt.verify(signupToken, process.env.JWT_SECRET!);

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password သည် အနည်းဆုံး စာလုံး ၆ လုံး ရှိရပါမည်။' });
    }

    // ၂။ Password ကို bcrypt ဖြင့် Hash လုပ်ပြီး လုံခြုံအောင် ပြုလုပ်ခြင်း
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ အခုလိုမျိုး Custom Jwt Payload အဖြစ် ပြောင်းလဲသတ်မှတ်ပေးလိုက်ပါ
    const decodedData = decoded as CustomJwtPayload;

    // ၃။ တကယ့် User Table ထဲမှာ အကောင့်အသစ် တကယ်ဆောက်လိုက်ခြင်း
    const newUser = await prisma.user.create({
      data: {
        email: decodedData.email,
        name: decodedData.name,
        password: hashedPassword,
      },
      select: { id: true, name: true, email: true, role: true } // Password ချန်လှပ်ခဲ့မည်
    });

    // ၄။ အကောင့်ဆောက်ပြီးတာနဲ့ တန်းပြီး Login ဝင်သွားစေဖို့အတွက် တကယ့် Login Token ထုတ်ပေးခြင်း
    const loginToken = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' } // ရက် ၃၀ သက်တမ်း
    );

    return res.status(201).json({
      success: true,
      message: 'အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်။',
      user: newUser,
      token: loginToken // Frontend က ဒါကိုရရင် LocalStorage မှာ သိမ်းပြီး Auto-Login တန်းဝင်ခိုင်းလိုက်ရုံပါပဲ
    });

  } catch (error) {
    // Token သက်တမ်းကုန်ရင် (၁၅ မိနစ်ကျော်သွားရင်) ဒီထဲရောက်မယ်
    return res.status(401).json({ success: false, message: 'ယာယီ Token သက်တမ်းကုန်သွားပါပြီ။ အစကနေ ပြန်စပါ။' });
  }
};