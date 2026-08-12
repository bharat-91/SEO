export interface MetricTileProps {
  label: string;
  value: string;
  /** Optional recommended window, e.g. title length 30–65 chars. */
  range?: { min: number; max: number; actual: number; scaleMax: number };
  hint?: string;
  tone?: 'good' | 'warn' | 'crit' | 'plain';
}

const TONE_CLASS = {
  good: 'sev-good',
  warn: 'sev-warning',
  crit: 'sev-critical',
  plain: '',
} as const;

/**
 * A single metric inside an expanded page row. When a recommended range is
 * supplied it also draws a small bar showing where the actual value falls
 * relative to that window — turning a bare number into something actionable.
 */
export function MetricTile({ label, value, range, hint, tone = 'plain' }: MetricTileProps) {
  const pct = (n: number) =>
    `${Math.min(100, Math.max(0, (n / (range?.scaleMax || 1)) * 100))}%`;

  return (
    <div className="dtile">
      <div className="dtile-top">
        <span className="dtile-label">{label}</span>
        <span className={`dtile-value tnum ${TONE_CLASS[tone]}`}>{value}</span>
      </div>

      {range && (
        <>
          <div className="range">
            <span
              className="range-ok"
              style={{ left: pct(range.min), width: pct(range.max - range.min) }}
            />
            <span className="range-marker" style={{ left: pct(range.actual) }} />
          </div>
          <p className="range-hint">
            Recommended {range.min}–{range.max}
          </p>
        </>
      )}

      {!range && hint && <p className="range-hint">{hint}</p>}
    </div>
  );
}
