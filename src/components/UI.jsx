import React, { useEffect } from 'react';
import './Nav.css';

// ── NAV ───────────────────────────────────────────────────────────────────
export function Nav({ user, page, setPage, onLogout }) {
  if (!user) return null;

  return (
    <nav className="nav">
      <div className="nav-brand">
        <div className="nav-brand-icon">🌿</div>
        <span>LeafScan AI</span>
      </div>

      <div className="nav-links">
        <button
          className={`nav-btn ${page === 'detect' ? 'active' : ''}`}
          onClick={() => setPage('detect')}
        >
          🔬 Detect
        </button>
        <button
          className={`nav-btn ${page === 'logs' ? 'active' : ''}`}
          onClick={() => setPage('logs')}
        >
          📊 Logs
        </button>
      </div>

      <div className="nav-right">
        <div className="nav-user">
          <div className="nav-avatar">{user.name[0].toUpperCase()}</div>
          <span className="nav-user-name">{user.name}</span>
        </div>
        <button className="nav-btn nav-logout" onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}

// ── TOAST ─────────────────────────────────────────────────────────────────
export function Toast({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return <div className="toast">{msg}</div>;
}

// ── PASSWORD STRENGTH ─────────────────────────────────────────────────────
export function PasswordStrength({ strength }) {
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'var(--red-400)', 'var(--amber-200)', 'var(--teal-400)', 'var(--green-400)'];

  if (!strength) return null;

  return (
    <div className="pw-strength">
      <div className="pw-bars">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`pw-bar ${i <= strength ? 'filled' : ''}`}
            style={{ background: i <= strength ? colors[strength] : undefined }}
          />
        ))}
      </div>
      <span className="pw-label" style={{ color: colors[strength] }}>
        {labels[strength]}
      </span>
    </div>
  );
}

// ── LOADING SPINNER ───────────────────────────────────────────────────────
export function Spinner({ size = 32 }) {
  return (
    <div
      className="spinner"
      style={{
        width: size,
        height: size,
        borderWidth: size < 24 ? 2 : 3,
      }}
    />
  );
}

// ── STAT CARD ─────────────────────────────────────────────────────────────
export function StatCard({ num, label, colorClass }) {
  return (
    <div className="stat-card">
      <div className={`stat-num ${colorClass}`}>{num}</div>
      <div className="stat-lbl">{label}</div>
    </div>
  );
}
