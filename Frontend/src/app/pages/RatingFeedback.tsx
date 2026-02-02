import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { mockBookings, mockWorkers } from '@/app/data/mockData';
import { toast } from 'sonner';

export function RatingFeedback() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const booking = mockBookings.find((b) => b.id === bookingId);
  const worker = booking ? mockWorkers.find((w) => w.id === booking.workerId) : null;

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');

  if (!booking || !worker) {
    return <div>Booking not found</div>;
  }

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    toast.success('Thank you for your feedback!');
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
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Rate Your Experience
          </h1>

          {/* Worker Info */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b">
            <img
              src={worker.image}
              alt={worker.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{worker.name}</h3>
              <p className="text-gray-600">{worker.skill}</p>
              <p className="text-sm text-gray-500">{booking.date}</p>
            </div>
          </div>

          {/* Rating Stars */}
          <div className="mb-8">
            <p className="text-center text-gray-600 mb-4">How was your experience?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-12 w-12 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center mt-2 font-medium text-gray-900">
                {rating === 5 && 'Excellent!'}
                {rating === 4 && 'Very Good!'}
                {rating === 3 && 'Good'}
                {rating === 2 && 'Fair'}
                {rating === 1 && 'Poor'}
              </p>
            )}
          </div>

          {/* Review Text */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share your experience (Optional)
            </label>
            <Textarea
              placeholder="Tell us about your experience with this worker..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
            />
          </div>

          <Button onClick={handleSubmit} className="w-full" size="lg">
            Submit Review
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RatingFeedback;
