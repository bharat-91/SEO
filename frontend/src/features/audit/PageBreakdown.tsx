import { useMemo, useState } from 'react';
import { IssueBadge } from '../../components/IssueBadge';
import { MetricTile } from '../../components/MetricTile';
import { getPageSeverity, Severity } from '../../utils/health';
import { formatKb, formatPath, httpChipClass } from '../../utils/formatters';
import type { PageResult } from '../../types/audit';

export interface PageBreakdownProps {
  pages: PageResult[];
}

type Filter = 'all' | Severity;
type SortKey = 'issues' | 'url' | 'status';

const SEVERITY_META: Record<Severity, { label: string; chip: string; accent: string }> = {
  critical: { label: 'Critical', chip: 'chip-crit', accent: 'var(--c-critical-solid)' },
  warning: { label: 'Warning', chip: 'chip-warn', accent: 'var(--c-warning-solid)' },
  healthy: { label: 'Healthy', chip: 'chip-good', accent: 'var(--c-good-solid)' },
};

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'critical', label: 'Critical' },
  { value: 'warning', label: 'Warning' },
  { value: 'healthy', label: 'Healthy' },
];

export function PageBreakdown({ pages }: PageBreakdownProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Filter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('issues');

  const decorated = useMemo(
    () => pages.map((page) => ({ page, severity: getPageSeverity(page.issues) })),
    [pages]
  );

  const visible = useMemo(() => {
    const filtered =
      filter === 'all'
        ? decorated
        : decorated.filter((row) => row.severity === filter);

    return [...filtered].sort((a, b) => {
      if (sortKey === 'issues') return b.page.issues.length - a.page.issues.length;
      if (sortKey === 'status') return (b.page.statusCode ?? 0) - (a.page.statusCode ?? 0);
      return a.page.url.localeCompare(b.page.url);
    });
  }, [decorated, filter, sortKey]);

  function toggle(url: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(url) ? next.delete(url) : next.add(url);
      return next;
    });
  }

  if (pages.length === 0) {
    return (
      <section className="panel empty-state">
        <div className="empty-icon" aria-hidden="true">
          🏝️
        </div>
        <p className="empty-title">No pages were crawled</p>
        <p>
          The audit finished without analyzing any pages. The homepage may have been
          unreachable, or it returned no usable HTML.
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="panel-head">
        <h2 className="section-title">
          <span aria-hidden="true">🗺️</span> Page breakdown
        </h2>

        <div className="filters">
          <div className="seg" role="group" aria-label="Filter pages by severity">
            {FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`seg-btn ${filter === option.value ? 'is-active' : ''}`}
                aria-pressed={filter === option.value}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className="sr-only" htmlFor="sort-pages">
            Sort pages by
          </label>
          <select
            id="sort-pages"
            className="select-sm"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            <option value="issues">Most issues</option>
            <option value="url">URL (A–Z)</option>
            <option value="status">HTTP status</option>
          </select>
        </div>
      </div>

      <p className="result-count" aria-live="polite">
        Showing {visible.length} of {pages.length}{' '}
        {pages.length === 1 ? 'page' : 'pages'}
      </p>

      {visible.length === 0 ? (
        <div className="panel empty-state">
          <div className="empty-icon" aria-hidden="true">
            🔍
          </div>
          <p className="empty-title">No pages match this filter</p>
          <p>Try selecting a different severity.</p>
        </div>
      ) : (
        <div className="table-wrap scroll-x" style={{ marginTop: 'var(--s-3)' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th scope="col">Severity</th>
                <th scope="col">Page</th>
                <th scope="col" className="col-optional">
                  Status
                </th>
                <th scope="col" className="num">
                  Issues
                </th>
                <th scope="col" className="num">
                  <span className="sr-only">Expand</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map(({ page, severity }) => (
                <PageRow
                  key={page.url}
                  page={page}
                  severity={severity}
                  isOpen={expanded.has(page.url)}
                  onToggle={() => toggle(page.url)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

interface PageRowProps {
  page: PageResult;
  severity: Severity;
  isOpen: boolean;
  onToggle: () => void;
}

function PageRow({ page, severity, isOpen, onToggle }: PageRowProps) {
  const meta = SEVERITY_META[severity];

  return (
    <>
      <tr
        className={`row-main ${isOpen ? 'is-open' : ''}`}
        style={{ ['--row-accent' as string]: meta.accent }}
        onClick={onToggle}
      >
        <td>
          <span className={`chip ${meta.chip}`}>
            <span className="chip-dot" aria-hidden="true" />
            {meta.label}
          </span>
        </td>

        <td className="cell-url">
          <span title={page.url}>{formatPath(page.url)}</span>
        </td>

        <td className="col-optional">
          <span className={`chip ${httpChipClass(page.statusCode)}`}>
            {page.statusCode ?? 'Failed'}
          </span>
        </td>

        <td className="num tnum">
          {page.issues.length === 0 ? (
            <span className="sev-mute">0</span>
          ) : (
            <strong>{page.issues.length}</strong>
          )}
        </td>

        <td className="num">
          <button
            type="button"
            className="btn btn-sm btn-icon"
            aria-expanded={isOpen}
            aria-label={`${isOpen ? 'Collapse' : 'Expand'} details for ${page.url}`}
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
          >
            <span className={`chevron ${isOpen ? 'is-open' : ''}`} aria-hidden="true">
              ▾
            </span>
          </button>
        </td>
      </tr>

      {isOpen && (
        <tr className="row-detail">
          <td colSpan={5}>
            <div className="detail-shell">
              <div className="detail-inner">
                <PageDetail page={page} />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function PageDetail({ page }: { page: PageResult }) {
  const { metrics, issues, fetchError, url } = page;

  if (fetchError) {
    return (
      <>
        <p className="eyebrow" style={{ marginBottom: 'var(--s-2)' }}>
          Could not fetch this page
        </p>
        <p className="alert-msg">{fetchError}</p>
        <p className="range-hint" style={{ marginTop: 'var(--s-2)' }}>
          {url}
        </p>
      </>
    );
  }

  return (
    <div className="stack">
      <div className="detail-grid">
        <MetricTile
          label="Title length"
          value={`${metrics.titleLength} chars`}
          range={{ min: 30, max: 65, actual: metrics.titleLength, scaleMax: 90 }}
          tone={
            metrics.titleLength >= 30 && metrics.titleLength <= 65 ? 'good' : 'warn'
          }
        />
        <MetricTile
          label="Meta description"
          value={`${metrics.metaDescriptionLength} chars`}
          range={{
            min: 70,
            max: 160,
            actual: metrics.metaDescriptionLength,
            scaleMax: 200,
          }}
          tone={
            metrics.metaDescriptionLength >= 70 && metrics.metaDescriptionLength <= 160
              ? 'good'
              : 'warn'
          }
        />
        <MetricTile
          label="H1 count"
          value={String(metrics.h1Count)}
          hint="Exactly one H1 is recommended"
          tone={metrics.h1Count === 1 ? 'good' : 'crit'}
        />
        <MetricTile
          label="Page size"
          value={formatKb(metrics.pageSizeKb)}
          hint="Flagged above 2 MB"
          tone={metrics.pageSizeKb > 2048 ? 'warn' : 'good'}
        />
        <MetricTile
          label="Canonical"
          value={metrics.canonical ? 'Present' : 'Missing'}
          hint={metrics.canonical ?? undefined}
          tone={metrics.canonical ? 'good' : 'warn'}
        />
        <MetricTile
          label="Noindex"
          value={metrics.noindex ? 'Yes' : 'No'}
          hint={
            metrics.noindex ? 'This page is excluded from search' : 'Indexable by search engines'
          }
          tone={metrics.noindex ? 'crit' : 'good'}
        />
        <MetricTile
          label="Internal links"
          value={String(metrics.internalLinkCount)}
          hint="Counted, not crawled"
        />
        <MetricTile
          label="HTTP status"
          value={String(page.statusCode ?? '—')}
          tone={
            page.statusCode && page.statusCode >= 200 && page.statusCode < 300
              ? 'good'
              : 'crit'
          }
        />
      </div>

      <div>
        <p className="eyebrow" style={{ marginBottom: 'var(--s-2)' }}>
          {issues.length > 0
            ? `Detected issues (${issues.length})`
            : 'Detected issues'}
        </p>
        {issues.length === 0 ? (
          <p className="sev-good">✓ This page passed every check.</p>
        ) : (
          <div className="issue-list">
            {issues.map((code, i) => (
              <IssueBadge key={code} code={code} index={i} />
            ))}
          </div>
        )}
      </div>

      <p className="range-hint mono">{url}</p>
    </div>
  );
}
