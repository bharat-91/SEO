import { useCountUp } from '../hooks/useCountUp';

export type MetricTone = 'neutral' | 'flagged' | 'critical';

export interface MetricCardProps {
  label: string;
  value: number;
  icon: string;
  /** Tone applied when value > 0. A zero value always renders muted. */
  tone?: MetricTone;
  index?: number;
}

const ACCENT: Record<MetricTone, string> = {
  neutral: 'var(--c-aqua)',
  flagged: 'var(--c-warning-solid)',
  critical: 'var(--c-critical-solid)',
};

export function MetricCard({
  label,
  value,
  icon,
  tone = 'neutral',
  index = 0,
}: MetricCardProps) {
  const animated = useCountUp(value);
  const stateClass = value === 0 ? 'is-zero' : `is-${tone}`;

  return (
    <div
      className={`metric rise ${stateClass}`}
      style={{
        ['--i' as string]: index,
        ['--metric-accent' as string]: value === 0 ? 'var(--c-line-hi)' : ACCENT[tone],
      }}
    >
      <span className="metric-icon" aria-hidden="true">
        {icon}
      </span>
      <div className="metric-body">
        <p className="metric-label">{label}</p>
        <p className="metric-value tnum">{animated}</p>
      </div>
    </div>
  );
}
