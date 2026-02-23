import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    skill: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
      required: true,
    },
    pricePerDay: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    aadhaar: {
      type: String,
    },
    rating: {
      type: Number,
      default: 0,
    },
    completedJobs: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: '',
    },
    languages: {
      type: [String],
      default: ['Hindi'],
    },
    aadhaarVerified: {
      type: Boolean,
      default: false,
    },
    policeVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Worker = mongoose.model('Worker', workerSchema);

export default Worker;
