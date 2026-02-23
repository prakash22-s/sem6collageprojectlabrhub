import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Upload, CheckCircle2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { useAuth } from '@/app/context/AuthContext';
import { useWorkers } from '@/app/context/WorkerContext';
import { skills } from '@/app/data/mockData';
import { toast } from 'sonner';

export function WorkerOnboarding() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addWorker } = useWorkers();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    skill: '',
    experience: '',
    pricePerDay: '',
    address: '',
    aadhaar: '',
    photo: null as File | null,
  });

  const handleSubmit = async () => {
    // Validate all fields
    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.skill || !formData.experience || !formData.pricePerDay || !formData.address) {
      toast.error('Please fill all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        skill: formData.skill,
        experience: parseInt(formData.experience),
        pricePerDay: parseInt(formData.pricePerDay),
        address: formData.address,
        aadhaar: formData.aadhaar || '',
      };

      console.log('Sending registration request:', { ...payload, password: '***' });

      // Register worker via API
      const response = await fetch('http://localhost:5000/api/workers/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        toast.error('Server returned invalid response. Please check if backend is running.');
        return;
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        toast.error(data.message || 'Registration failed');
        return;
      }

      // Login the worker
      console.log('Attempting worker login...');
      const loginResponse = await fetch('http://localhost:5000/api/auth/worker/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const loginData = await loginResponse.json();
      console.log('Login response:', loginData);

      if (loginResponse.ok) {
        // Store token
        localStorage.setItem('token', loginData.token);
        
        // Log in the worker using context
        login({
          id: loginData.user.id,
          name: loginData.user.name,
          email: loginData.user.email,
          phone: formData.phone,
          role: 'worker',
          skill: formData.skill,
          isVerified: loginData.worker?.isVerified || false,
        });

        toast.success('Registration successful! Redirecting to your dashboard...');

        // Redirect to worker dashboard
        setTimeout(() => {
          navigate('/worker/dashboard');
        }, 1500);
      } else {
        toast.error(loginData.message || 'Login failed after registration');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to connect to server. Please ensure backend is running on http://localhost:5000');
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen relative" style={{backgroundImage: 'url(https://as1.ftcdn.net/v2/jpg/06/99/03/42/1000_F_699034283_p567iQuz3FXu930InT3TysoVZNMeLi9Y.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm relative z-20">
        <div className="max-w-3xl mx-auto px-4 py-4">
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
      <div className="max-w-3xl mx-auto px-4 py-8 relative z-20">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= num
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > num ? <CheckCircle2 className="h-6 w-6" /> : num}
                </div>
                {num < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > num ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm">
            <span className={step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
              Basic Info
            </span>
            <span className={step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
              Professional
            </span>
            <span className={step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
              Verification
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {step === 1 && 'Basic Information'}
            {step === 2 && 'Professional Details'}
            {step === 3 && 'Verification Documents'}
          </h2>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  You'll use this email to login
                </p>
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum 6 characters
                </p>
              </div>

              <div>
                <Label htmlFor="phone">Mobile Number *</Label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center bg-gray-100 px-4 rounded-lg">
                    <span className="text-gray-700 font-medium">+91</span>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter 10-digit number"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Complete Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your full address"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 2: Professional Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="skill">Primary Skill *</Label>
                <Select value={formData.skill} onValueChange={(value) => updateField('skill', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {skills.map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="experience">Years of Experience *</Label>
                <Input
                  id="experience"
                  type="number"
                  placeholder="e.g., 5"
                  value={formData.experience}
                  onChange={(e) => updateField('experience', e.target.value)}
                  min="0"
                  max="50"
                />
              </div>

              <div>
                <Label htmlFor="price">Expected Price Per Day (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g., 800"
                  value={formData.pricePerDay}
                  onChange={(e) => updateField('pricePerDay', e.target.value)}
                  min="0"
                />
              </div>
            </div>
          )}

          {/* Step 3: Verification */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="aadhaar">Aadhaar Number *</Label>
                <Input
                  id="aadhaar"
                  type="text"
                  placeholder="XXXX-XXXX-XXXX"
                  value={formData.aadhaar}
                  onChange={(e) => updateField('aadhaar', e.target.value)}
                  maxLength={14}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Your Aadhaar will be verified securely
                </p>
              </div>

              <div>
                <Label htmlFor="photo">Profile Photo *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload photo</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Clear face photo required for verification
                  </p>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setFormData(prev => ({ ...prev, photo: e.target.files![0] }));
                        toast.success('Photo uploaded');
                      }
                    }}
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  📋 What happens next?
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your application will be reviewed within 24-48 hours</li>
                  <li>• You'll receive an OTP for verification</li>
                  <li>• Once approved, you can start receiving job requests</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Previous
              </Button>
            )}
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                className="flex-1"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="flex-1"
              >
                Submit Application
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
