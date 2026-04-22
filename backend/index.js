import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import http from 'http';
import { initSocket } from './socket.js';

import authRoutes from './routes/auth.js';
import contentRoutes from './routes/content.js';
import appointmentRoutes from './routes/appointments.js';
import aiRoutes from './routes/ai.js';
import notificationRoutes from './routes/notifications.js';
import chatRoutes from './routes/chat.js';
import prescriptionRoutes from './routes/prescriptions.js';
import adminRoutes from './routes/admin.js';
import contactRoutes from './routes/contact.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads', { maxAge: '7d' }));
app.use(express.static('public'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// Initialize Socket
initSocket(server);

app.get('/', (req, res) => {
  res.send('Care Companion API is running...');
});

const PORT = process.env.PORT;
if (!PORT) throw new Error("CRITICAL: PORT is not defined in .env");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("CRITICAL: MONGODB_URI is not defined in .env");

mongoose.connect(MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
