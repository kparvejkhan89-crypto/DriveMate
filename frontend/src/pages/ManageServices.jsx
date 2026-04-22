import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import { Wrench, Trash2 } from 'lucide-react';

export default function ManageServices() {
  const { token } = useAppContext();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/managed-services', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [token]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice) {
      setError('Please fill in both service name and price');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/managed-services', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name: newServiceName, price: parseFloat(newServicePrice) })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add service');
      
      await fetchServices();
      setShowAdd(false);
      setNewServiceName('');
      setNewServicePrice('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/managed-services/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete service');
      await fetchServices();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
        <h1 className="text-2xl">Manage Services</h1>
        <Button onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : 'Add New Service'}
        </Button>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {showAdd && (
        <Card className="w-full" style={{ marginBottom: '32px' }}>
          <h2 className="text-xl" style={{ marginBottom: '16px' }}>Add Service Offering</h2>
          <form className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }} onSubmit={handleAdd}>
             <Input label="Service Name" placeholder="e.g. Brake Replacement" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} />
             <Input label="Price (₹)" type="number" placeholder="2000" value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} />
            <div style={{ gridColumn: '1 / -1' }}>
               <Button type="submit">Add Service</Button>
            </div>
          </form>
        </Card>
      )}

      {services.length === 0 ? (
        <Card>
          <div className="empty-state">
            <Wrench size={48} className="text-muted" />
            <p>No services added yet. Add your first service to show up in user searches.</p>
          </div>
        </Card>
      ) : (
        <div className="grid" style={{ display: 'grid', gap: '16px' }}>
          {services.map(s => (
            <Card key={s.id}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div style={{ padding: '12px', backgroundColor: '#EFF6FF', borderRadius: '50%' }}>
                    <Wrench size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">{s.name}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <span className="text-primary font-bold">₹{s.price}</span>
                   <button 
                    onClick={() => handleDelete(s.id)}
                    style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    title="Delete Service"
                   >
                     <Trash2 size={20} />
                   </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
