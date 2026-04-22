import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import { User, MapPin, Store } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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

export default function Profile() {
  const { user, setUser, logout, token } = useAppContext();

  // User Profile State
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');

  // Provider Garage State
  const [loadingProvider, setLoadingProvider] = useState(user?.role === 'provider');
  const [garageName, setGarageName] = useState('');
  const [garageAddress, setGarageAddress] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [openingTime, setOpeningTime] = useState('09:00:00');
  const [closingTime, setClosingTime] = useState('18:00:00');
  const [servicesOffered, setServicesOffered] = useState('');
  const [garageRating, setGarageRating] = useState(4.0);
  const [garageCount, setGarageCount] = useState(1);
  
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user?.role === 'provider') {
      const fetchProviderServices = async () => {
        try {
          const res = await fetch("http://localhost:5000/api/provider-services", {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
             const data = await res.json();
             if (data) {
                setGarageName(data.name || '');
                setGarageAddress(data.address || '');
                setLatitude(data.latitude || null);
                setLongitude(data.longitude || null);
                setOpeningTime(data.opening_time || '09:00');
                setClosingTime(data.closing_time || '18:00');
                setGarageRating(data.rating ?? 0.0);
                setGarageCount(data.rating_count ?? 0);
             }
          }
        } catch (e) {
          console.error("Error loading garage data:", e);
        } finally {
          setLoadingProvider(false);
        }
      };

      fetchProviderServices();
    }
  }, [user, token]);

  const handleUpdateUser = async () => {
    try {
      setMsg({ type: '', text: '' });
      const res = await fetch("http://localhost:5000/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, name, email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      const updatedUser = { ...user, name };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setMsg({ type: 'success', text: 'Personal Profile updated successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handleUpdateGarage = async () => {
    try {
      setMsg({ type: '', text: '' });
      const res = await fetch("http://localhost:5000/api/provider-services", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ 
           name: garageName, 
           address: garageAddress, 
           latitude, 
           longitude,
           opening_time: openingTime, 
           closing_time: closingTime
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update garage details");

      setMsg({ type: 'success', text: 'Garage Location and Timings updated successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your profile?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/auth/delete-profile/${user.id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Failed to delete profile");

      alert("Profile deleted");
      if (logout) logout(); 
      setTimeout(() => { window.location.href = "/"; }, 500);
    } catch (err) {
      setMsg({ type: 'error', text: "Error deleting profile" });
    }
  };

  if (loadingProvider) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
        <h1 className="text-2xl">My Profile Settings</h1>
      </div>

      {msg.text && (
         <Alert type={msg.type} message={msg.text} onClose={() => setMsg({ type: '', text: '' })} style={{ marginBottom: '24px' }} />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        
        <Card className="w-full" style={{ maxWidth: '800px' }}>
          <div className="flex items-center gap-4" style={{ marginBottom: '24px' }}>
            <div style={{ backgroundColor: '#DBEAFE', padding: '24px', borderRadius: '50%' }}>
              <User size={48} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl">{name}</h2>
              <p className="text-muted text-sm capitalize">{user?.role} Account</p>
            </div>
          </div>

          <form className="grid" style={{ display: 'grid', gap: '16px' }} onSubmit={(e) => e.preventDefault()}>
            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email Address" type="email" value={email} disabled />

            <div className="flex gap-4" style={{ marginTop: '16px' }}>
              <Button type="button" onClick={handleUpdateUser}>Save Personal Details</Button>
              <Button type="button" onClick={handleDelete} variant="danger">Delete Profile</Button>
            </div>
          </form>
        </Card>

        {user?.role === 'provider' && (
          <Card className="w-full" style={{ maxWidth: '800px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Store size={32} className="text-primary" />
                  <h2 className="text-xl">Garage Configuration</h2>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#FEF3C7', padding: '6px 12px', borderRadius: '16px', color: '#D97706', fontWeight: 'bold' }}>
                ⭐ {Number(garageRating).toFixed(1)} 
                <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: '#B45309' }}>({garageCount} Reviews)</span>
              </div>
            </div>
            
            <form className="grid" style={{ display: 'grid', gap: '16px' }} onSubmit={(e) => e.preventDefault()}>
               <Input label="Garage Name" value={garageName} onChange={(e) => setGarageName(e.target.value)} />
               <Input label="Garage Address" value={garageAddress} onChange={(e) => setGarageAddress(e.target.value)} />
               
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                 <Input label="Opening Time" type="time" value={openingTime} onChange={(e) => setOpeningTime(e.target.value)} />
                 <Input label="Closing Time" type="time" value={closingTime} onChange={(e) => setClosingTime(e.target.value)} />
               </div>

               <div style={{ marginTop: '16px' }}>
                  <p className="text-sm font-semibold" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={16}/> Pinpoint Garage on Map
                  </p>
                  <p className="text-muted text-sm" style={{ marginBottom: '8px' }}>
                    Click exactly where your garage is on the map if you relocated so users can accurately navigate to you.
                  </p>
                  <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                    <MapContainer 
                       center={latitude && longitude ? [latitude, longitude] : [51.505, -0.09]} 
                       zoom={latitude && longitude ? 14 : 2} 
                       scrollWheelZoom={true} 
                       style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationMarker 
                        position={latitude && longitude ? { lat: Number(latitude), lng: Number(longitude) } : null} 
                        setPosition={(pos) => { setLatitude(pos.lat); setLongitude(pos.lng); }} 
                        setAddress={setGarageAddress}
                      />
                    </MapContainer>
                  </div>
                  {latitude && longitude ? (
                    <p className="text-success" style={{ fontSize: '13px', marginTop: '8px' }}>
                       📍 Updated Location Details: {Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}
                    </p>
                  ) : null}
               </div>

               <div style={{ marginTop: '16px' }}>
                 <h3 className="text-lg" style={{ marginTop: '16px', marginBottom: '16px' }}>Services Offered</h3>
                 <Input label="Comma-separated services (e.g. Oil Change, Tuning)" placeholder="Enter services..." value={servicesOffered} onChange={e => setServicesOffered(e.target.value)} />
               </div>

               <div style={{ marginTop: '16px' }}>
                 <Button type="button" onClick={handleUpdateGarage}>Update Garage Settings</Button>
               </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}