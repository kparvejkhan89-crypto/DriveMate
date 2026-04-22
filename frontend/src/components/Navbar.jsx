import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CarFront, Bell, User } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAppContext();
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
              <Bell size={20} className="text-muted cursor-pointer hover-text" />
              <div className="navbar-profile cursor-pointer">
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
