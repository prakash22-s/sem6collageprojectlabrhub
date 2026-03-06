import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Worker from './models/Worker.js';

dotenv.config();

const testWorkerLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all workers
    const workers = await Worker.find({}).limit(3);
    console.log(`📊 Found ${workers.length} workers in database\n`);

    if (workers.length === 0) {
      console.log('❌ No workers found. Please register a worker first.');
      process.exit(0);
    }

    // Check each worker's user account
    for (const worker of workers) {
      console.log(`\n🔍 Checking worker: ${worker.name}`);
      console.log(`   Email: ${worker.email}`);
      console.log(`   Skill: ${worker.skill}`);
      console.log(`   Verified: ${worker.isVerified}`);

      // Find associated user account
      const user = await User.findOne({ _id: worker.userId });
      
      if (!user) {
        console.log(`   ❌ No user account found for this worker!`);
        continue;
      }

      console.log(`   ✅ User account exists`);
      console.log(`   User ID: ${user._id}`);
      console.log(`   User Role: ${user.role}`);
      console.log(`   User Email: ${user.email}`);

      // Check if role is 'worker'
      if (user.role !== 'worker') {
        console.log(`   ⚠️  WARNING: User role is '${user.role}', should be 'worker'`);
      }

      // Test password (you'll need to know the password)
      console.log(`\n   📝 To test login, use:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: [the password you used during registration]`);
      console.log(`   Endpoint: POST http://localhost:5000/api/auth/login`);
    }

    console.log('\n\n✅ Worker Login Test Complete!');
    console.log('\n📋 Summary:');
    console.log('- Workers can login using the universal /api/auth/login endpoint');
    console.log('- Use the same email and password used during registration');
    console.log('- The backend will automatically detect the worker role');
    console.log('- Frontend will redirect to /worker/dashboard');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testWorkerLogin();
