import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import { API_BASE_URL } from '../api/config';

import { Car } from 'lucide-react';

export default function Vehicles() {
  const { token } = useAppContext();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  // Form state
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [number, setNumber] = useState('');
  const [year, setYear] = useState('');

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      const data = await response.json();
      setVehicles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [token]);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setError('');
    if (!brand || !model || !number || !year) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicles`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ brand, model, number, year })
      });
      if (!response.ok) throw new Error('Failed to add vehicle');
      await fetchVehicles();
      setShowAdd(false);
      setBrand(''); setModel(''); setNumber(''); setYear('');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
        <h1 className="text-2xl">My Vehicles</h1>
        <Button onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : 'Add New Vehicle'}
        </Button>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {showAdd && (
        <Card className="w-full" style={{ marginBottom: '32px' }}>
          <h2 className="text-xl" style={{ marginBottom: '16px' }}>Add New Vehicle</h2>
          <form onSubmit={handleAddVehicle} className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <Input label="Brand" placeholder="e.g. Honda" value={brand} onChange={e => setBrand(e.target.value)} />
            <Input label="Model" placeholder="e.g. City" value={model} onChange={e => setModel(e.target.value)} />
            <Input label="Registration Number" placeholder="e.g. MH 01 AB 1234" value={number} onChange={e => setNumber(e.target.value)} />
            <Input label="Year" type="number" placeholder="2020" value={year} onChange={e => setYear(e.target.value)} />
            <div style={{ gridColumn: '1 / -1' }}>
               <Button type="submit">Save Vehicle</Button>
            </div>
          </form>
        </Card>
      )}

      {vehicles.length === 0 ? (
        <Card>
          <div className="empty-state">
            <Car size={48} className="text-muted" />
            <p>No vehicles added yet.</p>
            <Button variant="outline" onClick={() => setShowAdd(true)}>Add your first vehicle</Button>
          </div>
        </Card>
      ) : (
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {vehicles.map(v => (
            <Card key={v.id}>
              <div className="flex items-center gap-2" style={{ marginBottom: '16px' }}>
                <div style={{ padding: '12px', backgroundColor: '#EFF6FF', borderRadius: '50%' }}>
                  <Car size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg">{v.brand} {v.model}</h3>
                  <p className="text-muted text-sm">{v.year}</p>
                </div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <p className="text-sm text-muted">Registration Number</p>
                <p style={{ fontWeight: '600', letterSpacing: '1px' }}>{v.number}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
