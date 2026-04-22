import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function PricingPlans() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Cashfree integration placeholder logic
  const handlePurchase = async (plan) => {
    setLoading(true);
    try {
      // PROD: API Call to initiate Cashfree Session
      // const response = await fetch('/api/create-order', { method: 'POST', body: JSON.stringify({ planId: plan.id }) });
      // const data = await response.json();
      // const cashfree = await load({ mode: "sandbox" });
      // cashfree.checkout({ paymentSessionId: data.paymentSessionId, redirectTarget: "_self" });

      // SIMULATE PAYMENT DELAY
      await new Promise(r => setTimeout(r, 1500));
      
      // Update session logic for UI demo
      login({ ...user, hasPaid: true, batch: plan.batch || user?.batch });
      alert(`Payment for ${plan.title} successful via Cashfree Sandbox!`);
      // User is now verified and has paid, reload dashboard view
      navigate('/user', { replace: true });
    } catch (err) {
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="section-title"><span className="section-tag">ENROLL</span> Select Your <em>Plan</em></div>
      <p style={{ color:'var(--silver)', marginBottom: '32px' }}>Choose the programme that fits your goals. Limited seats available for live batches.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Core Programme */}
        <div style={{ background: 'var(--card)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '16px', padding: '40px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700' }}>Self Paced</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', color: 'var(--white)', marginBottom: '16px' }}>Foundation to Advanced</h3>
          <div style={{ fontSize: '32px', color: 'var(--white)', fontWeight: '700', marginBottom: '8px' }}>₹14,999</div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '24px' }}>Full access to recorded lectures & materials without live 4-day trading sessions.</p>
          
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            <li style={{ fontSize: '13px', color: 'var(--silver)', display: 'flex', gap: '8px' }}><span style={{ color: 'var(--gold)' }}>✓</span> Phases 1 to 4</li>
            <li style={{ fontSize: '13px', color: 'var(--silver)', display: 'flex', gap: '8px' }}><span style={{ color: 'var(--gold)' }}>✓</span> Recorded Videos</li>
            <li style={{ fontSize: '13px', color: 'var(--silver)', display: 'flex', gap: '8px' }}><span style={{ color: 'var(--gold)' }}>✓</span> Study Materials</li>
            <li style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px', textDecoration: 'line-through' }}><span style={{ color: 'var(--border)' }}>✕</span> Live 4-Day Execution</li>
            <li style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px', textDecoration: 'line-through' }}><span style={{ color: 'var(--border)' }}>✕</span> Instructor Trade Audits</li>
          </ul>

          <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => handlePurchase({ id: 'base', title: 'Foundation to Advanced' })} disabled={loading}>
            {loading ? 'Processing...' : 'Enroll Now'}
          </button>
        </div>

        {/* Pro Programme */}
        <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.1) 0%, rgba(201,168,76,0.02) 100%)', border: '1.5px solid var(--gold)', borderRadius: '16px', padding: '40px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '16px', right: '-32px', background: 'var(--gold)', color: 'var(--black)', fontSize: '10px', fontWeight: '700', padding: '6px 40px', transform: 'rotate(45deg)', textTransform: 'uppercase', letterSpacing: '1px' }}>Recommended</div>
          <div style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700' }}>Mentorship</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', color: 'var(--white)', marginBottom: '16px' }}>Professional Masterclass</h3>
          <div style={{ fontSize: '32px', color: 'var(--white)', fontWeight: '700', marginBottom: '8px' }}>₹29,999</div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '24px' }}>The complete experience, structured to mold you into an institutional trader.</p>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            <li style={{ fontSize: '13px', color: 'var(--silver)', display: 'flex', gap: '8px' }}><span style={{ color: 'var(--green)' }}>✓</span> Phases 1 to 5</li>
            <li style={{ fontSize: '13px', color: 'var(--silver)', display: 'flex', gap: '8px' }}><span style={{ color: 'var(--green)' }}>✓</span> Live Classes & Recorded Videos</li>
            <li style={{ fontSize: '13px', color: 'var(--silver)', display: 'flex', gap: '8px' }}><span style={{ color: 'var(--green)' }}>✓</span> Study Materials</li>
            <li style={{ fontSize: '13px', color: 'var(--silver)', display: 'flex', gap: '8px' }}><span style={{ color: 'var(--green)' }}>✓</span> <strong>Live 4-Day Execution</strong></li>
            <li style={{ fontSize: '13px', color: 'var(--silver)', display: 'flex', gap: '8px' }}><span style={{ color: 'var(--green)' }}>✓</span> <strong>Instructor Trade Audits</strong></li>
          </ul>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Select Upcoming Batch</label>
            <select className="form-select" style={{ width: '100%', marginBottom: '16px' }}>
              <option>Batch A - starts April 15</option>
              <option>Batch B - starts May 1</option>
            </select>
          </div>

          <button className="btn btn-gold" style={{ width: '100%', border: 'none' }} onClick={() => handlePurchase({ id: 'pro', title: 'Professional Masterclass' })} disabled={loading}>
            {loading ? 'Processing...' : 'Enroll via Cashfree'}
          </button>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--muted)' }}>🔒 Secured by Cashfree Payments</span>
          </div>
        </div>
      </div>
    </div>
  );
}
