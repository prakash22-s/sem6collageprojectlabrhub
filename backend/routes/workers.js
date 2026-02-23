import express from 'express';
import Worker from '../models/Worker.js';
import User from '../models/User.js';

const router = express.Router();

// @route   POST /api/workers/register
// @desc    Register a new worker
// @access  Public
router.post('/register', async (req, res) => {
  try {
    console.log('Worker registration request received:', req.body);
    
    const { name, email, password, phone, skill, experience, pricePerDay, address, aadhaar } = req.body;

    // Log received fields
    console.log('Received fields:', { name, email, password: '***', phone, skill, experience, pricePerDay, address, aadhaar });

    // Validation
    if (!name || !email || !password || !phone || !skill || !experience || !pricePerDay || !address) {
      const missingFields = [];
      if (!name) missingFields.push('name');
      if (!email) missingFields.push('email');
      if (!password) missingFields.push('password');
      if (!phone) missingFields.push('phone');
      if (!skill) missingFields.push('skill');
      if (!experience) missingFields.push('experience');
      if (!pricePerDay) missingFields.push('pricePerDay');
      if (!address) missingFields.push('address');
      
      console.log('Missing fields:', missingFields);
      return res.status(400).json({ 
        success: false, 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if email already exists in User or Worker
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    const existingWorker = await Worker.findOne({ email });
    if (existingWorker) {
      return res.status(400).json({ 
        success: false, 
        message: 'Worker with this email already exists' 
      });
    }

    console.log('Creating user account...');
    // Create user account for worker
    const user = await User.create({
      name,
      email,
      password, // Will be hashed by User model pre-save hook
      role: 'worker',
    });
    console.log('User created:', user._id);

    console.log('Creating worker profile...');
    // Create worker profile
    const worker = await Worker.create({
      userId: user._id,
      name,
      email,
      phone,
      skill,
      experience: parseInt(experience),
      pricePerDay: parseInt(pricePerDay),
      address,
      aadhaar: aadhaar || '',
    });
    console.log('Worker created:', worker._id);

    res.status(201).json({
      success: true,
      message: 'Worker registered successfully',
      worker: {
        id: worker._id,
        name: worker.name,
        email: worker.email,
        skill: worker.skill,
        isVerified: worker.isVerified,
      },
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Worker registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Worker registration failed',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @route   GET /api/workers/all
// @desc    Get all workers (for admin)
// @access  Admin
router.get('/all', async (req, res) => {
  try {
    const workers = await Worker.find({});
    res.json({ success: true, workers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/workers/user/:userId
// @desc    Get worker by user ID
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.params.userId });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    res.json({ success: true, worker });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/workers
// @desc    Get all verified workers (for customers)
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('🔍 GET /api/workers - Fetching verified workers...');
    const workers = await Worker.find({ isVerified: true });
    console.log('✅ Found verified workers:', workers.length);
    console.log('📋 Workers:', workers.map(w => ({ name: w.name, skill: w.skill, verified: w.isVerified })));
    res.json({ success: true, workers });
  } catch (error) {
    console.error('❌ Error fetching workers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/workers/:id
// @desc    Get worker by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    res.json({ success: true, worker });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/workers/:id/approve
// @desc    Approve worker (admin only)
// @access  Admin
router.put('/:id/approve', async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    // Update user verification status
    await User.findByIdAndUpdate(worker.userId, { role: 'worker' });

    res.json({ success: true, worker });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/workers/:id/reject
// @desc    Reject worker (admin only)
// @access  Admin
router.delete('/:id/reject', async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (worker) {
      await User.findByIdAndDelete(worker.userId);
      await Worker.findByIdAndDelete(req.params.id);
    }
    res.json({ success: true, message: 'Worker rejected and deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/workers/:id/status
// @desc    Update worker online status
// @access  Worker
router.put('/:id/status', async (req, res) => {
  try {
    const { isOnline } = req.body;
    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      { isOnline },
      { new: true }
    );

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    res.json({ success: true, worker });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
