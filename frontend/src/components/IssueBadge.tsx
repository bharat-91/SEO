import { getIssueDefinition } from '../constants/issues';

const CATEGORY_ICON: Record<string, string> = {
  title: '🏷️',
  meta_description: '📝',
  h1: '🔠',
  canonical: '⚓',
  robots: '🚫',
  http_status: '🌊',
  page_size: '📦',
  unknown: '⚠️',
};

export interface IssueBadgeProps {
  code: string;
  index?: number;
}

/**
 * Shows the human-readable issue message (per the spec's requirement that the
 * frontend display a label, not the raw code). The machine code stays available
 * in the tooltip for anyone cross-referencing the API response.
 */
export function IssueBadge({ code, index = 0 }: IssueBadgeProps) {
  const { message, severity, category } = getIssueDefinition(code);

  return (
    <span
      className={`issue-chip is-${severity}`}
      style={{ ['--i' as string]: index }}
      title={code}
    >
      <span aria-hidden="true">{CATEGORY_ICON[category] ?? CATEGORY_ICON.unknown}</span>
      {message}
    </span>
  );
}
