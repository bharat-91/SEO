import { useCallback, useState } from 'react';
import { useAudit } from '../hooks/useAudit';
import { useAuditPolling } from '../hooks/useAuditPolling';
import { AuditOverview } from '../features/audit/AuditOverview';
import { PageBreakdown } from '../features/audit/PageBreakdown';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';

export interface AuditResultsPageProps {
  auditId: string;
  onReset: () => void;
}

export function AuditResultsPage({ auditId, onReset }: AuditResultsPageProps) {
  const { audit, error, fetchAudit } = useAudit();
  const [pollingError, setPollingError] = useState<string | null>(null);

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

  if (pollingError || error) {
    return (
      <div style={styles.container}>
        <ErrorAlert error={pollingError || error || 'Something went wrong.'} />
        <button className="button-secondary" onClick={onReset}>
          ← Try Another URL
        </button>
      </div>
    );
  }

  if (!audit) {
    return <LoadingSpinner message="Loading audit…" />;
  }

  if (audit.status === 'PENDING' || audit.status === 'RUNNING') {
    return (
      <LoadingSpinner message="Audit in progress… Crawling website and analyzing pages." />
    );
  }

  if (audit.status === 'FAILED') {
    return (
      <div style={styles.container}>
        <ErrorAlert error={audit.error || 'The audit failed to complete.'} />
        <button className="button-secondary" onClick={onReset}>
          ← Try Another URL
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <AuditOverview audit={audit} />
      <PageBreakdown pages={audit.pages} />
      <div style={styles.footer}>
        <button className="button-secondary" onClick={onReset}>
          ← Audit Another Website
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center' as const,
  },
};
