import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoBase64 } from '../assets/logo';

const LoginPage = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      const roleRoutes = { superadmin: '/superadmin', admin: '/admin', user: '/user' };
      navigate(roleRoutes[result.user.role] || '/user');
    } else {
      setError(result.message || 'Invalid email or password.');
    }
  };

  const handleSocialLogin = async (provider) => {
    setError('');
    setLoading(true);
    
    // Simulate OAuth delay for UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock social login -> acts as demo user for demonstration purposes
    const result = await login('trader@example.com', 'user12345');
    setLoading(false);

    if (result.success) {
      const roleRoutes = { superadmin: '/superadmin', admin: '/admin', user: '/user' };
      navigate(roleRoutes[result.user.role] || '/user');
    } else {
      setError(`Failed to connect to ${provider} API.`);
    }
  };

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--black)' }}>
      
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <Link to="/">
          <img src={logoBase64} alt="Rajmudra Fintech" style={{ width: '220px', filter: 'drop-shadow(0 0 10px rgba(201,168,76,0.4))' }} />
        </Link>
      </div>

      <div className="panel" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: '700', color: 'var(--white)', marginBottom: '8px', textAlign: 'center' }}>
          Welcome <em>Back</em>
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--silver)', textAlign: 'center', marginBottom: '24px' }}>
          Sign in to your dashboard to continue.
        </p>

        {/* Social Login Options */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button type="button" onClick={() => handleSocialLogin('Google')} disabled={loading} style={{ flex: 1, padding: '10px', background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: '8px', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: loading ? 'wait' : 'pointer', fontSize: '12px', fontWeight: '600', opacity: loading ? 0.7 : 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" color="#e74c3c"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 15.933 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.187 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
            Google
          </button>
          <button type="button" onClick={() => handleSocialLogin('Facebook')} disabled={loading} style={{ flex: 1, padding: '10px', background: 'rgba(100,149,237,0.1)', border: '1px solid rgba(100,149,237,0.3)', borderRadius: '8px', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: loading ? 'wait' : 'pointer', fontSize: '12px', fontWeight: '600', opacity: loading ? 0.7 : 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" color="#6495ed"><path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24h11.495v-9.294H9.688v-3.622h3.132V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.325V1.325C24 .597 23.403 0 22.675 0z"/></svg>
            Facebook
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>or sign in with email</div>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        </div>

        {error && (
          <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: '#e74c3c', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Password</span>
              <a href="#" style={{ color: 'var(--silver)', textTransform: 'none', letterSpacing: '0' }}>Forgot?</a>
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-gold btn-lg"
            style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: 'var(--silver)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: '600' }}>Register here</Link>
        </p>

        {/* DEMO ACCOUNTS HELPER */}
        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px dashed rgba(201,168,76,0.2)' }}>
          <p style={{ fontSize: '10px', color: 'var(--muted)', textAlign: 'center', marginBottom: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Demo Accounts (Click to fill)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button type="button" onClick={() => fillDemo('superadmin@rajmudra.com', 'admin123')} style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: 'var(--gold)', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', textAlign: 'center' }}>
              <strong>SuperAdmin:</strong> superadmin@rajmudra.com / admin123
            </button>
            <button type="button" onClick={() => fillDemo('vishal@rajmudra.com', 'admin123')} style={{ background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.3)', color: 'var(--green)', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', textAlign: 'center' }}>
              <strong>Admin/Mentor:</strong> vishal@rajmudra.com / admin123
            </button>
            <button type="button" onClick={() => fillDemo('trader@example.com', 'user12345')} style={{ background: 'rgba(100,149,237,0.1)', border: '1px solid rgba(100,149,237,0.3)', color: 'var(--blue)', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', textAlign: 'center' }}>
              <strong>User/Trader:</strong> trader@example.com / user12345
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
