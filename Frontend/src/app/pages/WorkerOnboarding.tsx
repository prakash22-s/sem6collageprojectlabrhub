import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Check, Upload } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { useAuth } from '@/app/context/AuthContext';
import { skills } from '@/app/data/mockData';
import { toast } from 'sonner';
import { apiUrl } from '@/app/lib/api';

type FormValues = {
  name: string;
  email: string;
  password: string;
  phone: string;
  skill: string;
  experience: string;
  pricePerDay: string;
  address: string;
  aadhaar: string;
  photo: File | null;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const stepFieldMap: Record<number, (keyof FormValues)[]> = {
  1: ['name', 'email', 'password', 'phone', 'address'],
  2: ['skill', 'experience', 'pricePerDay'],
  3: ['aadhaar', 'photo'],
};

const allFields: (keyof FormValues)[] = [
  'name',
  'email',
  'password',
  'phone',
  'skill',
  'experience',
  'pricePerDay',
  'address',
  'aadhaar',
  'photo',
];

export function WorkerOnboarding() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormValues>({
    name: '',
    email: '',
    password: '',
    phone: '',
    skill: '',
    experience: '',
    pricePerDay: '',
    address: '',
    aadhaar: '',
    photo: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!formData.photo) {
      setPhotoPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(formData.photo);
    setPhotoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [formData.photo]);

  const isEmpty = (value: string | File | null) => {
    if (value === null) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    return false;
  };

  const sanitizeAadhaar = (value: string) => value.replace(/\D/g, '').slice(0, 12);
  const sanitizePhone = (value: string) => value.replace(/\D/g, '').slice(0, 10);

  const validateFields = (fields: (keyof FormValues)[]) => {
    const nextErrors: FormErrors = {};

    fields.forEach((field) => {
      if (field === 'aadhaar') {
        const aadhaar = sanitizeAadhaar(String(formData.aadhaar));
        if (aadhaar.length === 0) {
          nextErrors.aadhaar = 'This field is required';
        } else if (aadhaar.length < 12) {
          nextErrors.aadhaar = 'Aadhaar number must be exactly 12 digits';
        }
        return;
      }

      if (field === 'phone') {
        const phone = sanitizePhone(String(formData.phone));
        if (phone.length === 0) {
          nextErrors.phone = 'This field is required';
        } else if (phone.length < 10) {
          nextErrors.phone = 'Mobile number must be exactly 10 digits';
        }
        return;
      }

      if (isEmpty(formData[field])) {
        nextErrors[field] = 'This field is required';
      }
    });

    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const updateField = (field: keyof FormValues, value: string | File | null) => {
    if (field === 'aadhaar' && typeof value === 'string') {
      const aadhaar = sanitizeAadhaar(value);
      setFormData((prev) => ({ ...prev, aadhaar }));

      if (aadhaar.length === 0) {
        setErrors((prev) => ({ ...prev, aadhaar: '' }));
      } else if (aadhaar.length < 12) {
        setErrors((prev) => ({ ...prev, aadhaar: 'Aadhaar number must be exactly 12 digits' }));
      } else {
        setErrors((prev) => ({ ...prev, aadhaar: '' }));
      }
      return;
    }

    if (field === 'phone' && typeof value === 'string') {
      const phone = sanitizePhone(value);
      setFormData((prev) => ({ ...prev, phone }));

      if (phone.length === 0) {
        setErrors((prev) => ({ ...prev, phone: '' }));
      } else if (phone.length < 10) {
        setErrors((prev) => ({ ...prev, phone: 'Mobile number must be exactly 10 digits' }));
      } else {
        setErrors((prev) => ({ ...prev, phone: '' }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (!isEmpty(value)) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleNext = () => {
    const isStepValid = validateFields(stepFieldMap[step]);
    if (!isStepValid) return;
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const canSubmit = useMemo(() => {
    return allFields.every((field) => {
      if (field === 'aadhaar') return sanitizeAadhaar(formData.aadhaar).length === 12;
      if (field === 'phone') return sanitizePhone(formData.phone).length === 10;
      return !isEmpty(formData[field]);
    });
  }, [formData]);

  const onSubmit = async () => {
    const isValid = validateFields(allFields);
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        phone: formData.phone.trim(),
        skill: formData.skill.trim(),
        experience: formData.experience.trim(),
        pricePerDay: formData.pricePerDay.trim(),
        address: formData.address.trim(),
        aadhaar: formData.aadhaar.trim(),
      };

      const form = new FormData();
      Object.entries(payload).forEach(([key, value]) => form.append(key, value));
      if (formData.photo) {
        form.append('photo', formData.photo);
      }

      if (navigator.geolocation) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              form.append('lat', String(pos.coords.latitude));
              form.append('lng', String(pos.coords.longitude));
              resolve();
            },
            () => resolve(),
            { enableHighAccuracy: true, timeout: 4000 }
          );
        });
      }

      const response = await fetch(apiUrl('/api/workers/register'), {
        method: 'POST',
        body: form,
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        toast.error('Server returned invalid response. Please check if backend is running.');
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || 'Registration failed');
        return;
      }

      const loginResponse = await fetch(apiUrl('/api/auth/worker/login'), {
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
      if (loginResponse.ok) {
        localStorage.setItem('token', loginData.token);

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
        setTimeout(() => navigate('/worker/dashboard'), 1500);
      } else {
        toast.error(loginData.message || 'Login failed after registration');
      }
    } catch {
      toast.error('Failed to connect to server. Please ensure backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage:
          'url(https://as1.ftcdn.net/v2/jpg/06/99/03/42/1000_F_699034283_p567iQuz3FXu930InT3TysoVZNMeLi9Y.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

      <header className="bg-white/95 backdrop-blur-sm shadow-sm relative z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button size="sm" onClick={() => navigate('/auth')} className="bg-blue-600 hover:bg-blue-700">
            Already Registered? Login
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 relative z-20">
        <div className="mb-10">
          <div className="relative px-1">
            <div className="absolute top-5 left-6 right-6 h-1 bg-gray-200 rounded-full" />
            <div
              className="absolute top-5 left-6 h-1 bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `calc((100% - 3rem) * ${(step - 1) / 2})` }}
            />

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 1, label: 'Basic Info' },
                { id: 2, label: 'Professional' },
                { id: 3, label: 'Verification' },
              ].map((item) => (
                <div key={item.id} className="flex flex-col items-center text-center">
                  <div
                    className={`z-10 h-10 w-10 rounded-full flex items-center justify-center font-semibold border-2 transition-all duration-300 ${
                      step > item.id
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : step === item.id
                          ? 'bg-white border-blue-600 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {step > item.id ? <Check className="h-5 w-5" /> : item.id}
                  </div>
                  <span
                    className={`mt-3 text-xs sm:text-sm transition-colors ${
                      step >= item.id ? 'text-blue-700 font-semibold' : 'text-gray-500'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {step === 1 && 'Basic Information'}
            {step === 2 && 'Professional Details'}
            {step === 3 && 'Verification Documents'}
          </h2>

          {step === 1 && (
            <div className="space-y-4 transition-all duration-300">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
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
                <p className="text-sm text-gray-500 mt-1">You will use this email to login</p>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
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
                <p className="text-sm text-gray-500 mt-1">Minimum 6 characters</p>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
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
                    placeholder="Enter 10 digit mobile number"
                    inputMode="numeric"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
                </div>
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>

              <div>
                <Label htmlFor="address">Complete Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your full address"
                  rows={3}
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                />
                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 transition-all duration-300">
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
                {errors.skill && <p className="mt-1 text-sm text-red-600">{errors.skill}</p>}
              </div>

              <div>
                <Label htmlFor="experience">Years of Experience *</Label>
                <Input
                  id="experience"
                  type="text"
                  placeholder="e.g., 5"
                  value={formData.experience}
                  onChange={(e) => updateField('experience', e.target.value)}
                />
                {errors.experience && <p className="mt-1 text-sm text-red-600">{errors.experience}</p>}
              </div>

              <div>
                <Label htmlFor="price">Expected Price Per Day (Rs) *</Label>
                <Input
                  id="price"
                  type="text"
                  placeholder="e.g., 800"
                  value={formData.pricePerDay}
                  onChange={(e) => updateField('pricePerDay', e.target.value)}
                />
                {errors.pricePerDay && <p className="mt-1 text-sm text-red-600">{errors.pricePerDay}</p>}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 transition-all duration-300">
              <div>
                <Label htmlFor="aadhaar">Aadhaar Number *</Label>
                <Input
                  id="aadhaar"
                  type="text"
                  placeholder="Enter Aadhaar number"
                  inputMode="numeric"
                  maxLength={12}
                  value={formData.aadhaar}
                  onChange={(e) => updateField('aadhaar', e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">Your Aadhaar will be verified securely</p>
                {errors.aadhaar && <p className="mt-1 text-sm text-red-600">{errors.aadhaar}</p>}
              </div>

              <div>
                <Label htmlFor="photo">Profile Photo *</Label>
                <label
                  htmlFor="photo"
                  className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
                >
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload photo</p>
                  <p className="text-xs text-gray-500 mt-1">Accepts JPG and PNG. Clear face photo required.</p>
                </label>
                <input
                  id="photo"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    updateField('photo', file);
                    if (file) toast.success('Photo uploaded');
                  }}
                />
                {photoPreview && (
                  <div className="mt-3">
                    <img
                      src={photoPreview}
                      alt="Profile preview"
                      className="h-28 w-28 rounded-lg object-cover border border-gray-300"
                    />
                  </div>
                )}
                {errors.photo && <p className="mt-1 text-sm text-red-600">{errors.photo}</p>}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>- Your application will be reviewed within 24-48 hours</li>
                  <li>- You will receive an OTP for verification</li>
                  <li>- Once approved, you can start receiving job requests</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((prev) => prev - 1)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Previous
              </Button>
            )}
            {step < 3 ? (
              <Button type="button" onClick={handleNext} className="flex-1">
                Next
              </Button>
            ) : (
              <Button type="button" className="flex-1" disabled={!canSubmit || isSubmitting} onClick={onSubmit}>
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
