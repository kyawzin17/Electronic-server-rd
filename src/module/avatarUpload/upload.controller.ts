import type { Request, Response } from 'express';
import { cloudinary } from './upload.servic.js';
import { prisma } from '../../lib/prisma.js';

export const uploadImageController = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'ပုံရွေးချယ်မှု မရှိပါ' });
    }

    const userId= req.params.id as string;
    // Cloudinary upload_stream ကို Promise ဖြင့် အလုပ်လုပ်စေခြင်း
    const uploadToCloudinary = (fileBuffer: Buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'rde_avatar', 
            resource_type: 'auto',
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(fileBuffer); // Buffer ကို stream ထဲထည့်ပြီး ပိတ်လိုက်ခြင်း
      });
    };

    // Upload လုပ်ငန်းစဉ်ကို စောင့်ပြီး Result ယူခြင်း
    const avatarUrl: any = await uploadToCloudinary(req.file.buffer).then((result: any) => result.secure_url as string);

    const user= await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            avatarUrl
        }
    })
    return res.status(200).json({
      success: true,
      data: user.avatarUrl,
    });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};