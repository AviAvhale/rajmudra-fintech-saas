import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoBase64 } from '../assets/logo';
import { registerApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate  = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', city: '', password: '', batch: 'Demo - Free Plan'
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await registerApi(formData);
      if (data.success) {
        // Server set HTTP-only cookie — no need to store token manually
        // Refresh auth state by calling login context with returned user
        // We use getMeApi indirectly; just set user from response
        window.location.href = '/user'; // Hard redirect to force session refresh
      }
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.errors?.[0]?.msg
        || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--black)' }}>
      
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <Link to="/">
          <img src={logoBase64} alt="Rajmudra Fintech" style={{ width: '220px', filter: 'drop-shadow(0 0 10px rgba(201,168,76,0.4))' }} />
        </Link>
      </div>

      <div className="panel" style={{ width: '100%', maxWidth: '440px', padding: '32px' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: '700', color: 'var(--white)', marginBottom: '8px', textAlign: 'center' }}>
          Create an <em>Account</em>
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--silver)', textAlign: 'center', marginBottom: '24px' }}>
          Start your journey towards institutional trading.
        </p>

        {/* Social Login Options */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button style={{ flex: 1, padding: '10px', background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: '8px', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" color="#e74c3c"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 15.933 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.187 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
            Google
          </button>
          <button style={{ flex: 1, padding: '10px', background: 'rgba(100,149,237,0.1)', border: '1px solid rgba(100,149,237,0.3)', borderRadius: '8px', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" color="#6495ed"><path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24h11.495v-9.294H9.688v-3.622h3.132V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.325V1.325C24 .597 23.403 0 22.675 0z"/></svg>
            Facebook
          </button>
        </div>
        <button style={{ width: '100%', padding: '10px', background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: '8px', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', marginBottom: '24px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" color="#2ecc71"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
          Continue with WhatsApp
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>or register with email</div>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        </div>

        {error && (
          <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: '#e74c3c', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="grid-2" style={{ marginBottom: '0', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">Full Name</label>
              <input type="text" name="name" className="form-input" placeholder="Raj Patil" required onChange={handleChange} disabled={loading} />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">Phone</label>
              <input type="tel" name="phone" className="form-input" placeholder="+91 99999 99999" required onChange={handleChange} disabled={loading} />
            </div>
          </div>
          
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-input" placeholder="raj@example.com" required onChange={handleChange} disabled={loading} />
          </div>

          <div className="grid-2" style={{ marginBottom: '0', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">City</label>
              <input type="text" name="city" className="form-input" placeholder="Pune" required onChange={handleChange} disabled={loading} />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">Select Plan</label>
              <select name="batch" className="form-select" onChange={handleChange} disabled={loading} value={formData.batch}>
                <option value="Demo - Free Plan">Demo - Free Plan</option>
                <option value="Batch A - Jan 2026">Batch A - Jan 2026</option>
                <option value="Batch B - Feb 2026">Batch B - Feb 2026</option>
                <option value="Batch C - Mar 2026">Batch C - Mar 2026</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password <span style={{ color: 'var(--muted)', fontWeight: '400' }}>(min. 8 characters)</span></label>
            <input type="password" name="password" className="form-input" placeholder="••••••••" required minLength={8} onChange={handleChange} disabled={loading} />
          </div>

          <button type="submit" className="btn btn-gold btn-lg" style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: 'var(--silver)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: '600' }}>Sign In here</Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;
