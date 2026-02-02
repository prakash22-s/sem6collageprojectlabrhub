import { useNavigate } from 'react-router';
import { User, LogOut, Calendar, Star, Search } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { useAuth } from '@/app/context/AuthContext';
import { mockBookings, mockWorkers } from '@/app/data/mockData';

export function CustomerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const activeBookings = mockBookings.filter((b) => b.status === 'confirmed' || b.status === 'pending');
  const completedBookings = mockBookings.filter((b) => b.status === 'completed');

  return (
    <div className="min-h-screen relative" style={{backgroundImage: 'url(https://as1.ftcdn.net/v2/jpg/06/99/03/42/1000_F_699034283_p567iQuz3FXu930InT3TysoVZNMeLi9Y.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
      <header className="bg-white/98 backdrop-blur-sm shadow-sm relative z-20">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">My Dashboard</h1>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 relative z-20">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-600">{user?.phone}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-24 flex flex-col gap-2"
            onClick={() => navigate('/workers')}
          >
            <Search className="h-6 w-6" />
            <span>Find Workers</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex flex-col gap-2"
            onClick={() => navigate('/customer/dashboard')}
          >
            <Calendar className="h-6 w-6" />
            <span>My Bookings</span>
          </Button>
        </div>

        {/* Bookings Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4 space-y-4">
            {activeBookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">No active bookings</p>
                <Button className="mt-4" onClick={() => navigate('/workers')}>
                  Find Workers
                </Button>
              </div>
            ) : (
              activeBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-4 space-y-4">
            {completedBookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">No completed bookings</p>
              </div>
            ) : (
              completedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: typeof mockBookings[0] }) {
  const navigate = useNavigate();
  const worker = mockWorkers.find((w) => w.id === booking.workerId);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{booking.workerName}</h3>
          <p className="text-sm text-gray-600">{booking.workerSkill}</p>
        </div>
        <Badge
          variant={
            booking.status === 'confirmed'
              ? 'default'
              : booking.status === 'completed'
              ? 'secondary'
              : 'outline'
          }
        >
          {booking.status}
        </Badge>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{booking.date}</span>
        </div>
        <p>{booking.address}</p>
      </div>

      <div className="flex items-center justify-between">
        <p className="font-bold text-gray-900">₹{booking.amount}</p>
        {booking.status === 'completed' && !booking.rating ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/rating/${booking.id}`)}
            className="gap-1"
          >
            <Star className="h-4 w-4" />
            Rate
          </Button>
        ) : booking.rating ? (
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>Rated {booking.rating}</span>
          </div>
        ) : (
          <Button size="sm" onClick={() => worker && navigate(`/worker/${worker.id}`)}>
            View Details
          </Button>
        )}
      </div>
    </div>
  );
}
