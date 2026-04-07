import express from 'express';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Doctor routes
router.get('/doctors', async (req, res) => {
  const doctors = await Doctor.find().populate('userId', 'fullName avatarUrl');
  res.json(doctors);
});

router.post('/doctors', protect, authorize('admin'), async (req, res) => {
  try {
    const { fullName, email, password, specialization, experience, bio, profileImage } = req.body;
    
    let userId;
    if (email && password) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        userId = userExists._id;
      } else {
        const user = await User.create({ fullName, email, password, role: 'doctor' });
        userId = user._id;
      }
    }

    const doctor = await Doctor.create({
      userId,
      specialization,
      experience,
      bio,
      profileImage,
      available: true
    });

    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Appointment routes
router.get('/appointments', protect, async (req, res) => {
  let query = {};
  if (req.user.role === 'patient') {
    query.patientId = req.user._id;
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    query.doctorId = doctor._id;
  }
  const appointments = await Appointment.find(query)
    .populate('patientId', 'fullName email')
    .populate({
      path: 'doctorId',
      populate: { path: 'userId', select: 'fullName' }
    });
  res.json(appointments);
});

router.post('/appointments', protect, async (req, res) => {
  const appointment = await Appointment.create({
    ...req.body,
    patientId: req.user._id
  });
  res.status(201).json(appointment);
});

// Admin routes
router.get('/doctor/me', protect, authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id }).populate('userId', 'fullName email');
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/admin/appointments', protect, authorize('admin'), async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'fullName email')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'fullName' }
      })
      .sort({ appointmentDate: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/appointments/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    appointment.status = status;
    await appointment.save();
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/admin/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const [patients, doctors, appointments, blogs] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      // We don't have Blog model here, but we can import it if needed or just count Testimonials
      Appointment.countDocuments({ status: 'pending' }) // Just a placeholder for now
    ]);
    res.json({ patients, doctors, appointments, blogs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/admin/recent-appointments', protect, authorize('admin'), async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'fullName' }
      })
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
