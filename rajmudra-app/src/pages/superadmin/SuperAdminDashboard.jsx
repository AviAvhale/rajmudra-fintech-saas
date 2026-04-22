import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import { useAuth } from '../../context/AuthContext';
import VideoModal from '../../components/VideoModal';
import { getSuperAdminStats } from '../../api/stats';
import { getUsers, updateUser, deleteUser } from '../../api/users';
import { getTickets, updateTicket } from '../../api/tickets';
import { getCourses, addCourseVideo, updateCourseTopics, getCourseAnalytics, getCourseStudents, archiveCourse } from '../../api/courses';
import { getSettings, saveSettings, sendPushNotification } from '../../api/courses';

// ── Sub-page components ──────────────────────────────────────────────────────
function RevenueChart({ data }) {
  // data = [{ _id: { year, month }, count }] from MongoDB aggregation
  const MONTH_NAMES = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let months, vals;
  if (data && data.length > 0) {
    months = data.map(d => MONTH_NAMES[d._id.month]);
    vals   = data.map(d => d.count);
  } else {
    months = ['Oct','Nov','Dec','Jan','Feb','Mar','Apr'];
    vals   = [55, 68, 82, 74, 91, 108, 100];
  }
  const max = Math.max(...vals) || 1;
  return (
    <>
      <div className="chart-bars">
        {vals.map((v, i) => (
          <div key={i} className={`chart-bar${i === vals.length-1 ? ' current' : ''}`}
            style={{ height: `${(v/max)*100}%` }} title={`${months[i]}: ${v} users`} />
        ))}
      </div>
      <div className="chart-labels">
        {months.map((m, i) => <div key={i} className="chart-label">{m}</div>)}
      </div>
    </>
  );
}

function StatCard({ icon, val, label, change, changeUp }) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <span className="stat-val">{val}</span>
      <span className="stat-label">{label}</span>
      {change && <span className={`stat-change ${changeUp ? 'up' : 'dn'}`}>{change}</span>}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// PAGE: OVERVIEW — Live data from MongoDB
function Overview({ openVideo }) {
  const [stats, setStats]     = useState(null);
  const [statsErr, setStatsErr] = useState('');

  useEffect(() => {
    getSuperAdminStats()
      .then(({ stats }) => setStats(stats))
      .catch(() => setStatsErr('Could not load stats from server.'));
  }, []);

  const revenue = stats ? `₹${(stats.revenue / 100000).toFixed(1)}L` : '—';
  const joined  = (date) => {
    const d = new Date(date);
    const today = new Date();
    const diff  = Math.floor((today - d) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff}d ago`;
  };

  return (
    <div>
      <div className="section-title"><span className="section-tag">LIVE DATA</span> Platform <em>Overview</em></div>
      {statsErr && <div style={{ background:'rgba(231,76,60,0.1)', border:'1px solid rgba(231,76,60,0.3)', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:12, color:'#e74c3c' }}>{statsErr}</div>}
      <div className="stats-grid">
        <StatCard icon="👥" val={stats ? stats.totalUsers : '…'} label="Total Users" change={stats ? `↑ ${stats.paidUsers} paid` : ''} changeUp />
        <StatCard icon="👨‍🏫" val={stats ? stats.totalAdmins : '…'} label="Active Admins" change="↑ All online" changeUp />
        <StatCard icon="💰" val={revenue} label="Revenue MTD" change={stats ? `${stats.conversionRate}% conversion` : ''} changeUp />
        <StatCard icon="📹" val="2" label="Live Sessions Now" change={<span className="badge badge-live">● LIVE</span>} />
      </div>

      <div className="grid-2">
        {/* Active Sessions */}
        <div className="panel">
          <div className="section-title">Active <em>Live</em> Sessions</div>
          {[
            { init:'VTP', name:'Vishal Tompe Patil', meta:'Phase 3 — Smart Money Concepts · 45 min', viewers:28, title:'Vishal – Smart Money Concepts' },
            { init:'NTP', name:'Nilesh Thore Patil', meta:'Phase 2 — Price Action Mastery · 12 min', viewers:14, title:'Nilesh – Price Action' },
          ].map(s => (
            <div key={s.init} className="session-card live-border">
              <div className="avatar avatar-md">{s.init}</div>
              <div className="session-info">
                <div className="session-name">{s.name}</div>
                <div className="session-meta">{s.meta}</div>
              </div>
              <div className="viewer-count"><div className="live-dot-anim"></div>{s.viewers} watching</div>
              <button className="btn btn-outline btn-sm" onClick={() => openVideo(s.title, 'observer')}>👁 Observe</button>
            </div>
          ))}
        </div>

        {/* Recent Registrations — Live from DB */}
        <div className="panel">
          <div className="section-title">Recent <em>Registrations</em></div>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Joined</th><th>Batch</th><th>Plan</th></tr></thead>
            <tbody>
              {stats?.recentUsers?.length
                ? stats.recentUsers.map((u) => (
                  <tr key={u._id}>
                    <td style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div className="avatar avatar-sm" style={{ fontSize:9 }}>{u.avatar}</div>{u.name}
                    </td>
                    <td>{joined(u.createdAt)}</td>
                    <td style={{ fontSize:11 }}>{u.batch}</td>
                    <td><span className={`badge ${u.hasPaid ? 'badge-active' : 'badge-pending'}`}>{u.hasPaid ? 'Paid' : 'Free'}</span></td>
                  </tr>
                ))
                : <tr><td colSpan={4} style={{ textAlign:'center', color:'var(--muted)', padding:'20px' }}>{stats ? 'No recent registrations' : 'Loading…'}</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="section-title">Monthly <em>Revenue</em></div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:38, fontWeight:900, color:'var(--gold)', marginBottom:4 }}>
            {stats ? `₹${stats.revenue.toLocaleString('en-IN')}` : '₹…'}
          </div>
          <div style={{ fontSize:11, color:'var(--muted)', marginBottom:12 }}>Live · from {stats ? stats.paidUsers : '…'} paid members</div>
          <RevenueChart data={stats?.monthlyData} />
        </div>
        <div className="panel">
          <div className="section-title">Open <em>Support Tickets</em> <span className="nav-badge" style={{ marginLeft:8 }}>3</span></div>
          <table className="data-table">
            <thead><tr><th>User</th><th>Issue</th><th>Priority</th><th>Action</th></tr></thead>
            <tbody>
              <tr><td>Rahul Sharma</td><td>MT5 connection error</td><td><span className="badge badge-open">High</span></td><td><button className="btn btn-gold btn-sm" onClick={() => openVideo('TK-081: Rahul – MT5', 'support')}>📹 Video Call</button></td></tr>
              <tr><td>Priya Menon</td><td>Chart not loading</td><td><span className="badge badge-pending">Medium</span></td><td><button className="btn btn-gold btn-sm" onClick={() => openVideo('TK-079: Priya – Charts', 'support')}>📹 Video Call</button></td></tr>
              <tr><td>Arjun Nair</td><td>Payment pending</td><td><span className="badge badge-pending">Medium</span></td><td><button className="btn btn-outline btn-sm">💬 Chat</button></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// PAGE: USERS — Live from MongoDB
function Users() {
  const [users,   setUsers]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [search,  setSearch]  = useState('');
  const [loadingU, setLoadingU] = useState(true);
  const [error,   setError]   = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchUsers = useCallback(async (q = '') => {
    setLoadingU(true);
    setError('');
    try {
      const data = await getUsers({ search: q, limit: 50 });
      setUsers(data.users);
      setTotal(data.total);
    } catch (e) {
      setError('Failed to load users from database.');
    } finally {
      setLoadingU(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(search), 400);
    return () => clearTimeout(timer);
  }, [search, fetchUsers]);

  const handleTogglePlan = async (id, current) => {
    try {
      await updateUser(id, { hasPaid: !current });
      setUsers(u => u.map(x => x._id === id ? { ...x, hasPaid: !current } : x));
    } catch (e) { alert('Failed to update user.'); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteUser(id);
      setUsers(u => u.filter(x => x._id !== id));
      setTotal(t => t - 1);
    } catch (e) { alert('Failed to delete user.'); }
    finally { setDeleting(null); }
  };

  const paid  = users.filter(u => u.hasPaid).length;
  const admins = users.filter(u => u.role === 'admin').length;

  return (
    <div>
      <div className="section-title"><span className="section-tag">MANAGEMENT</span> User <em>Management</em></div>
      <div className="stats-grid">
        <StatCard icon="👥" val={total} label="Total Users" />
        <StatCard icon="💰" val={paid} label="Paid Members" changeUp />
        <StatCard icon="👨‍🏫" val={admins} label="Admins" />
        <StatCard icon="🆓" val={total - paid > 0 ? total - paid : 0} label="Free Members" />
      </div>
      {error && <div style={{ background:'rgba(231,76,60,0.1)', border:'1px solid rgba(231,76,60,0.3)', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:12, color:'#e74c3c' }}>{error}</div>}
      <div className="panel">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div className="section-title" style={{ margin:0 }}>All <em>Users</em> <span style={{ fontSize:11, color:'var(--muted)', fontWeight:400, marginLeft:8 }}>({total} total)</span></div>
          <input className="form-input" style={{ width:220 }} type="text" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Batch</th><th>Plan</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            {loadingU
              ? <tr><td colSpan={7} style={{ textAlign:'center', color:'var(--muted)', padding:'24px' }}>Loading users…</td></tr>
              : users.length === 0
              ? <tr><td colSpan={7} style={{ textAlign:'center', color:'var(--muted)', padding:'24px' }}>No users found.</td></tr>
              : users.map(u => (
                <tr key={u._id}>
                  <td style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div className="avatar avatar-sm" style={{ fontSize:9 }}>{u.avatar}</div>{u.name}
                  </td>
                  <td style={{ color:'var(--muted)', fontSize:11 }}>{u.email}</td>
                  <td><span className={`badge ${u.role === 'superadmin' ? 'badge-live' : u.role === 'admin' ? 'badge-active' : 'badge-blue'}`}>{u.role}</span></td>
                  <td style={{ fontSize:11 }}>{u.batch || '—'}</td>
                  <td>
                    <button
                      className={`btn btn-sm ${u.hasPaid ? 'btn-gold' : 'btn-outline'}`}
                      onClick={() => handleTogglePlan(u._id, u.hasPaid)}
                      title={u.hasPaid ? 'Click to revoke plan' : 'Click to activate plan'}
                    >{u.hasPaid ? '✅ Paid' : '⏳ Free'}</button>
                  </td>
                  <td style={{ fontSize:11, color:'var(--muted)' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ color:'var(--red)', borderColor:'rgba(231,76,60,0.4)', marginLeft:4 }}
                      onClick={() => handleDelete(u._id, u.name)}
                      disabled={deleting === u._id}
                    >{deleting === u._id ? '…' : '🗑 Delete'}</button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// PAGE: ADMINS
function Admins({ openVideo }) {
  return (
    <div>
      <div className="section-title"><span className="section-tag">MANAGEMENT</span> Admin <em>Management</em></div>
      <div className="panel">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div className="section-title" style={{ margin:0 }}>Instructor <em>Accounts</em></div>
          <button className="btn btn-gold" onClick={() => alert('Admin invitation form — coming soon!\n\nTo add an admin, use the registration page and set their role to "admin" from User Management.')}>+ Add Admin</button>
        </div>
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Specialisation</th><th>Sessions</th><th>Students</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {[
              { init:'VTP', name:'Vishal Tompe Patil', email:'vishal@rajmudra.com', spec:'Smart Money, Institutional', sess:142, students:423 },
              { init:'NTP', name:'Nilesh Thore Patil', email:'nilesh@rajmudra.com', spec:'Price Action, Forex', sess:118, students:389 },
            ].map(a => (
              <tr key={a.init}>
                <td style={{ display:'flex', alignItems:'center', gap:8 }}><div className="avatar avatar-sm">{a.init}</div>{a.name}</td>
                <td>{a.email}</td><td>{a.spec}</td><td>{a.sess}</td><td>{a.students}</td>
                <td><span className="badge badge-active">Online</span></td>
                <td><button className="btn btn-outline btn-sm" onClick={() => openVideo(`Admin Call: ${a.name}`, 'support')}>📹 Call</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// PAGE: SESSIONS MONITOR
function Sessions({ openVideo }) {
  return (
    <div>
      <div className="section-title"><span className="section-tag">MONITORING</span> Live Sessions <em>Monitor</em></div>
      <div className="stats-grid">
        <StatCard icon="🔴" val="2" label="Live Now" change={<span className="badge badge-live">● LIVE</span>} />
        <StatCard icon="👁" val="42" label="Total Viewers" />
        <StatCard icon="📅" val="8" label="Scheduled Today" />
        <StatCard icon="🎥" val="284" label="Total Recordings" />
      </div>
      <div className="grid-2">
        <div className="panel">
          <div className="section-title">Currently <em>Live</em></div>
          {[
            { init:'VTP', name:'Vishal — Smart Money Concepts', meta:'Phase 3 · Room: RM-7842 · 28 viewers', title:'Vishal – Smart Money' },
            { init:'NTP', name:'Nilesh — Price Action Deep Dive', meta:'Phase 2 · Room: RM-3291 · 14 viewers', title:'Nilesh – Price Action' },
          ].map(s => (
            <div key={s.init} className="session-card live-border">
              <div className="avatar avatar-md">{s.init}</div>
              <div className="session-info"><div className="session-name">{s.name}</div><div className="session-meta">{s.meta}</div></div>
              <button className="btn btn-gold btn-sm" onClick={() => openVideo(s.title, 'observer')}>👁 Join &amp; Observe</button>
            </div>
          ))}
        </div>
        <div className="panel">
          <div className="section-title">Upcoming <em>Sessions</em></div>
          <table className="data-table">
            <thead><tr><th>Session</th><th>Admin</th><th>Time</th><th>Phase</th></tr></thead>
            <tbody>
              <tr><td>Risk Management</td><td>Vishal</td><td>3:00 PM</td><td>Phase 4</td></tr>
              <tr><td>Trade Psychology</td><td>Nilesh</td><td>5:00 PM</td><td>Phase 4</td></tr>
              <tr><td>Live Trading</td><td>Vishal</td><td>Tomorrow 9:30 AM</td><td>Phase 5</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// PAGE: TICKETS — Live from MongoDB
function Tickets({ openVideo }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusCounts, setStatusCounts] = useState({});

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTickets();
      setTickets(data.tickets || []);
      setStatusCounts(data.statusCounts || {});
    } catch (e) { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleStatusChange = async (id, status) => {
    try {
      const data = await updateTicket(id, { status });
      if (data.success) {
        setTickets(prev => prev.map(t => t._id === id ? data.ticket : t));
        fetchTickets(); // refresh counts
      }
    } catch (e) { alert('Failed to update ticket.'); }
  };

  const statusBadge = (s) => s === 'Open' ? 'badge-open' : s === 'In Progress' ? 'badge-pending' : 'badge-resolved';
  const priBadge = (p) => p === 'High' ? 'badge-open' : p === 'Medium' ? 'badge-pending' : 'badge-blue';
  const timeAgo = (date) => {
    const d = new Date(date);
    const diff = Math.floor((Date.now() - d) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff}d ago`;
  };

  return (
    <div>
      <div className="section-title"><span className="section-tag">SUPPORT</span> Support <em>Tickets</em></div>
      <div className="stats-grid">
        <StatCard icon="🔴" val={statusCounts.open || 0} label="Open" />
        <StatCard icon="⏳" val={statusCounts.inProgress || 0} label="In Progress" />
        <StatCard icon="✅" val={statusCounts.resolved || 0} label="Resolved" />
        <StatCard icon="📊" val={tickets.length} label="Total" />
      </div>
      <div className="panel">
        {loading ? (
          <div style={{ textAlign:'center', color:'var(--muted)', padding:40, fontSize:13 }}>Loading tickets…</div>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign:'center', color:'var(--muted)', padding:40, fontSize:13 }}>No support tickets yet.</div>
        ) : (
          <table className="data-table">
            <thead><tr><th>#</th><th>User</th><th>Issue</th><th>Category</th><th>Created</th><th>Priority</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t._id}>
                  <td>{t.ticketId}</td>
                  <td>{t.user?.name || 'Unknown'}</td>
                  <td>{t.subject}</td>
                  <td>{t.category}</td>
                  <td>{timeAgo(t.createdAt)}</td>
                  <td><span className={`badge ${priBadge(t.priority)}`}>{t.priority}</span></td>
                  <td><span className={`badge ${statusBadge(t.status)}`}>{t.status}</span></td>
                  <td>
                    {t.status === 'Open' ? (
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-gold btn-sm" onClick={() => handleStatusChange(t._id, 'In Progress')}>📋 Take</button>
                        <button className="btn btn-outline btn-sm" onClick={() => openVideo(`${t.ticketId}: ${t.user?.name}`, 'support')}>📹 Call</button>
                      </div>
                    ) : t.status === 'In Progress' ? (
                      <button className="btn btn-green btn-sm" onClick={() => handleStatusChange(t._id, 'Resolved')}>✅ Resolve</button>
                    ) : (
                      <button className="btn btn-outline btn-sm">🗂 View</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// PAGE: REVENUE
function Revenue() {
  return (
    <div>
      <div className="section-title"><span className="section-tag">FINANCE</span> Revenue &amp; <em>Payments</em></div>
      <div className="stats-grid">
        <StatCard icon="💰" val="₹18.4L" label="April Revenue"  change="↑ +8.3%" changeUp />
        <StatCard icon="📈" val="₹1.2Cr"  label="Annual Revenue" change="↑ +22%"  changeUp />
        <StatCard icon="🎟" val="847"      label="Enrollments" />
        <StatCard icon="💳" val="₹21,739"  label="Avg Fee / Student" />
      </div>
      <div className="grid-2">
        <div className="panel"><div className="section-title">Revenue <em>Trend</em></div><RevenueChart /></div>
        <div className="panel">
          <div className="section-title">Recent <em>Transactions</em></div>
          <table className="data-table">
            <thead><tr><th>Student</th><th>Amount</th><th>Mode</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {[['Rahul Sharma','₹25,000','UPI','Today','Active'],['Priya Menon','₹25,000','NEFT','Yesterday','Pending'],['Karan Mehta','₹18,000','Card','12 Apr','Active'],['Meenal Joshi','₹25,000','UPI','11 Apr','Active']].map(([n,a,m,d,s]) => (
                <tr key={n}><td>{n}</td><td>{a}</td><td>{m}</td><td>{d}</td><td><span className={`badge ${s==='Active'?'badge-active':'badge-pending'}`}>{s==='Active'?'Confirmed':'Pending'}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// PAGE: COURSES — LIVE from MongoDB
function Courses() {
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPhase, setOpenPhase] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [toast, setToast] = useState('');
  const [videoForm, setVideoForm] = useState({ title:'', url:'', description:'' });
  const [newTopic, setNewTopic] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingSub, setLoadingSub] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const pctColor = (pct) => { const n = parseInt(pct); return n > 70 ? 'var(--green)' : n > 40 ? 'var(--gold)' : 'var(--red)'; };

  const fetchCourses = useCallback(async () => {
    try { const data = await getCourses(); setPhases(data.courses || []); }
    catch (e) { showToast('❌ Failed to load courses'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const handleAddVideo = async (phaseNum) => {
    if (!videoForm.title.trim()) return showToast('⚠ Enter a video title');
    setLoadingSub(true);
    try {
      const d = await addCourseVideo(phaseNum, videoForm);
      if (d.success) { showToast(d.message); setVideoForm({ title:'', url:'', description:'' }); setActivePanel(null); fetchCourses(); }
    } catch (e) { showToast('❌ Failed to add video'); } finally { setLoadingSub(false); }
  };

  const handleDeleteTopic = async (phaseNum, topic) => {
    const phase = phases.find(p => p.phaseNum === phaseNum);
    if (!phase) return;
    try { await updateCourseTopics(phaseNum, phase.topicsList.filter(t => t !== topic)); showToast(`🗑 "${topic}" removed`); fetchCourses(); }
    catch (e) { showToast('❌ Failed'); }
  };

  const handleAddTopic = async (phaseNum) => {
    if (!newTopic.trim()) return;
    const phase = phases.find(p => p.phaseNum === phaseNum);
    if (!phase) return;
    try { await updateCourseTopics(phaseNum, [...phase.topicsList, newTopic.trim()]); showToast(`✅ "${newTopic.trim()}" added`); setNewTopic(''); fetchCourses(); }
    catch (e) { showToast('❌ Failed'); }
  };

  const loadAnalytics = async (phaseNum) => {
    setAnalyticsData(null); setLoadingSub(true);
    try { const d = await getCourseAnalytics(phaseNum); setAnalyticsData(d.analytics); }
    catch (e) { showToast('❌ Failed to load analytics'); } finally { setLoadingSub(false); }
  };

  const loadStudents = async (phaseNum) => {
    setStudents([]); setLoadingSub(true);
    try { const d = await getCourseStudents(phaseNum); setStudents(d.students || []); }
    catch (e) { showToast('❌ Failed to load students'); } finally { setLoadingSub(false); }
  };

  const handleExport = (phase) => {
    let csv = `Phase,Title,Videos,Enrolled,Completion\n${phase.phaseNum},${phase.title},${phase.videos.length},${phase.enrolled},${phase.completionPct}\n\nTopics\n${phase.topicsList.join('\n')}\n\nVideos\nTitle,URL\n`;
    phase.videos.forEach(v => { csv += `${v.title},${v.url || 'N/A'}\n`; });
    const blob = new Blob([csv], { type:'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `phase_${phase.phaseNum}.csv`; a.click(); URL.revokeObjectURL(url);
    showToast(`📄 Phase ${phase.phaseNum} exported`);
  };

  const handleArchive = async (phaseNum) => {
    try { await archiveCourse(phaseNum); showToast(`🗑 Phase ${phaseNum} archived`); setOpenPhase(null); setActivePanel(null); fetchCourses(); }
    catch (e) { showToast('❌ Failed to archive'); }
  };

  const switchPanel = (panel, phaseNum) => {
    const next = activePanel === panel ? null : panel;
    setActivePanel(next);
    if (next === 'analytics') loadAnalytics(phaseNum);
    if (next === 'students') loadStudents(phaseNum);
  };

  if (loading) return <div style={{ textAlign:'center', color:'var(--muted)', padding:40 }}>Loading courses…</div>;

  return (
    <div>
      <div className="section-title"><span className="section-tag">CONTENT</span> Course <em>Management</em> <span style={{ fontSize:11, color:'var(--green)', fontWeight:400, marginLeft:8 }}>● Live from MongoDB</span></div>
      {toast && <div style={{ position:'fixed', top:80, right:24, background:'var(--card)', border:'1px solid var(--gold)', borderRadius:10, padding:'12px 20px', fontSize:13, color:'var(--white)', zIndex:9999, boxShadow:'0 8px 32px rgba(0,0,0,0.5)', animation:'fadeIn 0.2s ease' }}>{toast}</div>}
      {phases.map(p => (
        <div key={p.phaseNum} className="panel" style={{ marginBottom:12 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'var(--gold)', flexShrink:0 }}>{p.phaseNum}</div>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:'var(--white)' }}>Phase {p.phaseNum} — {p.title}</div>
                <div style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>{p.topicsList.slice(0,3).join(', ')}{p.topicsList.length > 3 ? ` +${p.topicsList.length-3} more` : ''}</div>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
              <span style={{ fontSize:12, color:'var(--muted)' }}>{p.videos.length} videos</span>
              <span style={{ fontSize:12, color:'var(--silver)' }}>{p.enrolled} enrolled</span>
              <span style={{ color:pctColor(p.completionPct), fontWeight:600, fontSize:13 }}>{p.completionPct}</span>
              <button className="btn btn-outline btn-sm" onClick={() => { setOpenPhase(openPhase === p.phaseNum ? null : p.phaseNum); setActivePanel(null); }}>{openPhase === p.phaseNum ? '✕ Close' : '⚙ Manage'}</button>
            </div>
          </div>
          {openPhase === p.phaseNum && (
            <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid var(--border)' }}>
              <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:16 }}>
                <button className={`btn btn-sm ${activePanel==='addVideo'?'btn-gold':'btn-outline'}`} onClick={() => switchPanel('addVideo', p.phaseNum)}>📹 Add Video</button>
                <button className={`btn btn-sm ${activePanel==='editTopics'?'btn-gold':'btn-outline'}`} onClick={() => switchPanel('editTopics', p.phaseNum)}>📝 Edit Topics</button>
                <button className={`btn btn-sm ${activePanel==='analytics'?'btn-gold':'btn-outline'}`} onClick={() => switchPanel('analytics', p.phaseNum)}>📊 Analytics</button>
                <button className={`btn btn-sm ${activePanel==='students'?'btn-gold':'btn-outline'}`} onClick={() => switchPanel('students', p.phaseNum)}>👥 Students</button>
                <button className="btn btn-outline btn-sm" onClick={() => handleExport(p)}>📄 Export</button>
                <button className={`btn btn-sm ${activePanel==='archive'?'btn-gold':'btn-outline'}`} style={{ color:'var(--red)', borderColor:'rgba(231,76,60,0.3)' }} onClick={() => switchPanel('archive', p.phaseNum)}>🗑 Archive</button>
              </div>
              {activePanel === 'addVideo' && (
                <div style={{ background:'var(--deep)', border:'1px solid var(--border)', borderRadius:10, padding:20, marginBottom:12 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--white)', marginBottom:14 }}>📹 Add Video — Phase {p.phaseNum}</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                    <div><label className="form-label">Title *</label><input className="form-input" placeholder="e.g., Fibonacci" value={videoForm.title} onChange={e => setVideoForm({...videoForm, title:e.target.value})} /></div>
                    <div><label className="form-label">URL</label><input className="form-input" placeholder="https://youtube.com/..." value={videoForm.url} onChange={e => setVideoForm({...videoForm, url:e.target.value})} /></div>
                  </div>
                  <div style={{ marginBottom:12 }}><label className="form-label">Description</label><textarea className="form-textarea" value={videoForm.description} onChange={e => setVideoForm({...videoForm, description:e.target.value})} style={{ minHeight:50 }} /></div>
                  <div style={{ display:'flex', gap:10 }}>
                    <button className="btn btn-gold btn-sm" onClick={() => handleAddVideo(p.phaseNum)} disabled={loadingSub}>{loadingSub ? 'Saving…' : '✅ Save'}</button>
                    <button className="btn btn-outline btn-sm" onClick={() => setActivePanel(null)}>Cancel</button>
                  </div>
                  {p.videos.length > 0 && <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--border)', fontSize:11, color:'var(--muted)' }}>Existing: {p.videos.map(v => v.title).join(' · ')}</div>}
                </div>
              )}
              {activePanel === 'editTopics' && (
                <div style={{ background:'var(--deep)', border:'1px solid var(--border)', borderRadius:10, padding:20, marginBottom:12 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--white)', marginBottom:14 }}>📝 Topics — Phase {p.phaseNum}</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
                    {p.topicsList.map(t => (
                      <div key={t} style={{ background:'rgba(201,168,76,0.06)', border:'1px solid rgba(201,168,76,0.15)', borderRadius:6, padding:'6px 12px', fontSize:12, color:'var(--silver)', display:'flex', alignItems:'center', gap:8 }}>📖 {t} <button onClick={() => handleDeleteTopic(p.phaseNum, t)} style={{ background:'none', border:'none', color:'var(--red)', cursor:'pointer', fontSize:14, padding:0 }}>✕</button></div>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
                    <div style={{ flex:1 }}><label className="form-label">Add Topic</label><input className="form-input" placeholder="e.g., Fibonacci" value={newTopic} onChange={e => setNewTopic(e.target.value)} onKeyDown={e => e.key==='Enter' && handleAddTopic(p.phaseNum)} /></div>
                    <button className="btn btn-gold btn-sm" onClick={() => handleAddTopic(p.phaseNum)}>+ Add</button>
                  </div>
                </div>
              )}
              {activePanel === 'analytics' && (
                <div style={{ background:'var(--deep)', border:'1px solid var(--border)', borderRadius:10, padding:20, marginBottom:12 }}>
                  {loadingSub ? <div style={{ color:'var(--muted)', fontSize:12 }}>Loading…</div> : analyticsData ? <>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))', gap:10, marginBottom:16 }}>
                      {[{l:'Enrolled',v:analyticsData.enrolled,i:'👥'},{l:'Completion',v:analyticsData.completionPct,i:'✅'},{l:'Videos',v:analyticsData.totalVideos,i:'📹'},{l:'Watch Time',v:analyticsData.avgWatchTime,i:'⏱'},{l:'Quiz Pass',v:analyticsData.quizPassRate,i:'📝'}].map(s =>
                        <div key={s.l} style={{ background:'var(--card)', borderRadius:8, padding:'12px', border:'1px solid var(--border)' }}><div style={{ fontSize:16 }}>{s.i}</div><div style={{ fontSize:18, fontWeight:700, color:'var(--gold)', fontFamily:"'Playfair Display',serif" }}>{s.v}</div><div style={{ fontSize:8, color:'var(--muted)', textTransform:'uppercase', letterSpacing:2, marginTop:4 }}>{s.l}</div></div>
                      )}
                    </div>
                    {analyticsData.topicCompletion?.map(tc => <div key={tc.topic} style={{ marginBottom:8 }}><div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}><span style={{ color:'var(--silver)' }}>{tc.topic}</span><span style={{ color:tc.pct>70?'var(--green)':'var(--gold)', fontWeight:600 }}>{tc.pct}%</span></div><div style={{ background:'var(--border)', borderRadius:4, height:5, overflow:'hidden' }}><div style={{ width:`${tc.pct}%`, height:'100%', background:tc.pct>70?'var(--green)':'var(--gold)', borderRadius:4 }} /></div></div>)}
                  </> : null}
                </div>
              )}
              {activePanel === 'students' && (
                <div style={{ background:'var(--deep)', border:'1px solid var(--border)', borderRadius:10, padding:20, marginBottom:12 }}>
                  {loadingSub ? <div style={{ color:'var(--muted)', fontSize:12 }}>Loading…</div> : students.length === 0 ? <div style={{ color:'var(--muted)', fontSize:12 }}>No students found.</div> : (
                    <table className="data-table"><thead><tr><th>Student</th><th>Email</th><th>Batch</th><th>Progress</th></tr></thead><tbody>
                      {students.map(s => <tr key={s._id}><td style={{ display:'flex', alignItems:'center', gap:8 }}><div className="avatar avatar-sm" style={{ fontSize:9 }}>{s.avatar}</div>{s.name}</td><td style={{ fontSize:11, color:'var(--muted)' }}>{s.email}</td><td><span className="badge badge-blue">{s.batch}</span></td><td><div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ flex:1, background:'var(--border)', borderRadius:4, height:5, overflow:'hidden', minWidth:50 }}><div style={{ width:`${s.progress}%`, height:'100%', background:s.progress>70?'var(--green)':'var(--gold)', borderRadius:4 }} /></div><span style={{ fontSize:11, fontWeight:600 }}>{s.progress}%</span></div></td></tr>)}
                    </tbody></table>
                  )}
                </div>
              )}
              {activePanel === 'archive' && (
                <div style={{ background:'rgba(231,76,60,0.05)', border:'1px solid rgba(231,76,60,0.2)', borderRadius:10, padding:20, marginBottom:12 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--red)', marginBottom:8 }}>⚠ Archive Phase {p.phaseNum}?</div>
                  <p style={{ fontSize:12, color:'var(--silver)', marginBottom:16, lineHeight:1.6 }}>This will hide <strong>{p.title}</strong> from all users. Data stays in MongoDB.</p>
                  <div style={{ display:'flex', gap:10 }}>
                    <button className="btn btn-sm" style={{ background:'var(--red)', color:'#fff', border:'none' }} onClick={() => handleArchive(p.phaseNum)}>🗑 Confirm</button>
                    <button className="btn btn-outline btn-sm" onClick={() => setActivePanel(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      {phases.length === 0 && !loading && <div className="panel" style={{ textAlign:'center', padding:40, color:'var(--muted)' }}>No courses found.</div>}
    </div>
  );
}




// PAGE: SETTINGS — LIVE from MongoDB
function Settings() {
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [cfg, setCfg] = useState({ platformName:'', supportEmail:'', batchSizeLimit:30 });
  const [cashfree, setCashfree] = useState({ cashfreeEnv:'sandbox', cashfreeAppId:'', cashfreeSecret:'' });
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [saving, setSaving] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // Load settings from MongoDB
  useEffect(() => {
    getSettings()
      .then(d => {
        if (d.settings) {
          setCfg({ platformName: d.settings.platformName, supportEmail: d.settings.supportEmail, batchSizeLimit: d.settings.batchSizeLimit });
          setCashfree({ cashfreeEnv: d.settings.cashfreeEnv, cashfreeAppId: d.settings.cashfreeAppId, cashfreeSecret: d.settings.cashfreeSecret });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSavePlatform = async () => {
    setSaving(true);
    try {
      const d = await saveSettings(cfg);
      if (d.success) showToast('✅ Platform settings saved to database');
    } catch (e) { showToast('❌ Failed to save'); }
    finally { setSaving(false); }
  };

  const handleSaveCashfree = async () => {
    setSaving(true);
    try {
      const d = await saveSettings(cashfree);
      if (d.success) showToast('✅ Cashfree keys updated in database');
    } catch (e) { showToast('❌ Failed to save'); }
    finally { setSaving(false); }
  };

  const handleSendPush = async () => {
    if (!pushTitle.trim()) return showToast('⚠ Enter notification title');
    setSaving(true);
    try {
      const d = await sendPushNotification(pushTitle, pushBody);
      if (d.success) {
        showToast(`🚀 "${pushTitle}" sent to all users (saved as announcement)`);
        setPushTitle(''); setPushBody('');
      }
    } catch (e) { showToast('❌ Failed to send'); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ textAlign:'center', color:'var(--muted)', padding:40 }}>Loading settings…</div>;

  return (
    <div>
      <div className="section-title"><span className="section-tag">CONFIG</span> Platform <em>Settings</em> <span style={{ fontSize:11, color:'var(--green)', fontWeight:400, marginLeft:8 }}>● Live from MongoDB</span></div>

      {toast && <div style={{ position:'fixed', top:80, right:24, background:'var(--card)', border:'1px solid var(--gold)', borderRadius:10, padding:'12px 20px', fontSize:13, color:'var(--white)', zIndex:9999, boxShadow:'0 8px 32px rgba(0,0,0,0.5)', animation:'fadeIn 0.2s ease' }}>{toast}</div>}

      <div className="grid-2">
        <div className="panel">
          <div className="section-title">Platform <em>Configuration</em></div>
          <div className="form-group"><label className="form-label">Platform Name</label><input className="form-input" value={cfg.platformName} onChange={e => setCfg({...cfg, platformName:e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Support Email</label><input className="form-input" type="email" value={cfg.supportEmail} onChange={e => setCfg({...cfg, supportEmail:e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Batch Size Limit</label><input className="form-input" type="number" value={cfg.batchSizeLimit} onChange={e => setCfg({...cfg, batchSizeLimit:parseInt(e.target.value)||0})} /></div>
          <button className="btn btn-gold" onClick={handleSavePlatform} disabled={saving}>{saving ? 'Saving…' : '💾 Save Changes'}</button>
        </div>
        <div className="panel">
          <div className="section-title">System <em>Status</em></div>
          {[['WebRTC Signaling Server','Active'],['Payment Gateway (Cashfree)','Active'],['Email Service (SMTP)','Active'],['WhatsApp API','Degraded'],['Push Notifications (FCM)','Active']].map(([s,status]) => (
            <div key={s} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontSize:13, color:'var(--silver)' }}>{s}</span>
              <span className={`badge ${status==='Active'?'badge-active':'badge-pending'}`}>● {status}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid-2" style={{ marginTop: '20px' }}>
        <div className="panel">
          <div className="section-title">Cashfree <em>Integration</em></div>
          <div className="form-group"><label className="form-label">Environment</label><select className="form-select" value={cashfree.cashfreeEnv} onChange={e => setCashfree({...cashfree, cashfreeEnv:e.target.value})}><option value="sandbox">Sandbox (Test)</option><option value="production">Production (Live)</option></select></div>
          <div className="form-group"><label className="form-label">App ID</label><input className="form-input" value={cashfree.cashfreeAppId} onChange={e => setCashfree({...cashfree, cashfreeAppId:e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Secret Key</label><input className="form-input" type="password" value={cashfree.cashfreeSecret} onChange={e => setCashfree({...cashfree, cashfreeSecret:e.target.value})} /></div>
          <button className="btn btn-gold" onClick={handleSaveCashfree} disabled={saving}>{saving ? 'Saving…' : '🔑 Update Keys'}</button>
        </div>
        <div className="panel">
          <div className="section-title">Push <em>Notifications</em></div>
          <p style={{ fontSize: '12px', color: 'var(--silver)', marginBottom: '16px' }}>Send instant alerts to all users. Creates a high-priority announcement.</p>
          <div className="form-group"><label className="form-label">Notification Title</label><input className="form-input" placeholder="e.g., Live Class Starting" value={pushTitle} onChange={e => setPushTitle(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Message Body</label><textarea className="form-textarea" placeholder="Enter message text..." value={pushBody} onChange={e => setPushBody(e.target.value)} /></div>
          <button className="btn btn-gold" onClick={handleSendPush} disabled={saving}>{saving ? 'Sending…' : '🚀 Send Push Notification'}</button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN SUPERADMIN DASHBOARD
const NAV_ITEMS = [
  { divider: true, label: 'Main' },
  { id:'overview',  icon:'📊', label:'Overview' },
  { id:'users',     icon:'👑', label:'User Management' },
  { id:'admins',    icon:'🏫', label:'Admin Management' },
  { divider: true, label: 'Live & Support' },
  { id:'sessions',  icon:'📹', label:'Live Sessions Monitor' },
  { id:'tickets',   icon:'🔧', label:'Support Tickets', badge: 3 },
  { divider: true, label: 'Finance & Content' },
  { id:'revenue',   icon:'💰', label:'Revenue & Payments' },
  { id:'courses',   icon:'📋', label:'Course Management' },
  { id:'settings',  icon:'⚙️', label:'Platform Settings' },
];

export default function SuperAdminDashboard() {
  const [active, setActive]   = useState('overview');
  const [videoModal, setVideoModal] = useState(null); // { title, type }
  const [mobileOpen, setMobileOpen] = useState(false);

  const openVideo  = (title, type) => setVideoModal({ title, type });
  const closeVideo = ()            => setVideoModal(null);

  const PAGE = { overview:<Overview openVideo={openVideo}/>, users:<Users/>, admins:<Admins openVideo={openVideo}/>, sessions:<Sessions openVideo={openVideo}/>, tickets:<Tickets openVideo={openVideo}/>, revenue:<Revenue/>, courses:<Courses/>, settings:<Settings/> };

  return (
    <div className="app-layout">
      <Sidebar role="superadmin" activeItem={active} onNav={setActive} items={NAV_ITEMS} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="main-content">
        <Topbar title="Platform" subtitle="Control Center" onMenuToggle={() => setMobileOpen(true)} onViewNotifications={() => setActive('settings')} />
        <div className="page-content">
          {PAGE[active]}
        </div>
      </div>
      {videoModal && <VideoModal title={videoModal.title} type={videoModal.type} onClose={closeVideo} senderLabel="SA" />}
    </div>
  );
}
