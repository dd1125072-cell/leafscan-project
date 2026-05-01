import React, { useState } from 'react';
import { apiLogin } from '../utils/api';
import './AuthPages.css';

export default function LoginPage({ goRegister, onLogin, showToast }) {
  const [email,   setEmail]   = useState('');
  const [pw,      setPw]      = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await apiLogin({ email, password: pw });
      onLogin(user);
      showToast(`Welcome back, ${user.name}! 🌿`);
    } catch (err) {
      setError(err.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-container animate-fade-up">
        <div className="page-hero">
          <div className="page-hero-icon" style={{ background: '#dceeca' }}>🔐</div>
          <h1 className="page-title">Welcome Back</h1>
          <p className="page-sub">Sign in to continue diagnosing plants</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input id="login-email" className="form-input" type="email" placeholder="farmer@example.com"
                value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                required autoComplete="email" />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-pw">Password</label>
              <input id="login-pw" className="form-input" type="password" placeholder="••••••••"
                value={pw} onChange={e => { setPw(e.target.value); setError(''); }}
                required autoComplete="current-password" />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? '⏳ Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="divider"><span className="divider-text">don't have an account?</span></div>
          <p className="link-center"><span className="link" onClick={goRegister}>Create a free account</span></p>
        </div>
      </div>
    </div>
  );
}
