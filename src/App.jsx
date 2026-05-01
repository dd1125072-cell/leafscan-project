import React, { useState, useEffect } from 'react';
import { Nav, Toast } from './components/UI';
import Footer from './components/Footer';

import HeroPage     from './pages/HeroPage';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DetectPage   from './pages/DetectPage';
import ResultPage   from './pages/ResultPage';
import LogsPage     from './pages/LogsPage';

import { apiGetMe, apiLogout } from './utils/api';

// Auth screen states
const AUTH = { HERO: 'hero', LOGIN: 'login', REGISTER: 'register' };

export default function App() {
  const [authScreen, setAuthScreen] = useState(AUTH.HERO);
  const [user,        setUser]       = useState(null);
  const [page,        setPage]       = useState('detect');
  const [resultEntry, setResultEntry] = useState(null);
  const [toast,       setToast]      = useState(null);
  const [loading,     setLoading]    = useState(true);

  // ── Restore session from JWT on first load ────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const me = await apiGetMe();
        setUser(me);
      } catch {
        // No valid token — stay on hero screen
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function showToast(msg) { setToast(msg); }

  function handleLogin(u) {
    setUser(u);
    setPage('detect');
    setResultEntry(null);
  }

  function handleLogout() {
    apiLogout();
    setUser(null);
    setAuthScreen(AUTH.HERO);
    setResultEntry(null);
  }

  function handleResult(entry) {
    setResultEntry(entry);
    setPage('result');
  }

  function navigateTo(newPage) {
    setPage(newPage);
    if (newPage !== 'result') setResultEntry(null);
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <span style={{ fontSize: '2rem' }}>🌿</span>
      </div>
    );
  }

  // ── Not authenticated ─────────────────────────────────────────────────────
  if (!user) {
    return (
      <>
        {authScreen === AUTH.HERO && (
          <HeroPage
            goLogin={()    => setAuthScreen(AUTH.LOGIN)}
            goRegister={() => setAuthScreen(AUTH.REGISTER)}
          />
        )}
        {authScreen === AUTH.LOGIN && (
          <LoginPage
            goRegister={() => setAuthScreen(AUTH.REGISTER)}
            onLogin={handleLogin}
            showToast={showToast}
          />
        )}
        {authScreen === AUTH.REGISTER && (
          <RegisterPage
            goLogin={() => setAuthScreen(AUTH.LOGIN)}
            onLogin={handleLogin}
            showToast={showToast}
          />
        )}
        {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
        <Footer />
      </>
    );
  }

  // ── Authenticated ─────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Nav user={user} page={page} setPage={navigateTo} onLogout={handleLogout} />

      <div style={{ flex: 1 }}>
        {page === 'detect' && (
          <DetectPage user={user} onResult={handleResult} showToast={showToast} />
        )}

        {page === 'result' && resultEntry && (
          <ResultPage
            entry={resultEntry}
            goDetect={() => navigateTo('detect')}
            goLogs={()   => navigateTo('logs')}
          />
        )}

        {page === 'result' && !resultEntry && (
          <DetectPage user={user} onResult={handleResult} showToast={showToast} />
        )}

        {page === 'logs' && (
          <LogsPage user={user} goDetect={() => navigateTo('detect')} />
        )}
      </div>

      <Footer />
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
