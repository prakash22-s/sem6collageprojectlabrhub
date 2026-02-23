import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Calendar, MapPin, User as UserIcon } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent } from '@/app/components/ui/card';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';

export function BookingPage() {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    address: '',
    description: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      navigate('/auth');
      return;
    }
    fetchWorker();
  }, [workerId]);

  const fetchWorker = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/workers/${workerId}`);
      const data = await response.json();
      if (data.success) {
        setWorker(data.worker);
      }
    } catch (error) {
      console.error('Failed to fetch worker:', error);
      toast.error('Failed to load worker details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.address) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const booking = {
        customerId: user.id,
        workerId: worker._id,
        customerName: user.name,
        workerName: worker.name,
        workerSkill: worker.skill,
        date: formData.date,
        address: formData.address,
        amount: worker.pricePerDay,
        status: 'pending',
      };

      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Booking created successfully!');
        navigate('/customer/dashboard');
      } else {
        toast.error(data.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Worker not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Book Worker</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Worker Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                {worker.image && worker.image !== '' ? (
                  <img src={worker.image} alt={worker.name} className="w-16 h-16 rounded-lg object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-gray-500" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg">{worker.name}</h3>
                  <p className="text-gray-600">{worker.skill}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-medium">{worker.experience} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per day:</span>
                  <span className="font-medium text-green-600">₹{worker.pricePerDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed Jobs:</span>
                  <span className="font-medium">{worker.completedJobs}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your complete address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Additional Details (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Any specific requirements or instructions"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 font-medium">Total Amount: ₹{worker.pricePerDay}</p>
                  <p className="text-xs text-blue-700 mt-1">Payment will be collected after job completion</p>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Creating Booking...' : 'Confirm Booking'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
