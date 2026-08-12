import { StartAuditForm } from '../features/audit/StartAuditForm';
import { useAudit } from '../hooks/useAudit';

export interface StartPageProps {
  onAuditStarted: (auditId: string) => void;
}

export function StartPage({ onAuditStarted }: StartPageProps) {
  const { loading, error, startAudit, clearError } = useAudit();

  async function handleSubmit(url: string) {
    try {
      const auditId = await startAudit({ url });
      onAuditStarted(auditId);
    } catch {
      // error is already captured in the useAudit hook state
    }
  }

  return (
    <StartAuditForm
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      onDismissError={clearError}
    />
  );
}
