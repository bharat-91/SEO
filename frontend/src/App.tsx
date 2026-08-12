import { useEffect, useState } from 'react';
import { initializeApiClient } from './api/client';
import { StartPage } from './pages/StartPage';
import { AuditResultsPage } from './pages/AuditResultsPage';
import { CursorTrail } from './components/CursorTrail';
import { OceanBackground } from './components/OceanBackground';
import './styles/index.css';

function getAuditIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get('audit');
}

export function App() {
  const [auditId, setAuditId] = useState<string | null>(getAuditIdFromUrl);

  useEffect(() => {
    initializeApiClient();
  }, []);

  // Keep the view in sync when the user navigates with back/forward.
  useEffect(() => {
    function handlePopState() {
      setAuditId(getAuditIdFromUrl());
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function handleAuditStarted(newAuditId: string) {
    setAuditId(newAuditId);
    const params = new URLSearchParams(window.location.search);
    params.set('audit', newAuditId);
    window.history.pushState(null, '', `?${params.toString()}`);
  }

  function handleReset() {
    setAuditId(null);
    window.history.pushState(null, '', window.location.pathname);
  }

  return (
    <div className="app">
      <OceanBackground />
      <CursorTrail />

      <header className="app-header">
        <a
          className="brand"
          href={window.location.pathname}
          onClick={(event) => {
            event.preventDefault();
            handleReset();
          }}
        >
          <span className="brand-mark" aria-hidden="true">
            🏴‍☠️
          </span>
          <span className="brand-name">Zensor</span>
          <span className="brand-sub">Technical SEO Audit</span>
        </a>
      </header>

      <main className="app-main">
        {auditId ? (
          <AuditResultsPage auditId={auditId} onReset={handleReset} />
        ) : (
          <StartPage onAuditStarted={handleAuditStarted} />
        )}
      </main>

      <footer className="app-footer">
        Crawls your homepage and primary navigation only — internal links on those
        pages are counted, not followed.
      </footer>
    </div>
  );
}

export default App;
