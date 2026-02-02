import { useState } from 'react';
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
  image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
  isVerified: true,
  isOnline: true,
  completedJobs: 156,
  totalHours: 1248,
  languages: ['Hindi', 'English'],
  address: 'Saket, New Delhi',
};

const mockAvailableJobs = [
  {
    id: 'J001',
    title: 'Electrical Wiring Repair',
    customer: 'Priya Sharma',
    location: 'Vasant Vihar, Delhi',
    distance: 2.3,
    pay: 1200,
    duration: '4-6 hours',
    description: 'Need to fix electrical wiring in kitchen and living room',
    urgency: 'Today',
  },
  {
    id: 'J002',
    title: 'Fan Installation',
    customer: 'Amit Gupta',
    location: 'Malviya Nagar, Delhi',
    distance: 3.1,
    pay: 800,
    duration: '2-3 hours',
    description: 'Install 3 ceiling fans in new apartment',
    urgency: 'Tomorrow',
  },
];

const mockActiveJobs = [
  {
    id: 'AJ001',
    title: 'Switch Board Replacement',
    customer: 'Neha Patel',
    phone: '+91 98765 43211',
    location: 'Green Park, Delhi',
    pay: 1500,
    startTime: '10:00 AM',
    status: 'In Progress',
  },
];

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

  // Find the current worker's data
  const currentWorker = workers.find(w => w.id === user?.id);
  const [isOnline, setIsOnline] = useState(currentWorker?.isOnline || false);

  // Redirect if not logged in as worker
  if (!user || user.role !== 'worker') {
    navigate('/auth');
    return null;
  }

  // Use current worker data or fallback to user data
  const workerData = currentWorker || {
    id: user.id,
    name: user.name,
    skill: user.skill || 'Worker',
    rating: 0,
    totalReviews: 0,
    experience: 0,
    phone: user.phone,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    isVerified: user.isVerified || false,
    isOnline: false,
    completedJobs: 0,
    totalHours: 0,
    languages: ['Hindi'],
    address: 'Not provided',
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAvailabilityToggle = (checked: boolean) => {
    if (!workerData.isVerified) {
      toast.error('Please wait for admin approval to go online');
      return;
    }
    setIsOnline(checked);
    updateWorkerStatus(workerData.id, checked);
    toast.success(checked ? 'You are now online and can receive jobs' : 'You are now offline');
  };

  const handleAcceptJob = (jobId: string) => {
    toast.success('Job accepted successfully!');
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
            <h1 className="text-xl font-bold text-gray-900">Worker Dashboard</h1>
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
                    <img
                      src={workerData.image}
                      alt={workerData.name}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                    />
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
                <TabsTrigger value="available">Available Jobs</TabsTrigger>
                <TabsTrigger value="active">Active Jobs</TabsTrigger>
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              {/* Available Jobs Tab */}
              <TabsContent value="available" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Nearby Job Opportunities</h2>
                  <Badge variant="outline">
                    {workerData.isVerified ? `${mockAvailableJobs.length} jobs available` : 'Pending verification'}
                  </Badge>
                </div>
                {!workerData.isVerified ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">Account Pending Verification</h3>
                      <p className="text-gray-600">Your account is being reviewed by our admin team. You'll be able to see and accept jobs once verified.</p>
                    </CardContent>
                  </Card>
                ) : (
                  mockAvailableJobs.map((job) => (
                    <Card key={job.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{job.title}</h3>
                            <p className="text-sm text-gray-600">{job.customer}</p>
                          </div>
                          <Badge variant={job.urgency === 'Today' ? 'destructive' : 'secondary'}>
                            {job.urgency}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{job.location} ({job.distance} km)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{job.duration}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{job.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-green-600">₹{job.pay}</div>
                          <Button onClick={() => handleAcceptJob(job.id)} size="sm">
                            Accept Job
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Active Jobs Tab */}
              <TabsContent value="active" className="space-y-4">
                <h2 className="text-lg font-semibold">Current Active Jobs</h2>
                {mockActiveJobs.map((job) => (
                  <Card key={job.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-600">{job.customer}</p>
                          <p className="text-sm text-gray-500">{job.location}</p>
                        </div>
                        <Badge variant="default">{job.status}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Started: {job.startTime}</p>
                          <p className="text-lg font-bold text-green-600">₹{job.pay}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCall(job.phone)}
                            className="gap-1"
                          >
                            <Phone className="h-4 w-4" />
                            Call
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWhatsApp(job.phone)}
                            className="gap-1"
                          >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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