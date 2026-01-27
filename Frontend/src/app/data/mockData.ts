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

export const mockWorkers: Worker[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    skill: 'Electrician',
    rating: 4.8,
    experience: 8,
    distanceKm: 2.3,
    phone: '+91 98765 43210',
    isVerified: true,
    isOnline: true,
    pricePerDay: 800,
    image: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca44',
    completedJobs: 156,
    languages: ['Hindi', 'English'],
    address: 'Saket, New Delhi',
    aadhaarVerified: true,
    policeVerified: true,
  },
  {
    id: '2',
    name: 'Suresh Patel',
    skill: 'Plumber',
    rating: 4.6,
    experience: 5,
    distanceKm: 1.8,
    phone: '+91 98765 43211',
    isVerified: true,
    isOnline: true,
    pricePerDay: 700,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    completedJobs: 89,
    languages: ['Hindi', 'Gujarati'],
    address: 'Malviya Nagar, New Delhi',
    aadhaarVerified: true,
    policeVerified: false,
  },
  {
    id: '3',
    name: 'Amit Singh',
    skill: 'Carpenter',
    rating: 4.9,
    experience: 12,
    distanceKm: 3.5,
    phone: '+91 98765 43212',
    isVerified: true,
    isOnline: false,
    pricePerDay: 900,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
    completedJobs: 234,
    languages: ['Hindi', 'Punjabi', 'English'],
    address: 'Hauz Khas, New Delhi',
    aadhaarVerified: true,
    policeVerified: true,
  },
  {
    id: '4',
    name: 'Ravi Sharma',
    skill: 'Mason',
    rating: 4.5,
    experience: 10,
    distanceKm: 4.2,
    phone: '+91 98765 43213',
    isVerified: true,
    isOnline: true,
    pricePerDay: 850,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    completedJobs: 178,
    languages: ['Hindi'],
    address: 'Lajpat Nagar, New Delhi',
    aadhaarVerified: true,
    policeVerified: true,
  },
  {
    id: '5',
    name: 'Mohan Verma',
    skill: 'Painter',
    rating: 4.7,
    experience: 6,
    distanceKm: 2.9,
    phone: '+91 98765 43214',
    isVerified: true,
    isOnline: true,
    pricePerDay: 750,
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
    completedJobs: 112,
    languages: ['Hindi', 'English'],
    address: 'Green Park, New Delhi',
    aadhaarVerified: true,
    policeVerified: false,
  },
  {
    id: '6',
    name: 'Vijay Yadav',
    skill: 'Electrician',
    rating: 4.4,
    experience: 4,
    distanceKm: 5.1,
    phone: '+91 98765 43215',
    isVerified: false,
    isOnline: true,
    pricePerDay: 650,
    image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12',
    completedJobs: 45,
    languages: ['Hindi'],
    address: 'Dwarka, New Delhi',
    aadhaarVerified: true,
    policeVerified: false,
  },
];

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
