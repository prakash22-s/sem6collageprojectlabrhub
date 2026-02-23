import mongoose from 'mongoose';
import Worker from './models/Worker.js';
import dotenv from 'dotenv';

dotenv.config();

const testWorkersAPI = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    // Simulate the API query
    const workers = await Worker.find({ isVerified: true });
    
    console.log('=== Workers API Query Result ===');
    console.log(`Total verified workers: ${workers.length}\n`);
    
    if (workers.length > 0) {
      console.log('Workers list:');
      workers.forEach((w, i) => {
        console.log(`${i + 1}. ${w.name}`);
        console.log(`   - Skill: ${w.skill}`);
        console.log(`   - Verified: ${w.isVerified}`);
        console.log(`   - Price: ₹${w.pricePerDay}/day`);
        console.log(`   - ID: ${w._id}\n`);
      });
    } else {
      console.log('⚠️  No verified workers found!');
      console.log('This means the API will return an empty array.\n');
    }

    await mongoose.connection.close();
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testWorkersAPI();
