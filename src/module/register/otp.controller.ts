import type { Request, Response } from 'express';
import 'dotenv/config';
import crypto from 'crypto';
import { Resend } from 'resend';
import { prisma } from '../../lib/prisma.js'; // သင့်ရဲ့ prisma client လမ်းကြောင်း

// ၁။ Server တက်လာကတည်းက API Key ရှိမရှိ စစ်ဆေးပြီး လုံခြုံအောင် လုပ်ခြင်း
if (!process.env.RESEND_API_KEY) {
  console.error("❌ CRITICAL ERROR: RESEND_API_KEY is missing in .env file!");
}

// Resend Instance ကို သတ်မှတ်ခြင်း
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

export const otpController = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

    // ၂။ Input Validation (Production မှာ ပိုမို စစ်ဆေးသင့်သည်)
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'အမည် (Name) ထည့်သွင်းရန် လိုအပ်ပါသည်။' });
    }

    if (!email) {
      return res.status(400).json({ success: false, message: 'အီးမေးလ် (Email) ထည့်သွင်းရန် လိုအပ်ပါသည်။' });
    }

    // Email ပုံစံ မှန်ကန်မှု ရှိမရှိ Regex ဖြင့် စစ်ဆေးခြင်း
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'အီးမေးလ် ပုံစံ မှန်ကန်မှု မရှိပါ။' });
    }

    // ၃။ သုံးပြီးသား Email ဟုတ်မဟုတ် စစ်ဆေးခြင်း
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }, // lowercase ပြောင်းပြီး စစ်ဆေးခြင်း
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'ဤ Email ဖြင့် အကောင့်ဖွင့်ပြီးသား ဖြစ်နေပါသည်။' });
    }

    // ၄။ Crypto သုံးပြီး လုံခြုံသော ဂဏန်း ၆ လုံး OTP ထုတ်ခြင်း
    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // ၅ မိနစ် သက်တမ်း

    // ၅။ Database ထဲတွင် သိမ်းဆည်းခြင်း (Upsert)
    await prisma.otpStore.upsert({
      where: { email: email.toLowerCase().trim() },
      update: {
        otp,
        name: name.trim(),
        expiresAt,
      },
      create: {
        email: email.toLowerCase().trim(),
        otp,
        name: name.trim(),
        expiresAt,
      },
    });

    // ၆။ Resend သုံးပြီး Email လှမ်းပို့ခြင်း
    // Resend ရဲ့ SDK က { data, error } object အနေနဲ့ ပြန်ပေးပါတယ်
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email.toLowerCase().trim()],
      subject: `[My App] သင့်ရဲ့ အတည်ပြုကုဒ်မှာ ${otp} ဖြစ်ပါတယ်`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; max-width: 450px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #1a202c; font-size: 22px; font-weight: 600; margin-bottom: 16px;">မင်္ဂလာပါ ${name},</h2>
          <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">သင့်အကောင့်ကို အသက်သွင်းရန် အောက်ပါ ဂဏန်း ၆ လုံးပါဝင်သော OTP ကုဒ်ကို အသုံးပြုပေးပါ။ ဤကုဒ်သည် လုံခြုံရေးအရ <b>၁ မိနစ်</b> သာ သက်တမ်းရှိပါမည်။</p>
          
          <div style="background-color: #f7fafc; padding: 18px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1a0dab; border-radius: 8px; border: 1px solid #edf2f7; margin-bottom: 24px;">
            ${otp}
          </div>
          
          <p style="color: #718096; font-size: 13px; line-height: 1.5; margin-top: 24px; border-top: 1px solid #edf2f7; padding-top: 16px;">အကယ်၍ သင်ကိုယ်တိုင် တောင်းဆိုခဲ့ခြင်း မဟုတ်ပါက ဤအီးမေးလ်ကို စိတ်ချလက်ချ လျစ်လျူရှုနိုင်ပါသည်။</p>
        </div>
      `,
    });

    // ၇။ Resend ဘက်က ပို့တာ မအောင်မြင်ရင် ကိုင်တွယ်ခြင်း
    if (error) {
      console.error('❌ Resend SDK Error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'အီးမေးလ် ပို့ဆောင်ရမည့် Server တွင် အမှားအယွင်း ရှိနေပါသည်။ ရွှေ့ဆိုင်းပြီးမှ ပြန်လည်ကြိုးစားပါ။' 
      });
    }

    // တကယ့် Production မှာ လိုအပ်ရင် Resend ID ကို Log ထုတ်ကြည့်နိုင်သည်
    console.log(`✉️ Email sent successfully. Resend ID: ${data?.id}`);

    // ၈။ အားလုံး အောင်မြင်ပါက Response ပို့ခြင်း
    return res.status(200).json({
      success: true,
      message: 'OTP ကုဒ်ကို အီးမေးလ်ထဲသို့ ပို့ဆောင်ပေးပြီးပါပြီ။',
      email: email.toLowerCase().trim()
    });

  } catch (error) {
    // Server Error များကို ပြင်ပသို့ လုံခြုံရေးအရ အသေးစိတ်မပြဘဲ Server Log တွင်သာ မှတ်သားခြင်း
    console.error('❌ Production Register Initiate Crash:', error);
    return res.status(500).json({ success: false, message: 'Server အတွင်းပိုင်း ချို့ယွင်းချက် ဖြစ်ပွားပါသည်။' });
  }
};