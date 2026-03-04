import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle, Calendar, CheckCircle2, LogOut, Star, User } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';
import { apiUrl } from '@/app/lib/api';

export function NewWorkerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [workerProfile, setWorkerProfile] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    if (!user || user.role !== 'worker') {
      navigate('/auth');
      return;
    }
    fetchWorkerProfile();
    fetchBookings();
    const poll = setInterval(fetchBookings, 10000);
    return () => clearInterval(poll);
  }, [user?.id]);

  useEffect(() => {
    if (!workerProfile?._id || !isOnline || !navigator.geolocation) return;
    const timer = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          await fetch(apiUrl(`/api/workers/${workerProfile._id}/location`), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }),
          });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 4000 }
      );
    }, 20000);
    return () => clearInterval(timer);
  }, [workerProfile?._id, isOnline]);

  async function fetchWorkerProfile() {
    if (!user?.id) return;
    const response = await fetch(apiUrl(`/api/workers/user/${user.id}`));
    const data = await response.json();
    if (data.success) {
      setWorkerProfile(data.worker);
      setIsOnline(data.worker.isOnline);
    }
  }

  async function fetchBookings() {
    if (!user?.id) return;
    const response = await fetch(apiUrl(`/api/bookings/worker/${user.id}`));
    const data = await response.json();
    if (data.success) setBookings(data.bookings);
  }

  async function handleAvailabilityToggle(checked: boolean) {
    if (!workerProfile?._id || !workerProfile.isVerified) {
      toast.error('Your account is not verified yet');
      return;
    }
    const response = await fetch(apiUrl(`/api/workers/${workerProfile._id}/status`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOnline: checked }),
    });
    const data = await response.json();
    if (data.success) {
      setIsOnline(checked);
      toast.success(checked ? 'You are online' : 'You are offline');
    }
  }

  async function updateBooking(bookingId: string, endpoint: string, body?: unknown) {
    const response = await fetch(apiUrl(`/api/bookings/${bookingId}/${endpoint}`), {
      method: 'PUT',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json();
    if (data.success) {
      fetchWorkerProfile();
      fetchBookings();
    } else {
      toast.error(data.message || 'Request failed');
    }
  }

  const pending = bookings.filter((b) => b.status === 'pending');
  const active = bookings.filter((b) => b.status === 'confirmed');
  const completed = bookings.filter((b) => b.status === 'completed');
  const reviews = useMemo(() => completed.filter((b) => b.rating && b.review), [completed]);

  if (!user || user.role !== 'worker') return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Worker Dashboard</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
            <Switch
              checked={isOnline && !!workerProfile?.isVerified}
              onCheckedChange={handleAvailabilityToggle}
              disabled={!workerProfile?.isVerified}
            />
            <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/'); }}>
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {!workerProfile?.isVerified && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Pending admin verification. You can go online after approval.</AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardContent className="p-4 flex items-center gap-4">
            {workerProfile?.image ? (
              <img src={apiUrl(workerProfile.image)} alt={workerProfile.name} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-8 w-8 text-gray-500" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold">{workerProfile?.name || user.name}</h2>
              <p className="text-sm text-gray-600">{workerProfile?.skill || user.skill || 'Worker'}</p>
              <div className="text-sm text-gray-600">Completed Jobs: {workerProfile?.completedJobs || 0}</div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-xl">
            <TabsTrigger value="available">Available ({pending.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-3 mt-4">
            {pending.length === 0 && <Card><CardContent className="p-4 text-center text-gray-600">No pending requests</CardContent></Card>}
            {pending.map((booking) => (
              <Card key={booking._id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{booking.customerName}</div>
                      <div className="text-sm text-gray-600">{booking.address}</div>
                      <div className="text-sm text-gray-600">{booking.date}</div>
                    </div>
                    <div className="font-bold">Rs {booking.amount}</div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => updateBooking(booking._id, 'reject')}>Reject</Button>
                    <Button size="sm" onClick={() => updateBooking(booking._id, 'accept')}>Accept</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="active" className="space-y-3 mt-4">
            {active.length === 0 && <Card><CardContent className="p-4 text-center text-gray-600">No active jobs</CardContent></Card>}
            {active.map((booking) => (
              <Card key={booking._id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{booking.customerName}</div>
                    <div className="text-sm text-gray-600">{booking.address}</div>
                    <div className="text-sm text-gray-600 flex items-center gap-1"><Calendar className="h-4 w-4" />{booking.date}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>In Progress</Badge>
                    <Button size="sm" onClick={() => updateBooking(booking._id, 'status', { status: 'completed' })}>
                      Mark Completed
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-3 mt-4">
            {reviews.length === 0 && <Card><CardContent className="p-4 text-center text-gray-600">No reviews yet</CardContent></Card>}
            {reviews.map((review) => (
              <Card key={review._id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="font-semibold">{review.customerName}</div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {review.rating}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{review.review}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
