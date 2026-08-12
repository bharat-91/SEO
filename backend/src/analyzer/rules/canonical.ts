import type { CheerioAPI } from 'cheerio';

export interface CanonicalCheckResult {
  issues: string[];
  metric: string | null;
}

export function checkCanonical($: CheerioAPI): CanonicalCheckResult {
  const canonical = $('link[rel="canonical"]').first().attr('href') || null;
  const issues: string[] = [];

  if (!canonical) {
    issues.push('CANONICAL_MISSING');
  }

  return { issues, metric: canonical };
}
