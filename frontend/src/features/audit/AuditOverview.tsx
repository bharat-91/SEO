import { MetricCard } from '../../components/MetricCard';
import { formatUrl, getStatusColor } from '../../utils/formatters';
import { theme } from '../../constants/theme';
import type { Audit } from '../../types/audit';

export interface AuditOverviewProps {
  audit: Audit;
}

export function AuditOverview({ audit }: AuditOverviewProps) {
  const summary = audit.summary;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <p style={styles.label}>Audited Website</p>
          <h2 style={styles.url}>{formatUrl(audit.url)}</h2>
        </div>
        <span style={{ ...styles.statusBadge, backgroundColor: getStatusColor(audit.status) }}>
          {audit.status}
        </span>
      </div>

      {summary && summary.totalIssues === 0 && (
        <div style={styles.successBanner}>
          🏆 Treasure secured — no technical SEO issues detected across{' '}
          {summary.totalPages} {summary.totalPages === 1 ? 'page' : 'pages'}.
        </div>
      )}

      {summary && (
        <div style={styles.grid}>
          <MetricCard label="Total Pages" value={summary.totalPages} icon="🗺️" />
          <MetricCard
            label="Total Issues"
            value={summary.totalIssues}
            icon="⚠️"
            color={summary.totalIssues > 0 ? '#b91c1c' : '#15803d'}
          />
          <MetricCard label="Missing Titles" value={summary.missingTitles} icon="🏷️" />
          <MetricCard
            label="Meta Description Issues"
            value={summary.metaDescriptionIssues}
            icon="📝"
          />
          <MetricCard label="H1 Issues" value={summary.h1Issues} icon="🔠" />
          <MetricCard label="Canonical Issues" value={summary.canonicalIssues} icon="⚓" />
          <MetricCard label="Noindex Pages" value={summary.noindexPages} icon="🚫" />
          <MetricCard label="Non-200 Pages" value={summary.non200Pages} icon="🌊" />
          <MetricCard label="Pages > 2MB" value={summary.pagesOverSizeLimit} icon="📦" />
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    marginBottom: '32px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap' as const,
    gap: '12px',
  },
  label: {
    margin: '0 0 4px',
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    color: theme.textMuted,
  },
  url: {
    margin: 0,
    fontSize: '22px',
    wordBreak: 'break-all' as const,
    color: theme.textPrimary,
  },
  statusBadge: {
    padding: '6px 14px',
    borderRadius: '999px',
    color: 'white',
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    flexShrink: 0,
  },
  successBanner: {
    padding: '16px 20px',
    marginBottom: '20px',
    backgroundColor: 'rgba(21, 128, 61, 0.15)',
    border: '1px solid rgba(74, 222, 128, 0.35)',
    borderRadius: '8px',
    color: '#4ade80',
    fontWeight: '600',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
  },
};
