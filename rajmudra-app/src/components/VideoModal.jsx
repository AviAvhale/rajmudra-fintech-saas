import React, { useState, useEffect, useRef } from 'react';

export default function VideoModal({ title, type, sessionId, onClose, senderLabel = 'SA' }) {
  const [stream, setStream]         = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted]       = useState(true);
  const [isCamOn, setIsCamOn]       = useState(false);
  const [isSharing, setIsSharing]   = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [messages, setMessages]     = useState([
    { sender: 'System', text: `Session "${title}" opened`, sys: true },
  ]);
  const [chatInput, setChatInput]   = useState('');
  const remoteRef = useRef(null);
  const localRef  = useRef(null);
  const msgsRef   = useRef(null);
  const socketRef = useRef(null);
  const pcRef     = useRef(null);

  // ─── WebRTC Watcher: Connect to broadcaster's stream ─────────────────
  useEffect(() => {
    if (type === 'observer' && sessionId) {
      let cancelled = false;

      (async () => {
        const { io } = await import('socket.io-client');
        if (cancelled) return;

        const socket = io(`http://${window.location.hostname}:5000`);
        socketRef.current = socket;

        addMsg('System', 'Connecting to live stream...', true);

        socket.on('connect', () => {
          console.log('👁 Watcher socket connected');
          socket.emit('watcher', sessionId);
        });

        // Receive offer from broadcaster
        socket.on('offer', (broadcasterId, description) => {
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
          pcRef.current = pc;

          // When we receive the remote stream, play it
          pc.ontrack = (event) => {
            if (remoteRef.current && event.streams[0]) {
              remoteRef.current.srcObject = event.streams[0];
              // Mobile browsers require muted for autoplay — set it programmatically
              remoteRef.current.muted = true;
              const playPromise = remoteRef.current.play();
              if (playPromise) {
                playPromise
                  .then(() => {
                    // Autoplay started — unmute after a short delay for user experience
                    setTimeout(() => { if (remoteRef.current) remoteRef.current.muted = false; }, 500);
                  })
                  .catch(() => {
                    // Autoplay blocked — leave muted, add a tap-to-unmute hint
                    console.log('Autoplay blocked, video is muted');
                  });
              }
              setIsSharing(true);
              setConnectionStatus('Connected');
              addMsg('System', 'Connected to live stream ✓', true);
            }
          };

          // Send ICE candidates to broadcaster
          pc.onicecandidate = (e) => {
            if (e.candidate) socket.emit('candidate', broadcasterId, e.candidate);
          };

          pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
              setConnectionStatus('Disconnected');
              setIsSharing(false);
              addMsg('System', 'Stream disconnected', true);
            }
          };

          // Set remote description (the offer) and create answer
          pc.setRemoteDescription(description)
            .then(() => pc.createAnswer())
            .then(sdp => pc.setLocalDescription(sdp))
            .then(() => socket.emit('answer', broadcasterId, pc.localDescription));
        });

        // Receive ICE candidate from broadcaster
        socket.on('candidate', (_id, candidate) => {
          pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
        });

        // Broadcaster disconnected
        socket.on('broadcaster-disconnected', () => {
          setIsSharing(false);
          setConnectionStatus('Ended');
          addMsg('System', 'Instructor ended the broadcast', true);
        });

        socket.on('no-broadcaster', () => {
          setConnectionStatus('No broadcaster');
          addMsg('System', 'Waiting for instructor to start broadcasting...', true);
        });

        // ─── Live Chat: receive messages from others in the room ────
        socket.on('chat-message', (message) => {
          addMsg(message.sender, message.text);
        });
      })();

      return () => {
        cancelled = true;
        pcRef.current?.close();
        socketRef.current?.disconnect();
      };
    }
  }, [type, sessionId]);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages]);

  const addMsg = (sender, text, sys = false) => setMessages(prev => [...prev, { sender, text, sys }]);

  const startScreenShare = async () => {
    try {
      const s = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      setStream(s);
      if (remoteRef.current) { remoteRef.current.srcObject = s; remoteRef.current.play(); }
      setIsSharing(true);
      addMsg('System', 'Screen share started', true);
      s.getVideoTracks()[0].onended = () => { setIsSharing(false); setStream(null); addMsg('System', 'Screen share stopped', true); };
    } catch { addMsg('System', 'Screen share cancelled', true); }
  };

  const toggleCam = async () => {
    if (!isCamOn) {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(s);
        if (localRef.current) { localRef.current.srcObject = s; localRef.current.play(); }
        setIsCamOn(true);
      } catch { /* denied */ }
    } else {
      localStream?.getTracks().forEach(t => t.stop());
      setLocalStream(null); setIsCamOn(false);
    }
  };

  const handleClose = () => {
    stream?.getTracks().forEach(t => t.stop());
    localStream?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
    socketRef.current?.disconnect();
    onClose();
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    addMsg(`You (${senderLabel})`, text);
    setChatInput('');
    // Send via socket to all others in the session room
    if (socketRef.current && sessionId) {
      socketRef.current.emit('chat-message', sessionId, { sender: senderLabel, text });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 1100 }}>
        <div className="modal-header">
          <div>
            <h3>Video <em>{type === 'support' ? 'Support Call' : 'Session Observer'}</em></h3>
            <div style={{ fontSize:11, color:'var(--muted)', marginTop:4 }}>{type === 'support' ? `${senderLabel} · Encrypted Support Call` : 'Observer Mode · Live Session'} — {title}</div>
          </div>
          <button className="close-btn" onClick={handleClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="video-layout" style={{ height: 500 }}>
            {/* Remote / shared screen */}
            <div className="video-remote" style={{ position: 'relative', overflow: 'hidden' }}>
              {!isSharing ? (
                <div className="v-placeholder" style={{ background: 'linear-gradient(135deg, rgba(20,20,20,1) 0%, rgba(30,30,30,1) 100%)' }}>
                  <div className="vp-icon" style={{ animation: 'pulse 2s infinite' }}>📹</div>
                  <p style={{ color: 'var(--silver)' }}>
                    {type === 'support' ? 'Click "Share Screen" to start helping'
                     : connectionStatus === 'Ended' ? 'The instructor has ended this broadcast.'
                     : connectionStatus === 'No broadcaster' ? 'Waiting for instructor to start broadcasting...'
                     : 'Connecting to instructor\'s live stream...'}
                  </p>
                  {type === 'support' && (
                    <button className="btn btn-gold" onClick={startScreenShare}>🖥 Share / View Screen</button>
                  )}
                </div>
              ) : null}
              
              {/* The actual WebRTC video element — always present, hidden when not sharing */}
              <video ref={remoteRef} autoPlay playsInline muted style={{ display: isSharing ? 'block' : 'none', width:'100%', height:'100%', objectFit:'contain', background: '#000' }} />
              
              {isSharing && type === 'observer' && (
                 <div style={{ position:'absolute', top:12, left:12, background:'rgba(0,0,0,0.7)', padding:'6px 12px', borderRadius:20, fontSize:11, color:'var(--white)', fontWeight:600, display:'flex', alignItems:'center', gap:8, border:'1px solid rgba(255,255,255,0.1)', backdropFilter:'blur(4px)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                   <div style={{ width: 8, height: 8, background: 'var(--red)', borderRadius: '50%', boxShadow: '0 0 8px var(--red)', animation: 'pulse 1.5s infinite' }}></div>
                   LIVE · Instructor Screen
                 </div>
              )}
            </div>
            
            {/* Sidebar: local cam + chat */}
            <div className="video-side">
              <div className="video-local" style={{ minHeight: isCamOn ? '180px' : '80px', background: 'rgba(10,10,10,0.8)' }}>
                {!isCamOn
                  ? <div style={{ color:'var(--muted)', textAlign:'center', fontSize:12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}><div style={{ fontSize:20, marginBottom: 4, opacity: 0.5 }}>🎤</div>Cam Off</div>
                  : <video ref={localRef} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius: 'inherit' }} muted />
                }
              </div>
              <div className="chat-panel" style={{ flex:1, border: 'none', background: 'rgba(20,20,20,0.9)', display: 'flex', flexDirection: 'column' }}>
                <div className="chat-header" style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>💬 Live Chat</span>
                  <span style={{ fontSize: '10px', color: connectionStatus === 'Connected' ? 'var(--green)' : 'var(--muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 10 }}>● {connectionStatus}</span>
                </div>
                <div className="chat-msgs" ref={msgsRef} style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
                  {messages.map((m, i) => (
                    <div key={i} style={{ marginBottom: '10px', fontSize: '12px', lineHeight: '1.4' }}>
                      <span style={{ fontWeight: 600, color: m.sender.startsWith('You') ? 'var(--gold)' : m.sys ? 'var(--muted)' : 'var(--blue)', display: 'block', marginBottom: '2px' }}>{m.sender}</span>
                      <span style={{ color: m.sys ? 'var(--muted)' : 'var(--silver)' }}>{m.text}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.3)', display: 'flex', gap: '8px' }}>
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Say something..." style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', outline: 'none' }} />
                  <button onClick={sendChat} style={{ background: 'var(--gold)', color: 'black', border: 'none', borderRadius: '6px', padding: '0 16px', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}>Send</button>
                </div>
              </div>
            </div>
          </div>

          {/* Controls — only for support type, not observer */}
          {type !== 'observer' && (
            <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:14, flexWrap:'wrap', padding: '12px', background: 'rgba(20,20,20,0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <button className={`vc-btn${!isMuted ? ' vc-active' : ''}`} onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? '🔇 Unmute' : '🎤 Muted'}
              </button>
              <button className={`vc-btn${isCamOn ? ' vc-active' : ''}`} onClick={toggleCam}>
                {isCamOn ? '📷 Cam On' : '📷 Cam Off'}
              </button>
              <button className={`vc-btn${isSharing ? ' vc-active' : ''}`} onClick={startScreenShare}>
                {isSharing ? '🖥 Sharing...' : '🖥 Share Screen'}
              </button>
              <button className="vc-btn">⏺ Record</button>
              <span className="status-pill" style={{ marginLeft: 'auto' }}>● Connected</span>
              <button className="vc-btn vc-danger" onClick={handleClose}>📵 End Call</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
