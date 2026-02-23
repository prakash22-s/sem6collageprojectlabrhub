import express from 'express';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret_key', {
    expiresIn: '7d',
  });
};
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Validate role if provided
    const validRoles = ['user', 'customer', 'worker', 'admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ 
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user with default role 'customer' if not provided
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer',
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: error.message || 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/login
// @desc    Universal login for all users (detects role automatically)
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('User found with role:', user.role);

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Prepare response based on role
    const response = {
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };

    // If user is a worker, fetch worker profile
    if (user.role === 'worker') {
      const worker = await Worker.findOne({ userId: user._id });
      if (worker) {
        response.worker = {
          id: worker._id,
          skill: worker.skill,
          isVerified: worker.isVerified,
          isOnline: worker.isOnline,
        };
      }
    }

    console.log('Login successful for role:', user.role);
    res.status(200).json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: error.message || 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;


// @route   POST /api/auth/worker/login
// @desc    Worker login with email
// @access  Public
router.post('/worker/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user with worker role
    const user = await User.findOne({ email, role: 'worker' });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials or not a worker account' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get worker profile
    const worker = await Worker.findOne({ userId: user._id });

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      worker: worker ? {
        id: worker._id,
        skill: worker.skill,
        isVerified: worker.isVerified,
        isOnline: worker.isOnline,
      } : null,
    });
  } catch (error) {
    console.error('Worker login error:', error);
    res.status(500).json({ 
      message: error.message || 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
