import { getIssueDefinition } from '../constants/issues';
import type { PageResult } from '../types/audit';

export type Severity = 'critical' | 'warning' | 'healthy';

/**
 * Weighted penalty applied per issue found on a page.
 * Critical issues (missing H1, noindex, non-200…) hurt far more than
 * advisory ones (description a bit short).
 */
const PENALTY = {
  critical: 12,
  warning: 4,
} as const;

/** Worst-case penalty a single page can contribute, so one catastrophic
 *  page can't drag a large site's score to zero on its own. */
const MAX_PAGE_PENALTY = 45;

export interface HealthResult {
  /** 0–100, higher is better. */
  score: number;
  grade: string;
  severity: Severity;
  verdict: string;
}

/**
 * Derives an overall health score from the real per-page issue data returned
 * by the API. This is a presentation-layer summary — it invents no data, it
 * only weights and averages the issues the analyzer actually found.
 *
 * Each page starts at 100, loses a weighted amount per issue (capped), and
 * the site score is the mean across pages.
 */
export function computeHealth(pages: PageResult[]): HealthResult {
  if (pages.length === 0) {
    return {
      score: 0,
      grade: '—',
      severity: 'healthy',
      verdict: 'No pages analyzed',
    };
  }

  const total = pages.reduce((sum, page) => {
    const penalty = page.issues.reduce((acc, code) => {
      const { severity } = getIssueDefinition(code);
      return acc + (severity === 'critical' ? PENALTY.critical : PENALTY.warning);
    }, 0);

    return sum + Math.max(0, 100 - Math.min(penalty, MAX_PAGE_PENALTY));
  }, 0);

  const score = Math.round(total / pages.length);
  return { score, ...describeScore(score) };
}

function describeScore(score: number): Omit<HealthResult, 'score'> {
  if (score >= 90) {
    return {
      grade: 'Excellent',
      severity: 'healthy',
      verdict: 'Smooth sailing',
    };
  }
  if (score >= 75) {
    return {
      grade: 'Good',
      severity: 'healthy',
      verdict: 'Seaworthy, minor repairs',
    };
  }
  if (score >= 55) {
    return {
      grade: 'Fair',
      severity: 'warning',
      verdict: 'Taking on water',
    };
  }
  return {
    grade: 'Poor',
    severity: 'critical',
    verdict: 'All hands on deck',
  };
}

/** Worst severity present on a page — drives its row accent and pill. */
export function getPageSeverity(issues: string[]): Severity {
  if (issues.length === 0) return 'healthy';
  const hasCritical = issues.some(
    (code) => getIssueDefinition(code).severity === 'critical'
  );
  return hasCritical ? 'critical' : 'warning';
}
