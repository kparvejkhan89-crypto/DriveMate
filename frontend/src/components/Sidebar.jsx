import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Car, Wrench, IndianRupee, Calendar, FileText, Settings, Shield } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './Sidebar.css';

export default function Sidebar() {
  const { user } = useAppContext();
  
  const userLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/vehicles', label: 'My Vehicles', icon: Car },
    { to: '/services', label: 'Services', icon: Wrench },
    { to: '/reminders', label: 'Reminders', icon: Calendar },
    { to: '/documents', label: 'Documents', icon: FileText },
    { to: '/profile', label: 'Profile', icon: Settings },
  ];

  const providerLinks = [
    { to: '/provider-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/manage-services', label: 'Manage Services', icon: Wrench },
    { to: '/manage-bookings', label: 'Bookings', icon: Calendar },
    { to: '/provider-profile', label: 'Profile', icon: Settings },
  ];

  let links = userLinks;
  if (user?.role === 'provider') links = providerLinks;



  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} className="sidebar-icon" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
