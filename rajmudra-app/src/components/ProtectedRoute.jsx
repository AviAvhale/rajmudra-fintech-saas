import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  // Wait for session check before deciding
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--black)',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{
          width: '48px', height: '48px',
          border: '3px solid rgba(201,168,76,0.2)',
          borderTop: '3px solid var(--gold)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: 'var(--silver)', fontSize: '13px' }}>Verifying session…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) {
    const routes = { superadmin: '/superadmin', admin: '/admin', user: '/user' };
    return <Navigate to={routes[user.role] || '/login'} replace />;
  }

  return children;
}
