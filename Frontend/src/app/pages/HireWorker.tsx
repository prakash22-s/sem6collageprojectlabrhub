import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';
import { apiUrl } from '@/app/lib/api';

export function HireWorker() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [worker, setWorker] = useState<any>(null);
  const [date, setDate] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(apiUrl(`/api/workers/${id}`))
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setWorker(data.worker);
      });
  }, [id]);

  const handleBooking = async () => {
    if (!user || user.role !== 'customer') {
      toast.error('Please login as customer');
      navigate('/auth');
      return;
    }
    if (!worker || !date || !address) {
      toast.error('Please fill all required fields');
      return;
    }

    const response = await fetch(apiUrl('/api/bookings'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: user.id,
        workerId: worker._id,
        customerName: user.name,
        workerName: worker.name,
        workerSkill: worker.skill,
        date,
        address,
        amount: worker.pricePerDay,
        status: 'pending',
        description: notes,
      }),
    });
    const data = await response.json();
    if (data.success) {
      toast.success('Booking request sent');
      navigate('/customer/dashboard');
    } else {
      toast.error(data.message || 'Failed to create booking');
    }
  };

  if (!worker) return <div className="min-h-screen flex items-center justify-center">Loading worker...</div>;

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
          <p className="font-semibold">{worker.skill}</p>
          <p className="text-lg font-bold mt-1">Rs {worker.pricePerDay}/day</p>
          <p className="text-sm text-gray-600">{worker.address}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <Label htmlFor="date">Select Date *</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
          </div>
          <div>
            <Label htmlFor="address">Work Address *</Label>
            <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} rows={3} />
          </div>
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
          <Button onClick={handleBooking} className="w-full" size="lg">
            Confirm Booking
          </Button>
        </div>
      </div>
    </div>
  );
}
