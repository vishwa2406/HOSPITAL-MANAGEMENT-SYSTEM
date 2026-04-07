import express from 'express';
import { handleChat } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', protect, handleChat);

export default router;
