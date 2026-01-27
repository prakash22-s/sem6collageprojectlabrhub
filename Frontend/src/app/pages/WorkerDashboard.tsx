import { useNavigate } from 'react-router';
import { User, LogOut, Calendar, TrendingUp, Star, Clock } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { mockBookings } from '@/app/data/mockData';

export function WorkerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOnline, setIsOnline] = useState(true);

  const workerBookings = mockBookings.filter((b) => b.workerName === user?.name);
  const pendingRequests = workerBookings.filter((b) => b.status === 'pending');
  const upcomingJobs = workerBookings.filter((b) => b.status === 'confirmed');
  const completedJobs = workerBookings.filter((b) => b.status === 'completed');

  const totalEarnings = completedJobs.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Worker Dashboard</h1>
            <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/'); }} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-gray-600">{user?.skill}</p>
                <p className="text-sm text-gray-500">{user?.phone}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="font-medium">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <Switch checked={isOnline} onCheckedChange={setIsOnline} />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Earnings</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">₹{totalEarnings}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Star className="h-4 w-4" />
              <span className="text-sm">Rating</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">4.8</p>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4">New Requests ({pendingRequests.length})</h3>
            <div className="space-y-3">
              {pendingRequests.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{booking.customerName}</p>
                      <p className="text-sm text-gray-600">{booking.date}</p>
                    </div>
                    <Badge>₹{booking.amount}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{booking.address}</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">Accept</Button>
                    <Button size="sm" variant="outline" className="flex-1">Decline</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Jobs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Upcoming Jobs ({upcomingJobs.length})</h3>
          {upcomingJobs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No upcoming jobs</p>
          ) : (
            <div className="space-y-3">
              {upcomingJobs.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{booking.customerName}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Calendar className="h-4 w-4" />
                        <span>{booking.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{booking.address}</p>
                    </div>
                    <Badge variant="default">₹{booking.amount}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Completed */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Recently Completed ({completedJobs.length})</h3>
          {completedJobs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No completed jobs yet</p>
          ) : (
            <div className="space-y-3">
              {completedJobs.slice(0, 3).map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{booking.customerName}</p>
                      <p className="text-sm text-gray-600">{booking.date}</p>
                      {booking.rating && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{booking.rating}</span>
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary">₹{booking.amount}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
