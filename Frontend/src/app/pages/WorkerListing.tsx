import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, Filter, MapPin, Star, Phone, CheckCircle2, ArrowLeft, User } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { skills, type Worker } from '@/app/data/mockData';
import { useAuth } from '@/app/context/AuthContext';

export function WorkerListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'price'>('rating');

  useEffect(() => {
    fetchWorkers();
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

  const filteredWorkers = workers
    .filter((worker) => {
      const matchesSearch = worker.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSkill = selectedSkill === 'all' || worker.skill === selectedSkill;
      return matchesSearch && matchesSkill;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'distance') return (a.distanceKm || 0) - (b.distanceKm || 0);
      if (sortBy === 'price') return a.pricePerDay - b.pricePerDay;
      return 0;
    });

  return (
    <div className="min-h-screen relative" style={{backgroundImage: 'url(https://as1.ftcdn.net/v2/jpg/06/99/03/42/1000_F_699034283_p567iQuz3FXu930InT3TysoVZNMeLi9Y.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
      {/* Header */}
      <header className="bg-white/98 backdrop-blur-sm shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/customer/dashboard')}
                className="gap-2"
              >
                <User className="h-4 w-4" />
                {user.name}
              </Button>
            ) : (
              <Button size="sm" onClick={() => navigate('/auth')}>
                Login
              </Button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            <Select value={selectedSkill} onValueChange={setSelectedSkill}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Skills" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                {skills.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="distance">Nearest</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Worker List */}
      <div className="max-w-7xl mx-auto px-4 py-6 relative z-20">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {loading ? 'Loading...' : `${filteredWorkers.length} Workers Found`}
          </h2>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">Loading workers...</p>
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 mb-2">No verified workers available</p>
              <p className="text-sm text-gray-400">Workers need admin approval to appear here</p>
            </div>
          ) : (
            filteredWorkers.map((worker) => (
              <WorkerCard key={worker._id || worker.id} worker={worker} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function WorkerCard({ worker }: { worker: Worker }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4">
      <div className="flex gap-4">
        {/* Profile Image */}
        <div className="relative">
          {worker.image && worker.image !== '' ? (
            <img
              src={worker.image}
              alt={worker.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center">
              <User className="h-10 w-10 text-gray-500" />
            </div>
          )}
        </div>

        {/* Worker Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{worker.name}</h3>
                {worker.isVerified && (
                  <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-gray-600">{worker.skill}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{worker.rating}</span>
              <span className="text-gray-400">({worker.completedJobs})</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{worker.distanceKm} km</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-bold text-gray-900">₹{worker.pricePerDay}</p>
              <p className="text-xs text-gray-500">per day</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/worker/${worker.id}`)}
              >
                View Profile
              </Button>
              <Button
                size="sm"
                onClick={() => navigate(`/book/${worker._id || worker.id}`)}
              >
                Hire Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
