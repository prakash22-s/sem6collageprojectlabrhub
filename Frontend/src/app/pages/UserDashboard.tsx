import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { MapPin, List, User, LogOut, Star, Phone, CheckCircle2, Navigation } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';

// Demo workers with fixed locations
const demoWorkers = [
  { _id: 'demo1', name: 'Rajesh Kumar', skill: 'Electrician', rating: 4.8, pricePerDay: 800, completedJobs: 156, lat: 19.0760, lng: 72.8777, distance: 2.5, image: '' },
  { _id: 'demo2', name: 'Amit Singh', skill: 'Plumber', rating: 4.6, pricePerDay: 700, completedJobs: 98, lat: 19.0820, lng: 72.8850, distance: 3.2, image: '' },
  { _id: 'demo3', name: 'Suresh Patel', skill: 'Carpenter', rating: 4.9, pricePerDay: 900, completedJobs: 203, lat: 19.0700, lng: 72.8700, distance: 1.8, image: '' },
  { _id: 'demo4', name: 'Vikram Sharma', skill: 'Painter', rating: 4.5, pricePerDay: 650, completedJobs: 87, lat: 19.0850, lng: 72.8800, distance: 4.1, image: '' },
  { _id: 'demo5', name: 'Manoj Verma', skill: 'Mason', rating: 4.7, pricePerDay: 750, completedJobs: 134, lat: 19.0730, lng: 72.8820, distance: 2.9, image: '' },
];

export function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: 19.0760, lng: 72.8777 });

  useEffect(() => {
    if (demoMode) {
      setWorkers(demoWorkers);
      setLoading(false);
    } else {
      fetchWorkers();
    }
  }, [demoMode]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log('Location access denied')
      );
    }
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/workers');
      const data = await response.json();
      if (data.success) {
        setWorkers(data.workers);
      }
    } catch (error) {
      console.error('Failed to fetch workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookWorker = (worker: any) => {
    setSelectedWorker(worker);
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    setShowBookingModal(false);
    navigate(`/book/${selectedWorker._id}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user || user.role !== 'customer') {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Find Workers</h1>
              <p className="text-sm text-gray-600">Hire skilled workers near you</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{demoMode ? 'Demo' : 'Live'}</span>
                <Switch checked={demoMode} onCheckedChange={setDemoMode} />
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/customer/dashboard')}>
                My Bookings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="map" className="gap-2">
              <MapPin className="h-4 w-4" />
              Map View
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              List View
            </TabsTrigger>
          </TabsList>

          {/* Map View */}
          <TabsContent value="map">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative h-[600px] bg-gray-200">
                <iframe
                  src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30168.123456789!2d${userLocation.lng}!3d${userLocation.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA0JzMzLjYiTiA3MsKwNTInMzkuNyJF!5e0!3m2!1sen!2sin!4v1234567890`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                />
                <div className="absolute top-4 left-4 right-4 max-h-[500px] overflow-y-auto space-y-2">
                  {workers.slice(0, 3).map((worker) => (
                    <div key={worker._id} className="bg-white rounded-lg shadow-md p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{worker.name}</h3>
                            <CheckCircle2 className="h-4 w-4 text-blue-600" />
                          </div>
                          <p className="text-sm text-gray-600">{worker.skill}</p>
                          <div className="flex items-center gap-3 mt-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{worker.rating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Navigation className="h-4 w-4 text-gray-400" />
                              <span>{worker.distance || '2.5'} km</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">₹{worker.pricePerDay}</p>
                          <p className="text-xs text-gray-500">per day</p>
                          <Button size="sm" className="mt-2" onClick={() => handleBookWorker(worker)}>
                            Book
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* List View */}
          <TabsContent value="list">
            {loading ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">Loading workers...</p>
              </div>
            ) : workers.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 mb-2">No workers available</p>
                <p className="text-sm text-gray-400">Try enabling Demo Mode</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workers.map((worker) => (
                  <WorkerCard key={worker._id} worker={worker} onBook={handleBookWorker} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Booking Confirmation Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
          </DialogHeader>
          {selectedWorker && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedWorker.name}</h3>
                  <p className="text-gray-600">{selectedWorker.skill}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating:</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{selectedWorker.rating}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per day:</span>
                  <span className="font-medium text-green-600">₹{selectedWorker.pricePerDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Distance:</span>
                  <span className="font-medium">{selectedWorker.distance || '2.5'} km</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookingModal(false)}>
              Cancel
            </Button>
            <Button onClick={confirmBooking}>
              Proceed to Book
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WorkerCard({ worker, onBook }: { worker: any; onBook: (worker: any) => void }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          <User className="h-7 w-7 text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{worker.name}</h3>
            <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
          </div>
          <p className="text-sm text-gray-600">{worker.skill}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{worker.rating}</span>
            <span className="text-gray-500">({worker.completedJobs || 0})</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Navigation className="h-4 w-4" />
            <span>{worker.distance || '2.5'} km</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t">
        <div>
          <p className="text-lg font-bold text-green-600">₹{worker.pricePerDay}</p>
          <p className="text-xs text-gray-500">per day</p>
        </div>
        <Button size="sm" onClick={() => onBook(worker)}>
          Book Worker
        </Button>
      </div>
    </div>
  );
}
