import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('\n📧 Admin Email:', existingAdmin.email);
      console.log('🔑 Password: Use the password you set during creation');
      console.log('\nℹ️  Admin already exists. Delete and recreate? (Ctrl+C to cancel)');
      process.exit(0);
    }

    // Create new admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@labourhub.com',
      password: 'admin123',
      role: 'admin',
    });

    console.log('\n✅ Admin created successfully!');
    console.log('\n📧 Email: admin@labourhub.com');
    console.log('🔑 Password: admin123');
    console.log('\n⚠️  Change password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
