import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

try {
  await connectDB();
  const existingAdmin = await User.exists({ role: 'admin' });
  if (existingAdmin) {
    console.log('An admin account already exists; no seed changes made.');
  } else {
    await User.create({
      name: 'Administrator',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: 'admin',
      status: 'active'
    });
    console.log('Default administrator created: admin@example.com');
  }
} catch (error) {
  console.error('Failed to seed administrator:', error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
