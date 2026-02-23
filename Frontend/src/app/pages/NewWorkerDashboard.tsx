import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  User, LogOut, Edit, Phone, MessageCircle, MapPin, Clock, 
  Star, TrendingUp, Calendar, CheckCircle2, Eye, Wallet,
  BarChart3, History, Award, AlertCircle
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { useAuth } from '@/app/context/AuthContext';
import { useWorkers } from '@/app/context/WorkerContext';
import { toast } from 'sonner';

// Mock data for worker dashboard
const mockWorkerData = {
  id: 'W001',
  name: 'Rajesh Kumar',
  skill: 'Electrician',
  rating: 4.8,
  totalReviews: 156,
  experience: 8,
  phone: '+91 98765 43210',
  image: '',
  isVerified: true,
  isOnline: true,
  completedJobs: 156,
  totalHours: 1248,
  languages: ['Hindi', 'English'],
  address: 'Saket, New Delhi',
};

const mockEarnings = {
  today: 2800,
  weekly: 18500,
  monthly: 75000,
  weeklyData: [2500, 3200, 2800, 4100, 3600, 2300, 0],
};

const mockReviews = [
  {
    id: 'R001',
    customer: 'Priya M.',
    rating: 5,
    comment: 'Excellent work! Very professional and completed on time.',
    date: '2 days ago',
  },
  {
    id: 'R002',
    customer: 'Rahul K.',
    rating: 5,
    comment: 'Highly skilled electrician. Will hire again.',
    date: '1 week ago',
  },
  {
    id: 'R003',
    customer: 'Anjali S.',
    rating: 4,
    comment: 'Good work overall. Slightly expensive but worth it.',
    date: '2 weeks ago',
  },
];

const mockJobHistory = [
  {
    id: 'H001',
    title: 'Electrical Repair',
    customer: 'Vikram Singh',
    date: '2026-01-20',
    duration: '5 hours',
    payment: 2000,
    rating: 5,
  },
  {
    id: 'H002',
    title: 'Wiring Installation',
    customer: 'Sunita Devi',
    date: '2026-01-18',
    duration: '8 hours',
    payment: 3200,
    rating: 4,
  },
];

export function NewWorkerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { workers, updateWorkerStatus } = useWorkers();
  const [activeTab, setActiveTab] = useState('available');
  const [bookings, setBookings] = useState<any[]>([]);
  const [workerProfile, setWorkerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [previousPendingCount, setPreviousPendingCount] = useState(0);

  // Find the current worker's data
  const currentWorker = workers.find(w => w.id === user?.id);
  const [isOnline, setIsOnline] = useState(currentWorker?.isOnline || false);

  useEffect(() => {
    if (user?.id) {
      fetchWorkerProfile();
      fetchBookings();
      
      // Auto-refresh bookings every 10 seconds for real-time notifications
      const interval = setInterval(() => {
        fetchBookings();
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchWorkerProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/workers/user/${user.id}`);
      const data = await response.json();
      if (data.success) {
        setWorkerProfile(data.worker);
        setIsOnline(data.worker.isOnline);
      }
    } catch (error) {
      console.error('Failed to fetch worker profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/worker/${user.id}`);
      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings);
        // Count pending bookings for notification badge
        const pendingCount = data.bookings.filter(b => b.status === 'pending').length;
        
        // Show notification if new pending bookings arrived
        if (pendingCount > previousPendingCount && previousPendingCount > 0) {
          const newBookingsCount = pendingCount - previousPendingCount;
          toast.success(`🔔 ${newBookingsCount} New Job Request${newBookingsCount > 1 ? 's' : ''}!`, {
            duration: 5000,
          });
        }
        
        setNotificationCount(pendingCount);
        setPreviousPendingCount(pendingCount);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  // Redirect if not logged in as worker
  if (!user || user.role !== 'worker') {
    navigate('/auth');
    return null;
  }

  // Use worker profile data or fallback
  const workerData = workerProfile || currentWorker || {
    id: user.id,
    name: user.name,
    skill: user.skill || 'Worker',
    rating: 0,
    totalReviews: 0,
    experience: 0,
    phone: user.phone,
    image: '',
    isVerified: user.isVerified || false,
    isOnline: false,
    completedJobs: 0,
    totalHours: 0,
    languages: ['Hindi'],
    address: 'Not provided',
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const activeBookings = bookings.filter(b => b.status === 'confirmed');
  const completedBookings = bookings.filter(b => b.status === 'completed');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAvailabilityToggle = async (checked: boolean) => {
    if (!workerData.isVerified) {
      toast.error('Please wait for admin approval to go online');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/workers/${workerProfile._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: checked }),
      });
      
      const data = await response.json();
      if (data.success) {
        setIsOnline(checked);
        updateWorkerStatus(workerData.id, checked);
        toast.success(checked ? 'You are now online and can receive jobs' : 'You are now offline');
      }
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update status');
    }
  };

  const handleAcceptJob = async (bookingId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/accept`, {
        method: 'PUT',
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Job accepted successfully!');
        fetchBookings(); // Refresh bookings
      } else {
        toast.error(data.message || 'Failed to accept job');
      }
    } catch (error) {
      console.error('Accept job error:', error);
      toast.error('Failed to accept job');
    }
  };

  const handleRejectJob = async (bookingId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/reject`, {
        method: 'PUT',
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Job rejected');
        fetchBookings(); // Refresh bookings
      } else {
        toast.error(data.message || 'Failed to reject job');
      }
    } catch (error) {
      console.error('Reject job error:', error);
      toast.error('Failed to reject job');
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
  };

  return (
    <div className="min-h-screen relative" style={{backgroundImage: 'url(https://as1.ftcdn.net/v2/jpg/06/99/03/42/1000_F_699034283_p567iQuz3FXu930InT3TysoVZNMeLi9Y.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
      {/* Header */}
      <header className="bg-white/98 backdrop-blur-sm shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">Worker Dashboard</h1>
              {notificationCount > 0 && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1 animate-pulse">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-red-700">
                    {notificationCount} New Request{notificationCount > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* Availability Toggle */}
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${
                  !workerData.isVerified ? 'text-gray-500' : 
                  isOnline ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {!workerData.isVerified ? 'Pending Admin Approval' : 
                   isOnline ? 'Online' : 'Offline'}
                </span>
                <Switch
                  checked={isOnline && workerData.isVerified}
                  onCheckedChange={handleAvailabilityToggle}
                  disabled={!workerData.isVerified}
                />
                <div className={`w-3 h-3 rounded-full ${
                  isOnline && workerData.isVerified ? 'bg-green-500' : 'bg-gray-400'
                }`} />
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 relative z-20">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Worker Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="relative inline-block">
                    {workerData.image && workerData.image !== '' ? (
                      <img
                        src={workerData.image}
                        alt={workerData.name}
                        className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
                        <User className="h-10 w-10 text-gray-500" />
                      </div>
                    )}
                    {isOnline && workerData.isVerified && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">{workerData.name}</h3>
                  <p className="text-gray-600">{workerData.skill}</p>
                  <div className="mt-2">
                    {workerData.isVerified ? (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Pending Approval
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{workerData.rating}</span>
                      <span className="text-sm text-gray-500">({workerData.totalReviews || 0})</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Experience</span>
                    <span className="font-medium">{workerData.experience} years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Jobs Completed</span>
                    <span className="font-medium">{workerData.completedJobs}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Verification Status Alert */}
            {!workerData.isVerified && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your account is pending admin approval. You'll be able to receive jobs once verified.
                </AlertDescription>
              </Alert>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="available" className="relative">
                  Available Jobs
                  {notificationCount > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white px-2 py-0 text-xs">
                      {notificationCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="active">Active Jobs</TabsTrigger>
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              {/* Available Jobs Tab */}
              <TabsContent value="available" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Pending Job Requests</h2>
                  <div className="flex items-center gap-2">
                    {notificationCount > 0 && (
                      <Badge variant="destructive" className="animate-pulse">
                        {notificationCount} New Request{notificationCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {workerData.isVerified ? `${pendingBookings.length} total` : 'Pending verification'}
                    </Badge>
                  </div>
                </div>
                {!workerData.isVerified ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">Account Pending Verification</h3>
                      <p className="text-gray-600">Your account is being reviewed by our admin team. You'll be able to see and accept jobs once verified.</p>
                    </CardContent>
                  </Card>
                ) : pendingBookings.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No pending job requests</p>
                      <p className="text-sm text-gray-500 mt-2">New booking requests will appear here</p>
                    </CardContent>
                  </Card>
                ) : (
                  pendingBookings.map((booking) => (
                    <Card key={booking._id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{booking.customerName}</h3>
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                                New Request
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{booking.workerSkill}</p>
                          </div>
                        </div>
                        <div className="space-y-2 mb-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{booking.date}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                            <span className="text-gray-700">{booking.address}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="text-lg font-bold text-green-600">₹{booking.amount}</div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleRejectJob(booking._id)} 
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Reject
                            </Button>
                            <Button 
                              onClick={() => handleAcceptJob(booking._id)} 
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Accept Job
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Active Jobs Tab */}
              <TabsContent value="active" className="space-y-4">
                <h2 className="text-lg font-semibold">Current Active Jobs</h2>
                {activeBookings.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-600">No active jobs</p>
                    </CardContent>
                  </Card>
                ) : (
                  activeBookings.map((booking) => (
                    <Card key={booking._id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{booking.customerName}</h3>
                            <p className="text-sm text-gray-600">{booking.workerSkill}</p>
                            <p className="text-sm text-gray-500">{booking.address}</p>
                          </div>
                          <Badge variant="default">In Progress</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Date: {booking.date}</p>
                            <p className="text-lg font-bold text-green-600">₹{booking.amount}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Earnings Tab */}
              <TabsContent value="earnings" className="space-y-4">
                <h2 className="text-lg font-semibold">Earnings Dashboard</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Wallet className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-gray-600">Today's Earnings</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">₹{mockEarnings.today}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        <span className="text-sm text-gray-600">This Week</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">₹{mockEarnings.weekly}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                        <span className="text-sm text-gray-600">This Month</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">₹{mockEarnings.monthly}</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3">Weekly Earnings Chart</h3>
                      <div className="space-y-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                          <div key={day} className="flex items-center gap-2">
                            <span className="text-sm w-8">{day}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(mockEarnings.weeklyData[index] / 5000) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-16">₹{mockEarnings.weeklyData[index]}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3">Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Jobs</span>
                          <span className="font-medium">{mockWorkerData.completedJobs}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Hours</span>
                          <span className="font-medium">{mockWorkerData.totalHours}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg. per Job</span>
                          <span className="font-medium">₹{Math.round(mockEarnings.monthly / 30)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg. per Hour</span>
                          <span className="font-medium">₹{Math.round(mockEarnings.monthly / mockWorkerData.totalHours)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Customer Reviews</h2>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{mockWorkerData.rating}</span>
                    <span className="text-gray-500">({mockWorkerData.totalReviews} reviews)</span>
                  </div>
                </div>
                {mockReviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{review.customer}</h3>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-2">{review.comment}</p>
                      <p className="text-sm text-gray-500">{review.date}</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Job History Tab */}
              <TabsContent value="history" className="space-y-4">
                <h2 className="text-lg font-semibold">Job History</h2>
                {mockJobHistory.map((job) => (
                  <Card key={job.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{job.title}</h3>
                          <p className="text-sm text-gray-600">{job.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">₹{job.payment}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < job.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{job.date}</span>
                        <span>Duration: {job.duration}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
