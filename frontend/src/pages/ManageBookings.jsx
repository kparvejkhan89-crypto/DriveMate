import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import { API_BASE_URL } from '../api/config';

import { Calendar, User, MapPin, MessageSquare } from 'lucide-react';
import Chat from '../components/Chat';


export default function ManageBookings() {
  const { token } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeChat, setActiveChat] = useState(null);


  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [token]);

  const handleUpdateStatus = async (id, status) => {
    let payload = { status };
    if (status === 'rejected') {
       const reason = window.prompt("Please provide a reason for rejecting this booking:");
       if (reason === null) return; // Cancelled
       payload.reason = reason;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status');
      }
      await fetchBookings();
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'text-success';
      case 'rejected': return 'text-danger';
      case 'completed': return 'text-primary';
      case 'cancelled': return 'text-muted text-strikethrough';
      default: return 'text-warning';
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
        <h1 className="text-2xl">Manage Bookings</h1>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {bookings.length === 0 ? (
        <Card>
          <div className="empty-state">
            <Calendar size={48} className="text-muted" />
            <p>No booking requests yet.</p>
          </div>
        </Card>
      ) : (
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {bookings.map(b => (
            <Card key={b.id}>
               <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg" style={{ marginBottom: '4px' }}>{b.service_type}</h3>
                    <p className="text-muted text-sm flex items-center gap-1">
                      <User size={14}/> {b.user_name}
                    </p>
                    <p className="text-muted text-sm flex items-center gap-1" style={{ marginTop: '4px' }}>
                       <Calendar size={14}/> {new Date(b.date).toLocaleDateString()} at {b.time}
                    </p>
                    <div className="flex gap-2" style={{ marginTop: '8px' }}>
                       <button 
                         onClick={() => setActiveChat({ id: b.id, name: b.service_type })}
                         className="text-primary hover:underline text-xs flex items-center gap-1"
                         style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                       >
                         <MessageSquare size={14} /> Message User
                       </button>
                    </div>



                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span style={{ padding: '6px 12px', borderRadius: '16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '0.875rem', textTransform: 'capitalize' }} className={getStatusColor(b.status)}>
                      {b.status}
                    </span>
                    
                    {b.status === 'pending' && (
                        <div className="flex gap-2" style={{ marginTop: '8px' }}>
                            <Button variant="danger" size="sm" onClick={() => handleUpdateStatus(b.id, 'rejected')}>Reject</Button>
                            <Button variant="primary" size="sm" onClick={() => handleUpdateStatus(b.id, 'accepted')}>Accept</Button>
                        </div>
                    )}
                    
                    {b.status === 'accepted' && (
                        <div className="flex gap-2" style={{ marginTop: '8px' }}>
                            <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(b.id, 'cancelled')}>Cancel</Button>
                            <Button variant="secondary" size="sm" onClick={() => handleUpdateStatus(b.id, 'completed')}>Mark Completed</Button>
                        </div>
                    )}

                    {(b.status === 'accepted' || b.status === 'completed') && (
                        <div style={{ marginTop: '12px', borderTop: '1px solid #F1F5F9', paddingTop: '8px' }}>
                           <p className="text-xs text-muted" style={{ marginBottom: '4px' }}>Service Documentation</p>
                           <input 
                             type="file" 
                             id={`photo-${b.id}`} 
                             style={{ display: 'none' }} 
                             onChange={() => alert('Photo uploaded successfully! (Simulation)')}
                           />
                           <label 
                             htmlFor={`photo-${b.id}`}
                             className="text-primary hover:underline text-xs cursor-pointer flex items-center gap-1"
                           >
                             📷 Add Progress Photo
                           </label>
                        </div>
                    )}

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

