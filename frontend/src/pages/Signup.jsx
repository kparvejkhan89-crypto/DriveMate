import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import Alert from '../components/Alert';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { API_BASE_URL } from '../api/config';

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

function LocationMarker({ position, setPosition, setAddress }) {
  const map = useMapEvents({
    async click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
        const data = await response.json();
        if (data && data.display_name && setAddress) {
          setAddress(data.display_name);
        }
      } catch (err) {
        console.error("Failed to fetch address", err);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function Signup() {
  const [role, setRole] = useState('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [garageName, setGarageName] = useState('');
  const [garageAddress, setGarageAddress] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('18:00');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam === 'provider') {
      setRole('provider');
    }
  }, [location]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setError('');
      },
      (err) => {
        setError('Error fetching location. Please allow location access.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill all basic details');
      return;
    }

    if (role === 'provider' && (!garageName || !garageAddress)) {
      setError('Please fill garage details');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name, email, password, role,
        garageDetails: role === 'provider' ? { name: garageName, address: garageAddress, latitude, longitude, opening_time: openingTime, closing_time: closingTime } : null
      };

      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
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
    <div className="container flex justify-center items-center py-5" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <Card className="w-full" style={{ maxWidth: '450px', padding: '32px' }}>
        <h2 className="text-2xl text-center" style={{ marginBottom: '24px' }}>
          {role === 'user' ? 'Create User Account' : 'Create Provider Account'}
        </h2>
        
        <Alert type="error" message={error} onClose={() => setError('')} />

        <div className="flex gap-2" style={{ marginBottom: '24px' }}>
          <Button 
            variant={role === 'user' ? 'primary' : 'outline'} 
            isFullWidth 
            onClick={() => setRole('user')}
          >
            User
          </Button>
          <Button 
            variant={role === 'provider' ? 'primary' : 'outline'} 
            isFullWidth 
            onClick={() => setRole('provider')}
          >
            Provider
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <Input label="Full Name" type="text" name="name" autoComplete="name" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
          <Input label="Email Address" type="email" name="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          <Input label="Password" type="password" name="password" autoComplete="new-password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />

          {role === 'provider' && (
            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <h3 className="text-lg" style={{ marginBottom: '16px' }}>Garage Details</h3>
              <Input label="Garage Name" type="text" placeholder="Super Auto Care" value={garageName} onChange={e => setGarageName(e.target.value)} />
              <Input label="Garage Address" type="text" placeholder="123 Main Street" value={garageAddress} onChange={e => setGarageAddress(e.target.value)} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Input label="Opening Time" type="time" value={openingTime} onChange={e => setOpeningTime(e.target.value)} />
                <Input label="Closing Time" type="time" value={closingTime} onChange={e => setClosingTime(e.target.value)} />
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <p className="text-sm font-semibold" style={{ marginBottom: '8px' }}>Pinpoint Garage on Map</p>
                <div style={{ height: '250px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                  <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker 
                      position={latitude && longitude ? { lat: latitude, lng: longitude } : null} 
                      setPosition={(pos) => { setLatitude(pos.lat); setLongitude(pos.lng); }} 
                      setAddress={setGarageAddress}
                    />
                  </MapContainer>
                </div>
                {latitude && longitude ? (
                  <p className="text-success" style={{ fontSize: '13px', marginTop: '8px' }}>
                     📍 Location Pinned: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </p>
                ) : (
                  <p className="text-muted" style={{ fontSize: '13px', marginTop: '8px' }}>
                     Click anywhere on the map to set your location.
                  </p>
                )}
              </div>
            </div>
          )}

          <Button type="submit" isFullWidth disabled={loading} style={{ marginTop: '24px' }}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted" style={{ marginTop: '24px' }}>
          Already have an account? <Link to={`/login?role=${role}`} className="text-primary">Sign in</Link>
        </p>
      </Card>
    </div>
  );
}
