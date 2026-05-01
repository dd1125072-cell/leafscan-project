import React, { useState } from 'react';
import { calcPasswordStrength, PW_STRENGTH_LABELS, PW_STRENGTH_COLORS } from '../utils/data';
import { PasswordStrength } from '../components/UI';
import { apiRegister } from '../utils/api';
import './AuthPages.css';

export default function RegisterPage({ goLogin, onLogin, showToast }) {
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [pw,      setPw]      = useState('');
  const [confirm, setConfirm] = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const pwStrength = calcPasswordStrength(pw);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (pw.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (pw !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const user = await apiRegister({ name, email, password: pw });
      onLogin(user);
      showToast(`Account created! Welcome, ${user.name} 🌱`);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-container animate-fade-up">
        <div className="page-hero">
          <div className="page-hero-icon" style={{ background: '#dceeca' }}>🌱</div>
          <h1 className="page-title">Join LeafScan</h1>
          <p className="page-sub">Create your free account and start diagnosing</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <input id="reg-name" className="form-input" type="text" placeholder="Ravi Kumar"
                value={name} onChange={e => { setName(e.target.value); setError(''); }}
                required autoComplete="name" />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input id="reg-email" className="form-input" type="email" placeholder="ravi@example.com"
                value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                required autoComplete="email" />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-pw">Password</label>
              <input id="reg-pw" className="form-input" type="password" placeholder="Minimum 6 characters"
                value={pw} onChange={e => { setPw(e.target.value); setError(''); }}
                required autoComplete="new-password" />
              {pw && <PasswordStrength strength={pwStrength} />}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
              <input id="reg-confirm" className="form-input" type="password" placeholder="Re-enter your password"
                value={confirm} onChange={e => { setConfirm(e.target.value); setError(''); }}
                required autoComplete="new-password" />
              {confirm && pw !== confirm && (
                <p className="auth-error" style={{ marginTop: 4, marginBottom: 0 }}>Passwords do not match</p>
              )}
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? '⏳ Creating account...' : 'Create Account →'}
            </button>
          </form>

          <div className="divider"><span className="divider-text">already have an account?</span></div>
          <p className="link-center"><span className="link" onClick={goLogin}>Sign in instead</span></p>
        </div>
      </div>
    </div>
  );
}
