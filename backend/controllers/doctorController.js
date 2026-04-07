import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('userId', 'fullName avatarUrl email');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addDoctor = async (req, res) => {
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
};

export const getDoctorMe = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id }).populate('userId', 'fullName email');
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const { fullName, specialization, experience, bio, profileImage } = req.body;
    
    const doctor = await Doctor.findById(doctorId).populate('userId');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    doctor.specialization = specialization;
    doctor.experience = experience;
    doctor.bio = bio;
    doctor.profileImage = profileImage;
    await doctor.save();

    if (fullName && doctor.userId) {
      const user = await User.findById(doctor.userId._id);
      user.fullName = fullName;
      await user.save();
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    
    // Also delete user account if we want, but for now we just delete doctor profile
    await Doctor.findByIdAndDelete(doctorId);
    
    res.json({ message: 'Doctor deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
