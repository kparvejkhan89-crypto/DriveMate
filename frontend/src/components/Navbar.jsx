import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CarFront, Bell, User } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, notifications } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content justify-between items-center">
        <Link to="/" className="navbar-brand flex items-center gap-1">
          <CarFront size={28} className="text-primary" />
          <span>DriveMate</span>
        </Link>
        <div className="navbar-links flex items-center gap-2">
          {user ? (
            <>
              <span className="navbar-user">Hello, {user.name}</span>
              <Link to="/notifications" className="relative p-1 hover-text">
                <Bell size={20} className="text-muted" />
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <span style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#EF4444', color: 'white', fontSize: '10px', borderRadius: '50%', padding: '1px 5px', minWidth: '16px', textAlign: 'center' }}>
                    {notifications.filter(n => !n.is_read).length}
                  </span>
                )}
              </Link>
              <div className="navbar-profile cursor-pointer" onClick={() => navigate('/profile')}>
                <User size={20} />
              </div>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
