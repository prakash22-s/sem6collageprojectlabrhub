import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from './models/Booking.js';
import Worker from './models/Worker.js';

dotenv.config();

const testRatings = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all completed bookings
    const completedBookings = await Booking.find({ status: 'completed' });
    console.log(`📊 Total completed bookings: ${completedBookings.length}\n`);

    // Find bookings with ratings
    const ratedBookings = await Booking.find({ 
      status: 'completed',
      rating: { $exists: true, $ne: null }
    });
    console.log(`⭐ Bookings with ratings: ${ratedBookings.length}\n`);

    if (ratedBookings.length > 0) {
      console.log('📋 Rated Bookings Details:\n');
      
      for (const booking of ratedBookings) {
        console.log(`Booking ID: ${booking._id}`);
        console.log(`Customer: ${booking.customerName}`);
        console.log(`Worker: ${booking.workerName}`);
        console.log(`Skill: ${booking.workerSkill}`);
        console.log(`Rating: ${booking.rating} ⭐`);
        console.log(`Review: ${booking.review || '(No review text)'}`);
        console.log(`Date: ${booking.date}`);
        console.log(`Amount: ₹${booking.amount}`);
        
        // Check worker profile
        const worker = await Worker.findById(booking.workerId);
        if (worker) {
          console.log(`Worker's Average Rating: ${worker.rating}`);
          console.log(`Worker's Completed Jobs: ${worker.completedJobs}`);
        }
        console.log('---\n');
      }
    } else {
      console.log('❌ No rated bookings found.\n');
      console.log('To test ratings:');
      console.log('1. Complete a booking (mark as completed)');
      console.log('2. Customer rates the booking');
      console.log('3. Rating should appear in worker dashboard\n');
    }

    // Check workers and their ratings
    const workers = await Worker.find({});
    console.log(`\n👷 Workers in database: ${workers.length}\n`);
    
    for (const worker of workers) {
      const workerRatings = await Booking.find({
        workerId: worker._id,
        rating: { $exists: true, $ne: null }
      });
      
      console.log(`Worker: ${worker.name} (${worker.skill})`);
      console.log(`  Average Rating: ${worker.rating}`);
      console.log(`  Completed Jobs: ${worker.completedJobs}`);
      console.log(`  Total Ratings Received: ${workerRatings.length}`);
      
      if (workerRatings.length > 0) {
        const ratings = workerRatings.map(b => b.rating);
        console.log(`  Individual Ratings: ${ratings.join(', ')}`);
      }
      console.log('');
    }

    console.log('\n✅ Rating Test Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testRatings();
