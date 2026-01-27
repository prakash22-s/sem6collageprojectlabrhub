import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, Filter, MapPin, Star, Phone, CheckCircle2, ArrowLeft, User } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { mockWorkers, skills, type Worker } from '@/app/data/mockData';
import { useAuth } from '@/app/context/AuthContext';

export function WorkerListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'price'>('rating');

  const filteredWorkers = mockWorkers
    .filter((worker) => {
      const matchesSearch = worker.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSkill = selectedSkill === 'all' || worker.skill === selectedSkill;
      return matchesSearch && matchesSkill;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      if (sortBy === 'price') return a.pricePerDay - b.pricePerDay;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
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
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {filteredWorkers.length} Workers Found
          </h2>
        </div>

        <div className="space-y-4">
          {filteredWorkers.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">No workers found matching your criteria</p>
            </div>
          ) : (
            filteredWorkers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
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
          <img
            src={worker.image}
            alt={worker.name}
            className="w-20 h-20 rounded-lg object-cover"
          />
          {worker.isOnline && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
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
                onClick={() => navigate(`/hire/${worker.id}`)}
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
