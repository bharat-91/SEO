import { useState } from 'react';
import { IssueBadge } from '../../components/IssueBadge';
import { getIssueDefinition } from '../../constants/issues';
import { theme } from '../../constants/theme';
import type { PageResult } from '../../types/audit';

export interface PageBreakdownProps {
  pages: PageResult[];
}

type Severity = 'critical' | 'warning' | 'healthy';

function getPageSeverity(issues: string[]): Severity {
  if (issues.length === 0) return 'healthy';
  if (issues.some((code) => getIssueDefinition(code).severity === 'critical')) return 'critical';
  return 'warning';
}

const SEVERITY_ICON: Record<Severity, string> = {
  critical: '🔴',
  warning: '🟠',
  healthy: '🟢',
};

const SEVERITY_LABEL: Record<Severity, string> = {
  critical: 'Critical',
  warning: 'Warning',
  healthy: 'Healthy',
};

export function PageBreakdown({ pages }: PageBreakdownProps) {
  const [expandedUrls, setExpandedUrls] = useState<Set<string>>(new Set());

  function toggleExpanded(url: string) {
    setExpandedUrls((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  }

  if (pages.length === 0) {
    return (
      <div style={styles.empty}>
        <p>🏝️ No pages were crawled for this audit.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>🗺️ Page-Level Breakdown</h3>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Severity</th>
              <th style={styles.th}>Page URL</th>
              <th style={styles.th}>HTTP Status</th>
              <th style={styles.th}>Issues</th>
              <th style={styles.th} />
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => {
              const severity = getPageSeverity(page.issues);
              const isExpanded = expandedUrls.has(page.url);

              return (
                <PageRow
                  key={page.url}
                  page={page}
                  severity={severity}
                  isExpanded={isExpanded}
                  onToggle={() => toggleExpanded(page.url)}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface PageRowProps {
  page: PageResult;
  severity: Severity;
  isExpanded: boolean;
  onToggle: () => void;
}

function PageRow({ page, severity, isExpanded, onToggle }: PageRowProps) {
  return (
    <>
      <tr className="table-row-interactive" style={styles.row} onClick={onToggle}>
        <td style={styles.td}>
          <span title={SEVERITY_LABEL[severity]} aria-hidden="true">
            {SEVERITY_ICON[severity]}
          </span>
          <span className="sr-only">{SEVERITY_LABEL[severity]}</span>
        </td>
        <td style={{ ...styles.td, ...styles.urlCell }}>{page.url}</td>
        <td style={styles.td}>{page.statusCode ?? '—'}</td>
        <td style={styles.td}>{page.issues.length}</td>
        <td style={{ ...styles.td, textAlign: 'right' as const }}>
          <button
            type="button"
            className="button-secondary"
            style={styles.toggleButton}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} details for ${page.url}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={5} style={styles.expandedCell}>
            <PageDetail page={page} />
          </td>
        </tr>
      )}
    </>
  );
}

function PageDetail({ page }: { page: PageResult }) {
  if (page.fetchError) {
    return (
      <div style={styles.detailGrid}>
        <DetailRow label="Fetch Error" value={page.fetchError} />
      </div>
    );
  }

  return (
    <div>
      <div style={styles.detailGrid}>
        <DetailRow label="Title Length" value={`${page.metrics.titleLength} chars`} />
        <DetailRow
          label="Meta Description Length"
          value={`${page.metrics.metaDescriptionLength} chars`}
        />
        <DetailRow label="H1 Count" value={String(page.metrics.h1Count)} />
        <DetailRow label="Canonical" value={page.metrics.canonical || 'None'} />
        <DetailRow label="Noindex" value={page.metrics.noindex ? 'Yes' : 'No'} />
        <DetailRow label="Page Size" value={`${page.metrics.pageSizeKb} KB`} />
        <DetailRow label="Internal Links" value={String(page.metrics.internalLinkCount)} />
      </div>

      {page.issues.length > 0 && (
        <div style={styles.issuesSection}>
          <p style={styles.issuesLabel}>Detected Issues</p>
          <div>
            {page.issues.map((code) => (
              <IssueBadge key={code} code={code} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.detailRow}>
      <span style={styles.detailLabel}>{label}</span>
      <span style={styles.detailValue}>{value}</span>
    </div>
  );
}

const styles = {
  container: {
    marginTop: '24px',
  },
  heading: {
    marginBottom: '16px',
    color: theme.textPrimary,
  },
  tableWrapper: {
    overflowX: 'auto' as const,
    border: `1px solid ${theme.border}`,
    borderRadius: '10px',
    backgroundColor: theme.bgOcean,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '14px',
  },
  th: {
    textAlign: 'left' as const,
    padding: '12px 16px',
    backgroundColor: theme.bgOceanLight,
    borderBottom: `1px solid ${theme.border}`,
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    color: theme.textMuted,
  },
  row: {
    cursor: 'pointer',
    borderBottom: `1px solid ${theme.border}`,
  },
  td: {
    padding: '12px 16px',
    verticalAlign: 'middle' as const,
    color: theme.textPrimary,
  },
  toggleButton: {
    padding: '4px 10px',
    fontSize: '13px',
    backgroundColor: 'transparent',
  },
  urlCell: {
    wordBreak: 'break-all' as const,
    maxWidth: '400px',
  },
  expandedCell: {
    padding: '16px 24px',
    backgroundColor: theme.bgDeep,
    borderBottom: `1px solid ${theme.border}`,
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '8px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
    padding: '6px 0',
  },
  detailLabel: {
    color: theme.textMuted,
  },
  detailValue: {
    fontWeight: '600',
    color: theme.textPrimary,
    wordBreak: 'break-all' as const,
    textAlign: 'right' as const,
  },
  issuesSection: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: `1px solid ${theme.border}`,
  },
  issuesLabel: {
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    color: theme.textMuted,
    marginBottom: '8px',
  },
  empty: {
    padding: '40px',
    textAlign: 'center' as const,
    color: theme.textMuted,
  },
};
