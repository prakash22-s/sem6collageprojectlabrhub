import express from 'express';
import Booking from '../models/Booking.js';
import Worker from '../models/Worker.js';

const router = express.Router();
router.post('/', async (req, res) => {
  try {
    const { workerId } = req.body;
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    
    if (!worker.isVerified) {
      return res.status(400).json({ success: false, message: 'Worker is not verified. Cannot create booking.' });
    }
    
    const booking = await Booking.create(req.body);
    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get('/customer/:customerId', async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.params.customerId });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get('/worker/:workerId', async (req, res) => {
  try {
    console.log('🔍 Fetching bookings for worker:', req.params.workerId);
    
    // First, try to find worker by userId (if workerId is actually a User ID)
    let worker = await Worker.findOne({ userId: req.params.workerId });
    
    // If not found, try to find by Worker _id
    if (!worker) {
      worker = await Worker.findById(req.params.workerId);
    }
    
    if (!worker) {
      console.log('❌ Worker not found');
      return res.json({ success: true, bookings: [] });
    }
    
    console.log('✅ Found worker:', worker._id);
    
    // Fetch bookings using the worker's _id
    const bookings = await Booking.find({ workerId: worker._id }).sort({ createdAt: -1 });
    console.log('📋 Found bookings:', bookings.length);
    
    res.json({ success: true, bookings });
  } catch (error) {
    console.error('❌ Error fetching worker bookings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/bookings
// @desc    Get all bookings (admin)
// @access  Admin
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find({});
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/bookings/:id/reject
// @desc    Worker rejects booking
// @access  Worker
router.put('/:id/reject', async (req, res) => {
  try {
    console.log('❌ Worker rejecting booking:', req.params.id);
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    console.log('✅ Booking rejected successfully');
    res.json({ success: true, booking, message: 'Job rejected' });
  } catch (error) {
    console.error('❌ Error rejecting booking:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status
// @access  Customer/Worker
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    console.log('🔄 Updating booking status:', req.params.id, 'to', status);
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // If completed, increment worker's completed jobs
    if (status === 'completed') {
      await Worker.findByIdAndUpdate(booking.workerId, {
        $inc: { completedJobs: 1 },
      });
      console.log('✅ Worker completed jobs incremented');
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error('❌ Error updating booking status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/bookings/:id/accept
// @desc    Worker accepts booking
// @access  Worker
router.put('/:id/accept', async (req, res) => {
  try {
    console.log('✅ Worker accepting booking:', req.params.id);
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'confirmed' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    console.log('✅ Booking accepted successfully');
    res.json({ success: true, booking, message: 'Job accepted successfully' });
  } catch (error) {
    console.error('❌ Error accepting booking:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/bookings/:id/rate
// @desc    Add rating and review
// @access  Customer
router.put('/:id/rate', async (req, res) => {
  try {
    const { rating, review } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { rating, review },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Update worker's average rating
    const workerBookings = await Booking.find({
      workerId: booking.workerId,
      rating: { $exists: true },
    });

    if (workerBookings.length > 0) {
      const avgRating =
        workerBookings.reduce((sum, b) => sum + b.rating, 0) / workerBookings.length;
      await Worker.findByIdAndUpdate(booking.workerId, { rating: avgRating.toFixed(1) });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
