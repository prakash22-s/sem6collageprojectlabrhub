# Complete Booking Flow Implementation

## Overview
This document describes the end-to-end booking flow implemented in the LabourHub application.

## Flow Summary

### 1. User Login → Show Only Active Workers
- **Location**: `WorkerListing.tsx`
- **Logic**: Filters workers by `isVerified: true` and `isOnline: true`
- **API**: `GET /api/workers` (already filters for verified+online workers)
- Workers must be approved by admin AND set themselves online to appear

### 2. Booking a Worker
- **Location**: `BookingPage.tsx` (NEW)
- **Route**: `/book/:workerId`
- **API**: `POST /api/bookings`
- **Payload**:
  ```json
  {
    "customerId": "user_id",
    "workerId": "worker_id",
    "customerName": "Customer Name",
    "workerName": "Worker Name",
    "workerSkill": "Skill",
    "date": "2024-01-25",
    "address": "Complete Address",
    "amount": 800,
    "status": "pending"
  }
  ```
- **Result**: Booking created with status "pending"

### 3. Customer Dashboard - Recent Bookings
- **Location**: `CustomerDashboard.tsx` (UPDATED)
- **API**: `GET /api/bookings/customer/:customerId`
- **Tabs**:
  - **Pending**: Shows bookings with status "pending" (waiting for worker acceptance)
  - **Active**: Shows bookings with status "confirmed" (worker accepted)
  - **Completed**: Shows bookings with status "completed"

### 4. Worker Accepts Job
- **Location**: `NewWorkerDashboard.tsx` (UPDATED)
- **API**: `PUT /api/bookings/:id/accept`
- **Logic**: Changes booking status from "pending" to "confirmed"
- **Worker Dashboard Tabs**:
  - **Available Jobs**: Shows pending bookings (status "pending")
  - **Active Jobs**: Shows confirmed bookings (status "confirmed")
  - **Earnings/Reviews/History**: Existing functionality

### 5. Job Completion & Rating
- **Location**: `CustomerDashboard.tsx` (UPDATED)
- **API**: `PUT /api/bookings/:id/rate`
- **Logic**: 
  - Customer can rate completed jobs (status "completed")
  - Rating is 1-5 stars
  - Updates worker's average rating automatically
  - Increments worker's completedJobs count

## Database Schema

### Booking Model
```javascript
{
  customerId: ObjectId (ref: User),
  workerId: ObjectId (ref: Worker),
  customerName: String,
  workerName: String,
  workerSkill: String,
  date: String,
  address: String,
  amount: Number,
  status: Enum ['pending', 'confirmed', 'completed', 'cancelled'],
  rating: Number (1-5),
  review: String,
  timestamps: true
}
```

## API Endpoints

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/customer/:customerId` - Get customer's bookings
- `GET /api/bookings/worker/:workerId` - Get worker's bookings
- `PUT /api/bookings/:id/accept` - Worker accepts booking (NEW)
- `PUT /api/bookings/:id/status` - Update booking status
- `PUT /api/bookings/:id/rate` - Submit rating and review

### Workers
- `GET /api/workers` - Get all verified+online workers
- `GET /api/workers/:id` - Get worker by ID
- `GET /api/workers/user/:userId` - Get worker by user ID (NEW)
- `PUT /api/workers/:id/status` - Update worker online status

## Frontend Components

### New Components
1. **BookingPage.tsx** - Worker booking form with date, address, and details

### Updated Components
1. **CustomerDashboard.tsx**
   - Fetches real bookings from API
   - Three tabs: Pending, Active, Completed
   - Inline rating functionality for completed jobs

2. **NewWorkerDashboard.tsx**
   - Fetches worker profile and bookings from API
   - Available Jobs tab shows pending bookings
   - Active Jobs tab shows confirmed bookings
   - Accept job functionality

3. **WorkerListing.tsx**
   - Shows only online workers
   - Updated hire button to use new booking route
   - Added User icon fallback for workers without images

## User Flow Example

1. **Customer logs in** → Redirected to `/workers`
2. **Sees only online workers** → Clicks "Hire Now" on a worker
3. **Booking form** → Fills date, address → Submits
4. **Booking created** → Status: "pending" → Appears in Customer's "Pending" tab
5. **Worker sees booking** → In "Available Jobs" tab → Clicks "Accept Job"
6. **Booking accepted** → Status: "confirmed" → Moves to Customer's "Active" tab and Worker's "Active Jobs" tab
7. **Job completed** → Admin/Worker marks as "completed" → Appears in Customer's "Completed" tab
8. **Customer rates** → Clicks "Rate" → Selects stars → Submits → Worker's rating updated

## Role-Based Behavior

### Customer
- Can view only online workers
- Can book workers
- Can view bookings in three states (pending, active, completed)
- Can rate completed jobs

### Worker
- Must be verified by admin to go online
- Can toggle online/offline status
- Can see pending job requests
- Can accept jobs
- Can view active jobs
- Can view earnings, reviews, and history

### Admin
- Can approve/reject workers
- Workers must be approved before going online
- Can view all bookings (future enhancement)

## Status Flow

```
pending → confirmed → completed
   ↓
cancelled (optional)
```

- **pending**: Customer booked, waiting for worker acceptance
- **confirmed**: Worker accepted, job in progress
- **completed**: Job finished, ready for rating
- **cancelled**: Job cancelled by either party (not implemented yet)
