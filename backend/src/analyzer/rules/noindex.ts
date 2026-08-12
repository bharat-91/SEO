import type { CheerioAPI } from 'cheerio';

export interface NoindexCheckResult {
  issues: string[];
  metric: boolean;
}

export function checkNoindex($: CheerioAPI): NoindexCheckResult {
  const robotsMeta = ($('meta[name="robots"]').first().attr('content') || '').toLowerCase();
  const xRobotsMeta = ($('meta[name="x-robots-tag"]').first().attr('content') || '').toLowerCase();
  const combined = `${robotsMeta} ${xRobotsMeta}`;
  const isNoindex = combined.includes('noindex');
  const issues: string[] = [];

  if (isNoindex) {
    issues.push('NOINDEX');
  }

  return { issues, metric: isNoindex };
}
