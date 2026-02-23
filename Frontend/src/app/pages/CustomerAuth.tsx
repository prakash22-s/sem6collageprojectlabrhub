import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';

export function CustomerAuth() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = 'http://localhost:5000/api/auth';

  const handleLogin = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Login failed');
        return;
      }

      console.log('Login response:', data);
      localStorage.setItem('token', data.token);
      
      // Use the role from backend response
      const userRole = data.user.role;
      
      login({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: '',
        role: userRole,
        skill: data.worker?.skill,
        isVerified: data.worker?.isVerified,
      });
      
      toast.success('Login successful!');
      
      // Role-based redirection
      if (userRole === 'worker') {
        navigate('/worker/dashboard');
      } else if (userRole === 'customer') {
        navigate('/workers');
      } else if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/workers');
      }
    } catch (error) {
      toast.error('Failed to connect to server. Make sure backend is running.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role: 'customer' }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Registration failed');
        return;
      }

      localStorage.setItem('token', data.token);
      login({
        id: data.user.id,
        name: data.user.name,
        phone: '',
        role: 'customer',
      });
      toast.success('Registration successful!');
      navigate('/workers');
    } catch (error) {
      toast.error('Failed to connect to server. Make sure backend is running.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative" style={{backgroundImage: 'url(https://as1.ftcdn.net/v2/jpg/06/99/03/42/1000_F_699034283_p567iQuz3FXu930InT3TysoVZNMeLi9Y.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-white/85 backdrop-blur-sm"></div>
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm relative z-20">
        <div className="max-w-md mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-20">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {step === 'login' ? 'Login to LabourHub' : 'Create Account'}
              </h2>
              <p className="text-gray-600">
                {step === 'login'
                  ? 'Enter your credentials to continue'
                  : 'Sign up to get started'}
              </p>
            </div>

            <div className="space-y-6">
              {step === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                onClick={step === 'login' ? handleLogin : handleRegister}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Loading...' : step === 'login' ? 'Login' : 'Register'}
              </Button>

              <div className="text-center">
                <button
                  onClick={() => {
                    setStep(step === 'login' ? 'register' : 'login');
                    setEmail('');
                    setPassword('');
                    setName('');
                  }}
                  className="text-sm text-blue-600 hover:underline"
                  disabled={isLoading}
                >
                  {step === 'login' ? "Don't have an account? Register" : 'Already have an account? Login'}
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            By continuing, you agree to our Terms & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
