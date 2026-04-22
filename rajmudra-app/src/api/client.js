import axios from 'axios';

// ─── Axios instance ────────────────────────────────────────────────────────────
// Base URL points to backend. Uses the current hostname so it works on LAN too.
const API_HOST = window.location.hostname; // 'localhost' or '10.x.x.x'
const client = axios.create({
  baseURL: `http://${API_HOST}:5000`,
  withCredentials: true,   // Send HTTP-only cookies automatically
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor — attach Bearer token (fallback for LAN/HTTP) ────────
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('rm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — handle 401 globally ───────────────────────────────
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    // Skip redirect for /api/auth/me — this is the session check on app load
    // and is expected to return 401 when the user is not logged in.
    const isSessionCheck = url.includes('/api/auth/me');

    if (error.response?.status === 401 && !isSessionCheck) {
      // Session expired mid-use — clear token and redirect to login
      localStorage.removeItem('rm_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
