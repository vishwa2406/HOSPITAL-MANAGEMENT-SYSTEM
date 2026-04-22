import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Doctor from './models/Doctor.js';
import User from './models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("CRITICAL: MONGODB_URI is not defined in .env");

async function checkData() {
  try {
    await mongoose.connect(MONGODB_URI);
    const doctorCount = await Doctor.countDocuments();
    const userCount = await User.countDocuments();
    console.log(`Doctors in DB: ${doctorCount}`);
    console.log(`Users in DB: ${userCount}`);
    
    if (doctorCount > 0) {
      const doctors = await Doctor.find().populate('userId', 'fullName');
      doctors.forEach(d => console.log(`- ${d.userId?.fullName} (${d.specialization})`));
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
