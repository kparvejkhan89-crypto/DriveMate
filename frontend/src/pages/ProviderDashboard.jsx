import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import { Calendar, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProviderDashboard() {
  const { user, token } = useAppContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
        <h1 className="text-2xl">Provider Dashboard</h1>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <StatCard title="Total Bookings" value={stats?.bookingsCount || 0} icon={Calendar} />
        <StatCard title="Pending Requests" value={stats?.pendingCount || 0} icon={Calendar} colorClass="text-warning" />
      </div>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <Card>
          <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
            <h2 className="text-xl">Recent Bookings</h2>
            <Link to="/manage-bookings" className="text-primary text-sm">View all</Link>
          </div>
          {stats?.pendingCount === 0 ? (
            <div className="empty-state">
              <CheckCircle size={48} className="text-success" />
              <p>You're all up to date!</p>
            </div>
          ) : (
            <p className="text-muted">You have {stats?.pendingCount} pending requests to review.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
