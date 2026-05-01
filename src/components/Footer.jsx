import React from 'react';
import './Footer.css';

const CREATORS = ['Madhesh', 'Dinesh', 'Sooraj'];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-leaf">🌿</span>
          <span className="footer-name">LeafScan AI</span>
        </div>

        <p className="footer-tagline">
          Empowering farmers with AI-powered plant disease detection
        </p>

        <div className="footer-creators">
          <span className="footer-creators-label">Crafted with ❤️ by</span>
          <div className="footer-avatars">
            {CREATORS.map((name, i) => (
              <div key={name} className="footer-avatar" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="footer-avatar-circle">
                  {name[0]}
                </div>
                <span className="footer-avatar-name">{name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} LeafScan AI · All rights reserved</span>
        </div>
      </div>
    </footer>
  );
}
