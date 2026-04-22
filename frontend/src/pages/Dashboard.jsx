import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import { Car, Wrench, IndianRupee, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
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
        <h1 className="text-2xl">Dashboard</h1>
        {user?.role === 'user' && (
          <Link to="/vehicles" className="btn btn-primary btn-sm">Add Vehicle</Link>
        )}
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {user?.role === 'user' ? (
             <>
               <StatCard title="My Vehicles" value={stats?.vehiclesCount || 0} icon={Car} />
               <StatCard title="Bookings" value={stats?.bookingsCount || 0} icon={Calendar} />
               <StatCard title="Total Expenses" value={`₹${stats?.totalExpenses || 0}`} icon={IndianRupee} />
             </>
        ) : (
             <>
               <StatCard title="Total Bookings" value={stats?.bookingsCount || 0} icon={Calendar} />
               <StatCard title="Pending Requests" value={stats?.pendingCount || 0} icon={Wrench} />
               <StatCard title="Total Earnings" value={`₹${stats?.totalEarnings || 0}`} icon={IndianRupee} />
             </>
        )}
      </div>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <Card>
          {user?.role === 'user' ? (
             <>
               <h2 className="text-xl" style={{ marginBottom: '16px' }}>Upcoming Service Reminders</h2>
               <div className="empty-state">
                 <Wrench size={48} className="text-muted" />
                 <p>Check your Reminders tab for upcoming garage appointments and navigation details.</p>
                 <div className="flex gap-2" style={{ marginTop: '16px' }}>
                    <Link to="/reminders" className="btn btn-primary btn-sm">View Reminders</Link>
                    <Link to="/services" className="btn btn-outline btn-sm">Book a Service</Link>
                 </div>
               </div>
             </>
          ) : (
             <>
               <h2 className="text-xl" style={{ marginBottom: '16px' }}>Provider Management Hub</h2>
               <div className="empty-state">
                 <Car size={48} className="text-muted" />
                 <p>Process your incoming customer service requests, configure your garage location, and track your total earnings right from your dedicated portals.</p>
                 <div className="flex gap-2" style={{ marginTop: '16px' }}>
                    <Link to="/manage-bookings" className="btn btn-primary btn-sm">Process Bookings</Link>
                    <Link to="/profile" className="btn btn-outline btn-sm">Configure Garage</Link>
                 </div>
               </div>
             </>
          )}
        </Card>
      </div>
    </div>
  );
}
