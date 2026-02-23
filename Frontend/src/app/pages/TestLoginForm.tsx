import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';

const TestLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  const API_URL = 'http://localhost:5000/api/auth';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const endpoint = isLogin ? '/login' : '/register';
      const payload = isLogin
        ? { email, password }
        : { name, email, password };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'An error occurred');
        return;
      }

      setMessage(`${isLogin ? 'Login' : 'Registration'} successful!`);
      setUser(data.user);
      localStorage.setItem('token', data.token);

      // Reset form
      setEmail('');
      setPassword('');
      setName('');
    } catch (err) {
      setError('Failed to connect to server. Make sure the backend is running on http://localhost:5000');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    setMessage('Logged out successfully');
  };

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome!</CardTitle>
            <CardDescription>You are logged in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-medium text-green-800">Login Successful</p>
              <p className="text-xs text-green-700 mt-1">Connected to MongoDB Atlas</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-semibold">Name:</span> {user.name}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Email:</span> {user.email}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Role:</span> {user.role}
              </p>
            </div>
            <Button onClick={handleLogout} className="w-full" variant="outline">
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? 'Login' : 'Register'}</CardTitle>
          <CardDescription>
            Test your MongoDB Atlas connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">{message}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
            </Button>

            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setMessage('');
              }}
              className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              disabled={loading}
            >
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
            </button>
          </form>

          <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              <span className="font-semibold">Test Credentials:</span>
              <br />
              Email: test@example.com
              <br />
              Password: password123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestLoginForm;
