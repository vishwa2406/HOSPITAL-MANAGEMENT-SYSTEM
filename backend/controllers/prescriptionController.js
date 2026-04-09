import Prescription from '../models/Prescription.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import { createNotification } from './notificationController.js';

export const createPrescription = async (req, res) => {
  try {
    const { appointmentId, medicines, generalNotes } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId', 'fullName email');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const doctor = await Doctor.findOne({ userId: req.user._id })
      .populate('userId', 'fullName');
    if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to prescribe for this appointment' });
    }

    const prescription = await Prescription.create({
      appointmentId,
      patientId: appointment.patientId,
      doctorId: doctor._id,
      medicines,
      generalNotes
    });

    // Notify the patient
    await createNotification({
      userId: appointment.patientId._id,
      type: 'prescription_generated',
      title: 'New Prescription Available 💊',
      message: `Dr. ${doctor.userId.fullName} has generated a prescription for your appointment. View it in your Prescriptions section.`,
      meta: { prescriptionId: prescription._id, appointmentId }
    });

    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPrescriptions = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      query.doctorId = doctor._id;
    }

    const prescriptions = await Prescription.find(query)
      .populate('appointmentId')
      .populate('patientId', 'fullName email phone age')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'fullName' }
      })
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPatientPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.params.patientId })
      .populate('appointmentId')
      .populate('patientId', 'fullName email phone age')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'fullName' }
      })
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
