import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'doctor', 'patient'], default: 'patient' },
  phone: { type: String, default: '' },
  age: { type: Number },
  avatarUrl: { type: String, default: '' },
  mustChangePassword: { type: Boolean, default: false },
  healthMetrics: {
    bloodPressure: { type: String, default: null },
    heartRate: { type: Number, default: null },
    glucose: { type: Number, default: null },
    temperature: { type: Number, default: null },
    history: [{
      bloodPressure: String,
      heartRate: Number,
      glucose: Number,
      temperature: Number,
      timestamp: { type: Date, default: Date.now }
    }]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.index({ role: 1, createdAt: -1 });

export default mongoose.model('User', userSchema);
