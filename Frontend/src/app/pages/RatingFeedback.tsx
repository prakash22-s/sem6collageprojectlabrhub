import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from 'sonner';
import { apiUrl } from '@/app/lib/api';

export function RatingFeedback() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');

  useEffect(() => {
    if (!bookingId) return;
    fetch(apiUrl(`/api/bookings/${bookingId}`))
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setBooking(data.booking);
      });
  }, [bookingId]);

  const handleSubmit = async () => {
    if (!bookingId || rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    const response = await fetch(apiUrl(`/api/bookings/${bookingId}/rate`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, review }),
    });
    const data = await response.json();
    if (data.success) {
      toast.success('Thank you for your feedback');
      navigate('/customer/dashboard');
    } else {
      toast.error(data.message || 'Failed to submit review');
    }
  };

  if (!booking) return <div className="min-h-screen flex items-center justify-center">Loading booking...</div>;

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
          <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">Rate Your Experience</h1>
          <p className="text-center text-gray-600 mb-1">{booking.workerName}</p>
          <p className="text-center text-sm text-gray-500 mb-6">{booking.date}</p>

          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                <Star
                  className={`h-10 w-10 ${
                    star <= (hoveredRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>

          <Textarea
            placeholder="Share your feedback (optional)"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={4}
            className="mb-4"
          />

          <Button onClick={handleSubmit} className="w-full" size="lg">
            Submit Review
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RatingFeedback;
