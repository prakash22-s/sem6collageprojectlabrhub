import mongoose from 'mongoose';
import Worker from './models/Worker.js';
import dotenv from 'dotenv';

dotenv.config();

const clearWorkerImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Update all workers to have empty image field
    const result = await Worker.updateMany(
      {},
      { $set: { image: '' } }
    );

    console.log(`Updated ${result.modifiedCount} workers`);
    console.log('All worker images cleared successfully');

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

clearWorkerImages();
