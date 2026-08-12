import type { CheerioAPI } from 'cheerio';
import { TITLE_MIN_LENGTH, TITLE_MAX_LENGTH } from '../constants.js';

export interface TitleCheckResult {
  issues: string[];
  metric: number;
}

export function checkTitle($: CheerioAPI): TitleCheckResult {
  const title = $('title').first().text().trim();
  const length = title.length;
  const issues: string[] = [];

  if (length === 0) {
    issues.push('TITLE_MISSING');
  } else if (length < TITLE_MIN_LENGTH) {
    issues.push('TITLE_TOO_SHORT');
  } else if (length > TITLE_MAX_LENGTH) {
    issues.push('TITLE_TOO_LONG');
  }

  return { issues, metric: length };
}
