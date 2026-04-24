import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';
import { API_BASE_URL } from '../api/config';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('user');
  const { login } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam === 'provider' || location.pathname.includes('login-provider')) {
      setRole('provider');
    }
  }, [location]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, requiredRole: role }),
      });


      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.user, data.token);
      
      if (data.user.role === 'provider') {
        navigate('/provider-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex justify-center items-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <Card className="w-full" style={{ maxWidth: '400px', padding: '32px' }}>
        <h2 className="text-2xl text-center" style={{ marginBottom: '24px' }}>
          {role === 'user' ? 'User Login' : 'Provider Login'}
        </h2>
        
        <Alert type="error" message={error} onClose={() => setError('')} />

        <div className="flex gap-2" style={{ marginBottom: '24px' }}>
          <Button 
            type="button"
            variant={role === 'user' ? 'primary' : 'outline'} 
            isFullWidth 
            onClick={() => setRole('user')}
          >
            User
          </Button>
          <Button 
            type="button"
            variant={role === 'provider' ? 'primary' : 'outline'} 
            isFullWidth 
            onClick={() => setRole('provider')}
          >
            Provider
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <Input 
            label="Email Address" 
            type="email" 
            name="email"
            autoComplete="email"
            placeholder="you@example.com" 
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Input 
            label="Password" 
            type="password" 
            name="password"
            autoComplete="current-password"
            placeholder="••••••••" 
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          
          <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
            <label className="flex items-center gap-1 text-sm text-muted">
              <input type="checkbox" /> Remember me
            </label>
            <Link to="#" className="text-sm text-primary">Forgot password?</Link>
          </div>

          <Button type="submit" isFullWidth disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted" style={{ marginTop: '24px' }}>
          Don't have an account? <Link to={`/signup?role=${role}`} className="text-primary">Sign up</Link>
        </p>
      </Card>
    </div>
  );
}
