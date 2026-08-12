import { useEffect, useState } from 'react';
import { initializeApiClient } from './api/client';
import { StartPage } from './pages/StartPage';
import { AuditResultsPage } from './pages/AuditResultsPage';
import { CursorTrail } from './components/CursorTrail';
import './App.css';

function getAuditIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get('audit');
}

export function App() {
  const [auditId, setAuditId] = useState<string | null>(getAuditIdFromUrl);

  useEffect(() => {
    initializeApiClient();
  }, []);

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
      <CursorTrail />
      <header className="app-header">
        <h1>
          <span aria-hidden="true">🏴‍☠️</span> Zensor — Technical SEO Audit Tool
        </h1>
      </header>
      <main className="app-main">
        {auditId ? (
          <AuditResultsPage auditId={auditId} onReset={handleReset} />
        ) : (
          <StartPage onAuditStarted={handleAuditStarted} />
        )}
      </main>
    </div>
  );
}

export default App;
