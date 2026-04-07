import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getPatients,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/admin/patients', protect, authorize('admin'), getPatients);

export default router;
