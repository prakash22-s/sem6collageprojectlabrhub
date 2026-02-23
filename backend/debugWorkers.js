import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Worker from './models/Worker.js';

dotenv.config();

const checkWorkers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const allWorkers = await Worker.find({});
    console.log('\n📊 TOTAL WORKERS:', allWorkers.length);

    const verifiedWorkers = await Worker.find({ isVerified: true });
    console.log('✅ VERIFIED WORKERS:', verifiedWorkers.length);

    const unverifiedWorkers = await Worker.find({ isVerified: false });
    console.log('❌ UNVERIFIED WORKERS:', unverifiedWorkers.length);

    console.log('\n📋 ALL WORKERS DETAILS:');
    allWorkers.forEach((worker, index) => {
      console.log(`\n${index + 1}. ${worker.name}`);
      console.log(`   Email: ${worker.email}`);
      console.log(`   Skill: ${worker.skill}`);
      console.log(`   isVerified: ${worker.isVerified}`);
      console.log(`   isOnline: ${worker.isOnline}`);
      console.log(`   ID: ${worker._id}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkWorkers();
