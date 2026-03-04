import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Briefcase, Clock, LogOut, Shield, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { useAuth } from '@/app/context/AuthContext';
import { apiUrl } from '@/app/lib/api';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [workers, setWorkers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [user?.id]);

  async function loadData() {
    const [workersRes, bookingsRes] = await Promise.all([
      fetch(apiUrl('/api/workers/all')),
      fetch(apiUrl('/api/bookings')),
    ]);
    const workersData = await workersRes.json();
    const bookingsData = await bookingsRes.json();
    if (workersData.success) setWorkers(workersData.workers);
    if (bookingsData.success) setBookings(bookingsData.bookings);
  }

  const metrics = useMemo(() => {
    const verifiedWorkers = workers.filter((w) => w.isVerified).length;
    const pendingWorkers = workers.filter((w) => !w.isVerified).length;
    const completedBookings = bookings.filter((b) => b.status === 'completed').length;
    const activeBookings = bookings.filter(
      (b) => b.status === 'pending' || b.status === 'confirmed'
    ).length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    return {
      verifiedWorkers,
      pendingWorkers,
      completedBookings,
      activeBookings,
      totalRevenue,
    };
  }, [workers, bookings]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/'); }}>
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Workers" value={String(workers.length)} icon={<Users className="h-6 w-6 text-blue-600" />} subtitle={`${metrics.verifiedWorkers} verified`} />
          <StatsCard title="Total Bookings" value={String(bookings.length)} icon={<Briefcase className="h-6 w-6 text-green-600" />} subtitle={`${metrics.completedBookings} completed`} />
          <StatsCard title="Active Jobs" value={String(metrics.activeBookings)} icon={<Clock className="h-6 w-6 text-orange-600" />} subtitle="pending + confirmed" />
          <StatsCard title="Revenue" value={`Rs ${metrics.totalRevenue}`} icon={<TrendingUp className="h-6 w-6 text-purple-600" />} subtitle="booked value" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-6 flex flex-col gap-2" onClick={() => navigate('/admin/verification')}>
              <Shield className="h-8 w-8 text-blue-600" />
              <span>Worker Verification</span>
              <Badge variant="destructive">{metrics.pendingWorkers} pending</Badge>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex flex-col gap-2" onClick={() => navigate('/workers')}>
              <Users className="h-8 w-8 text-green-600" />
              <span>Browse Workers</span>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex flex-col gap-2" onClick={loadData}>
              <Briefcase className="h-8 w-8 text-purple-600" />
              <span>Refresh Data</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4">{icon}</div>
        <h3 className="text-sm text-gray-600">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
