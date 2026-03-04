import express from 'express';
import Worker from '../models/Worker.js';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { sendSMSAlert } from '../utils/alerts.js';

const router = express.Router();
const uploadDir = path.resolve('backend', 'uploads', 'workers');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    cb(null, `worker-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// @route   POST /api/workers/register
// @desc    Register a new worker
// @access  Public
router.post('/register', upload.single('photo'), async (req, res) => {
  try {
    console.log('Worker registration request received:', req.body);
    
    const { name, email, password, phone, skill, experience, pricePerDay, address, aadhaar, lat, lng } = req.body;
    const image = req.file ? `/uploads/workers/${req.file.filename}` : '';

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
      image,
      onboardingMode: 'online',
      location:
        lat && lng
          ? {
              lat: parseFloat(lat),
              lng: parseFloat(lng),
              updatedAt: new Date(),
            }
          : undefined,
    });
    console.log('Worker created:', worker._id);

    await sendSMSAlert(
      phone,
      `LabourHub: Hi ${name}, your onboarding request was received. We will review and verify your profile soon.`
    );

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

// @route   POST /api/workers/offline-register
// @desc    Offline worker onboarding by support/admin agent
// @access  Public
router.post('/offline-register', async (req, res) => {
  try {
    const {
      name,
      phone,
      skill,
      experience,
      pricePerDay,
      address,
      aadhaar,
      preferredLanguage,
    } = req.body;

    if (!name || !phone || !skill || !experience || !pricePerDay || !address) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields for offline onboarding',
      });
    }

    const syntheticEmail = `offline.${phone}.${Date.now()}@labourhub.local`;
    const syntheticPassword = `offline_${Math.random().toString(36).slice(2, 10)}`;

    const user = await User.create({
      name,
      email: syntheticEmail,
      password: syntheticPassword,
      role: 'worker',
    });

    const worker = await Worker.create({
      userId: user._id,
      name,
      email: syntheticEmail,
      phone,
      skill,
      experience: parseInt(experience),
      pricePerDay: parseInt(pricePerDay),
      address,
      aadhaar: aadhaar || '',
      onboardingMode: 'offline',
      languages: preferredLanguage ? [preferredLanguage] : ['Hindi'],
      isOnline: false,
      isVerified: false,
    });

    await sendSMSAlert(
      phone,
      `LabourHub: ${name}, your offline onboarding is created. You will receive SMS updates after verification.`
    );

    res.status(201).json({
      success: true,
      message: 'Offline onboarding submitted',
      worker,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

// @route   GET /api/workers/nearby
// @desc    Get nearby verified workers using coordinates
// @access  Public
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radiusKm = 10, skill } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'lat and lng query params are required',
      });
    }

    const originLat = parseFloat(lat);
    const originLng = parseFloat(lng);
    const maxRadius = parseFloat(radiusKm);

    const query = { isVerified: true };
    if (skill) query.skill = skill;

    const workers = await Worker.find(query);

    const withDistance = workers
      .map((worker) => {
        if (worker.location?.lat == null || worker.location?.lng == null) return null;
        const distanceKm = calculateDistanceKm(
          originLat,
          originLng,
          worker.location.lat,
          worker.location.lng
        );
        return { ...worker.toObject(), distanceKm: Number(distanceKm.toFixed(1)) };
      })
      .filter(Boolean)
      .filter((worker) => worker.distanceKm <= maxRadius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({ success: true, workers: withDistance });
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

// @route   GET /api/workers/:id/tracking
// @desc    Get latest worker location for live tracking
// @access  Public
router.get('/:id/tracking', async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id).select('name isOnline location');
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    res.json({ success: true, worker });
  } catch (error) {
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
    await sendSMSAlert(
      worker.phone,
      `LabourHub: Congratulations ${worker.name}, your profile is verified. You can now go online and accept jobs.`
    );

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

// @route   PUT /api/workers/:id/location
// @desc    Update worker live location
// @access  Worker
router.put('/:id/location', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'lat and lng must be numbers',
      });
    }

    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      {
        location: { lat, lng, updatedAt: new Date() },
      },
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

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default router;
