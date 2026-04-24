import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';
import { Bell, Check } from 'lucide-react';
import { API_BASE_URL } from '../api/config';

export default function Notifications() {
  const { token, notifications, setNotifications } = useAppContext();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
        <h1 className="text-2xl">Notifications</h1>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {notifications.length === 0 ? (
        <Card>
          <div className="empty-state">
            <Bell size={48} className="text-muted" />
            <p>You have no notifications at the moment.</p>
          </div>
        </Card>
      ) : (
        <div className="grid" style={{ display: 'grid', gap: '16px' }}>
          {notifications.map(n => (
            <Card key={n.id} style={{ borderLeft: n.is_read ? '4px solid #E2E8F0' : '4px solid #3B82F6', opacity: n.is_read ? 0.8 : 1 }}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold" style={{ marginBottom: '4px' }}>{n.title}</h3>
                  <p className="text-muted">{n.message}</p>
                  <span className="text-xs text-muted" style={{ display: 'block', marginTop: '8px' }}>
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
                {!n.is_read && (
                  <button 
                    onClick={() => markAsRead(n.id)}
                    className="text-primary hover:underline flex items-center gap-1"
                    style={{ fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <Check size={16} /> Mark as read
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
