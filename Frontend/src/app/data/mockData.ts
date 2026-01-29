// Mock data for LabourHub application

export interface Worker {
  id: string;
  name: string;
  skill: string;
  rating: number;
  experience: number; // years
  distanceKm: number;
  phone: string;
  isVerified: boolean;
  isOnline: boolean;
  pricePerDay: number;
  image: string;
  completedJobs: number;
  languages: string[];
  address: string;
  aadhaarVerified: boolean;
  policeVerified: boolean;
}

export interface Booking {
  id: string;
  workerId: string;
  workerName: string;
  workerSkill: string;
  customerId: string;
  customerName: string;
  date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  amount: number;
  address: string;
  rating?: number;
  review?: string;
}

export interface Review {
  id: string;
  workerId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

export const mockWorkers: Worker[] = [];

export const mockBookings: Booking[] = [
  {
    id: 'B001',
    workerId: '1',
    workerName: 'Rajesh Kumar',
    workerSkill: 'Electrician',
    customerId: 'C001',
    customerName: 'Priya Mehta',
    date: '2026-01-25',
    status: 'confirmed',
    amount: 800,
    address: 'Flat 203, Vasant Vihar, Delhi',
  },
  {
    id: 'B002',
    workerId: '2',
    workerName: 'Suresh Patel',
    workerSkill: 'Plumber',
    customerId: 'C001',
    customerName: 'Priya Mehta',
    date: '2026-01-20',
    status: 'completed',
    amount: 700,
    address: 'Flat 203, Vasant Vihar, Delhi',
    rating: 5,
    review: 'Excellent work! Very professional and punctual.',
  },
  {
    id: 'B003',
    workerId: '3',
    workerName: 'Amit Singh',
    workerSkill: 'Carpenter',
    customerId: 'C002',
    customerName: 'Rahul Gupta',
    date: '2026-01-22',
    status: 'completed',
    amount: 900,
    address: 'House 45, Saket, Delhi',
    rating: 4,
    review: 'Good work, but arrived a bit late.',
  },
];

export const mockReviews: Review[] = [
  {
    id: 'R001',
    workerId: '1',
    customerName: 'Priya M.',
    rating: 5,
    comment: 'Excellent electrician! Fixed all issues quickly and professionally.',
    date: '2026-01-15',
  },
  {
    id: 'R002',
    workerId: '1',
    customerName: 'Rahul K.',
    rating: 5,
    comment: 'Highly recommended. Very skilled and honest person.',
    date: '2026-01-10',
  },
  {
    id: 'R003',
    workerId: '1',
    customerName: 'Anjali S.',
    rating: 4,
    comment: 'Good work overall. Slightly expensive but worth it.',
    date: '2026-01-05',
  },
  {
    id: 'R004',
    workerId: '2',
    customerName: 'Vikram P.',
    rating: 5,
    comment: 'Best plumber I have hired. Very reliable.',
    date: '2026-01-12',
  },
  {
    id: 'R005',
    workerId: '2',
    customerName: 'Neha G.',
    rating: 4,
    comment: 'Solved the problem efficiently. Will hire again.',
    date: '2026-01-08',
  },
];

export const skills = [
  'Electrician',
  'Plumber',
  'Carpenter',
  'Mason',
  'Painter',
  'AC Technician',
  'Tile Worker',
  'Welder',
];
