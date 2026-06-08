import multer from 'multer';

// Disk အစား MemoryStorage ကို ပြောင်းသုံးမယ်
const storage = multer.memoryStorage();

export const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // ပုံ Size ကို 5MB ထက်မပိုအောင် Limit လုပ်ထားတာ (မထည့်လည်း ရပါတယ်)
  }
});