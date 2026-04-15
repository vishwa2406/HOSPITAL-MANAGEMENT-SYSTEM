import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/fileUpload.js';
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getPatients,
  adminUpdateUser,
  deleteUser,
  uploadAvatar,
  changePassword,
  updatePatientVitals,
  requestPasswordReset,
  verifyOTP,
  resetPassword,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', upload.single('avatar'), registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/profile/avatar', protect, upload.single('avatar'), uploadAvatar);
router.get('/admin/patients', protect, authorize('admin'), getPatients);
router.put('/admin/users/:id', protect, authorize('admin'), adminUpdateUser);
router.delete('/admin/users/:id', protect, authorize('admin'), deleteUser);
router.put('/change-password', protect, changePassword);
router.put('/patients/:id/vitals', protect, authorize('doctor', 'admin'), updatePatientVitals);
router.post('/forgot-password', requestPasswordReset);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

export default router;
