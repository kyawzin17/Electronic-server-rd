import { Router } from 'express';
import { uploadService } from './upload.servic.js';
import { uploadImageController } from './upload.controller.js';

const router = Router();

// Frontend ကနေ 'image' ဆိုတဲ့ key နဲ့ ပို့ရပါမယ်
router.patch('/avatar/upload/:id', uploadService.single('image'), uploadImageController);

export default router;