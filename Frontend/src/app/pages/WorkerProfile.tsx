import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Star, MapPin, Phone, Shield, CheckCircle2, MessageCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { useWorkers } from '@/app/context/WorkerContext';
import { mockReviews } from '@/app/data/mockData';

export function WorkerProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { approvedWorkers } = useWorkers();
  const worker = approvedWorkers.find((w) => w.id === id);
  const reviews = mockReviews.filter((r) => r.workerId === id);

  if (!worker) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Worker not found</p>
      </div>
    );
  }

  const handleCall = () => {
    window.location.href = `tel:${worker.phone}`;
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${worker.phone.replace(/\D/g, '')}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      {/* Profile Section */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Worker Info Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex gap-4 mb-6">
            <div className="relative">
              <img
                src={worker.image}
                alt={worker.name}
                className="w-24 h-24 rounded-lg object-cover"
              />
              {worker.isOnline && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{worker.name}</h1>
                {worker.isVerified && (
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <p className="text-gray-600 mb-2">{worker.skill}</p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{worker.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{worker.distanceKm} km away</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Experience</p>
              <p className="text-xl font-bold text-gray-900">{worker.experience} years</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Completed Jobs</p>
              <p className="text-xl font-bold text-gray-900">{worker.completedJobs}</p>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            {worker.aadhaarVerified && (
              <Badge variant="secondary" className="gap-1">
                <Shield className="h-3 w-3" />
                Aadhaar Verified
              </Badge>
            )}
            {worker.policeVerified && (
              <Badge variant="secondary" className="gap-1">
                <Shield className="h-3 w-3" />
                Police Verified
              </Badge>
            )}
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Languages</p>
              <p className="text-gray-900">{worker.languages.join(', ')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Location</p>
              <p className="text-gray-900">{worker.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Price</p>
              <p className="text-2xl font-bold text-gray-900">₹{worker.pricePerDay}/day</p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Reviews ({reviews.length})
          </h2>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900">{review.customerName}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{review.rating}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-1">{review.comment}</p>
                <p className="text-xs text-gray-400">{review.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow p-4 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleCall}
          >
            <Phone className="h-4 w-4" />
            Call
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
          <Button
            className="flex-1"
            onClick={() => navigate(`/hire/${worker.id}`)}
          >
            Hire Now
          </Button>
        </div>
      </div>
    </div>
  );
}
