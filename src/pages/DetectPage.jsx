import React, { useState, useRef } from 'react';
import { apiSaveScan, normaliseScan } from '../utils/api';
import './DetectPage.css';

export default function DetectPage({ user, onResult, showToast }) {
  const [imgSrc,    setImgSrc]    = useState(null);
  const [notes,     setNotes]     = useState('');
  const [drag,      setDrag]      = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error,     setError]     = useState('');
  const fileRef = useRef(null);

  function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please upload a valid image file (PNG, JPG, WEBP).'); return; }
    if (file.size > 10 * 1024 * 1024)   { setError('Image must be smaller than 10 MB.'); return; }
    setError('');
    const reader = new FileReader();
    reader.onload = e => setImgSrc(e.target.result);
    reader.readAsDataURL(file);
  }

  function handleDrop(e) { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!imgSrc) { setError('Please upload a rice leaf image.'); return; }
    setError(''); setAnalyzing(true);
    try {
      const saved = await apiSaveScan({ plantName: 'Rice', notes, imgSrc });
      onResult(normaliseScan(saved));
    } catch (err) {
      setError(err.message || 'Detection failed. Make sure all 3 servers are running.');
    } finally { setAnalyzing(false); }
  }

  function resetImage() { setImgSrc(null); if (fileRef.current) fileRef.current.value = ''; }

  return (
    <div className="page animate-fade-up">
      <div className="page-hero">
        <div className="page-hero-icon" style={{ background: '#C0DD97' }}>🌾</div>
        <h1 className="page-title">Rice Disease Detection</h1>
        <p className="page-sub">Upload a clear close-up photo of your rice plant leaf for AI-powered diagnosis</p>
      </div>

      <div className="detect-info-strip">
        <span className="detect-info-item">🔬 Bacterial Blight</span>
        <span className="detect-info-item">🍄 Rice Blast</span>
        <span className="detect-info-item">🟤 Brown Spot</span>
        <span className="detect-info-item">✅ Healthy</span>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Submitted by</label>
            <input className="form-input" value={user.name} readOnly />
          </div>

          <div className="form-group">
            <label className="form-label">Crop <span className="required-star">*</span></label>
            <input className="form-input" value="Rice 🌾" readOnly style={{ background: '#f0fdf4', fontWeight: 600 }} />
          </div>

          <div className="form-group">
            <label className="form-label">Leaf Image <span className="required-star">*</span></label>
            {!imgSrc ? (
              <div
                className={`upload-zone ${drag ? 'drag-over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)} onDrop={handleDrop}
                onClick={() => fileRef.current?.click()} role="button" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}>
                <span className="upload-zone-icon">📷</span>
                <p className="upload-zone-title">{drag ? 'Drop it here!' : 'Drop rice leaf image here or click to browse'}</p>
                <p className="upload-zone-sub">PNG, JPG, WEBP · Max 10 MB · Close-up leaf photos work best</p>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
              </div>
            ) : (
              <div className="upload-preview-wrap">
                <img className="upload-preview" src={imgSrc} alt="Rice leaf" />
                <button type="button" className="upload-remove" onClick={resetImage}>✕ Remove image</button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="notes-input">Notes <span className="form-optional">(optional)</span></label>
            <textarea id="notes-input" className="form-input form-textarea" rows={3}
              placeholder="E.g. field location, crop age, previous treatments..."
              value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          {error && <p className="form-error">⚠ {error}</p>}

          <button type="submit" className="btn btn-primary btn-full" disabled={analyzing || !imgSrc}>
            {analyzing ? <><span className="spinner" /> Analysing with YOLOv5...</> : '🔬 Detect Disease'}
          </button>
        </form>
      </div>
    </div>
  );
}
