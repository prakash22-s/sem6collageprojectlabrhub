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
    phone: '',
    skill: '',
    experience: '',
    pricePerDay: '',
    address: '',
    aadhaar: '',
    photo: null as File | null,
  });

  const handleSubmit = () => {
    // Validate all fields
    if (!formData.name || !formData.phone || !formData.skill || !formData.experience || !formData.pricePerDay || !formData.address) {
      toast.error('Please fill all required fields');
      return;
    }

    // Create worker object
    const newWorker = {
      id: `W${Date.now()}`,
      name: formData.name,
      skill: formData.skill,
      rating: 0,
      experience: parseInt(formData.experience),
      distanceKm: 0,
      phone: `+91 ${formData.phone}`,
      isVerified: false,
      isOnline: false,
      pricePerDay: parseInt(formData.pricePerDay),
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      completedJobs: 0,
      languages: ['Hindi'],
      address: formData.address,
      aadhaarVerified: false,
      policeVerified: false,
    };

    console.log('Adding worker:', newWorker);
    
    // Add worker to pending list
    addWorker(newWorker);
    
    // Log in the worker
    login({
      id: newWorker.id,
      name: newWorker.name,
      phone: newWorker.phone,
      role: 'worker',
      skill: newWorker.skill,
      isVerified: newWorker.isVerified,
    });
    
    toast.success('Registration successful! Redirecting to your dashboard...');
    
    // Redirect to worker dashboard
    setTimeout(() => {
      navigate('/worker/dashboard');
    }, 1500);
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
