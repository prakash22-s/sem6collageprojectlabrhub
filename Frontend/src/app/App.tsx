import { RouterProvider } from 'react-router';
import { AuthProvider } from '@/app/context/AuthContext';
import { Toaster } from '@/app/components/ui/sonner';
import { router } from '@/app/routes';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </AuthProvider>
  );
}
