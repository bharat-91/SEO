import { useCountUp } from '../hooks/useCountUp';
import { severityTextClass } from '../utils/formatters';
import type { HealthResult } from '../utils/health';

const SIZE = 148;
const STROKE = 11;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const STROKE_CLASS = {
  critical: 'stroke-critical',
  warning: 'stroke-warning',
  healthy: 'stroke-good',
} as const;

export interface HealthGaugeProps {
  health: HealthResult;
  pageCount: number;
  issueCount: number;
}

/**
 * Radial score dial — the "is my site healthy?" answer at a glance.
 * The score is derived from the audit's real issue data (see utils/health.ts).
 */
export function HealthGauge({ health, pageCount, issueCount }: HealthGaugeProps) {
  const animated = useCountUp(health.score);
  const offset = CIRCUMFERENCE * (1 - animated / 100);
  const toneClass = severityTextClass(health.severity);

  return (
    <div className="gauge-card">
      <div
        className="gauge"
        role="img"
        aria-label={`Site health score ${health.score} out of 100 — ${health.grade}`}
      >
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
          <circle
            className="gauge-track"
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            strokeWidth={STROKE}
          />
          <circle
            className={`gauge-fill ${STROKE_CLASS[health.severity]}`}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            strokeWidth={STROKE}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="gauge-center">
          <span className={`gauge-score tnum ${toneClass}`}>{animated}</span>
          <span className="gauge-grade">{health.grade}</span>
        </div>
      </div>

      <div className="gauge-copy">
        <p className="eyebrow">Overall health</p>
        <p className={`gauge-verdict ${toneClass}`}>{health.verdict}</p>
        <p className="gauge-note">
          {issueCount === 0 ? (
            <>
              No issues found across {pageCount} {pageCount === 1 ? 'page' : 'pages'}.
            </>
          ) : (
            <>
              {issueCount} {issueCount === 1 ? 'issue' : 'issues'} found across{' '}
              {pageCount} {pageCount === 1 ? 'page' : 'pages'}. Expand any row below to
              see exactly what to fix.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
