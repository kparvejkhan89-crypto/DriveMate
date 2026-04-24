import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import { API_BASE_URL } from '../api/config';
import { Users, Store, Shield } from 'lucide-react';

export default function AdminDashboard() {
  const { token } = useAppContext();
  const [users, setUsers] = useState([]);
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('users');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, gRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/api/admin/garages`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (!uRes.ok || !gRes.ok) throw new Error('Failed to fetch admin data');
        
        setUsers(await uRes.json());
        setGarages(await gRes.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
        <h1 className="text-2xl flex items-center gap-2"><Shield className="text-primary" /> Admin Control Center</h1>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      <div className="flex gap-4" style={{ marginBottom: '24px' }}>
        <button 
          onClick={() => setTab('users')} 
          className={`btn ${tab === 'users' ? 'btn-primary' : 'btn-outline'} btn-sm flex items-center gap-2`}
        >
          <Users size={16} /> Users ({users.length})
        </button>
        <button 
          onClick={() => setTab('garages')} 
          className={`btn ${tab === 'garages' ? 'btn-primary' : 'btn-outline'} btn-sm flex items-center gap-2`}
        >
          <Store size={16} /> Garages ({garages.length})
        </button>
      </div>

      {tab === 'users' ? (
        <Card>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Role</th>
                <th style={{ padding: '12px' }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px' }}>{u.id}</td>
                  <td style={{ padding: '12px' }}>{u.name}</td>
                  <td style={{ padding: '12px' }}>{u.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ textTransform: 'capitalize', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', backgroundColor: u.role === 'admin' ? '#DBEAFE' : '#F1F5F9' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <Card>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Address</th>
                <th style={{ padding: '12px' }}>Rating</th>
                <th style={{ padding: '12px' }}>Reviews</th>
              </tr>
            </thead>
            <tbody>
              {garages.map(g => (
                <tr key={g.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{g.name}</td>
                  <td style={{ padding: '12px', fontSize: '13px' }}>{g.address}</td>
                  <td style={{ padding: '12px' }}>⭐ {g.rating}</td>
                  <td style={{ padding: '12px' }}>{g.rating_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
