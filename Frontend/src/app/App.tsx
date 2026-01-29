import { RouterProvider } from 'react-router';
import { AuthProvider } from '@/app/context/AuthContext';
import { WorkerProvider } from '@/app/context/WorkerContext';
import { Toaster } from '@/app/components/ui/sonner';
import { router } from '@/app/routes';

export default function App() {
  return (
    <AuthProvider>
      <WorkerProvider>
        <RouterProvider router={router} />
        <Toaster position="top-center" richColors />
      </WorkerProvider>
    </AuthProvider>
  );
}
