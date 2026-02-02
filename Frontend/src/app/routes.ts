import { createBrowserRouter } from 'react-router';
import { Landing } from '@/app/pages/Landing';
import { CustomerAuth } from '@/app/pages/CustomerAuth';
import { WorkerOnboarding } from '@/app/pages/WorkerOnboarding';
import { WorkerListing } from '@/app/pages/WorkerListing';
import { WorkerProfile } from '@/app/pages/WorkerProfile';
import { HireWorker } from '@/app/pages/HireWorker';
import { CustomerDashboard } from '@/app/pages/CustomerDashboard';
import { RatingFeedback } from '@/app/pages/RatingFeedback';
import { NewWorkerDashboard } from '@/app/pages/NewWorkerDashboard';
import { AdminLogin } from '@/app/pages/AdminLogin';
import { AdminVerification } from '@/app/pages/AdminVerification';
import { AdminDashboard } from '@/app/pages/AdminDashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Landing,
  },
  {
    path: '/auth',
    Component: CustomerAuth,
  },
  {
    path: '/worker/onboard',
    Component: WorkerOnboarding,
  },
  {
    path: '/workers',
    Component: WorkerListing,
  },
  {
    path: '/worker/:id',
    Component: WorkerProfile,
  },
  {
    path: '/hire/:id',
    Component: HireWorker,
  },
  {
    path: '/customer/dashboard',
    Component: CustomerDashboard,
  },
  {
    path: '/rating/:bookingId',
    Component: RatingFeedback,
  },
  {
    path: '/worker/dashboard',
    Component: NewWorkerDashboard,
  },
  {
    path: '/admin/login',
    Component: AdminLogin,
  },
  {
    path: '/admin/verification',
    Component: AdminVerification,
  },
  {
    path: '/admin',
    Component: AdminDashboard,
  },
]);
