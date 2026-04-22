import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import { Calendar, Bell } from 'lucide-react';

export default function Reminders() {
  const { token } = useAppContext();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/bookings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch bookings');
        const data = await response.json();
        
        // Filter upcoming bookings
        const upcoming = data.filter(b => b.status === 'accepted' || b.status === 'pending');
        
        const generatedReminders = upcoming.map(b => ({
          id: b.id,
          title: `Service: ${b.service_type}`,
          date: b.date,
          time: b.time,
          description: `At ${b.center_name || 'Selected Garage'} - ${b.center_address || ''}`,
          lat: b.center_lat,
          lng: b.center_lng
        }));

        setReminders(generatedReminders);

        // Trigger OS notification
        if (generatedReminders.length > 0) {
          if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                new Notification('Upcoming Service Reminder', {
                  body: `You have ${generatedReminders.length} upcoming service appointment(s)!`,
                  icon: '/favicon.svg'
                });
              }
            });
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
        <h1 className="text-2xl">Upcoming Reminders</h1>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {reminders.length === 0 ? (
        <Card>
          <div className="empty-state">
            <Bell size={48} className="text-muted" />
            <p>No upcoming service reminders.</p>
          </div>
        </Card>
      ) : (
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {reminders.map(r => (
            <Card key={r.id}>
               <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg flex items-center gap-2">
                        <Bell size={18} className="text-primary"/> {r.title}
                    </h3>
                    <p className="text-muted text-sm">{r.description}</p>
                    {r.lat && r.lng && (
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline text-sm"
                        style={{ display: 'inline-block', color: '#3B82F6', marginTop: '4px' }}
                      >
                        (Get Directions)
                      </a>
                    )}
                  </div>
                  <div>
                    <span className="text-warning flex items-center gap-1 font-semibold" style={{ fontSize: '0.9rem' }}>
                       <Calendar size={14}/> {new Date(r.date).toLocaleDateString()} {r.time ? 'at ' + r.time : ''}
                    </span>
                  </div>
               </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
