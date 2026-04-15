import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { sendEmail } from '../utils/email.js';
import { getOTPEmail } from '../utils/emailTemplates.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let avatarUrl = '';
    if (req.file) {
      avatarUrl = req.file.path;
      if (!avatarUrl.startsWith('http')) {
        avatarUrl = `${req.protocol}://${req.get('host')}/${avatarUrl.replace(/\\/g, '/')}`;
      }
    }

    const user = await User.create({ 
      fullName, 
      email, 
      password, 
      role: role || 'patient',
      avatarUrl 
    });

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        age: user.age,
        mustChangePassword: user.mustChangePassword,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  res.json(req.user);
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      user.fullName = fullName || user.fullName;
      user.phone = phone || user.phone;
      if (req.body.age !== undefined) user.age = req.body.age;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
        phone: updatedUser.phone,
        age: updatedUser.age,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let finalPath = req.file.path;
    // If it's a local file path (not a Cloudinary URL), format it as a URL
    if (!finalPath.startsWith('http')) {
      finalPath = `${req.protocol}://${req.get('host')}/${finalPath.replace(/\\/g, '/')}`;
    }

    user.avatarUrl = finalPath;
    await user.save();

    // If user is a doctor, also update Doctor model
    if (user.role === 'doctor') {
      import('../models/Doctor.js').then(async ({ default: Doctor }) => {
        await Doctor.findOneAndUpdate({ userId: user._id }, { profileImage: finalPath });
      });
    }

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      age: user.age,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const adminUpdateUser = async (req, res) => {
  try {
    const { fullName, email, phone, role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, {
      fullName, email, phone, role
    }, { new: true }).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePatientVitals = async (req, res) => {
  try {
    const { bloodPressure, heartRate, glucose, temperature } = req.body;
    const patient = await User.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Update current metrics
    patient.healthMetrics.bloodPressure = bloodPressure || patient.healthMetrics.bloodPressure;
    patient.healthMetrics.heartRate = heartRate || patient.healthMetrics.heartRate;
    patient.healthMetrics.glucose = glucose || patient.healthMetrics.glucose;
    patient.healthMetrics.temperature = temperature || patient.healthMetrics.temperature;

    // Push to history
    patient.healthMetrics.history.push({
      bloodPressure: patient.healthMetrics.bloodPressure,
      heartRate: patient.healthMetrics.heartRate,
      glucose: patient.healthMetrics.glucose,
      temperature: patient.healthMetrics.temperature,
      timestamp: new Date()
    });

    await patient.save();
    res.json({ message: 'Vitals updated successfully', healthMetrics: patient.healthMetrics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Email not registered' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to DB (replace if exists)
    await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date(), attempts: 0 },
      { upsert: true, new: true }
    );

    // Send Email
    await sendEmail({
      to: email,
      subject: 'Password Reset OTP - LIOHNS Life Care',
      html: getOTPEmail(otp),
    });

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not requested' });
    }

    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ email });
      return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Verify OTP again for security before resetting
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Delete OTP record
    await OTP.deleteOne({ email });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
