import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, CheckCircle2, MapPin, MessageCircle, Phone, Star, User } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { apiUrl } from '@/app/lib/api';

export function WorkerProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [worker, setWorker] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [tracking, setTracking] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    fetchWorker();
    fetchReviews();
    fetchTracking();
    const timer = setInterval(fetchTracking, 15000);
    return () => clearInterval(timer);
  }, [id]);

  async function fetchWorker() {
    const response = await fetch(apiUrl(`/api/workers/${id}`));
    const data = await response.json();
    if (data.success) setWorker(data.worker);
  }

  async function fetchReviews() {
    const response = await fetch(apiUrl(`/api/bookings/worker/${id}`));
    const data = await response.json();
    if (data.success) {
      setReviews(data.bookings.filter((b: any) => b.rating && b.review));
    }
  }

  async function fetchTracking() {
    const response = await fetch(apiUrl(`/api/workers/${id}/tracking`));
    const data = await response.json();
    if (data.success) setTracking(data.worker);
  }

  if (!worker) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Worker not found
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

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex gap-4 mb-6">
            {worker.image ? (
              <img src={apiUrl(worker.image)} alt={worker.name} className="w-24 h-24 rounded-lg object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center">
                <User className="h-10 w-10 text-gray-500" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{worker.name}</h1>
                {worker.isVerified && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
              </div>
              <p className="text-gray-600 mb-2">{worker.skill}</p>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {worker.rating || 0}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {worker.address}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Experience</p>
              <p className="text-xl font-bold">{worker.experience} years</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Price</p>
              <p className="text-xl font-bold">Rs {worker.pricePerDay}/day</p>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            {worker.aadhaarVerified && <Badge variant="secondary">Aadhaar Verified</Badge>}
            {worker.policeVerified && <Badge variant="secondary">Police Verified</Badge>}
            {worker.isOnline && <Badge>Online</Badge>}
          </div>
          {tracking?.location?.lat != null && tracking?.location?.lng != null && (
            <p className="text-sm text-gray-600 mb-3">
              Live location: {tracking.location.lat.toFixed(5)}, {tracking.location.lng.toFixed(5)}
            </p>
          )}

          <Separator className="my-4" />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => (window.location.href = `tel:${worker.phone}`)}>
              <Phone className="h-4 w-4 mr-1" />
              Call
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => window.open(`https://wa.me/${String(worker.phone).replace(/\D/g, '')}`, '_blank')}>
              <MessageCircle className="h-4 w-4 mr-1" />
              WhatsApp
            </Button>
            <Button className="flex-1" onClick={() => navigate(`/hire/${worker._id}`)}>
              Hire
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Reviews ({reviews.length})</h2>
          {reviews.length === 0 && <p className="text-gray-600">No reviews yet</p>}
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-gray-100 pb-3 last:border-b-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold">{review.customerName}</p>
                  <span className="text-sm flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {review.rating}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{review.review}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
