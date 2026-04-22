import React, { useState, useRef, useEffect } from 'react';
import { getAnnouncements } from '../api/stats';

const TICKER_DATA = [
  { sym: 'EUR/USD', price: '1.0892', chg: '+0.12%', up: true },
  { sym: 'GBP/USD', price: '1.2641', chg: '-0.08%', up: false },
  { sym: 'USD/JPY', price: '153.42', chg: '+0.21%', up: true },
  { sym: 'XAU/USD', price: '2,318', chg: '+0.45%', up: true },
  { sym: 'BTC',     price: '$71,240', chg: '+1.32%', up: true },
  { sym: 'ETH',     price: '$2,312', chg: '-0.54%', up: false },
  { sym: 'GBP/JPY', price: '192.41', chg: '-0.10%', up: false },
];

export default function Topbar({ title, subtitle, extras, onMenuToggle, onViewNotifications }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const notifRef = useRef(null);

  const fetchNotifs = () => {
    setLoading(true);
    getAnnouncements()
      .then(res => setNotifs(res.announcements || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifs();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifs, 30000);

    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearInterval(interval);
    };
  }, []);

  const timeAgo = (date) => {
    const d = new Date(date);
    const diff = Math.floor((Date.now() - d) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const handleViewAll = () => {
    setOpen(false);
    if (onViewNotifications) onViewNotifications();
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        {onMenuToggle && (
          <button className="hamburger-btn" onClick={onMenuToggle} aria-label="Open menu">
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        )}
        <div className="topbar-title">
          {title} {subtitle && <span>{subtitle}</span>}
        </div>
      </div>
      <div className="topbar-right">
        <div className="ticker-mini">
          {TICKER_DATA.slice(0,4).map(t => (
            <div key={t.sym} className="tm">
              <span className="tm-sym">{t.sym}</span>
              <span className={t.up ? 'tm-up' : 'tm-dn'}>{t.up ? '↑' : '↓'} {t.price}</span>
            </div>
          ))}
        </div>
        
        {extras}
        
        {/* Notification Bell */}
        <div className="notif-wrapper" ref={notifRef}>
          <button 
            className="notif-bell-btn" 
            onClick={() => setOpen(!open)}
            aria-label="Notifications"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {notifs.length > 0 && <span className="notif-count">{notifs.length > 9 ? '9+' : notifs.length}</span>}
          </button>
          
          {open && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">
                <span>Notifications</span>
                {notifs.length > 0 && <span className="notif-new-badge">{notifs.length} New</span>}
              </div>
              
              <div className="notif-dropdown-body">
                {loading ? (
                  <div className="notif-empty">Loading…</div>
                ) : notifs.length === 0 ? (
                  <div className="notif-empty">
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔔</div>
                    You're all caught up!
                  </div>
                ) : (
                  notifs.slice(0, 5).map(n => (
                    <div key={n._id} className="notif-item">
                      <div className="notif-item-icon">{n.priority === 'high' ? '🔴' : '📢'}</div>
                      <div className="notif-item-content">
                        <div className="notif-item-title">{n.title}</div>
                        <div className="notif-item-body">{n.body?.slice(0, 80)}{n.body?.length > 80 ? '...' : ''}</div>
                        <div className="notif-item-time">{timeAgo(n.createdAt)} · {n.postedBy?.name || 'Admin'}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {onViewNotifications && (
                <button className="notif-dropdown-footer" onClick={handleViewAll}>
                  View All Announcements →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
