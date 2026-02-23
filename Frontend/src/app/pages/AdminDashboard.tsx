import { useNavigate } from 'react-router';
import { Users, Briefcase, TrendingUp, Shield, LogOut, CheckCircle2, Clock, User } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { useAuth } from '@/app/context/AuthContext';
import { useWorkers } from '@/app/context/WorkerContext';
import { mockBookings } from '@/app/data/mockData';
import type React from 'react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { workers, pendingWorkers, approvedWorkers } = useWorkers();

  const totalWorkers = workers.length;
  const verifiedWorkers = approvedWorkers.length;
  const pendingVerification = pendingWorkers.length;
  const totalBookings = mockBookings.length;
  const completedBookings = mockBookings.filter((b) => b.status === 'completed').length;
  const activeBookings = mockBookings.filter((b) => b.status === 'confirmed' || b.status === 'pending').length;
  const totalRevenue = mockBookings.reduce((sum, b) => sum + b.amount, 0);

  const recentBookings = mockBookings.slice(0, 5);
  const recentWorkers = workers.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/'); }} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Workers"
            value={totalWorkers.toString()}
            subtitle={`${verifiedWorkers} verified`}
            icon={<Users className="h-6 w-6 text-blue-600" />}
            bgColor="bg-blue-50"
          />
          <StatsCard
            title="Total Bookings"
            value={totalBookings.toString()}
            subtitle={`${completedBookings} completed`}
            icon={<Briefcase className="h-6 w-6 text-green-600" />}
            bgColor="bg-green-50"
          />
          <StatsCard
            title="Active Jobs"
            value={activeBookings.toString()}
            subtitle="In progress"
            icon={<Clock className="h-6 w-6 text-orange-600" />}
            bgColor="bg-orange-50"
          />
          <StatsCard
            title="Total Revenue"
            value={`₹${totalRevenue}`}
            subtitle="All time"
            icon={<TrendingUp className="h-6 w-6 text-purple-600" />}
            bgColor="bg-purple-50"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-2"
                onClick={() => navigate('/admin/verification')}
              >
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="font-semibold">Worker Verification</span>
                {pendingVerification > 0 && (
                  <Badge variant="destructive">{pendingVerification} pending</Badge>
                )}
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-2"
                onClick={() => navigate('/workers')}
              >
                <Users className="h-8 w-8 text-green-600" />
                <span className="font-semibold">View All Workers</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-2"
              >
                <Briefcase className="h-8 w-8 text-purple-600" />
                <span className="font-semibold">Manage Bookings</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{booking.workerName}</p>
                      <p className="text-sm text-gray-600">{booking.customerName}</p>
                      <p className="text-xs text-gray-500">{booking.date}</p>
                    </div>
                    <div className="text-right ml-4">
                      <Badge
                        variant={
                          booking.status === 'completed' ? 'secondary' :
                          booking.status === 'confirmed' ? 'default' : 'outline'
                        }
                      >
                        {booking.status}
                      </Badge>
                      <p className="text-sm font-semibold mt-1">₹{booking.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Workers */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Workers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentWorkers.map((worker) => (
                  <div key={worker.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {worker.image && worker.image !== '' ? (
                      <img
                        src={worker.image}
                        alt={worker.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 truncate">{worker.name}</p>
                        {worker.isVerified && (
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{worker.skill}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">₹{worker.pricePerDay}</p>
                      <p className="text-xs text-gray-500">/day</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skills Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Workers by Skill</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Electrician', 'Plumber', 'Carpenter', 'Mason'].map((skill) => {
                const count = workers.filter((w) => w.skill === skill).length;
                return (
                  <div key={skill} className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-sm text-gray-600">{skill}s</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, subtitle, icon, bgColor }: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  bgColor: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${bgColor}`}>
            {icon}
          </div>
        </div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
