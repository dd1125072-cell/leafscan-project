import React, { useState, useEffect } from 'react';
import { formatDate, formatDateTime } from '../utils/data';
import { apiGetScans, apiClearScans, apiDeleteScan, normaliseScan } from '../utils/api';
import { StatCard } from '../components/UI';
import './LogsPage.css';

export default function LogsPage({ user, goDetect }) {
  const [logs,     setLogs]     = useState([]);
  const [filter,   setFilter]   = useState('all');
  const [search,   setSearch]   = useState('');
  const [expanded, setExpanded] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error,    setError]    = useState('');

  async function fetchLogs() {
    setFetching(true);
    setError('');
    try {
      const params = {};
      if (filter !== 'all') params.filter = filter;
      if (search)           params.search = search;
      const data = await apiGetScans(params);
      setLogs(data.scans.map(normaliseScan));
    } catch (err) {
      setError('Could not load logs. Is the server running?');
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => { fetchLogs(); }, [filter, search]); // eslint-disable-line

  async function clearLogs() {
    if (!window.confirm('Delete all your scan logs? This cannot be undone.')) return;
    try {
      await apiClearScans();
      setLogs([]);
    } catch {
      alert('Failed to clear logs.');
    }
  }

  async function deleteSingle(id) {
    try {
      await apiDeleteScan(id);
      setLogs(prev => prev.filter(l => l.id !== id));
      if (expanded === id) setExpanded(null);
    } catch {
      alert('Failed to delete scan.');
    }
  }

  const totalHealthy  = logs.filter(l => l.isHealthy).length;
  const totalDiseased = logs.filter(l => !l.isHealthy).length;

  return (
    <div className="page-wide animate-fade-up">
      <div className="logs-header">
        <div>
          <h2 className="logs-title">My Scan Logs</h2>
          <p className="logs-sub">All plant disease scans submitted by you</p>
        </div>
        {logs.length > 0 && (
          <button className="btn btn-sm btn-outline" onClick={clearLogs}
            style={{ color: 'var(--red-600)', borderColor: 'var(--red-400)' }}>
            🗑 Clear All
          </button>
        )}
      </div>

      <div className="logs-stats">
        <StatCard num={logs.length}   label="Total Scans" colorClass="green" />
        <StatCard num={totalHealthy}  label="Healthy"     colorClass="teal"  />
        <StatCard num={totalDiseased} label="Diseased"    colorClass="red"   />
      </div>

      <div className="logs-filters">
        <input className="form-input logs-search" type="search" placeholder="Search plant or disease..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-input logs-filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All results</option>
          <option value="healthy">Healthy only</option>
          <option value="diseased">Diseased only</option>
        </select>
      </div>

      {error && <p className="detect-error">{error}</p>}

      {fetching ? (
        <div className="logs-empty"><span className="logs-empty-icon">🔄</span>
          <p className="logs-empty-title">Loading...</p></div>
      ) : logs.length === 0 ? (
        <div className="logs-empty">
          <span className="logs-empty-icon">🌾</span>
          <p className="logs-empty-title">No scans yet</p>
          <p className="logs-empty-sub">Upload your first plant image to get started.</p>
          <button className="btn btn-primary" style={{ width: 'auto', marginTop: '1rem' }} onClick={goDetect}>
            🔬 Start Detecting
          </button>
        </div>
      ) : (
        <>
          <div className="card logs-table-card">
            <div className="scroll-x">
              <table className="log-table">
                <thead>
                  <tr>
                    <th>Image</th><th>Plant</th><th>Diagnosis</th><th>Status</th>
                    <th>Confidence</th><th>Date</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <React.Fragment key={log.id}>
                      <tr className={expanded === log.id ? 'row-expanded' : ''}
                        onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                        style={{ cursor: 'pointer' }}>
                        <td>
                          {log.imgSrc
                            ? <img className="log-thumb" src={log.imgSrc} alt={log.plantName} />
                            : <div className="log-thumb-ph">🌿</div>}
                        </td>
                        <td className="log-plant">{log.plantName}</td>
                        <td>{log.label}</td>
                        <td>
                          <span className={`badge badge-${log.isHealthy ? 'healthy' : 'diseased'}`}>
                            {log.isHealthy ? 'Healthy' : 'Diseased'}
                          </span>
                        </td>
                        <td>
                          <div className="log-conf-row">
                            <div className="log-conf-bar">
                              <div className={`log-conf-fill ${log.isHealthy ? 'healthy' : 'diseased'}`}
                                style={{ width: log.confidence + '%' }} />
                            </div>
                            <span className="log-conf-num">{log.confidence}%</span>
                          </div>
                        </td>
                        <td className="log-date">{formatDate(log.submittedAt)}</td>
                        <td className="log-expand-btn">{expanded === log.id ? '▲' : '▼'}</td>
                      </tr>

                      {expanded === log.id && (
                        <tr className="log-detail-row">
                          <td colSpan={7}>
                            <div className="log-detail">
                              {log.imgSrc && (
                                <img src={log.imgSrc} alt={log.plantName} className="log-detail-img" />
                              )}
                              <div className="log-detail-info">
                                <div><span className="detail-label">Submitted by:</span> {log.userName}</div>
                                <div><span className="detail-label">Date & Time:</span> {formatDateTime(log.submittedAt)}</div>
                                {log.notes && <div><span className="detail-label">Notes:</span> {log.notes}</div>}
                                <button className="btn btn-sm btn-outline"
                                  style={{ color: 'var(--red-600)', borderColor: 'var(--red-400)', marginTop: '0.5rem', width: 'auto' }}
                                  onClick={e => { e.stopPropagation(); deleteSingle(log.id); }}>
                                  🗑 Delete this scan
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="logs-count-hint">{logs.length} entries shown</p>
        </>
      )}
    </div>
  );
}
