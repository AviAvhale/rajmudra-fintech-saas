import React, { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import VideoModal from '../../components/VideoModal';
import PricingPlans from '../../components/PricingPlans';
import { useAuth } from '../../context/AuthContext';
import { getUserStats, getAnnouncements } from '../../api/stats';
import { updateMyProfile } from '../../api/users';
import { getConversations, getMessages, sendMessage } from '../../api/messages';
import { getTickets, createTicket } from '../../api/tickets';
import { getJournalEntries, createJournalEntry, deleteJournalEntry } from '../../api/journal';
import { getAudits, submitAudit } from '../../api/audits';
import { getCourses } from '../../api/courses';
import { getLiveSessions } from '../../api/livesessions';
import { getDailyAnalyses, toggleAnalysisLike } from '../../api/livesessions';

function StatCard({ icon, val, label, sub }) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <span className="stat-val stat-val-sm">{val}</span>
      <span className="stat-label">{label}</span>
      {sub && <span className="stat-change">{sub}</span>}
    </div>
  );
}

function ProgBar({ label, pct, color = 'var(--gold)' }) {
  return (
    <div className="prog-item">
      <div className="prog-label">
        <span className="prog-label-text">{label}</span>
        <span className="prog-label-pct">{pct}%</span>
      </div>
      <div className="prog-bar">
        <div className="prog-fill" style={{ width:`${pct}%`, background:`linear-gradient(90deg,${color},${color}88)` }} />
      </div>
    </div>
  );
}

// PAGE: MY PROGRESS (HOME) — Live announcements from MongoDB
function MyProgress() {
  const [stats, setStats]       = useState(null);
  const [statsErr, setStatsErr] = useState('');

  useEffect(() => {
    getUserStats()
      .then(({ stats }) => setStats(stats))
      .catch(() => setStatsErr('Could not load data from server.'));
  }, []);

  const timeAgo = (date) => {
    const d = new Date(date);
    const diff = Math.floor((Date.now() - d) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div>
      <div className="section-title"><span className="section-tag">DASHBOARD</span> My <em>Progress</em></div>
      {statsErr && <div style={{ background:'rgba(231,76,60,0.1)', border:'1px solid rgba(231,76,60,0.3)', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:12, color:'#e74c3c' }}>{statsErr}</div>}
      <div className="stats-grid">
        <StatCard icon="📚" val={stats?.user?.batch || 'Phase 3'} label="Current Batch" />
        <StatCard icon="👥" val={stats?.batchmates || '…'} label="Batchmates" />
        <StatCard icon="📈" val={stats?.user?.hasPaid ? '✅ Active' : '⏳ Free'} label="Plan Status" />
        <StatCard icon="📣" val={stats?.announcements?.length || 0} label="Announcements" />
      </div>
      <div className="grid-2">
        <div className="panel">
          <div className="section-title">Course <em>Progress</em></div>
          <div className="prog-wrap">
            <ProgBar label="Phase 1 — The Foundation" pct={100} color="var(--green)" />
            <ProgBar label="Phase 2 — Technical Analysis" pct={100} color="var(--green)" />
            <ProgBar label="Phase 3 — Advanced Strategy" pct={60} />
            <ProgBar label="Phase 4 — Risk Management" pct={0} color="var(--border)" />
            <ProgBar label="Phase 5 — Execution & Audit" pct={0} color="var(--border)" />
          </div>
        </div>
        <div className="panel">
          <div className="section-title">Recent <em>Announcements</em></div>
          {!stats ? (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 20, fontSize: 12 }}>Loading…</div>
          ) : stats.announcements?.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 20, fontSize: 12 }}>No announcements yet.</div>
          ) : (
            stats.announcements.slice(0, 5).map(a => (
              <div key={a._id} style={{ background:'var(--card2)', border:'1px solid var(--border)', borderRadius:8, padding:12, marginBottom:10, display:'flex', gap:12, alignItems:'flex-start' }}>
                <span style={{ fontSize:20 }}>{a.priority === 'high' ? '🔴' : a.priority === 'medium' ? '📢' : '📄'}</span>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--white)' }}>{a.title}</div>
                  <div style={{ fontSize:10, color:'var(--muted)', marginTop:4 }}>
                    {a.postedBy?.name || 'Admin'} · {timeAgo(a.createdAt)}
                  </div>
                  <div style={{ fontSize:11, color:'var(--silver)', marginTop:4 }}>{a.body?.slice(0, 120)}{a.body?.length > 120 ? '…' : ''}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// PAGE: COURSE PHASES — LIVE from MongoDB
function CoursePhasesPage({ openVideo }) {
  const [openPhase, setOpenPhase] = useState(null);
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses()
      .then(d => {
        const mapped = (d.courses || []).map((c, i) => ({
          num: c.phaseNum,
          title: c.title,
          topics: c.topicsList,
          videos: c.videos,
          done: i < 2,
          pct: i === 0 ? 100 : i === 1 ? 100 : i === 2 ? 60 : 0,
          current: i === 2,
        }));
        setPhases(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign:'center', color:'var(--muted)', padding:40, fontSize:12 }}>Loading courses from database…</div>;

  return (
    <div>
      <div className="section-title"><span className="section-tag">LEARNING</span> Course <em>Phases</em> <span style={{ fontSize:11, color:'var(--green)', fontWeight:400, marginLeft:8 }}>● MongoDB</span></div>
      {phases.map(p => (
        <div key={p.num} style={{ background:'var(--card)', border:`1px solid ${p.current?'rgba(201,168,76,0.4)':'var(--border)'}`, borderRadius:12, marginBottom:12, overflow:'hidden', transition:'all 0.2s' }}>
          <div style={{ padding:'16px 24px', display:'flex', alignItems:'center', gap:16, cursor:'pointer' }} onClick={() => setOpenPhase(openPhase===p.num?null:p.num)}>
            <div style={{ width:44, height:44, borderRadius:'50%', background: p.done?'rgba(46,204,113,0.15)':p.current?'rgba(201,168,76,0.15)':'rgba(35,35,35,0.6)', border:`1px solid ${p.done?'rgba(46,204,113,0.3)':p.current?'rgba(201,168,76,0.3)':'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, color: p.done?'var(--green)':p.current?'var(--gold)':'var(--muted)', flexShrink:0 }}>
              {p.done ? '✓' : p.num}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:600, color: p.current?'var(--white)':'var(--silver)' }}>Phase {p.num} — {p.title}</div>
              <div style={{ marginTop:6 }}><div className="prog-bar" style={{ height:3 }}><div className="prog-fill" style={{ width:`${p.pct}%`, background: p.done?'var(--green)':'var(--gold)' }} /></div></div>
            </div>
            <span className={`badge ${p.done?'badge-active':p.current?'badge-pending':'badge-blue'}`}>{p.done?'Completed':p.current?'In Progress':'Locked'}</span>
            <span style={{ color:'var(--muted)', fontSize:16 }}>{openPhase===p.num?'▲':'▼'}</span>
          </div>
          {openPhase===p.num && (
            <div style={{ padding:'0 24px 20px', borderTop:'1px solid var(--border)' }}>
              <div style={{ marginTop:14, display:'flex', flexWrap:'wrap', gap:8 }}>
                {p.topics.map(t => (
                  <div key={t} style={{ background:'rgba(201,168,76,0.06)', border:'1px solid rgba(201,168,76,0.15)', borderRadius:6, padding:'6px 12px', fontSize:12, color:'var(--silver)' }}>
                    {p.done?'✅':p.current?'📖':'🔒'} {t}
                  </div>
                ))}
              </div>
              {p.videos && p.videos.length > 0 && (
                <div style={{ marginTop:12, fontSize:11, color:'var(--muted)' }}>📹 {p.videos.length} recorded video{p.videos.length !== 1 ? 's' : ''}</div>
              )}
              {(p.done || p.current) && (
                <button className="btn btn-outline" style={{ marginTop:14 }} onClick={() => openVideo && openVideo(`Phase ${p.num} — ${p.title}`, 'observer')}>📹 View Recorded Sessions</button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// PAGE: LIVE SESSIONS — LIVE from MongoDB
function LiveSessionsPage({ openVideo }) {
  const [live, setLive] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [ended, setEnded] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(() => {
    getLiveSessions()
      .then(d => { setLive(d.live || []); setUpcoming(d.upcoming || []); setEnded(d.ended || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [fetchSessions]);

  const formatDate = (d) => {
    const dt = new Date(d);
    const diff = Math.floor((dt - Date.now()) / 86400000);
    if (diff === 0) return `Today ${dt.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
    if (diff === 1) return `Tomorrow ${dt.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
    return dt.toLocaleDateString([], {day:'numeric', month:'short'}) + ' ' + dt.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  };
  const pastDate = (d) => {
    const dt = new Date(d);
    const diff = Math.floor((Date.now() - dt) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return dt.toLocaleDateString([], {day:'numeric', month:'short'});
  };

  if (loading) return <div style={{ textAlign:'center', color:'var(--muted)', padding:40, fontSize:12 }}>Loading sessions from database…</div>;

  return (
    <div>
      <div className="section-title"><span className="section-tag">LIVE</span> Live <em>Sessions</em> <span style={{ fontSize:11, color:'var(--green)', fontWeight:400, marginLeft:8 }}>● MongoDB</span></div>
      <div className="grid-2">
        <div className="panel">
          <div className="section-title">Currently <em>Live</em> <span style={{ fontSize:11, color:'var(--muted)', fontWeight:400 }}>({live.length})</span></div>
          {live.length === 0 ? (
            <div style={{ textAlign:'center', color:'var(--muted)', padding:20, fontSize:12 }}>No live sessions right now.</div>
          ) : live.map(s => (
            <div key={s._id} className="session-card live-border" style={{ position:'relative' }}>
              {/* Red LIVE badge */}
              <div style={{ position:'absolute', top:10, right:10, display:'flex', alignItems:'center', gap:6, background:'rgba(231,76,60,0.15)', border:'1px solid rgba(231,76,60,0.4)', padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, color:'#e74c3c' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#e74c3c', boxShadow:'0 0 8px #e74c3c', animation:'pulse 1.5s infinite' }}></div>
                LIVE
              </div>
              <div className="avatar avatar-md">{s.instructorAvatar || s.instructor?.slice(0,2)}</div>
              <div className="session-info">
                <div className="session-name">{s.instructor} — {s.topic}</div>
                <div className="session-meta">{s.phase} · Room: {s.roomCode} · {s.viewers} watching</div>
                <div style={{ fontSize:11, color:'var(--silver)', marginTop:4, display:'flex', alignItems:'center', gap:6 }}>
                  🕐 Started: {s.startedAt ? new Date(s.startedAt).toLocaleString([], { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : s.scheduledAt ? new Date(s.scheduledAt).toLocaleString([], { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : 'Just now'}
                </div>
              </div>
              <button className="btn btn-gold btn-sm" onClick={() => openVideo(`${s.instructor} – ${s.topic}`, 'observer', s._id)}>️▶ Join Session</button>
            </div>
          ))}
        </div>
        <div className="panel">
          <div className="section-title">Upcoming <em>Sessions</em> <span style={{ fontSize:11, color:'var(--muted)', fontWeight:400 }}>({upcoming.length})</span></div>
          {upcoming.length === 0 ? (
            <div style={{ textAlign:'center', color:'var(--muted)', padding:20, fontSize:12 }}>No upcoming sessions.</div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Topic</th><th>Instructor</th><th>Time</th><th>Phase</th></tr></thead>
              <tbody>
                {upcoming.map(s => (
                  <tr key={s._id}><td>{s.topic}</td><td>{s.instructor?.split(' ')[0]}</td><td>{formatDate(s.scheduledAt)}</td><td>{s.phase}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div className="panel">
        <div className="section-title">Past <em>Recordings</em> <span style={{ fontSize:11, color:'var(--muted)', fontWeight:400 }}>({ended.length})</span></div>
        {ended.length === 0 ? (
          <div style={{ textAlign:'center', color:'var(--muted)', padding:20, fontSize:12 }}>No past recordings yet.</div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Session Name</th><th>Instructor</th><th>Phase</th><th>Date</th><th>Duration</th><th>Watch</th></tr></thead>
            <tbody>
              {ended.map(s => (
                <tr key={s._id}><td>{s.topic}</td><td>{s.instructor?.split(' ')[0]}</td><td>{s.phase}</td><td>{pastDate(s.scheduledAt)}</td><td>{s.duration || '—'}</td><td><button className="btn btn-outline btn-sm" onClick={() => openVideo(`${s.topic} — ${s.instructor}`, 'observer')}>▶ Watch</button></td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// PAGE: TRADE JOURNAL — Live from MongoDB
function TradeJournal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [form, setForm] = useState({ pair:'', direction:'Buy', entryPrice:'', lotSize:'', stopLoss:'', takeProfit:'', result:'', pnl:'', note:'' });

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getJournalEntries();
      setEntries(data.entries || []);
    } catch (e) { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleSave = async () => {
    if (!form.pair.trim() || !form.entryPrice.trim()) { setSaveMsg('❌ Pair and Entry Price are required.'); return; }
    setSaving(true);
    setSaveMsg('');
    try {
      const data = await createJournalEntry(form);
      if (data.success) {
        setEntries(prev => [data.entry, ...prev]);
        setForm({ pair:'', direction:'Buy', entryPrice:'', lotSize:'', stopLoss:'', takeProfit:'', result:'', pnl:'', note:'' });
        setShowForm(false);
        setSaveMsg('✅ Trade saved!');
        setTimeout(() => setSaveMsg(''), 3000);
      }
    } catch (e) { setSaveMsg('❌ Failed to save trade.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this trade entry?')) return;
    try {
      await deleteJournalEntry(id);
      setEntries(prev => prev.filter(e => e._id !== id));
    } catch (e) { alert('Failed to delete entry.'); }
  };

  const timeAgo = (date) => {
    const d = new Date(date);
    const diff = Math.floor((Date.now() - d) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff}d ago`;
  };

  return (
    <div>
      <div className="section-title" style={{ justifyContent:'space-between' }}>
        <span><span className="section-tag">JOURNAL</span> Trade <em>Journal</em></span>
        <button className="btn btn-gold btn-sm" onClick={() => setShowForm(!showForm)}>+ Log Trade</button>
      </div>
      {saveMsg && <div style={{ fontSize:12, marginBottom:12, color: saveMsg.startsWith('✅') ? 'var(--green)' : 'var(--red)' }}>{saveMsg}</div>}

      {showForm && (
        <div className="panel">
          <div className="section-title">New <em>Trade Entry</em></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:14 }}>
            <div className="form-group"><label className="form-label">Pair</label><input className="form-input" placeholder="EUR/USD" value={form.pair} onChange={e => setForm({...form, pair: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Direction</label><select className="form-select" value={form.direction} onChange={e => setForm({...form, direction: e.target.value})}><option>Buy</option><option>Sell</option></select></div>
            <div className="form-group"><label className="form-label">Entry Price</label><input className="form-input" placeholder="1.0892" value={form.entryPrice} onChange={e => setForm({...form, entryPrice: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Lot Size</label><input className="form-input" placeholder="0.01" value={form.lotSize} onChange={e => setForm({...form, lotSize: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Stop Loss</label><input className="form-input" placeholder="1.0850" value={form.stopLoss} onChange={e => setForm({...form, stopLoss: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Take Profit</label><input className="form-input" placeholder="1.0950" value={form.takeProfit} onChange={e => setForm({...form, takeProfit: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Result (pips)</label><input className="form-input" placeholder="+25 pips" value={form.result} onChange={e => setForm({...form, result: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">P&amp;L (₹)</label><input className="form-input" placeholder="₹250" value={form.pnl} onChange={e => setForm({...form, pnl: e.target.value})} /></div>
          </div>
          <div className="form-group"><label className="form-label">Notes / Analysis</label><textarea className="form-textarea" placeholder="What was your reasoning? What did you learn?" value={form.note} onChange={e => setForm({...form, note: e.target.value})} /></div>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn btn-gold" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : '💾 Save Trade'}</button>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign:'center', color:'var(--muted)', padding:40, fontSize:13 }}>Loading trades…</div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign:'center', color:'var(--muted)', padding:40, fontSize:13 }}>No trades yet. Click "+ Log Trade" to add your first entry.</div>
      ) : (
        entries.map(e => (
          <div key={e._id} className="journal-card">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, color:'var(--white)' }}>{e.pair}</div>
                <span className={`badge ${e.direction==='Buy'?'badge-active':'badge-open'}`}>{e.direction}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                {e.result && <span className={`journal-result ${e.result?.startsWith('+') || e.result?.startsWith('profit') ? 'profit' : 'loss'}`} style={{ fontWeight:700, fontSize:14 }}>{e.result}</span>}
                <span style={{ fontSize:11, color:'var(--muted)' }}>{timeAgo(e.createdAt)}</span>
                <button className="btn btn-outline btn-sm" style={{ color:'var(--red)', borderColor:'rgba(231,76,60,0.3)', fontSize:10, padding:'2px 8px' }} onClick={() => handleDelete(e._id)}>✕</button>
              </div>
            </div>
            <div style={{ display:'flex', gap:24, fontSize:12, color:'var(--muted)', marginBottom:6 }}>
              <span>Entry: <strong style={{ color:'var(--silver)' }}>{e.entryPrice}</strong></span>
              {e.stopLoss && <span>SL: <strong style={{ color:'var(--red)' }}>{e.stopLoss}</strong></span>}
              {e.takeProfit && <span>TP: <strong style={{ color:'var(--green)' }}>{e.takeProfit}</strong></span>}
              {e.lotSize && <span>Lot: <strong style={{ color:'var(--silver)' }}>{e.lotSize}</strong></span>}
            </div>
            {e.note && <div style={{ fontSize:12, color:'var(--silver)', fontStyle:'italic' }}>"{e.note}"</div>}
          </div>
        ))
      )}
    </div>
  );
}

// PAGE: TRADE AUDIT REQUEST — Live from MongoDB
function AuditRequest() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');
  const [form, setForm] = useState({ pair:'', direction:'Buy', entryPrice:'', stopLoss:'', takeProfit:'', result:'', analysis:'', screenshot:'' });

  useEffect(() => {
    getAudits().then(data => setAudits(data.audits || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!form.pair.trim() || !form.entryPrice.trim()) { setSubmitMsg('❌ Pair and Entry Price are required.'); return; }
    setSubmitting(true);
    setSubmitMsg('');
    try {
      const data = await submitAudit(form);
      if (data.success) {
        setAudits(prev => [data.audit, ...prev]);
        setForm({ pair:'', direction:'Buy', entryPrice:'', stopLoss:'', takeProfit:'', result:'', analysis:'', screenshot:'' });
        setSubmitMsg('✅ Submitted for audit!');
        setTimeout(() => setSubmitMsg(''), 3000);
      }
    } catch (e) { setSubmitMsg('❌ Failed to submit.'); }
    finally { setSubmitting(false); }
  };

  const statusBadge = (s) => s === 'Pending' ? 'badge-open' : s === 'In Review' ? 'badge-pending' : s === 'Approved' ? 'badge-active' : 'badge-open';
  const timeAgo = (date) => {
    const d = new Date(date);
    const diff = Math.floor((Date.now() - d) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff}d ago`;
  };

  return (
    <div>
      <div className="section-title"><span className="section-tag">AUDIT</span> Trade <em>Audit Request</em></div>
      <div className="grid-2">
        <div className="panel">
          <div className="section-title">Submit <em>Trade for Review</em></div>
          <div className="form-group"><label className="form-label">Currency Pair</label><input className="form-input" placeholder="GBP/USD" value={form.pair} onChange={e => setForm({...form, pair: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Trade Direction</label><select className="form-select" value={form.direction} onChange={e => setForm({...form, direction: e.target.value})}><option>Buy</option><option>Sell</option></select></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
            <div className="form-group"><label className="form-label">Entry</label><input className="form-input" placeholder="1.2680" value={form.entryPrice} onChange={e => setForm({...form, entryPrice: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Stop Loss</label><input className="form-input" placeholder="1.2640" value={form.stopLoss} onChange={e => setForm({...form, stopLoss: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Take Profit</label><input className="form-input" placeholder="1.2760" value={form.takeProfit} onChange={e => setForm({...form, takeProfit: e.target.value})} /></div>
          </div>
          <div className="form-group"><label className="form-label">Result</label><input className="form-input" placeholder="+32 pips" value={form.result} onChange={e => setForm({...form, result: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Your Analysis / Notes</label><textarea className="form-textarea" placeholder="Explain your reasoning, entry logic, and what you want reviewed..." style={{ minHeight:100 }} value={form.analysis} onChange={e => setForm({...form, analysis: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Screenshot (Description / Link)</label><textarea className="form-textarea" placeholder="Describe your chart setup or paste a TradingView link..." value={form.screenshot} onChange={e => setForm({...form, screenshot: e.target.value})} /></div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <button className="btn btn-gold" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Submitting…' : '📤 Submit for Audit'}</button>
            {submitMsg && <span style={{ fontSize:12, color: submitMsg.startsWith('✅') ? 'var(--green)' : 'var(--red)' }}>{submitMsg}</span>}
          </div>
        </div>
        <div className="panel">
          <div className="section-title">My <em>Audit History</em> <span style={{ fontSize:11, color:'var(--muted)', fontWeight:400, marginLeft:8 }}>({audits.length})</span></div>
          {loading ? (
            <div style={{ textAlign:'center', color:'var(--muted)', padding:20, fontSize:12 }}>Loading…</div>
          ) : audits.length === 0 ? (
            <div style={{ textAlign:'center', color:'var(--muted)', padding:20, fontSize:12 }}>No audit submissions yet.</div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Pair</th><th>Submitted</th><th>Reviewer</th><th>Status</th><th>Feedback</th></tr></thead>
              <tbody>
                {audits.map(a => (
                  <tr key={a._id}>
                    <td>{a.pair}</td>
                    <td>{timeAgo(a.createdAt)}</td>
                    <td>{a.reviewer?.name || '—'}</td>
                    <td><span className={`badge ${statusBadge(a.status)}`}>{a.status}</span></td>
                    <td>{a.feedback ? <span title={a.feedback} style={{ cursor:'pointer' }}>📝 View</span> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// PAGE: SUPPORT TICKETS — Live from MongoDB
function SupportTickets({ openVideo }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');
  const [form, setForm] = useState({ category:'Technical', subject:'', description:'' });

  useEffect(() => {
    getTickets().then(data => setTickets(data.tickets || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.description.trim()) { setSubmitMsg('❌ Subject and description are required.'); return; }
    setSubmitting(true);
    setSubmitMsg('');
    try {
      const data = await createTicket(form);
      if (data.success) {
        setTickets(prev => [data.ticket, ...prev]);
        setForm({ category:'Technical', subject:'', description:'' });
        setShowForm(false);
        setSubmitMsg('✅ Ticket submitted!');
        setTimeout(() => setSubmitMsg(''), 3000);
      }
    } catch (e) { setSubmitMsg('❌ Failed to submit ticket.'); }
    finally { setSubmitting(false); }
  };

  const statusBadge = (s) => s === 'Open' ? 'badge-open' : s === 'In Progress' ? 'badge-pending' : 'badge-resolved';
  const timeAgo = (date) => {
    const d = new Date(date);
    const diff = Math.floor((Date.now() - d) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff}d ago`;
  };

  return (
    <div>
      <div className="section-title" style={{ justifyContent:'space-between' }}>
        <span><span className="section-tag">SUPPORT</span> My <em>Support Tickets</em></span>
        <button className="btn btn-gold btn-sm" onClick={() => setShowForm(!showForm)}>+ New Ticket</button>
      </div>
      {submitMsg && <div style={{ fontSize:12, marginBottom:12, color: submitMsg.startsWith('✅') ? 'var(--green)' : 'var(--red)' }}>{submitMsg}</div>}

      {showForm && (
        <div className="panel">
          <div className="section-title">Raise <em>Support Ticket</em></div>
          <div className="form-group"><label className="form-label">Issue Category</label>
            <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              <option value="Technical">Technical (MT5/Platform)</option>
              <option value="Software">Software (Charts/Tools)</option>
              <option value="Payment">Payment Issue</option>
              <option value="Content">Course Content</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Subject</label><input className="form-input" placeholder="Brief description of your issue" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Describe Your Issue</label><textarea className="form-textarea" placeholder="Please describe in detail..." style={{ minHeight:100 }} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn btn-gold" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Submitting…' : '📩 Submit Ticket'}</button>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign:'center', color:'var(--muted)', padding:40, fontSize:13 }}>Loading tickets…</div>
      ) : tickets.length === 0 ? (
        <div style={{ textAlign:'center', color:'var(--muted)', padding:40, fontSize:13 }}>No tickets yet. Click "+ New Ticket" to create one.</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {tickets.map(t => (
            <div key={t._id} className="ticket-card">
              <div className="ticket-header">
                <span className="ticket-id">{t.ticketId}</span>
                <span className={`badge ${statusBadge(t.status)}`}>{t.status}</span>
              </div>
              <div className="ticket-subject">{t.subject}</div>
              <div className="ticket-body" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:11, color:'var(--muted)' }}>{t.category} · {timeAgo(t.createdAt)}</span>
                {t.status === 'Open' && <button className="btn btn-gold btn-sm" onClick={() => openVideo(`${t.ticketId}: ${t.subject}`, 'support')}>📹 Video Call</button>}
              </div>
              {t.resolution && <div style={{ fontSize:11, color:'var(--green)', marginTop:8, padding:'8px 12px', background:'rgba(46,204,113,0.06)', borderRadius:6, border:'1px solid rgba(46,204,113,0.15)' }}>📝 Resolution: {t.resolution}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// PAGE: PROFILE & KYC — Live data from MongoDB + Save
function ProfileKYC({ user }) {
  const [name, setName]     = useState(user?.name || '');
  const [phone, setPhone]   = useState('');
  const [city, setCity]     = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch real profile data on mount
  useEffect(() => {
    getUserStats()
      .then(({ stats }) => {
        if (stats?.user) {
          setName(stats.user.name || '');
          setPhone(stats.user.phone || '');
          setCity(stats.user.city || '');
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const data = await updateMyProfile({ name, phone, city });
      if (data.success) {
        setSaveMsg('✅ Profile updated successfully!');
        setTimeout(() => setSaveMsg(''), 3000);
      }
    } catch (e) {
      setSaveMsg('❌ Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingProfile) {
    return <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>Loading profile…</div>;
  }

  return (
    <div>
      <div className="section-title"><span className="section-tag">ACCOUNT</span> Profile &amp; <em>KYC</em></div>
      <div className="grid-2">
        <div className="panel">
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
            <div className="avatar avatar-lg">{user?.avatar}</div>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700 }}>{name || user?.name}</div>
              <div style={{ fontSize:12, color:'var(--muted)', marginTop:4 }}>{user?.email} · {user?.batch || 'No batch'}</div>
              <span className={`badge ${user?.hasPaid ? 'badge-active' : 'badge-pending'}`} style={{ marginTop:8, display:'inline-block' }}>{user?.hasPaid ? 'Paid Member' : 'Free Member'}</span>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={name} onChange={e => setName(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={user?.email || ''} disabled style={{ opacity: 0.6 }} /></div>
          <div className="form-group"><label className="form-label">Phone</label><input className="form-input" placeholder="+91 99999 99999" value={phone} onChange={e => setPhone(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">City</label><input className="form-input" placeholder="Mumbai" value={city} onChange={e => setCity(e.target.value)} /></div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn btn-gold" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : '💾 Save Profile'}</button>
            {saveMsg && <span style={{ fontSize: 12, color: saveMsg.startsWith('✅') ? 'var(--green)' : 'var(--red)' }}>{saveMsg}</span>}
          </div>
        </div>
        <div className="panel">
          <div className="section-title">KYC <em>Verification</em></div>
          {[
            { step:'01', label:'Submit Aadhaar Card', done:true },
            { step:'02', label:'Submit PAN Card', done:true },
            { step:'03', label:'Bank Account Details', done:true },
            { step:'04', label:'Video Verification (Admin Call)', done:false },
            { step:'05', label:'KYC Approval', done:false },
          ].map(k => (
            <div key={k.step} className={`kyc-step${k.done?' kyc-step-done':''}`}>
              <div className="kyc-step-num">{k.done ? '✓' : k.step}</div>
              <div style={{ fontSize:13, color: k.done?'var(--green)':'var(--silver)', fontWeight: k.done?600:300 }}>{k.label}</div>
              {k.done && <span className="badge badge-active" style={{ marginLeft:'auto' }}>Done</span>}
            </div>
          ))}
          <div style={{ marginTop:14 }}>
            <div style={{ fontSize:11, color:'var(--muted)', marginBottom:8 }}>KYC Status: <strong style={{ color:'var(--gold)' }}>Partially Verified (3/5)</strong></div>
            <button className="btn btn-gold btn-sm">Continue KYC →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// PAGE: DAILY ANALYSIS — LIVE from MongoDB
function DailyAnalysis({ onNavigate }) {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState({});

  useEffect(() => {
    getDailyAnalyses()
      .then(d => setAnalyses(d.analyses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const timeAgo = (date) => {
    const d = new Date(date);
    const diff = Math.floor((Date.now() - d) / 3600000);
    if (diff < 1) return 'Just now';
    if (diff < 24) return `${diff}h ago`;
    const days = Math.floor(diff / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const handleLike = async (id) => {
    try {
      const d = await toggleAnalysisLike(id);
      setLiked(prev => ({ ...prev, [id]: d.liked }));
      setAnalyses(prev => prev.map(a => a._id === id ? { ...a, likes: d.likes } : a));
    } catch (e) { /* ignore */ }
  };

  if (loading) return <div style={{ textAlign:'center', color:'var(--muted)', padding:40, fontSize:12 }}>Loading analyses from database…</div>;

  return (
    <div>
      <div className="section-title"><span className="section-tag">MARKET</span> Daily <em>Analysis</em> <span style={{ fontSize:11, color:'var(--green)', fontWeight:400, marginLeft:8 }}>● MongoDB</span></div>
      <p style={{ color:'var(--silver)', marginBottom: '24px' }}>Expert market breakdown and potential setups for the day.</p>

      {analyses.length === 0 ? (
        <div style={{ textAlign:'center', color:'var(--muted)', padding:40, fontSize:12 }}>No analyses posted yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {analyses.map(a => (
            <div key={a._id} className="panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '700', fontFamily: "'Playfair Display', serif" }}>{a.pair} — {a.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>By {a.author} · {timeAgo(a.createdAt)}</div>
                </div>
                <span className="badge badge-pending">Analysis</span>
              </div>

              <p style={{ fontSize: '14px', color: 'var(--silver)', lineHeight: '1.8', marginBottom: '20px' }}>
                {a.body}
              </p>

              {a.images?.length > 0 && (
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px' }}>
                  {a.images.map((img, idx) => (
                    <img key={idx} src={img} alt="Analysis Chart" style={{ height: '200px', borderRadius: '8px', border: '1px solid var(--border)', objectFit: 'cover' }} />
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--border)', alignItems: 'center' }}>
                <button className={`btn btn-sm ${liked[a._id] ? 'btn-gold' : 'btn-outline'}`} onClick={() => handleLike(a._id)}>{liked[a._id] ? '✅ Helpful' : '👍 Helpful'} ({a.likes || 0})</button>
                <button className="btn btn-outline btn-sm" onClick={() => onNavigate && onNavigate('messages')}>💬 Discuss in Chat</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// PAGE: MESSAGES — LIVE from MongoDB
function Messages({ user }) {
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [inp, setInp] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const ref = useRef(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(data.conversations || []);
      // Auto-select first conversation
      if (!activePartner && data.conversations?.length > 0) {
        setActivePartner(data.conversations[0].partner);
      }
    } catch (e) { /* ignore */ }
    finally { setLoadingConvos(false); }
  }, [activePartner]);

  useEffect(() => { fetchConversations(); }, []);

  // Fetch messages for active partner
  const fetchMessages = useCallback(async () => {
    if (!activePartner?._id) return;
    setLoadingMsgs(true);
    try {
      const data = await getMessages(activePartner._id);
      setMsgs(data.messages || []);
    } catch (e) { /* ignore */ }
    finally { setLoadingMsgs(false); }
  }, [activePartner?._id]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!activePartner?._id) return;
    const interval = setInterval(async () => {
      try {
        const data = await getMessages(activePartner._id);
        setMsgs(data.messages || []);
        // Also refresh conversation list for unread counts
        const convData = await getConversations();
        setConversations(convData.conversations || []);
      } catch (e) { /* ignore */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [activePartner?._id]);

  // Auto-scroll
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [msgs]);

  const send = async () => {
    if (!inp.trim() || !activePartner?._id || sending) return;
    setSending(true);
    try {
      const data = await sendMessage(activePartner._id, inp);
      if (data.success) {
        setMsgs(prev => [...prev, data.message]);
        setInp('');
      }
    } catch (e) { /* ignore */ }
    finally { setSending(false); }
  };

  const selectPartner = (partner) => {
    setActivePartner(partner);
    setMsgs([]);
  };

  return (
    <div>
      <div className="section-title"><span className="section-tag">COMMUNICATIONS</span> Mentor <em>Chat</em></div>
      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:20, height:500 }}>
        {/* Conversation sidebar */}
        <div className="panel" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)' }}>Conversations</div>
          <div style={{ overflowY:'auto', height:'calc(100% - 44px)' }}>
            {loadingConvos ? (
              <div style={{ padding:20, textAlign:'center', color:'var(--muted)', fontSize:12 }}>Loading…</div>
            ) : conversations.length === 0 ? (
              <div style={{ padding:20, textAlign:'center', color:'var(--muted)', fontSize:12 }}>No conversations yet.</div>
            ) : (
              conversations.map(c => (
                <div key={c.partner._id} onClick={() => selectPartner(c.partner)} style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', cursor:'pointer', background: activePartner?._id === c.partner._id ? 'rgba(201,168,76,0.05)' : '' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div className="avatar avatar-sm">{c.partner.avatar || c.partner.name?.slice(0,2).toUpperCase()}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:'var(--white)' }}>{c.partner.name}</div>
                      <div style={{ fontSize:10, color:'var(--muted)' }}>{c.lastMessage?.text?.slice(0, 30) || 'Start a conversation…'}{c.lastMessage?.text?.length > 30 ? '…' : ''}</div>
                    </div>
                    {c.unread > 0 && <span className="nav-badge">{c.unread}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Chat area */}
        <div className="chat-panel" style={{ height:500 }}>
          <div className="chat-header">💬 {activePartner ? `${activePartner.name} (${activePartner.role === 'admin' ? 'Instructor' : activePartner.role === 'superadmin' ? 'Super Admin' : 'Student'})` : 'Select a conversation'}</div>
          <div className="chat-msgs" ref={ref}>
            {loadingMsgs ? (
              <div style={{ padding:20, textAlign:'center', color:'var(--muted)', fontSize:12 }}>Loading messages…</div>
            ) : msgs.length === 0 ? (
              <div style={{ padding:20, textAlign:'center', color:'var(--muted)', fontSize:12 }}>No messages yet. Start the conversation!</div>
            ) : (
              msgs.map((m, i) => (
                <div key={m._id || i} className={`cmsg${m.sender?._id === user?._id || m.sender === user?._id ? ' mine' : ''}`}>
                  <span className="sender">{m.sender?.name || 'You'}</span> — {m.text}
                </div>
              ))
            )}
          </div>
          <div className="chat-input-row">
            <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder={activePartner ? `Message ${activePartner.name}...` : 'Select a conversation first...'} disabled={!activePartner} />
            <button onClick={send} disabled={!activePartner || sending}>{sending ? '…' : 'Send'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { divider: true, label: 'My Learning' },
  { id:'progress',  icon:'📊', label:'My Progress' },
  { id:'phases',    icon:'📚', label:'Course Phases' },
  { divider: true, label: 'Live & Trading' },
  { id:'analysis',  icon:'💡', label:'Daily Analysis', badge: 'New' },
  { id:'sessions',  icon:'📹', label:'Live Sessions' },
  { id:'journal',   icon:'📈', label:'Trade Journal' },
  { id:'audit',     icon:'🔍', label:'Trade Audit Request' },
  { divider: true, label: 'Mentorship' },
  { id:'messages',  icon:'💬', label:'Mentor Chat' },
  { id:'tickets',   icon:'🎫', label:'Support Tickets' },
  { divider: true, label: 'Account' },
  { id:'profile',   icon:'👤', label:'Profile & KYC' },
];

export default function UserDashboard() {
  const { user }   = useAuth();
  const [active, setActive]   = useState('progress');
  const [videoModal, setVideoModal] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const openVideo  = (title, type, sessionId) => setVideoModal({ title, type, sessionId });
  const closeVideo = ()            => setVideoModal(null);

  const PAGE = {
    progress: <MyProgress />,
    phases:   <CoursePhasesPage openVideo={openVideo} />,
    analysis: <DailyAnalysis onNavigate={setActive} />,
    sessions: <LiveSessionsPage openVideo={openVideo} />,
    journal:  <TradeJournal />,
    audit:    <AuditRequest />,
    messages: <Messages user={user} />,
    tickets:  <SupportTickets openVideo={openVideo} />,
    profile:  <ProfileKYC user={user} />,
  };

  if (user && !user.hasPaid) {
    return (
      <div className="app-layout">
        <Sidebar role="user" activeItem="enroll" onNav={()=>{}} items={[{ id:'enroll', icon:'💳', label:'Enrollment' }, {id:'profile', icon:'👤', label:'Profile'}]} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <div className="main-content">
          <Topbar title="Trader" subtitle="Complete Purchase" onMenuToggle={() => setMobileOpen(true)} extras={<div className="avatar avatar-sm" style={{ marginRight:4 }}>{user?.avatar}</div>} />
          <div className="page-content">
            <PricingPlans />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar role="user" activeItem={active} onNav={setActive} items={NAV_ITEMS} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="main-content">
        <Topbar title="Trader" subtitle="Dashboard" onMenuToggle={() => setMobileOpen(true)} onViewNotifications={() => setActive('progress')} extras={
          <div className="avatar avatar-sm" style={{ marginRight:4 }}>{user?.avatar}</div>
        } />
        <div className="page-content">
          {PAGE[active]}
        </div>
      </div>
      {videoModal && <VideoModal title={videoModal.title} type={videoModal.type} sessionId={videoModal.sessionId} onClose={closeVideo} senderLabel={user?.avatar || 'RS'} />}
    </div>
  );
}
