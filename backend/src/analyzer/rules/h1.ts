import type { CheerioAPI } from 'cheerio';

export interface H1CheckResult {
  issues: string[];
  metric: number;
}

export function checkH1($: CheerioAPI): H1CheckResult {
  const h1Count = $('h1').length;
  const issues: string[] = [];

  if (h1Count === 0) {
    issues.push('H1_MISSING');
  } else if (h1Count > 1) {
    issues.push('H1_MULTIPLE');
  }

  return { issues, metric: h1Count };
}
