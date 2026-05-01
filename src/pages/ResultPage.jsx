import React, { useState, useEffect } from 'react';
import { DISEASE_INFO, formatDateTime } from '../utils/data';
import './ResultPage.css';

const SEVERITY_COLOR = { 'None': '#16a34a', 'Moderate': '#d97706', 'High': '#dc2626', 'Very High': '#7c3aed' };
const SEVERITY_BG    = { 'None': '#f0fdf4', 'Moderate': '#fffbeb', 'High': '#fef2f2', 'Very High': '#f5f3ff' };

export default function ResultPage({ entry, goDetect, goLogs }) {
  const [barWidth, setBarWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setBarWidth(entry.confidence), 300); return () => clearTimeout(t); }, [entry.confidence]);

  // Use rich info from model response if available, else fallback to local DISEASE_INFO
  const labelKey = entry.label || 'Healthy';
  const localInfo = DISEASE_INFO[labelKey] || DISEASE_INFO['Healthy'];
  const displayName  = entry.displayName  || localInfo.displayName  || labelKey.replace(/_/g, ' ');
  const severity     = entry.severity     || localInfo.severity     || 'Unknown';
  const description  = entry.description  || localInfo.description  || '';
  const treatment    = entry.treatment    || localInfo.treatment    || [];
  const sevColor     = SEVERITY_COLOR[severity] || '#374151';
  const sevBg        = SEVERITY_BG[severity]    || '#f9fafb';

  return (
    <div className="page animate-fade-up">
      <div className="page-hero">
        <h1 className="page-title">Detection Result</h1>
        <p className="page-sub">Analysed {formatDateTime(entry.submittedAt)}</p>
      </div>

      {/* ── Status Banner ── */}
      <div className={`result-banner ${entry.isHealthy ? 'healthy' : 'diseased'}`}>
        <div className="result-banner-icon">{entry.isHealthy ? '✅' : '🚨'}</div>
        <div>
          <div className="result-banner-title">{entry.isHealthy ? 'Healthy Rice Plant' : displayName}</div>
          <div className="result-banner-sub">
            {entry.isHealthy ? 'No disease detected in this sample.' : 'Disease detected — immediate action recommended.'}
          </div>
        </div>
      </div>

      {/* ── Confidence ── */}
      <div className="card animate-fade-up animate-delay-1">
        <div className="card-label">Model Confidence</div>
        <div className="confidence-row">
          <div className="confidence-bar" style={{ flex: 1 }}>
            <div className={`confidence-fill ${entry.isHealthy ? 'healthy' : 'diseased'}`} style={{ width: barWidth + '%' }} />
          </div>
          <span className="confidence-score" style={{ color: entry.isHealthy ? 'var(--teal-600)' : 'var(--red-800)' }}>
            {entry.confidence}%
          </span>
        </div>
        {entry.confidence < 70 && <p className="confidence-hint">⚠ Low confidence — consider retaking with a clearer, closer image.</p>}
      </div>

      {/* ── Submitted Image + Details ── */}
      <div className="card animate-fade-up animate-delay-2">
        <div className="card-label">Submission Details</div>
        <div className="info-grid">
          <div className="info-cell">
            <div className="info-cell-label">Crop</div>
            <div className="info-cell-val">🌾 {entry.plantName || 'Rice'}</div>
          </div>
          <div className="info-cell">
            <div className="info-cell-label">Status</div>
            <div className="info-cell-val">
              <span className={`badge badge-${entry.isHealthy ? 'healthy' : 'diseased'}`}>
                {entry.isHealthy ? 'Healthy' : 'Diseased'}
              </span>
            </div>
          </div>
          <div className="info-cell">
            <div className="info-cell-label">Submitted by</div>
            <div className="info-cell-val">👤 {entry.userName}</div>
          </div>
          <div className="info-cell">
            <div className="info-cell-label">Diagnosis</div>
            <div className="info-cell-val" style={{ fontWeight: 600 }}>{displayName}</div>
          </div>
        </div>
        {entry.imgSrc && <img src={entry.imgSrc} alt="Submitted rice leaf" className="result-img" />}
        {entry.notes && <div className="result-notes"><span className="result-notes-label">Notes: </span>{entry.notes}</div>}
      </div>

      {/* ── Disease Info ── */}
      {!entry.isHealthy && (
        <div className="card animate-fade-up animate-delay-3" style={{ borderLeft: `4px solid ${sevColor}` }}>
          <div className="card-label">About This Disease</div>
          <div className="disease-severity-badge" style={{ background: sevBg, color: sevColor }}>
            ⚠ Severity: <strong>{severity}</strong>
          </div>
          <p className="disease-description">{description}</p>
        </div>
      )}

      {/* ── Treatment / Recommendations ── */}
      <div className="card animate-fade-up animate-delay-4">
        <div className="card-label">
          {entry.isHealthy ? '✅ Maintenance Tips' : '💊 Recommended Treatment'}
        </div>
        <ul className="recs-list">
          {treatment.map((rec, i) => (
            <li key={i} className={`rec-item ${entry.isHealthy ? 'healthy' : 'diseased'}`}>
              <span className="rec-icon">{entry.isHealthy ? '✔' : '!'}</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Actions ── */}
      <div className="result-actions">
        <button className="btn btn-primary" onClick={goDetect}>🌾 New Scan</button>
        <button className="btn btn-outline" onClick={goLogs}>📊 View All Logs</button>
      </div>
    </div>
  );
}
