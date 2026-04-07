import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import Appointment from '../models/Appointment.js';

export const getOrCreateChat = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    // Check if appointment exists and is approved
    const appointment = await Appointment.findById(appointmentId).populate('doctorId');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.status !== 'approved') return res.status(403).json({ message: 'Chat is only enabled for approved appointments' });

    // Check if chat already exists
    let chat = await Chat.findOne({ appointmentId });
    if (!chat) {
      // Create new chat
      chat = await Chat.create({
        appointmentId,
        participants: [appointment.patientId, appointment.doctorId.userId]
      });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { chatId, message, type } = req.body;
    const newMessage = await Message.create({
      chatId,
      senderId: req.user._id,
      message,
      type: type || 'text'
    });

    // Update last message in chat
    await Chat.findByIdAndUpdate(chatId, { 
      lastMessage: newMessage._id,
      updatedAt: Date.now() 
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'fullName profileImage role')
      .populate('lastMessage')
      .populate({
        path: 'appointmentId',
        populate: { path: 'doctorId', populate: { path: 'userId', select: 'fullName' } }
      })
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
