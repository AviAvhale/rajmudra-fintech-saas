import React, { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import { useAuth } from '../../context/AuthContext';
import { getAdminStats, getAnnouncements, createAnnouncement, deleteAnnouncement } from '../../api/stats';
import { getStudents } from '../../api/users';
import { getConversations, getMessages, sendMessage } from '../../api/messages';
import { getAudits, reviewAudit } from '../../api/audits';
import { createLiveSession, endLiveSession } from '../../api/livesessions';

// ── Chat helper for Live Session ───────────────────────────────────────────
function ChatPanel({ id, height = 360, initMessages = [], adminLabel = 'VTP', onSend, socketRef, sessionId }) {
  const [msgs, setMsgs] = useState(initMessages);
  const [inp, setInp]   = useState('');
  const ref             = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [msgs]);

  // Listen for incoming chat messages from students
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;
    const handler = (message) => {
      setMsgs(prev => [...prev, { sender: message.sender, text: message.text, sys: false, mine: false }]);
    };
    socket.on('chat-message', handler);
    return () => socket.off('chat-message', handler);
  }, [socketRef?.current]);

  const addMsg = (sender, text, sys = false, mine = false) => setMsgs(prev => [...prev, { sender, text, sys, mine }]);
  const send = () => {
    if (!inp.trim()) return;
    const text = inp.trim();
    addMsg(`📢 ${adminLabel}`, text, false, true);
    setInp('');
    // Emit to socket room
    if (socketRef?.current && sessionId) {
      socketRef.current.emit('chat-message', sessionId, { sender: `Instructor (${adminLabel})`, text });
    }
    if (onSend) onSend(text);
  };
  return (
    <div className="chat-panel" style={{ height }}>
      <div className="chat-header">💬 Live Chat <span style={{ color:'var(--muted)', fontSize:10 }}>{id}</span></div>
      <div className="chat-msgs" ref={ref}>
        {msgs.map((m, i) => (
          <div key={i} className={`cmsg${m.sys ? ' sys' : ''}${m.mine ? ' mine' : ''}`}>
            <span className="sender">{m.sender}</span> — {m.text}
          </div>
        ))}
      </div>
      <div className="chat-input-row">
        <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Broadcast message..." />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}

// ── StatCard ───────────────────────────────────────────────────────────────
function StatCard({ icon, val, label }) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <span className="stat-val stat-val-sm">{val}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

// ── ProgBar ────────────────────────────────────────────────────────────────
function ProgBar({ label, pct, color = 'var(--gold)' }) {
  return (
    <div className="prog-item">
      <div className="prog-label">
        <span className="prog-label-text">{label}</span>
        <span className="prog-label-pct">{pct}%</span>
      </div>
      <div className="prog-bar">
        <div className="prog-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg,${color},${color}88)` }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: OVERVIEW — Live data from MongoDB
function Overview({ onGoLive }) {
  const [stats, setStats]     = useState(null);
  const [statsErr, setStatsErr] = useState('');

  useEffect(() => {
    getAdminStats()
      .then(({ stats }) => setStats(stats))
      .catch(() => setStatsErr('Could not load stats from server.'));
  }, []);

  return (
    <div>
      <div className="section-title"><span className="section-tag">INSTRUCTOR</span> My <em>Overview</em></div>
      {statsErr && <div style={{ background:'rgba(231,76,60,0.1)', border:'1px solid rgba(231,76,60,0.3)', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:12, color:'#e74c3c' }}>{statsErr}</div>}
      <div className="stats-grid">
        <StatCard icon="👥" val={stats ? stats.totalUsers : '…'} label="My Students" />
        <StatCard icon="📹" val="48" label="Sessions Hosted" />
        <StatCard icon="⭐" val="4.9" label="Student Rating" />
        <StatCard icon="💰" val={stats ? stats.paidUsers : '…'} label="Paid Members" />
      </div>

      {/* Batch breakdown from DB */}
      {stats?.batchBreakdown && stats.batchBreakdown.length > 0 && (
        <div className="panel" style={{ marginBottom: 20 }}>
          <div className="section-title">Batch <em>Breakdown</em></div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {stats.batchBreakdown.map(b => (
              <div key={b._id || 'none'} style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 8, padding: '10px 16px', fontSize: 12 }}>
                <div style={{ fontWeight: 700, color: 'var(--white)', marginBottom: 2 }}>{b._id || 'Unassigned'}</div>
                <div style={{ color: 'var(--gold)' }}>{b.count} student{b.count !== 1 ? 's' : ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid-2">
        <div className="panel">
          <div className="section-title">Upcoming <em>Sessions</em></div>
          <table className="data-table">
            <thead><tr><th>Topic</th><th>Phase</th><th>Date / Time</th><th>Action</th></tr></thead>
            <tbody>
              <tr><td>Smart Money Concepts</td><td>Phase 3</td><td>Today 2:00 PM</td><td><button className="btn btn-gold btn-sm" onClick={onGoLive}>▶ Start</button></td></tr>
              <tr><td>Order Block Analysis</td><td>Phase 3</td><td>Tomorrow 10:00 AM</td><td><button className="btn btn-outline btn-sm">Edit</button></td></tr>
              <tr><td>4-Day Live Trade — Day 1</td><td>Phase 5</td><td>15 Apr 9:30 AM</td><td><button className="btn btn-outline btn-sm">Edit</button></td></tr>
            </tbody>
          </table>
        </div>
        <div className="panel">
          <div className="section-title">Student <em>Progress</em></div>
          <div className="prog-wrap">
            <ProgBar label="Phase 1 — Foundation" pct={96} />
            <ProgBar label="Phase 2 — Technical Analysis" pct={83} />
            <ProgBar label="Phase 3 — Advanced Strategy" pct={61} color="var(--gold-light)" />
            <ProgBar label="Phase 4 — Risk Management" pct={42} color="var(--gold)" />
            <ProgBar label="Phase 5 — Live Trading" pct={28} color="var(--red)" />
          </div>
        </div>
      </div>
    </div>
  );
}

// PAGE: STUDENTS — Live from MongoDB
function Students() {
  const [students, setStudents] = useState([]);
  const [total, setTotal]       = useState(0);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const fetchStudents = useCallback(async (q = '') => {
    setLoading(true);
    setError('');
    try {
      const data = await getStudents({ search: q, limit: 50 });
      setStudents(data.students);
      setTotal(data.total);
    } catch {
      setError('Failed to load students from database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  useEffect(() => {
    const timer = setTimeout(() => fetchStudents(search), 400);
    return () => clearTimeout(timer);
  }, [search, fetchStudents]);

  const joined = (date) => {
    const d = new Date(date);
    const today = new Date();
    const diff = Math.floor((today - d) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff}d ago`;
  };

  return (
    <div>
      <div className="section-title"><span className="section-tag">ROSTER</span> My <em>Students</em> <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400, marginLeft: 8 }}>({total} total)</span></div>
      <div style={{ marginBottom: 16 }}>
        <input className="form-input" style={{ width: 260 }} type="text" placeholder="Search students…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {error && <div style={{ background:'rgba(231,76,60,0.1)', border:'1px solid rgba(231,76,60,0.3)', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:12, color:'#e74c3c' }}>{error}</div>}
      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 40, fontSize: 13 }}>Loading students…</div>
      ) : students.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 40, fontSize: 13 }}>No students found.</div>
      ) : (
        students.map(s => (
          <div key={s._id} className="session-card">
            <div className="avatar avatar-md">{s.avatar}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--white)' }}>{s.name}</div>
              <div style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>{s.email} · {s.batch || 'No batch'} · Joined: {joined(s.createdAt)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className={`badge ${s.hasPaid ? 'badge-active' : 'badge-pending'}`}>{s.hasPaid ? 'Paid' : 'Free'}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// PAGE: LIVE SESSION
function LiveSession({ user }) {
  const [isLive, setIsLive]       = useState(false);
  const [stream, setStream]       = useState(null);
  const [viewers, setViewers]     = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const studioRef                 = useRef(null);
  const socketRef                 = useRef(null);
  const peersRef                  = useRef({}); // watcherId -> RTCPeerConnection
  
  // Form state
  const [topic, setTopic] = useState("Smart Money Concepts");
  const [phase, setPhase] = useState("Phase 3 — Advanced Strategy");
  const [isStarting, setIsStarting] = useState(false);

  // Cleanup socket + peers on unmount
  useEffect(() => {
    return () => {
      Object.values(peersRef.current).forEach(pc => pc.close());
      socketRef.current?.disconnect();
    };
  }, []);

  const startSession = async () => {
    setIsStarting(true);
    try {
      const s = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      
      // Call backend to create the live session record
      const resp = await createLiveSession({ topic, phase, batch: "Batch A - Jan 2026" });
      const newSessionId = resp.success ? resp.session._id : `local-${Date.now()}`;
      setSessionId(newSessionId);
      
      setStream(s); setIsLive(true);
      if (studioRef.current) { studioRef.current.srcObject = s; studioRef.current.play(); }

      // ─── WebRTC Broadcasting Setup ────────────────────────
      const { io } = await import('socket.io-client');
      const socket = io(`http://${window.location.hostname}:5000`);
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('📡 Broadcaster socket connected');
        socket.emit('broadcaster', newSessionId);
      });

      // When a watcher joins, create a peer connection and send them the stream
      socket.on('watcher', (watcherId) => {
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            // Free TURN relay as fallback for difficult NAT (e.g. mobile hotspot)
            { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
            { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
          ],
          iceCandidatePoolSize: 10,
        });
        peersRef.current[watcherId] = pc;

        // Add the screen share tracks to the peer connection
        s.getTracks().forEach(track => pc.addTrack(track, s));

        // Send ICE candidates to the watcher
        pc.onicecandidate = (e) => {
          if (e.candidate) socket.emit('candidate', watcherId, e.candidate);
        };

        // Create and send offer
        pc.createOffer()
          .then(sdp => pc.setLocalDescription(sdp))
          .then(() => socket.emit('offer', watcherId, pc.localDescription));

        setViewers(v => v + 1);
      });

      // Handle answer from watcher  
      socket.on('answer', (watcherId, description) => {
        peersRef.current[watcherId]?.setRemoteDescription(description);
      });

      // Handle ICE candidate from watcher
      socket.on('candidate', (watcherId, candidate) => {
        peersRef.current[watcherId]?.addIceCandidate(new RTCIceCandidate(candidate));
      });

      // When screen share natively stops
      s.getVideoTracks()[0].onended = () => endSession();
    } catch (e) { 
      console.error(e);
    } finally {
      setIsStarting(false);
    }
  };

  const endSession = async () => {
    // Stop all tracks
    stream?.getTracks().forEach(t => t.stop());
    setStream(null); setIsLive(false); setViewers(0);
    if (studioRef.current) studioRef.current.srcObject = null;

    // Close all peer connections
    Object.values(peersRef.current).forEach(pc => pc.close());
    peersRef.current = {};

    // Disconnect socket
    socketRef.current?.disconnect();
    socketRef.current = null;
    
    if (sessionId) {
      try {
        await endLiveSession(sessionId, "1h");
      } catch (e) {
        console.error("Failed to end session:", e);
      }
      setSessionId(null);
    }
  };

  const copyRoom = () => navigator.clipboard.writeText('RM-7842').then(() => alert('Room code copied!'));

  return (
    <div>
      <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><span className="section-tag">BROADCAST</span> Host <em>Live Session</em></div>
        {isLive && <div style={{ animation: 'pulse 1.5s infinite', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', padding: '6px 12px', borderRadius: 8, color: 'var(--red)', fontWeight: 600 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }}></div> LIVE NOW</div>}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20 }}>
        <div>
          {/* Studio */}
          <div className="studio" style={{ border: isLive ? '2px solid rgba(231,76,60,0.6)' : '2px solid var(--border)', boxShadow: isLive ? '0 0 30px rgba(231,76,60,0.2)' : 'none', transition: 'all 0.3s ease', borderRadius: 16 }}>
            {!isLive ? (
              <div className="studio-placeholder" style={{ background: 'linear-gradient(145deg, rgba(20,20,20,1) 0%, rgba(30,30,30,1) 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                <div className="big-icon" style={{ filter: 'drop-shadow(0 0 15px rgba(201,168,76,0.3))' }}>🎙</div>
                <h3 style={{ fontSize: 26, marginBottom: 12 }}>Ready to Go <em style={{ color:'var(--gold)' }}>Live?</em></h3>
                <p style={{ color: 'var(--silver)' }}>Share your screen to broadcast your trading session to your students in real-time in high definition.</p>
                <button className="btn btn-gold btn-lg" onClick={startSession} disabled={isStarting} style={{ padding: '16px 36px', fontSize: 16, borderRadius: 30, boxShadow: '0 8px 25px rgba(201,168,76,0.3)', marginTop: 10 }}>
                  {isStarting ? "Starting Broadcast..." : "🔴 Start Live Broadcast"}
                </button>
              </div>
            ) : null}
            <video ref={studioRef} style={{ display: isLive ? 'block' : 'none', width:'100%', height:'100%', objectFit:'contain', background: '#050505' }} />
          </div>

          {/* Controls */}
          {isLive && (
            <div className="studio-controls" style={{ background: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="room-chip" onClick={copyRoom} title="Click to copy" style={{ background: 'rgba(201,168,76,0.1)', color: 'var(--gold)', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13, border: '1px solid rgba(201,168,76,0.3)' }}>Room: RM‑7842 📋</div>
              <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)', margin: '0 8px' }}></div>
              <button className="vc-btn vc-active" style={{ background: 'rgba(46,204,113,0.15)', color: 'var(--green)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: 8, padding: '8px 16px', fontWeight: 600 }}>🎤 Mic On</button>
              <button className="vc-btn" style={{ borderRadius: 8, padding: '8px 16px' }}>📷 Cam</button>
              <button className="vc-btn vc-active" style={{ borderRadius: 8, padding: '8px 16px', background: 'rgba(255,255,255,0.1)' }}>🖥 Sharing Screen</button>
              <span style={{ marginLeft:'auto', fontSize:13, color:'var(--silver)', display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: 'var(--gold)' }}>👁</span> {viewers} watching</span>
              <button className="vc-btn vc-danger" onClick={endSession} style={{ background: 'rgba(231,76,60,0.15)', color: 'var(--red)', border: '1px solid rgba(231,76,60,0.4)', borderRadius: 8, padding: '8px 20px', fontWeight: 600, boxShadow: '0 4px 15px rgba(231,76,60,0.2)' }}>⏹ End Stream</button>
            </div>
          )}

          {/* Session Settings */}
          <div className="panel" style={{ borderRadius: 16, border: '1px solid rgba(201,168,76,0.15)', background: 'linear-gradient(180deg, rgba(20,20,20,0.5) 0%, rgba(10,10,10,0.2) 100%)' }}>
            <div className="section-title" style={{ fontSize: 14 }}>Session <em>Configuration</em></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20 }}>
              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--silver)', marginBottom: 8 }}>Topic</label>
                <input className="form-input" style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.1)' }} value={topic} onChange={e => setTopic(e.target.value)} disabled={isLive} />
              </div>
              <div className="form-group">
                <label className="form-label">Target Batch & Phase</label>
                <select className="form-select" value={phase} onChange={e => setPhase(e.target.value)} disabled={isLive}>
                  <optgroup label="Batch A - Jan 2026">
                    {['Phase 3 — Advanced Strategy','Phase 1 — Foundation','Phase 2 — Technical Analysis','Phase 4 — Risk Management','Phase 5 — Execution & Audit'].map(p => <option key={`A_${p}`}>{p}</option>)}
                  </optgroup>
                  <optgroup label="Batch B - Feb 2026">
                    {['Phase 1 — Foundation','Phase 2 — Technical Analysis'].map(p => <option key={`B_${p}`}>{p}</option>)}
                  </optgroup>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Recording</label>
                <select className="form-select" disabled={isLive}><option>Yes — Record Session</option><option>No — Live Only</option></select>
              </div>
            </div>
          </div>
        </div>

        {/* Chat */}
        <ChatPanel
          id="Live Session"
          height={500}
          adminLabel={user?.avatar || 'VTP'}
          initMessages={[{ sender:'System', text:'Session chat ready', sys:true }]}
          socketRef={socketRef}
          sessionId={sessionId}
        />
      </div>
    </div>
  );
}

// PAGE: COURSES — fully interactive with working buttons
function Courses() {
  const [openPhase, setOpenPhase] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [toast, setToast] = useState('');
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const [phases, setPhases] = useState([
    { num:'01', title:'The Foundation', topics:['Forex Basics','Currency Pairs','Pips & Lots','Leverage','Platform Setup','Order Types'], videos:12, pct:'96%', col:'var(--green)' },
    { num:'02', title:'Technical Analysis', topics:['Candlestick Patterns','Support & Resistance','Trendlines & Channels','Price Action','Moving Averages','RSI & MACD'], videos:18, pct:'83%', col:'var(--green)' },
    { num:'03', title:'Advanced Strategy', topics:['Smart Money Concepts','Order Blocks','Institutional Flow','Liquidity Grabs','Break of Structure','ICT Strategies'], videos:22, pct:'61%', col:'var(--gold)' },
    { num:'04', title:'Risk Management', topics:['Position Sizing','Risk-to-Reward Ratios','Trade Psychology','Journal Keeping','Max Drawdown Rules'], videos:15, pct:'42%', col:'var(--gold)' },
    { num:'05', title:'Execution & Audit', topics:['4 Days Live Trading','Entry & Exit Mastery','Real Trade Reviews','Performance Metrics','Certification'], videos:20, pct:'28%', col:'var(--red)' },
  ]);

  const [videoForm, setVideoForm] = useState({ title:'', url:'' });
  const [newTopic, setNewTopic] = useState('');

  const handleUploadVideo = (phaseNum) => {
    if (!videoForm.title.trim()) return showToast('⚠ Please enter a video title');
    setPhases(prev => prev.map(p => p.num === phaseNum ? { ...p, videos: p.videos + 1 } : p));
    showToast(`✅ "${videoForm.title}" uploaded to Phase ${phaseNum}`);
    setVideoForm({ title:'', url:'' });
    setActivePanel(null);
  };

  const handleDeleteTopic = (phaseNum, topic) => {
    setPhases(prev => prev.map(p => p.num === phaseNum ? { ...p, topics: p.topics.filter(t => t !== topic) } : p));
    showToast(`🗑 "${topic}" removed`);
  };

  const handleAddTopic = (phaseNum) => {
    if (!newTopic.trim()) return;
    setPhases(prev => prev.map(p => p.num === phaseNum ? { ...p, topics: [...p.topics, newTopic.trim()] } : p));
    showToast(`✅ "${newTopic.trim()}" added`);
    setNewTopic('');
  };

  return (
    <div>
      <div className="section-title"><span className="section-tag">CONTENT</span> Course <em>Content</em></div>

      {toast && (
        <div style={{ position:'fixed', top:80, right:24, background:'var(--card)', border:'1px solid var(--gold)', borderRadius:10, padding:'12px 20px', fontSize:13, color:'var(--white)', zIndex:9999, boxShadow:'0 8px 32px rgba(0,0,0,0.5)', animation:'fadeIn 0.2s ease' }}>
          {toast}
        </div>
      )}

      {phases.map(p => (
        <div key={p.num} className="panel" style={{ marginBottom: 12 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'var(--gold)', flexShrink:0 }}>{p.num}</div>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:'var(--white)' }}>Phase {p.num} — {p.title}</div>
                <div style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>{p.videos} videos · {p.pct} completed by students</div>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ color:p.col, fontWeight:600, fontSize:13 }}>{p.pct}</span>
              <button className="btn btn-outline btn-sm" onClick={() => { setOpenPhase(openPhase === p.num ? null : p.num); setActivePanel(null); }}>
                {openPhase === p.num ? '✕ Close' : '📂 Manage'}
              </button>
            </div>
          </div>

          {openPhase === p.num && (
            <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid var(--border)' }}>
              {/* Action buttons */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:16 }}>
                <button className={`btn btn-sm ${activePanel==='upload'?'btn-gold':'btn-outline'}`} onClick={() => setActivePanel(activePanel==='upload'?null:'upload')}>📹 Upload Video</button>
                <button className={`btn btn-sm ${activePanel==='editTopics'?'btn-gold':'btn-outline'}`} onClick={() => setActivePanel(activePanel==='editTopics'?null:'editTopics')}>📝 Edit Topics</button>
                <button className={`btn btn-sm ${activePanel==='analytics'?'btn-gold':'btn-outline'}`} onClick={() => setActivePanel(activePanel==='analytics'?null:'analytics')}>📊 View Analytics</button>
              </div>

              {/* ── UPLOAD VIDEO ── */}
              {activePanel === 'upload' && (
                <div style={{ background:'var(--deep)', border:'1px solid var(--border)', borderRadius:10, padding:20, marginBottom:12 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--white)', marginBottom:14 }}>📹 Upload Video — Phase {p.num}</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                    <div>
                      <label className="form-label">Video Title *</label>
                      <input className="form-input" placeholder="e.g., Candlestick Patterns" value={videoForm.title} onChange={e => setVideoForm({...videoForm, title:e.target.value})} />
                    </div>
                    <div>
                      <label className="form-label">Video URL / File</label>
                      <input className="form-input" placeholder="https://youtube.com/..." value={videoForm.url} onChange={e => setVideoForm({...videoForm, url:e.target.value})} />
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:10 }}>
                    <button className="btn btn-gold btn-sm" onClick={() => handleUploadVideo(p.num)}>✅ Upload</button>
                    <button className="btn btn-outline btn-sm" onClick={() => setActivePanel(null)}>Cancel</button>
                  </div>
                </div>
              )}

              {/* ── EDIT TOPICS ── */}
              {activePanel === 'editTopics' && (
                <div style={{ background:'var(--deep)', border:'1px solid var(--border)', borderRadius:10, padding:20, marginBottom:12 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--white)', marginBottom:14 }}>📝 Topics — Phase {p.num}: {p.title}</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
                    {p.topics.map(t => (
                      <div key={t} style={{ background:'rgba(201,168,76,0.06)', border:'1px solid rgba(201,168,76,0.15)', borderRadius:6, padding:'6px 12px', fontSize:12, color:'var(--silver)', display:'flex', alignItems:'center', gap:8 }}>
                        📖 {t}
                        <button onClick={() => handleDeleteTopic(p.num, t)} style={{ background:'none', border:'none', color:'var(--red)', cursor:'pointer', fontSize:14, padding:0, lineHeight:1 }} title="Remove">✕</button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
                    <div style={{ flex:1 }}>
                      <label className="form-label">Add New Topic</label>
                      <input className="form-input" placeholder="e.g., Fibonacci Retracement" value={newTopic} onChange={e => setNewTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTopic(p.num)} />
                    </div>
                    <button className="btn btn-gold btn-sm" onClick={() => handleAddTopic(p.num)} style={{ whiteSpace:'nowrap' }}>+ Add</button>
                  </div>
                </div>
              )}

              {/* ── VIEW ANALYTICS ── */}
              {activePanel === 'analytics' && (
                <div style={{ background:'var(--deep)', border:'1px solid var(--border)', borderRadius:10, padding:20, marginBottom:12 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--white)', marginBottom:14 }}>📊 Analytics — Phase {p.num}: {p.title}</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))', gap:10, marginBottom:16 }}>
                    {[{ label:'Completion', val:p.pct, icon:'✅' }, { label:'Avg. Watch', val:'28 min', icon:'⏱' }, { label:'Quiz Pass', val:'82%', icon:'📝' }].map(s => (
                      <div key={s.label} style={{ background:'var(--card)', borderRadius:8, padding:'12px 14px', border:'1px solid var(--border)' }}>
                        <div style={{ fontSize:16, marginBottom:4 }}>{s.icon}</div>
                        <div style={{ fontSize:18, fontWeight:700, color:'var(--gold)', fontFamily:"'Playfair Display',serif" }}>{s.val}</div>
                        <div style={{ fontSize:8, color:'var(--muted)', textTransform:'uppercase', letterSpacing:2, marginTop:4 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize:11, color:'var(--muted)', marginBottom:8 }}>Topic Completion Rates</div>
                  {p.topics.slice(0,5).map((t, i) => {
                    const w = [95,85,72,58,42][i] || 50;
                    return (
                      <div key={t} style={{ marginBottom:8 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                          <span style={{ color:'var(--silver)' }}>{t}</span>
                          <span style={{ color:w>70?'var(--green)':w>50?'var(--gold)':'var(--red)', fontWeight:600 }}>{w}%</span>
                        </div>
                        <div style={{ background:'var(--border)', borderRadius:4, height:5, overflow:'hidden' }}>
                          <div style={{ width:`${w}%`, height:'100%', background:w>70?'var(--green)':w>50?'var(--gold)':'var(--red)', borderRadius:4, transition:'width 0.5s' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


// PAGE: TRADE AUDIT — Live from MongoDB
function TradeAudit() {
  const [audits, setAudits]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [statusCounts, setStatusCounts] = useState({});

  const fetchAudits = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAudits();
      setAudits(data.audits || []);
      setStatusCounts(data.statusCounts || {});
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAudits(); }, [fetchAudits]);

  const handleReview = async (id, status, feedback) => {
    try {
      const data = await reviewAudit(id, { status, feedback });
      if (data.success) {
        setAudits(prev => prev.map(a => a._id === id ? data.audit : a));
      }
    } catch { alert('Failed to update audit.'); }
  };

  const statusBadge = (s) => s === 'Pending' ? 'badge-open' : s === 'In Review' ? 'badge-pending' : s === 'Approved' ? 'badge-active' : 'badge-open';

  const timeAgo = (date) => {
    const d = new Date(date);
    const diff = Math.floor((Date.now() - d) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff}d ago`;
  };

  // Split into pending and completed
  const pending = audits.filter(a => a.status === 'Pending' || a.status === 'In Review');
  const completed = audits.filter(a => a.status === 'Approved' || a.status === 'Needs Improvement');

  return (
    <div>
      <div className="section-title"><span className="section-tag">REVIEW</span> Trade <em>Audits</em></div>
      <div className="stats-grid">
        <StatCard icon="🔴" val={statusCounts.pending || 0} label="Pending" />
        <StatCard icon="⏳" val={statusCounts.inReview || 0} label="In Review" />
        <StatCard icon="✅" val={statusCounts.approved || 0} label="Approved" />
        <StatCard icon="⚠️" val={statusCounts.needsWork || 0} label="Needs Work" />
      </div>
      {loading ? (
        <div style={{ textAlign:'center', color:'var(--muted)', padding:40, fontSize:13 }}>Loading audits…</div>
      ) : (
        <div className="grid-2">
          <div>
            <div className="section-title">Pending <em>Reviews</em> ({pending.length})</div>
            {pending.length === 0 ? (
              <div className="panel" style={{ textAlign:'center', color:'var(--muted)', padding:30, fontSize:13 }}>No pending audits 🎉</div>
            ) : (
              pending.map(a => (
                <AuditCard key={a._id} audit={a} onReview={handleReview} timeAgo={timeAgo} />
              ))
            )}
          </div>
          <div className="panel">
            <div className="section-title">Audit <em>Queue</em></div>
            <table className="data-table">
              <thead><tr><th>Student</th><th>Pair</th><th>Submitted</th><th>Status</th></tr></thead>
              <tbody>
                {audits.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign:'center', color:'var(--muted)', padding:20 }}>No submissions yet.</td></tr>
                ) : (
                  audits.map(a => (
                    <tr key={a._id}>
                      <td>{a.user?.name || 'Unknown'}</td>
                      <td>{a.pair}</td>
                      <td>{timeAgo(a.createdAt)}</td>
                      <td><span className={`badge ${statusBadge(a.status)}`}>{a.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Individual audit card with review actions
function AuditCard({ audit: a, onReview, timeAgo }) {
  const [feedback, setFeedback] = useState('');

  return (
    <div className="audit-card">
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'var(--white)' }}>{a.user?.name || 'Unknown'} — {a.pair} {a.direction}</div>
        <span className={`badge ${a.status === 'Pending' ? 'badge-open' : 'badge-pending'}`}>{a.status}</span>
      </div>
      <div className="audit-img">📊</div>
      <div style={{ fontSize:11, color:'var(--muted)', marginBottom:8 }}>
        Entry: {a.entryPrice} · SL: {a.stopLoss || '—'} · TP: {a.takeProfit || '—'} · Result: {a.result || '—'} · Submitted: {timeAgo(a.createdAt)}
      </div>
      {a.analysis && <div style={{ fontSize:12, color:'var(--silver)', marginBottom:12 }}>"{a.analysis}"</div>}
      <textarea className="form-textarea" placeholder="Your audit comments..." value={feedback} onChange={e => setFeedback(e.target.value)} />
      <div style={{ display:'flex', gap:8, marginTop:10 }}>
        <button className="btn btn-green btn-sm" onClick={() => onReview(a._id, 'Approved', feedback)}>✅ Approve Trade</button>
        <button className="btn btn-red btn-sm" onClick={() => onReview(a._id, 'Needs Improvement', feedback)}>⚠️ Needs Improvement</button>
        {a.status === 'Pending' && <button className="btn btn-outline btn-sm" onClick={() => onReview(a._id, 'In Review', '')}>📋 Mark In Review</button>}
      </div>
    </div>
  );
}

// PAGE: ANNOUNCEMENTS — Live from MongoDB
function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [title, setTitle]     = useState('');
  const [body, setBody]       = useState('');
  const [target, setTarget]   = useState('all');
  const [posting, setPosting] = useState(false);
  const [postMsg, setPostMsg] = useState('');

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAnnouncements();
      setAnnouncements(data.announcements || []);
    } catch {
      setError('Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const handlePost = async () => {
    if (!title.trim() || !body.trim()) return;
    setPosting(true);
    setPostMsg('');
    try {
      const visibleTo = target === 'all' ? ['all'] : [target];
      const data = await createAnnouncement({ title, body, visibleTo });
      if (data.success) {
        setAnnouncements(prev => [data.announcement, ...prev]);
        setTitle('');
        setBody('');
        setPostMsg('✅ Announcement sent!');
        setTimeout(() => setPostMsg(''), 3000);
      }
    } catch {
      setPostMsg('❌ Failed to create announcement.');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a._id !== id));
    } catch {
      alert('Failed to delete announcement.');
    }
  };

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
      <div className="section-title"><span className="section-tag">BROADCAST</span> <em>Announcements</em></div>
      <div className="grid-2">
        <div className="panel">
          <div className="section-title">New <em>Announcement</em></div>
          <div className="form-group"><label className="form-label">Title</label><input className="form-input" placeholder="Announcement title..." value={title} onChange={e => setTitle(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Message</label><textarea className="form-textarea" placeholder="Your announcement..." style={{ minHeight:100 }} value={body} onChange={e => setBody(e.target.value)} /></div>
          <div className="form-group">
            <label className="form-label">Send To</label>
            <select className="form-select" value={target} onChange={e => setTarget(e.target.value)}>
              <option value="all">All Users</option>
              <option value="user">Students Only</option>
              <option value="admin">Admins Only</option>
            </select>
          </div>
          <div style={{ display:'flex', gap:10, alignItems: 'center' }}>
            <button className="btn btn-gold" onClick={handlePost} disabled={posting}>{posting ? 'Sending…' : '📣 Send'}</button>
            {postMsg && <span style={{ fontSize: 12, color: postMsg.startsWith('✅') ? 'var(--green)' : 'var(--red)' }}>{postMsg}</span>}
          </div>
        </div>
        <div className="panel">
          <div className="section-title">Recent <em>Announcements</em> <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400, marginLeft: 8 }}>({announcements.length})</span></div>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 20, fontSize: 12 }}>Loading…</div>
          ) : error ? (
            <div style={{ color: 'var(--red)', fontSize: 12 }}>{error}</div>
          ) : announcements.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 20, fontSize: 12 }}>No announcements yet.</div>
          ) : (
            announcements.map(a => (
              <div key={a._id} style={{ background:'var(--card2)', border:'1px solid var(--border)', borderRadius:8, padding:14, marginBottom:10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'var(--white)', marginBottom:4 }}>{a.title}</div>
                  <button className="btn btn-outline btn-sm" style={{ color:'var(--red)', borderColor:'rgba(231,76,60,0.3)', fontSize:10, padding:'2px 8px' }} onClick={() => handleDelete(a._id)}>✕</button>
                </div>
                <div style={{ fontSize:11, color:'var(--muted)', marginBottom:6 }}>
                  {a.postedBy?.name || 'Unknown'} · {timeAgo(a.createdAt)} · Visible to: {a.visibleTo?.join(', ')}
                </div>
                <div style={{ fontSize:12, color:'var(--silver)' }}>{a.body}</div>
              </div>
            ))
          )}
        </div>
      </div>
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
      if (!activePartner && data.conversations?.length > 0) {
        setActivePartner(data.conversations[0].partner);
      }
    } catch { /* ignore */ }
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
    } catch { /* ignore */ }
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
        const convData = await getConversations();
        setConversations(convData.conversations || []);
      } catch { /* ignore */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [activePartner?._id]);

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
    } catch { /* ignore */ }
    finally { setSending(false); }
  };

  const selectPartner = (partner) => {
    setActivePartner(partner);
    setMsgs([]);
  };

  return (
    <div>
      <div className="section-title"><span className="section-tag">INBOX</span> Student <em>Messages</em></div>
      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:20, height:500 }}>
        <div className="panel" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)' }}>Conversations</div>
          <div style={{ overflowY:'auto', height:'calc(100% - 44px)' }}>
            {loadingConvos ? (
              <div style={{ padding:20, textAlign:'center', color:'var(--muted)', fontSize:12 }}>Loading…</div>
            ) : conversations.length === 0 ? (
              <div style={{ padding:20, textAlign:'center', color:'var(--muted)', fontSize:12 }}>No student messages yet.</div>
            ) : (
              conversations.map(c => (
                <div key={c.partner._id} onClick={() => selectPartner(c.partner)} style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', cursor:'pointer', background: activePartner?._id === c.partner._id ? 'rgba(201,168,76,0.05)' : '' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div className="avatar avatar-sm">{c.partner.avatar || c.partner.name?.slice(0,2).toUpperCase()}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:'var(--white)' }}>{c.partner.name}</div>
                      <div style={{ fontSize:10, color:'var(--muted)' }}>{c.lastMessage?.text?.slice(0, 30) || 'No messages yet'}{c.lastMessage?.text?.length > 30 ? '…' : ''}</div>
                    </div>
                    {c.unread > 0 && <span className="nav-badge">{c.unread}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="chat-panel" style={{ height:500 }}>
          <div className="chat-header">💬 {activePartner ? activePartner.name : 'Select a student'}</div>
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
            <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key==='Enter'&&send()} placeholder={activePartner ? `Reply to ${activePartner.name}...` : 'Select a student first...'} disabled={!activePartner} />
            <button onClick={send} disabled={!activePartner || sending}>{sending ? '…' : 'Send'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { divider: true, label: 'Main' },
  { id:'overview',  icon:'📊', label:'Overview' },
  { id:'students',  icon:'👥', label:'My Students' },
  { divider: true, label: 'Teaching' },
  { id:'live',      icon:'📹', label:'Host Live Session' },
  { id:'courses',   icon:'📚', label:'Course Content' },
  { id:'audit',     icon:'📝', label:'Trade Audits' },
  { divider: true, label: 'Communication' },
  { id:'announce',  icon:'📣', label:'Announcements' },
  { id:'messages',  icon:'💬', label:'Student Messages' },
];

export default function AdminDashboard() {
  const { user }   = useAuth();
  const [active, setActive] = useState('overview');
  const [isLive, setIsLive] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const goLive = () => setActive('live');

  const PAGE = {
    overview: <Overview onGoLive={goLive} />,
    students: <Students />,
    live:     <LiveSession user={user} />,
    courses:  <Courses />,
    audit:    <TradeAudit />,
    announce: <Announcements />,
    messages: <Messages user={user} />,
  };

  return (
    <div className="app-layout">
      <Sidebar role="admin" activeItem={active} onNav={setActive} items={NAV_ITEMS} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="main-content">
        <Topbar title="Instructor" subtitle="Dashboard" onMenuToggle={() => setMobileOpen(true)} onViewNotifications={() => setActive('announce')} extras={
          isLive ? <div className="live-badge"><div className="live-dot"></div>LIVE</div> : null
        }/>
        <div className="page-content">
          {PAGE[active]}
        </div>
      </div>
    </div>
  );
}
