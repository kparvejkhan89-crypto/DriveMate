import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import { API_BASE_URL } from '../api/config';

import { Calendar, MapPin, Wrench } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function Services() {
  const { token } = useAppContext();
  const [centers, setCenters] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBooking, setShowBooking] = useState(false);

  // Booking state
  const [selectedCenter, setSelectedCenter] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // Search logic
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [ratingInput, setRatingInput] = useState({});

  const filteredCenters = centers.filter(c => 
     c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const fetchData = async () => {
    try {
      const [resCenters, resBookings] = await Promise.all([
        fetch(`${API_BASE_URL}/api/service-centers`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/bookings`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (!resCenters.ok || !resBookings.ok) throw new Error('Failed to fetch data');
      
      setCenters(await resCenters.json());
      setBookings(await resBookings.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const [centerServices, setCenterServices] = useState([]);

  useEffect(() => {
    if (selectedCenter) {
      fetch(`${API_BASE_URL}/api/service-centers/${selectedCenter}/services`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setCenterServices(data))
      .catch(err => console.error('Failed to fetch center services', err));
    } else {
      setCenterServices([]);
    }
  }, [selectedCenter, token]);

  const handleBookService = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedCenter || !serviceType || !date || !time) {
      setError('Please fill in all details');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ center_id: selectedCenter, service_type: serviceType, date, time })
      });
      if (!response.ok) throw new Error('Failed to book service');
      await fetchData();
      setShowBooking(false);
      setSelectedCenter(''); setServiceType(''); setDate(''); setTime('');
      setCenterServices([]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'cancelled' })
      });
      
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel booking');
      }
      
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'text-success';
      case 'rejected': return 'text-danger';
      case 'completed': return 'text-primary';
      case 'cancelled': return 'text-muted';
      default: return 'text-warning';
    }
  };

  if (loading) return <Spinner />;

  const handleRateBooking = async (id, ratingScore) => {
    if (!ratingScore) {
       alert("Please select a rating!");
       return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ratingScore: parseInt(ratingScore) })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to submit rating');
      
      alert(data.message);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(h, m, 0);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
        <h1 className="text-2xl">Services & Bookings</h1>
        <Button onClick={() => setShowBooking(!showBooking)}>
          {showBooking ? 'Cancel Booking' : 'Book a Service'}
        </Button>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {showBooking && (
        <Card className="w-full" style={{ marginBottom: '32px' }}>
          <h2 className="text-xl" style={{ marginBottom: '16px' }}>Book New Service</h2>
          <form onSubmit={handleBookService} className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            
            <div style={{ gridColumn: '1 / -1', position: 'relative', zIndex: 500 }}>
              <Input 
                label="Search Service Center (Name, City)"
                type="text" 
                placeholder="Type garage name or city to search..." 
                value={searchQuery}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                  if (selectedCenter) setSelectedCenter('');
                }}
              />
              {showDropdown && (
                 <div style={{ position: 'absolute', top: '75px', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', zIndex: 1000, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                   {filteredCenters.length > 0 ? filteredCenters.map(center => {
                      const hours = center.opening_time && center.closing_time ? ` | 🕒 ${formatTime(center.opening_time)} - ${formatTime(center.closing_time)}` : '';
                      return (
                        <div 
                          key={center.id} 
                          style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #F1F5F9' }}
                          onClick={() => {
                            setSelectedCenter(center.id);
                            setSearchQuery(center.name);
                            setShowDropdown(false);
                          }}
                        >
                          <strong>{center.name}</strong> <span style={{ fontSize: '0.85rem', color: '#64748B' }}>{center.address ? `- ${center.address}` : ''} (Rating: {center.rating}){hours}</span>
                        </div>
                      );
                   }) : <div style={{ padding: '12px 16px', color: '#64748B' }}>No garages found matching your search.</div>}
                 </div>
              )}

              {selectedCenter && centers.find(c => c.id === parseInt(selectedCenter))?.latitude && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p className="text-sm font-semibold">📍 Garage Location Map:</p>
                    <p className="text-sm text-muted" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                       <span>{centers.find(c => c.id === parseInt(selectedCenter)).address}</span>
                       <span style={{ fontWeight: '500', color: '#10B981', padding: '2px 8px', backgroundColor: '#ECFDF5', borderRadius: '12px' }}>
                         🕒 {formatTime(centers.find(c => c.id === parseInt(selectedCenter)).opening_time)} - {formatTime(centers.find(c => c.id === parseInt(selectedCenter)).closing_time)}
                       </span>
                    </p>
                  </div>
                  <div style={{ height: '250px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                    <MapContainer 
                      key={selectedCenter} // Force re-render when changing centers
                      center={[
                         centers.find(c => c.id === parseInt(selectedCenter)).latitude, 
                         centers.find(c => c.id === parseInt(selectedCenter)).longitude
                      ]} 
                      zoom={14} 
                      scrollWheelZoom={true} 
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[
                         centers.find(c => c.id === parseInt(selectedCenter)).latitude, 
                         centers.find(c => c.id === parseInt(selectedCenter)).longitude
                      ]} />
                    </MapContainer>
                  </div>
                </div>
              )}
            </div>

            {selectedCenter && (
               <div className="input-group">
                 <label className="input-label">Service Type</label>
                 <select className="input-field" value={serviceType} onChange={e => setServiceType(e.target.value)}>
                   <option value="">{centerServices.length > 0 ? 'Select a Service' : 'No services offered by this garage'}</option>
                   {centerServices.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                   ))}
                 </select>
               </div>
            )}
            
            <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
            <Input label="Time" type="time" value={time} onChange={e => setTime(e.target.value)} />
            
            <div style={{ gridColumn: '1 / -1' }}>
               <Button type="submit">Confirm Booking</Button>
            </div>
          </form>
        </Card>
      )}

      {bookings.length === 0 ? (
        <Card>
          <div className="empty-state">
            <Wrench size={48} className="text-muted" />
            <p>No service history or upcoming bookings.</p>
          </div>
        </Card>
      ) : (
        <div>
          <h2 className="text-xl" style={{ marginBottom: '16px' }}>Booking History</h2>
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            {bookings.map(b => (
              <Card key={b.id}>
                 <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg" style={{ marginBottom: '4px' }}>{b.service_type}</h3>
                      <div className="text-muted text-sm flex items-center gap-1">
                        <MapPin size={14}/> {b.center_name} {b.center_address ? `- ${b.center_address}` : ''}
                        {b.center_lat && b.center_lng && (
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${b.center_lat},${b.center_lng}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                            style={{ marginLeft: '8px', color: '#3B82F6' }}
                          >
                            (Get Directions)
                          </a>
                        )}
                      </div>
                      <p className="text-muted text-sm flex items-center gap-1" style={{ marginTop: '4px' }}>
                         <Calendar size={14}/> {new Date(b.date).toLocaleDateString()} at {b.time}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <span style={{ padding: '6px 12px', borderRadius: '16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '0.875rem', textTransform: 'capitalize' }} className={getStatusColor(b.status)}>
                        {b.status}
                      </span>
                      {b.status === 'rejected' && b.rejection_reason && (
                         <div className="text-danger" style={{ fontSize: '0.8rem', maxWidth: '200px', textAlign: 'right' }}>
                           <strong style={{ display: 'block' }}>Reason for Rejection:</strong> 
                           {b.rejection_reason}
                         </div>
                      )}
                      {(b.status === 'pending' || b.status === 'accepted') && (
                        <Button variant="outline" onClick={() => handleCancelBooking(b.id)} style={{ padding: '4px 12px', fontSize: '0.8rem', color: '#EF4444', borderColor: '#EF4444' }}>
                          Cancel
                        </Button>
                      )}
                      {b.status === 'completed' && !b.is_rated && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <select 
                            className="input-field" 
                            style={{ padding: '0px 8px', fontSize: '0.8rem', width: 'auto', minWidth: '60px', height: '28px', backgroundColor: '#F8FAFC' }}
                            value={ratingInput[b.id] || ''} 
                            onChange={(e) => setRatingInput({ ...ratingInput, [b.id]: e.target.value })}
                          >
                            <option value="">Rate</option>
                            <option value="5">⭐⭐⭐⭐⭐</option>
                            <option value="4">⭐⭐⭐⭐</option>
                            <option value="3">⭐⭐⭐</option>
                            <option value="2">⭐⭐</option>
                            <option value="1">⭐</option>
                          </select>
                          <Button variant="primary" onClick={() => handleRateBooking(b.id, ratingInput[b.id])} style={{ padding: '4px 12px', fontSize: '0.8rem', backgroundColor: '#3B82F6', height: '28px', lineHeight: '1' }}>
                            Submit
                          </Button>
                        </div>
                      )}
                      {b.status === 'completed' && b.is_rated && (
                        <span style={{ fontSize: '0.85rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                          ⭐ Rated Successfully
                        </span>
                      )}
                    </div>
                 </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
