import { useCallback, useState } from 'react';
import { useAudit } from '../hooks/useAudit';
import { useAuditPolling } from '../hooks/useAuditPolling';
import { AuditOverview } from '../features/audit/AuditOverview';
import { AuditProgress } from '../features/audit/AuditProgress';
import { PageBreakdown } from '../features/audit/PageBreakdown';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { formatDuration, formatUrl, statusClass } from '../utils/formatters';

export interface AuditResultsPageProps {
  auditId: string;
  onReset: () => void;
}

export function AuditResultsPage({ auditId, onReset }: AuditResultsPageProps) {
  const { audit, error, fetchAudit } = useAudit();
  const [pollingError, setPollingError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFetch = useCallback(
    async (stop: () => void) => {
      const result = await fetchAudit(auditId);
      if (result.status === 'COMPLETED' || result.status === 'FAILED') {
        stop();
      }
    },
    [auditId, fetchAudit]
  );

  useAuditPolling({
    auditId,
    onFetch: handleFetch,
    onError: (err) => setPollingError(err.message),
  });

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access can be blocked by permissions. The URL is already in
      // the address bar, so there is nothing useful to escalate here.
    }
  }

  const backButton = (
    <button type="button" className="btn btn-ghost btn-sm" onClick={onReset}>
      <span aria-hidden="true">←</span> Audit another site
    </button>
  );

  if (pollingError || error) {
    return (
      <div className="stack">
        <ErrorAlert
          error={pollingError ?? error ?? 'Something went wrong.'}
          title="Could not load this audit"
        />
        <div>{backButton}</div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="panel panel-pad">
        <LoadingSpinner title="Loading audit" message="Fetching your report…" />
      </div>
    );
  }

  const isRunning = audit.status === 'PENDING' || audit.status === 'RUNNING';

  return (
    <div className="stack">
      <header className="result-head">
        <div>
          <p className="eyebrow">Audited website</p>
          <p className="result-url">
            <span aria-hidden="true">🌐</span>
            {formatUrl(audit.url)}
          </p>
        </div>

        <div className="result-actions">
          <span className={`status-pill ${statusClass(audit.status)}`}>
            <span className="status-dot" aria-hidden="true" />
            {audit.status}
          </span>
          <button type="button" className="btn btn-sm btn-ghost" onClick={copyLink}>
            {copied ? '✓ Copied' : '🔗 Copy link'}
          </button>
          {backButton}
        </div>
      </header>

      {isRunning && <AuditProgress />}

      {audit.status === 'FAILED' && (
        <ErrorAlert
          error={audit.error ?? 'The audit failed to complete.'}
          title="This audit failed"
        />
      )}

      {audit.status === 'COMPLETED' && (
        <>
          <AuditOverview audit={audit} />
          <PageBreakdown pages={audit.pages} />
          <p className="range-hint" style={{ textAlign: 'center' }}>
            Completed in {formatDuration(audit.createdAt, audit.updatedAt)} ·{' '}
            <span className="mono">{audit.audit_id}</span>
          </p>
        </>
      )}
    </div>
  );
}
