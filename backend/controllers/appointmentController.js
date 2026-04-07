import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/email.js';

export const getAppointments = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAppointment = async (req, res) => {
  try {
    // Frontend sends appointmentDate & appointmentTime. Backend schema expects date & time.
    const dateInput = req.body.appointmentDate || req.body.date;
    const timeInput = req.body.appointmentTime || req.body.time;

    if (!dateInput || !timeInput || !req.body.doctorId) {
      return res.status(400).json({ message: 'Missing required fields: doctor, date, or time.' });
    }

    // Double-Booking Check
    const existingAppointment = await Appointment.findOne({
      doctorId: req.body.doctorId,
      date: dateInput,
      time: timeInput,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingAppointment) {
      return res.status(409).json({ message: 'This time slot is already booked for the selected doctor.' });
    }

    const appointment = await Appointment.create({
      doctorId: req.body.doctorId,
      notes: req.body.notes || '',
      date: dateInput,
      time: timeInput,
      patientId: req.user._id
    });

    // Send Email to patient
    const populatedAppt = await Appointment.findById(appointment._id)
      .populate('patientId', 'fullName email')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'fullName' } });

    await sendEmail({
      to: populatedAppt.patientId.email,
      subject: 'Appointment Request Received',
      html: `
        <h2>Hi ${populatedAppt.patientId.fullName},</h2>
        <p>Your appointment request with ${populatedAppt.doctorId.userId.fullName} on ${new Date(populatedAppt.date).toLocaleDateString()} at ${populatedAppt.time} has been received.</p>
        <p>Status: <strong>Pending Approval</strong></p>
        <p>Thank you for choosing Care Companion!</p>
      `
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'fullName email')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'fullName' } });

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    appointment.status = status;
    await appointment.save();

    // Notify patient
    await sendEmail({
      to: appointment.patientId.email,
      subject: `Appointment ${status.toUpperCase()}`,
      html: `
        <h2>Hi ${appointment.patientId.fullName},</h2>
        <p>Your appointment with ${appointment.doctorId.userId.fullName} on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been <strong>${status}</strong>.</p>
      `
    });

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'fullName email')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'fullName' }
      })
      .sort({ date: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminRecentAppointments = async (req, res) => {
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
};

export const getAdminStats = async (req, res) => {
  try {
    const [patients, doctors, appointments, blogs] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }) // Mocking blogs for now
    ]);
    res.json({ patients, doctors, appointments, blogs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rescheduleAppointment = async (req, res) => {
  try {
    const { date, time } = req.body;
    if (!date || !time) {
      return res.status(400).json({ message: 'Missing required fields: date or time.' });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'fullName email')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'fullName' } });

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    // Check if new time is available
    const existingAppointment = await Appointment.findOne({
      doctorId: appointment.doctorId._id,
      date: date,
      time: time,
      status: { $in: ['pending', 'approved'] },
      _id: { $ne: appointment._id } // exclude self
    });

    if (existingAppointment) {
      return res.status(409).json({ message: 'This time slot is already booked for the selected doctor.' });
    }

    appointment.date = date;
    appointment.time = time;
    appointment.status = 'pending'; // Reset status for doctor to re-approve
    await appointment.save();

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
