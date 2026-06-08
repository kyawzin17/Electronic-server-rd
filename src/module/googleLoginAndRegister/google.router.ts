// routes/authRoutes.ts
import express, { Router } from 'express';
import { googleAuth } from './google.controller.js';

const router: Router = express.Router();

// 💡 အသစ်ထပ်တိုးမည့် Google Auth Route
router.post('/google_login', googleAuth);

export default router;