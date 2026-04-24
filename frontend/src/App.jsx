import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import Vehicles from './pages/Vehicles';
import Services from './pages/Services';
import Expenses from './pages/Expenses';
import ManageBookings from './pages/ManageBookings';
import Reminders from './pages/Reminders';
import Documents from './pages/Documents';
import Profile from './pages/Profile';
import ManageServices from './pages/ManageServices';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';


const ProtectedRoute = ({ children, roleRequired }) => {
  const { user } = useAppContext();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roleRequired && user.role !== roleRequired) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        {children}
      </main>
    </div>
  );
};

function AppContent() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login-provider" element={<Login />} />

        <Route path="/signup" element={<Signup />} />
        
        {/* User Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute roleRequired="user">
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/vehicles" 
          element={
            <ProtectedRoute roleRequired="user">
              <Vehicles />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/services" 
          element={
            <ProtectedRoute roleRequired="user">
              <Services />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/expenses" 
          element={
            <ProtectedRoute roleRequired="user">
              <Expenses />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reminders" 
          element={
            <ProtectedRoute roleRequired="user">
              <Reminders />
            </ProtectedRoute>
          } 
        />

        {/* Provider Routes */}
        <Route 
          path="/provider-dashboard" 
          element={
            <ProtectedRoute roleRequired="provider">
              <ProviderDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/manage-bookings" 
          element={
            <ProtectedRoute roleRequired="provider">
              <ManageBookings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/manage-services" 
          element={
            <ProtectedRoute roleRequired="provider">
              <ManageServices />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/provider-profile" 
          element={
            <ProtectedRoute roleRequired="provider">
              <Profile />
            </ProtectedRoute>
          } 
        />
        
        {/* Common protected routes */}
        <Route 
          path="/documents" 
          element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
}
