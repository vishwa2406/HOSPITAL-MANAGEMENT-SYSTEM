import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getOrCreateChat,
  getMessages,
  sendMessage,
  getUserChats
} from '../controllers/chatController.js';

const router = express.Router();

router.get('/my-chats', protect, getUserChats);
router.get('/:appointmentId', protect, getOrCreateChat);
router.get('/messages/:chatId', protect, getMessages);
router.post('/messages', protect, sendMessage);

export default router;
