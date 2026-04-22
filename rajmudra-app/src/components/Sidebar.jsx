import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ role, activeItem, onNav, items, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const roleBadgeClass = {
    superadmin: 'sidebar-role-badge badge-superadmin',
    admin: 'sidebar-role-badge badge-admin-role',
    user: 'sidebar-role-badge badge-user-role',
  }[role];

  const roleLabel = { superadmin: 'SuperAdmin', admin: 'Instructor', user: 'Trader' }[role];
  const roleTextClass = { superadmin: 'role-super', admin: 'role-admin', user: 'role-user' }[role];

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleNavClick = (id) => {
    onNav(id);
    // Close sidebar on mobile after navigating
    if (onMobileClose) onMobileClose();
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={onMobileClose} />
      )}

      <aside className={`sidebar${mobileOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <div>
            <div className="sidebar-logo-text">Rajmudra</div>
            <div className="sidebar-logo-sub">Fintech Platform</div>
          </div>
          <span className={roleBadgeClass}>{roleLabel}</span>
          {/* Mobile close button — sits at the end of the logo row */}
          <button className="sidebar-close-btn" onClick={onMobileClose} aria-label="Close menu">
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          {items.map((item, i) =>
            item.divider ? (
              <span key={i} className="nav-section-label">{item.label}</span>
            ) : (
              <button
                key={item.id}
                className={`nav-item${activeItem === item.id ? ' active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </button>
            )
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-row">
            <div className="avatar avatar-sm">{user?.avatar}</div>
            <div>
              <div className="user-name" style={{ fontSize: '11px' }}>{user?.name}</div>
              <div className={`user-role-text ${roleTextClass}`}>{roleLabel}</div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>Exit</button>
          </div>
        </div>
      </aside>
    </>
  );
}
