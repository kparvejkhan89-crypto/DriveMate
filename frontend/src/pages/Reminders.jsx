import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import { Calendar, Bell, MessageSquare, Navigation } from 'lucide-react';
import Chat from '../components/Chat';

import { API_BASE_URL } from '../api/config';


export default function Reminders() {
  const { token } = useAppContext();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeChat, setActiveChat] = useState(null);


  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/bookings`, {
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

        setReminders(generatedReminders);
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
                        <div className="flex gap-3" style={{ marginTop: '12px' }}>
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm flex items-center gap-1"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            <Navigation size={14}/> Navigate Now
                          </a>
                          <button 
                            onClick={() => setActiveChat({ id: r.id, name: r.title })}
                            className="btn btn-primary btn-sm flex items-center gap-1"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            <MessageSquare size={14}/> Message Garage
                          </button>
                        </div>
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
      {activeChat && (
        <Chat 
          bookingId={activeChat.id} 
          bookingName={activeChat.name} 
          onClose={() => setActiveChat(null)} 
        />
      )}
    </div>
  );
}

