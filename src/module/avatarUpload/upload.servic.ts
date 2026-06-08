import cloudinary from '../../config/cloudinary.js';
import multer from 'multer';


// Memory Storage ကို သုံးပြီး RAM ပေါ်မှာပဲ ခဏသိမ်းမည်
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('ပုံဖော်မဲ့ (Images) သာ အကျုံးဝင်ပါသည်ု!'), false);
  }
};

export const uploadService = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
});

export { cloudinary };