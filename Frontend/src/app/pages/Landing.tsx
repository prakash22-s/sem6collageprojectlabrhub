import { Link } from 'react-router';
import { Wrench, Users, Shield, Clock, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">LabourHub</h1>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/login">
              <Button variant="ghost" size="sm">Admin</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Find Trusted Workers
            <br />
            <span className="text-blue-600">Near You</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            Connect with verified electricians, plumbers, carpenters, and more.
            Book instantly, pay securely, rate honestly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto">
                Find Workers
              </Button>
            </Link>
            <Link to="/worker/onboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Join as Worker
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose LabourHub?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="h-10 w-10 text-blue-600" />}
              title="Verified Workers"
              description="All workers are verified with Aadhaar and police verification for your safety."
            />
            <FeatureCard
              icon={<Star className="h-10 w-10 text-blue-600" />}
              title="Rated & Reviewed"
              description="Check ratings and reviews from real customers before hiring."
            />
            <FeatureCard
              icon={<Clock className="h-10 w-10 text-blue-600" />}
              title="Quick Booking"
              description="Book workers instantly with OTP verification. No lengthy sign-ups."
            />
          </div>
        </div>
      </section>

      {/* Worker Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Available Services
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Electrician', 'Plumber', 'Carpenter', 'Mason', 'Painter', 'AC Technician', 'Tile Worker', 'Welder'].map((skill) => (
              <Link to="/workers" key={skill}>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
                  <Wrench className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <p className="font-semibold text-gray-900">{skill}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            <StatCard number="10,000+" label="Verified Workers" />
            <StatCard number="50,000+" label="Jobs Completed" />
            <StatCard number="4.8" label="Average Rating" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Wrench className="h-6 w-6" />
            <h4 className="text-xl font-bold">LabourHub</h4>
          </div>
          <p className="text-gray-400 mb-4">
            Connecting skilled workers with customers across India
          </p>
          <p className="text-sm text-gray-500">
            © 2026 LabourHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="mb-4">{icon}</div>
      <h4 className="text-xl font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold mb-2">{number}</div>
      <div className="text-blue-100">{label}</div>
    </div>
  );
}
