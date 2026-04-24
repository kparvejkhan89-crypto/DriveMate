import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import { API_BASE_URL } from '../api/config';

import { Car, Wrench, IndianRupee, Calendar, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';



export default function Dashboard() {
  const { user, token } = useAppContext();


  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allBookings, setAllBookings] = useState([]);
  const [smartReminder, setSmartReminder] = useState(null);


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const data = await response.json();
        setStats(data);

        // Fetch all bookings for smart reminders and PDF
        const bRes = await fetch(`${API_BASE_URL}/api/bookings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (bRes.ok) {
           const bData = await bRes.json();
           setAllBookings(bData);
           
           if (user?.role === 'user') {
             const completed = bData.filter(b => b.status === 'completed');
             if (completed.length > 0) {
                const latest = new Date(completed[0].date);
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                if (latest < sixMonthsAgo) {
                  setSmartReminder({ type: 'overdue', date: latest.toLocaleDateString() });
                }
             } else {
                setSmartReminder({ type: 'never', date: null });
             }
           }
        }
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
        <div className="flex gap-2">
          {user?.role === 'user' && (
            <Link to="/vehicles" className="btn btn-primary btn-sm">Add Vehicle</Link>
          )}
        </div>


      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {user?.role === 'user' ? (
             <>
                <StatCard title="My Vehicles" value={stats?.vehiclesCount || 0} icon={Car} />
                <StatCard title="Bookings" value={stats?.bookingsCount || 0} icon={Calendar} />
             </>
        ) : (
             <>
                <StatCard title="Total Bookings" value={stats?.bookingsCount || 0} icon={Calendar} />
                <StatCard title="Pending Requests" value={stats?.pendingCount || 0} icon={Wrench} />
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

        {user?.role === 'user' && smartReminder && (
          <Card style={{ backgroundColor: '#FFFBEB', border: '1px solid #FEF3C7' }}>
            <div className="flex items-start gap-4">
               <div style={{ backgroundColor: '#FEF3C7', padding: '12px', borderRadius: '50%' }}>
                  <AlertTriangle className="text-warning" size={24} />
               </div>
               <div>
                  <h3 className="text-lg font-semibold" style={{ color: '#92400E' }}>Smart Maintenance Suggestion</h3>
                  <p className="text-sm" style={{ color: '#B45309', marginTop: '4px' }}>
                    {smartReminder.type === 'never' 
                      ? "You haven't booked any service yet! We recommend a general checkup for your vehicle's longevity."
                      : `Your last service was on ${smartReminder.date}. It's been over 6 months! We recommend a routine maintenance check.`}
                  </p>
                  <Link to="/services" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>Book Checkup Now</Link>
               </div>
            </div>
          </Card>
        )}
      </div>

    </div>
  );
}
