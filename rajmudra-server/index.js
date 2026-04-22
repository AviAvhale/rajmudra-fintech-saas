require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server: SocketIOServer } = require('socket.io');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { sanitizeMongo, sanitizeXSS } = require('./middleware/sanitize');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();
const server = http.createServer(app);

// ─── Socket.io — WebRTC Signaling Server ──────────────────────────────────────
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',  // Allow LAN connections
    methods: ['GET', 'POST'],
  },
});

// Track broadcasters: sessionId → socket.id
const broadcasters = {};

io.on('connection', (socket) => {
  // Instructor starts broadcasting
  socket.on('broadcaster', (sessionId) => {
    broadcasters[sessionId] = socket.id;
    socket.join(sessionId);
    console.log(`📡 Broadcaster registered for session ${sessionId}`);
  });

  // Student wants to watch
  socket.on('watcher', (sessionId) => {
    const broadcasterId = broadcasters[sessionId];
    if (broadcasterId) {
      // Tell the broadcaster a new watcher joined
      io.to(broadcasterId).emit('watcher', socket.id);
      socket.join(sessionId);
      console.log(`👁 Watcher ${socket.id} joined session ${sessionId}`);
    } else {
      socket.emit('no-broadcaster');
    }
  });

  // Relay WebRTC offer from broadcaster to watcher
  socket.on('offer', (watcherId, description) => {
    io.to(watcherId).emit('offer', socket.id, description);
  });

  // Relay WebRTC answer from watcher to broadcaster
  socket.on('answer', (broadcasterId, description) => {
    io.to(broadcasterId).emit('answer', socket.id, description);
  });

  // Relay ICE candidate
  socket.on('candidate', (targetId, candidate) => {
    io.to(targetId).emit('candidate', socket.id, candidate);
  });

  // ─── Live Chat: relay messages to everyone in the session room ────
  socket.on('chat-message', (sessionId, message) => {
    // Broadcast to all OTHER sockets in the room (not the sender)
    socket.to(sessionId).emit('chat-message', message);
  });

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    // Remove from broadcasters map if this socket was a broadcaster
    for (const [sessionId, sockId] of Object.entries(broadcasters)) {
      if (sockId === socket.id) {
        delete broadcasters[sessionId];
        // Notify all watchers in room
        socket.to(sessionId).emit('broadcaster-disconnected');
        console.log(`📡 Broadcaster disconnected from session ${sessionId}`);
        break;
      }
    }
  });
});

// ─── Security Middleware (applied before all routes) ──────────────────────────

// 1. HTTP Security Headers (Content-Security-Policy, X-Frame-Options, etc.)
app.use(helmet());

// 2. CORS — allow requests from localhost and LAN devices
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.) + any origin on LAN
      callback(null, true);
    },
    credentials: true, // Allow cookies to be sent cross-origin
  })
);

// 3. Body parser with size limit (prevent large payload attacks)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. Cookie parser (for HTTP-only JWT cookies)
app.use(cookieParser());

// 5. MongoDB injection sanitization (strips $ and . operators)
app.use(sanitizeMongo);

// 6. XSS sanitization on all request bodies
app.use(sanitizeXSS);

// 7. General API rate limit
app.use('/api', apiLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/journal', require('./routes/journal'));
app.use('/api/audits', require('./routes/audits'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/livesessions', require('./routes/livesessions'));
app.use('/api/analysis', require('./routes/analysis'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Rajmudra API is running.', timestamp: new Date().toISOString() });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'An error occurred.' : err.message,
  });
});

// ─── Database + Server Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Rajmudra API running on http://0.0.0.0:${PORT}`);
      console.log(`🌐 LAN: http://10.164.211.18:${PORT}`);
      console.log(`📡 WebRTC Signaling: Socket.io ✓`);
      console.log(`🔐 Security: Helmet ✓ | CORS ✓ | Rate Limit ✓ | Sanitization ✓`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
