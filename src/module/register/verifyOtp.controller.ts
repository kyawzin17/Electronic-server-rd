import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

import { prisma } from '../../lib/prisma.js'; // သင့်ရဲ့ prisma client လမ်းကြောင်း

export const verifyOtpController = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    // ၁။ Validation စစ်ဆေးခြင်း
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email နှင့် OTP ကုဒ် ရိုက်ထည့်ရန် လိုအပ်ပါသည်။' });
    }

    // ၂။ Database ထဲမှာ ဒီ Email အတွက် သိမ်းထားတဲ့ OTP ရှိမရှိ ရှာခြင်း
    const otpRecord = await prisma.otpStore.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'OTP ကုဒ် မမှန်ကန်ပါ သို့မဟုတ် သက်တမ်းကုန်ဆုံးသွားပါပြီ။' });
    }

    // ၃။ OTP သက်တမ်း ကုန်မကုန် စစ်ဆေးခြင်း
    const isExpired = new Date() > otpRecord.expiresAt;
    if (isExpired) {
      // သက်တမ်းကုန်နေလျှင် Database ထဲကပါ တစ်ခါတည်း ဖျက်ပစ်မည်
      await prisma.otpStore.delete({ where: { email: email.toLowerCase().trim() } });
      return res.status(400).json({ success: false, message: 'OTP ကုဒ် သက်တမ်းကုန်သွားပါပြီ။ အသစ်ပြန်တောင်းပါ။' });
    }
    console.log(otpRecord.otp);
    console.log(otp);

    // ၄။ ရိုက်ထည့်လိုက်သော OTP နှင့် DB ထဲက OTP ကို တိုက်စစ်ခြင်း
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, message: 'OTP ကုဒ် မှားယွင်းနေပါသည်။' });
    }

    // ၅။ OTP မှန်ကန်ပါက Password သတ်မှတ်မည့်စာမျက်နှာသို့ သွားခွင့်ပြုရန် ယာယီ Signup Token (JWT) ထုတ်ပေးခြင်း
    // ဒီ Token ရဲ့ သက်တမ်းကို ၁၅ မိနစ် (15m) ပဲ ပေးထားမှာဖြစ်လို့ လုံခြုံမှုရှိပါတယ်
    const signupToken = jwt.sign(
      { email: otpRecord.email, name: otpRecord.name },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' } 
    );

    // ၆။ အသုံးပြုပြီးသား OTP ကို နောက်တစ်ကြိမ် ပြန်သုံးလို့မရအောင် DB ထဲမှ ဖျက်ပစ်ခြင်း
    await prisma.otpStore.delete({
      where: { email: email.toLowerCase().trim() }
    });

    // ၇။ အောင်မြင်ကြောင်းနှင့် ယာယီ Token ကို Frontend ဆီ ပို့ပေးခြင်း
    return res.status(200).json({
      success: true,
      message: 'OTP အတည်ပြုခြင်း အောင်မြင်ပါသည်။ Password သတ်မှတ်ပေးရန် လိုအပ်ပါသည်။',
      signupToken // Frontend က ဒါကို သိမ်းထားပြီး Step 3 မှာ သုံးရပါမယ်
    });

  } catch (error) {
    console.error('❌ OTP Verification Error:', error);
    return res.status(500).json({ success: false, message: 'Server အတွင်းပိုင်း ချို့ယွင်းချက် ဖြစ်ပွားပါသည်။' });
  }
};