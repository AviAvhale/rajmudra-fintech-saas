import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage          from './pages/LandingPage';
import LoginPage            from './pages/LoginPage';
import RegisterPage         from './pages/RegisterPage';
import SuperAdminDashboard  from './pages/superadmin/SuperAdminDashboard';
import AdminDashboard       from './pages/admin/AdminDashboard';
import UserDashboard        from './pages/user/UserDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"          element={<LandingPage />} />
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/register"  element={<RegisterPage />} />
          <Route path="/superadmin" element={
            <ProtectedRoute role="superadmin"><SuperAdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin"     element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/user"      element={
            <ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>
          } />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
