import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Worker } from '@/app/data/mockData';

interface WorkerContextType {
  workers: Worker[];
  pendingWorkers: Worker[];
  approvedWorkers: Worker[];
  addWorker: (worker: Worker) => void;
  approveWorker: (workerId: string) => void;
  rejectWorker: (workerId: string) => void;
}

const WorkerContext = createContext<WorkerContextType | undefined>(undefined);

// Sample pending workers for testing
const samplePendingWorkers: Worker[] = [
  {
    id: 'W1',
    name: 'Rajesh Kumar',
    skill: 'Electrician',
    rating: 0,
    experience: 5,
    distanceKm: 2.5,
    phone: '+91 9876543210',
    isVerified: false,
    isOnline: true,
    pricePerDay: 800,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    completedJobs: 0,
    languages: ['Hindi', 'English'],
    address: 'Saket, New Delhi',
    aadhaarVerified: true,
    policeVerified: false,
  },
  {
    id: 'W2',
    name: 'Suresh Patel',
    skill: 'Plumber',
    rating: 0,
    experience: 3,
    distanceKm: 1.8,
    phone: '+91 9876543211',
    isVerified: false,
    isOnline: true,
    pricePerDay: 700,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    completedJobs: 0,
    languages: ['Hindi', 'Gujarati'],
    address: 'Malviya Nagar, New Delhi',
    aadhaarVerified: true,
    policeVerified: false,
  },
];

export function WorkerProvider({ children }: { children: ReactNode }) {
  const [workers, setWorkers] = useState<Worker[]>(() => {
    const saved = localStorage.getItem('labourHub_workers');
    return saved ? JSON.parse(saved) : samplePendingWorkers;
  });

  useEffect(() => {
    localStorage.setItem('labourHub_workers', JSON.stringify(workers));
  }, [workers]);

  const pendingWorkers = workers.filter(w => !w.isVerified);
  const approvedWorkers = workers.filter(w => w.isVerified);

  const addWorker = (worker: Worker) => {
    console.log('WorkerContext: Adding worker', worker);
    setWorkers(prev => {
      const newWorkers = [...prev, { ...worker, isVerified: false }];
      console.log('WorkerContext: Updated workers list', newWorkers);
      return newWorkers;
    });
  };

  const approveWorker = (workerId: string) => {
    setWorkers(prev => 
      prev.map(w => w.id === workerId ? { ...w, isVerified: true } : w)
    );
  };

  const rejectWorker = (workerId: string) => {
    setWorkers(prev => prev.filter(w => w.id !== workerId));
  };

  return (
    <WorkerContext.Provider value={{
      workers,
      pendingWorkers,
      approvedWorkers,
      addWorker,
      approveWorker,
      rejectWorker,
    }}>
      {children}
    </WorkerContext.Provider>
  );
}

export function useWorkers() {
  const context = useContext(WorkerContext);
  if (context === undefined) {
    throw new Error('useWorkers must be used within a WorkerProvider');
  }
  return context;
}