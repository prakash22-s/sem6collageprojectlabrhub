import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle2, XCircle, Eye, User } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { toast } from 'sonner';
import { apiUrl } from '@/app/lib/api';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';

export function AdminVerification() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState<any | null>(null);
  const [offlineForm, setOfflineForm] = useState({
    name: '',
    phone: '',
    skill: '',
    experience: '',
    pricePerDay: '',
    address: '',
  });

  const pendingWorkers = workers.filter(w => !w.isVerified);
  const approvedWorkers = workers.filter(w => w.isVerified);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await fetch(apiUrl('/api/workers/all'));
      const data = await response.json();
      if (data.success) {
        setWorkers(data.workers);
      }
    } catch (error) {
      console.error('Failed to fetch workers:', error);
      toast.error('Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  console.log('AdminVerification: Pending workers', pendingWorkers);
  console.log('AdminVerification: Approved workers', approvedWorkers);

  const handleApprove = async (workerId: string) => {
    try {
      const response = await fetch(apiUrl(`/api/workers/${workerId}/approve`), {
        method: 'PUT',
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Worker approved successfully');
        fetchWorkers();
      } else {
        toast.error(data.message || 'Failed to approve worker');
      }
    } catch (error) {
      console.error('Approve error:', error);
      toast.error('Failed to approve worker');
    }
  };

  const handleReject = async (workerId: string) => {
    try {
      const response = await fetch(apiUrl(`/api/workers/${workerId}/reject`), {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.error('Worker application rejected');
        fetchWorkers();
      } else {
        toast.error(data.message || 'Failed to reject worker');
      }
    } catch (error) {
      console.error('Reject error:', error);
      toast.error('Failed to reject worker');
    }
  };

  const handleOfflineOnboard = async () => {
    const response = await fetch(apiUrl('/api/workers/offline-register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offlineForm),
    });
    const data = await response.json();
    if (data.success) {
      toast.success('Offline onboarding submitted');
      setOfflineForm({
        name: '',
        phone: '',
        skill: '',
        experience: '',
        pricePerDay: '',
        address: '',
      });
      fetchWorkers();
    } else {
      toast.error(data.message || 'Failed to submit offline onboarding');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Worker Verification</h1>
            <div className="w-20" /> {/* Spacer */}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Offline Worker Onboarding</h2>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <Label>Name</Label>
              <Input value={offlineForm.name} onChange={(e) => setOfflineForm({ ...offlineForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={offlineForm.phone} onChange={(e) => setOfflineForm({ ...offlineForm, phone: e.target.value })} />
            </div>
            <div>
              <Label>Skill</Label>
              <Input value={offlineForm.skill} onChange={(e) => setOfflineForm({ ...offlineForm, skill: e.target.value })} />
            </div>
            <div>
              <Label>Experience</Label>
              <Input value={offlineForm.experience} onChange={(e) => setOfflineForm({ ...offlineForm, experience: e.target.value })} />
            </div>
            <div>
              <Label>Price Per Day</Label>
              <Input value={offlineForm.pricePerDay} onChange={(e) => setOfflineForm({ ...offlineForm, pricePerDay: e.target.value })} />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={offlineForm.address} onChange={(e) => setOfflineForm({ ...offlineForm, address: e.target.value })} />
            </div>
          </div>
          <Button className="mt-3" onClick={handleOfflineOnboard}>Submit Offline Entry</Button>
        </div>
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Loading workers...</p>
          </div>
        ) : (
          <Tabs defaultValue="pending">
            <TabsList className="w-full max-w-md mx-auto">
              <TabsTrigger value="pending" className="flex-1">
                Pending ({pendingWorkers.length})
              </TabsTrigger>
              <TabsTrigger value="verified" className="flex-1">
                Verified ({approvedWorkers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              {pendingWorkers.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <p className="text-gray-500">No pending workers for verification</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingWorkers.map((worker) => (
                    <WorkerVerificationCard
                      key={worker._id || worker.id}
                      worker={worker}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onViewDetails={setSelectedWorker}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="verified" className="mt-6">
              {approvedWorkers.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <p className="text-gray-500">No verified workers yet</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {approvedWorkers.map((worker) => (
                    <VerifiedWorkerCard key={worker._id || worker.id} worker={worker} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Worker Details Dialog */}
        {selectedWorker && (
          <Dialog open={!!selectedWorker} onOpenChange={() => setSelectedWorker(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Worker Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-4">
                  {selectedWorker.image && selectedWorker.image !== '' ? (
                    <img src={selectedWorker.image} alt={selectedWorker.name} className="w-24 h-24 rounded-lg object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center">
                      <User className="h-12 w-12 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{selectedWorker.name}</h3>
                    <p className="text-gray-600">{selectedWorker.skill}</p>
                    <p className="text-sm text-gray-500">{selectedWorker.phone}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-semibold">{selectedWorker.experience} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price/Day</p>
                    <p className="font-semibold">₹{selectedWorker.pricePerDay}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-semibold">{selectedWorker.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Languages</p>
                    <p className="font-semibold">{selectedWorker.languages?.join(', ') || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => { handleApprove(selectedWorker.id || selectedWorker._id); setSelectedWorker(null); }} className="flex-1">
                    Approve
                  </Button>
                  <Button variant="destructive" onClick={() => { handleReject(selectedWorker.id || selectedWorker._id); setSelectedWorker(null); }} className="flex-1">
                    Reject
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

function WorkerVerificationCard({ worker, onApprove, onReject, onViewDetails }: any) {
  const workerId = worker._id || worker.id;
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex gap-3 mb-3">
        {worker.image && worker.image !== '' ? (
          <img src={worker.image} alt={worker.name} className="w-16 h-16 rounded-lg object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
            <User className="h-8 w-8 text-gray-500" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{worker.name}</h3>
          <p className="text-sm text-gray-600">{worker.skill}</p>
          <p className="text-xs text-gray-500">{worker.phone}</p>
        </div>
      </div>

      <div className="space-y-2 mb-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Experience:</span>
          <span className="font-medium">{worker.experience} years</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Price/Day:</span>
          <span className="font-medium">₹{worker.pricePerDay}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onViewDetails(worker)} className="flex-1 gap-1">
          <Eye className="h-4 w-4" />
          View
        </Button>
        <Button size="sm" onClick={() => onApprove(workerId)} className="flex-1 gap-1">
          <CheckCircle2 className="h-4 w-4" />
          Approve
        </Button>
        <Button size="sm" variant="destructive" onClick={() => onReject(workerId)} className="gap-1">
          <XCircle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function VerifiedWorkerCard({ worker }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex gap-3 mb-3">
        {worker.image && worker.image !== '' ? (
          <img src={worker.image} alt={worker.name} className="w-16 h-16 rounded-lg object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
            <User className="h-8 w-8 text-gray-500" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{worker.name}</h3>
            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
          </div>
          <p className="text-sm text-gray-600">{worker.skill}</p>
          <Badge variant="secondary" className="mt-1">
            {worker.completedJobs} jobs
          </Badge>
        </div>
      </div>
    </div>
  );
}
