import { MetricCard, MetricTone } from '../../components/MetricCard';
import { HealthGauge } from '../../components/HealthGauge';
import { computeHealth } from '../../utils/health';
import type { Audit, AuditSummary } from '../../types/audit';

export interface AuditOverviewProps {
  audit: Audit;
}

interface MetricSpec {
  label: string;
  icon: string;
  key: keyof AuditSummary;
  tone: MetricTone;
}

const METRICS: MetricSpec[] = [
  { label: 'Pages crawled', icon: '🗺️', key: 'totalPages', tone: 'neutral' },
  { label: 'Total issues', icon: '⚠️', key: 'totalIssues', tone: 'critical' },
  { label: 'Missing titles', icon: '🏷️', key: 'missingTitles', tone: 'critical' },
  { label: 'Meta description', icon: '📝', key: 'metaDescriptionIssues', tone: 'flagged' },
  { label: 'H1 issues', icon: '🔠', key: 'h1Issues', tone: 'critical' },
  { label: 'Canonical issues', icon: '⚓', key: 'canonicalIssues', tone: 'flagged' },
  { label: 'Noindex pages', icon: '🚫', key: 'noindexPages', tone: 'critical' },
  { label: 'Non-200 pages', icon: '🌊', key: 'non200Pages', tone: 'critical' },
  { label: 'Pages over 2 MB', icon: '📦', key: 'pagesOverSizeLimit', tone: 'flagged' },
];

export function AuditOverview({ audit }: AuditOverviewProps) {
  const { summary, pages } = audit;
  if (!summary) return null;

  const health = computeHealth(pages);

  return (
    <div className="stack">
      <section className="panel panel-pad rise" style={{ ['--i' as string]: 0 }}>
        <HealthGauge
          health={health}
          pageCount={summary.totalPages}
          issueCount={summary.totalIssues}
        />
      </section>

      {summary.totalIssues === 0 && summary.totalPages > 0 && (
        <div className="celebrate rise" style={{ ['--i' as string]: 1 }}>
          <span className="celebrate-icon" aria-hidden="true">
            🏆
          </span>
          <div>
            <p className="celebrate-title">No technical SEO issues detected</p>
            <p className="celebrate-note">
              Every one of the {summary.totalPages}{' '}
              {summary.totalPages === 1 ? 'page' : 'pages'} we crawled passed all
              checks. Nothing to fix right now.
            </p>
          </div>
        </div>
      )}

      <section>
        <div className="panel-head">
          <h2 className="section-title">
            <span aria-hidden="true">📊</span> Summary
          </h2>
        </div>
        <div className="metric-grid">
          {METRICS.map((metric, i) => (
            <MetricCard
              key={metric.key}
              label={metric.label}
              value={summary[metric.key]}
              icon={metric.icon}
              tone={metric.tone}
              index={i}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
