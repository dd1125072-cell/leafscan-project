import React from 'react';
import './HeroPage.css';

export default function HeroPage({ goLogin, goRegister }) {
  return (
    <div className="hero-bg">
      <div className="hero-content">
        <div className="hero-leaf">🌱</div>

        <h1 className="hero-title">
          Detect Plant Diseases<br />
          <span className="hero-title-accent">Instantly with AI</span>
        </h1>

        <p className="hero-desc">
          Upload a photo of your plant leaf and get an instant disease diagnosis
          powered by computer vision. Protect your crops before it's too late.
        </p>

        <div className="hero-btns">
          <button className="hero-btn-primary" onClick={goLogin}>
            Sign In
          </button>
          <button className="hero-btn-secondary" onClick={goRegister}>
            Create Account
          </button>
        </div>

        <div className="hero-features">
          <div className="hero-feat">
            <div className="hero-feat-icon">🔬</div>
            <div className="hero-feat-title">AI Analysis</div>
            <div className="hero-feat-desc">Accurate disease detection from images</div>
          </div>
          <div className="hero-feat">
            <div className="hero-feat-icon">⚡</div>
            <div className="hero-feat-title">Instant Results</div>
            <div className="hero-feat-desc">Get diagnosis in seconds</div>
          </div>
          <div className="hero-feat">
            <div className="hero-feat-icon">📊</div>
            <div className="hero-feat-title">Full History</div>
            <div className="hero-feat-desc">Track all your scan submissions</div>
          </div>
        </div>
      </div>

      <footer className="hero-footer">
        <p>Supports 12 plant types · Built for farmers & agronomists</p>
      </footer>
    </div>
  );
}
