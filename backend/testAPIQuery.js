import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Worker from './models/Worker.js';

dotenv.config();

const testAPI = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Simulate the exact query from the API
    const workers = await Worker.find({ isVerified: true });
    console.log('\n🔍 Query: Worker.find({ isVerified: true })');
    console.log('📊 Result count:', workers.length);
    console.log('\n📋 Workers returned:');
    workers.forEach((w, i) => {
      console.log(`${i + 1}. ${w.name} - ${w.skill} - Verified: ${w.isVerified}`);
    });

    // Check the response format
    const response = { success: true, workers };
    console.log('\n📤 API Response format:');
    console.log(JSON.stringify(response, null, 2).substring(0, 500));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testAPI();
