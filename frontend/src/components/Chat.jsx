import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Send, X } from 'lucide-react';
import { API_BASE_URL } from '../api/config';
import Button from './Button';
import Input from './Input';

export default function Chat({ bookingId, bookingName, onClose }) {
  const { token, user } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef();

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/${bookingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [bookingId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ bookingId, message: newMessage })
      });
      if (res.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', width: '350px', height: '500px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', zIndex: 1000, border: '1px solid #E2E8F0' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'between', alignItems: 'center', backgroundColor: '#3B82F6', color: 'white', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
        <h4 className="font-semibold text-sm truncate" style={{ flex: 1 }}>Chat: {bookingName}</h4>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={18} /></button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <p className="text-center text-xs text-muted">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-xs text-muted">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((m, idx) => {
            const isMe = m.sender_id == user.id;
            return (
              <div key={idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                <div style={{ backgroundColor: isMe ? '#3B82F6' : '#F1F5F9', color: isMe ? 'white' : 'black', padding: '8px 12px', borderRadius: '12px', borderBottomRightRadius: isMe ? '0' : '12px', borderBottomLeftRadius: isMe ? '12px' : '0', fontSize: '14px' }}>
                  {m.message}
                </div>
                <p style={{ fontSize: '10px', color: '#64748B', marginTop: '2px', textAlign: isMe ? 'right' : 'left' }}>
                   {isMe ? 'Me' : m.sender_name} • {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSend} style={{ padding: '16px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ flex: 1, padding: '8px 12px', borderRadius: '20px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none' }}
        />
        <button type="submit" style={{ backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
