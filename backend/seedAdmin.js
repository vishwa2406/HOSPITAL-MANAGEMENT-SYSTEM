import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/care-companion';

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@smarttasks.com';
    const adminPassword = 'Admin@123';

    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log('Admin already exists. Updating password...');
      adminExists.password = adminPassword;
      await adminExists.save();
      console.log('Admin password updated successfully');
    } else {
      await User.create({
        fullName: 'System Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
      console.log('Admin user created successfully');
    }

    console.log('\n--- Admin Credentials ---');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('-------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
