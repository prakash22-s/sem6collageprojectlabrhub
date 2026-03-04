import express from 'express';
import Booking from '../models/Booking.js';
import Worker from '../models/Worker.js';
import { sendSMSAlert, sendVoiceAlert } from '../utils/alerts.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { workerId } = req.body;
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    if (!worker.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Worker is not verified. Cannot create booking.',
      });
    }

    const booking = await Booking.create(req.body);
    const bookingAlert = `LabourHub: New booking from ${booking.customerName} for ${booking.date}.`;
    await sendSMSAlert(worker.phone, bookingAlert);
    await sendVoiceAlert(worker.phone, bookingAlert);

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/customer/:customerId', async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.params.customerId }).sort({
      createdAt: -1,
    });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/worker/:workerId', async (req, res) => {
  try {
    let worker = await Worker.findOne({ userId: req.params.workerId });
    if (!worker) {
      worker = await Worker.findById(req.params.workerId);
    }
    if (!worker) {
      return res.json({ success: true, bookings: [] });
    }

    const bookings = await Booking.find({ workerId: worker._id }).sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/bookings
// @desc    Get all bookings (admin)
// @access  Admin
router.get('/', async (_req, res) => {
  try {
    const bookings = await Booking.find({}).sort({ createdAt: -1 });
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
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const worker = await Worker.findById(booking.workerId);
    if (worker?.phone) {
      await sendSMSAlert(worker.phone, `LabourHub: Booking ${booking._id} was rejected.`);
    }

    res.json({ success: true, booking, message: 'Job rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status
// @access  Customer/Worker
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (status === 'completed') {
      await Worker.findByIdAndUpdate(booking.workerId, {
        $inc: { completedJobs: 1 },
      });
    }

    const worker = await Worker.findById(booking.workerId);
    if (worker?.phone) {
      await sendSMSAlert(worker.phone, `LabourHub: Booking ${booking._id} updated to ${status}.`);
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/bookings/:id/accept
// @desc    Worker accepts booking
// @access  Worker
router.put('/:id/accept', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'confirmed' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const worker = await Worker.findById(booking.workerId);
    if (worker?.phone) {
      await sendSMSAlert(worker.phone, `LabourHub: You accepted booking ${booking._id}.`);
    }

    res.json({ success: true, booking, message: 'Job accepted successfully' });
  } catch (error) {
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

    const workerBookings = await Booking.find({
      workerId: booking.workerId,
      rating: { $exists: true },
    });

    if (workerBookings.length > 0) {
      const avgRating =
        workerBookings.reduce((sum, b) => sum + b.rating, 0) / workerBookings.length;
      await Worker.findByIdAndUpdate(booking.workerId, { rating: Number(avgRating.toFixed(1)) });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
