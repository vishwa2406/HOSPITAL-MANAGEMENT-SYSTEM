import Notification from '../models/Notification.js';
import { getIO } from '../socket.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper: called internally from other controllers
export const createNotification = async ({ userId, type, title, message, meta = {} }) => {
  try {
    const notification = await Notification.create({ userId, type, title, message, meta });
    
    // Emit real-time notification
    try {
      const io = getIO();
      // Emit to the specific user's room
      io.to(userId.toString()).emit('new_notification', notification);
    } catch (socketErr) {
      console.error('Socket notification emit failed:', socketErr.message);
    }
  } catch (err) {
    console.error('Notification creation failed:', err.message);
  }
};
