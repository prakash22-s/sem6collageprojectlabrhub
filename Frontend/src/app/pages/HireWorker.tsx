import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { useWorkers } from '@/app/context/WorkerContext';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';

export function HireWorker() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { approvedWorkers } = useWorkers();
  const worker = approvedWorkers.find((w) => w.id === id);
  const [date, setDate] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  if (!worker) {
    return <div>Worker not found</div>;
  }

  const handleBooking = () => {
    if (!user) {
      toast.error('Please login to book');
      navigate('/auth');
      return;
    }

    if (!date || !address) {
      toast.error('Please fill all required fields');
      return;
    }

    toast.success('Booking request sent!');
    setTimeout(() => {
      navigate('/customer/dashboard');
    }, 1000);
  };

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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Book {worker.name}</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <img src={worker.image} alt={worker.name} className="w-16 h-16 rounded-lg object-cover" />
            <div>
              <h3 className="font-semibold text-gray-900">{worker.name}</h3>
              <p className="text-gray-600">{worker.skill}</p>
              <p className="text-lg font-bold text-gray-900 mt-1">₹{worker.pricePerDay}/day</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <Label htmlFor="date">Select Date *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <Label htmlFor="address">Work Address *</Label>
            <Textarea
              id="address"
              placeholder="Enter complete address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any specific requirements..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Service Charge</span>
              <span className="font-semibold">₹{worker.pricePerDay}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>₹{worker.pricePerDay}</span>
            </div>
          </div>

          <Button onClick={handleBooking} className="w-full" size="lg">
            Confirm Booking
          </Button>
        </div>
      </div>
    </div>
  );
}
