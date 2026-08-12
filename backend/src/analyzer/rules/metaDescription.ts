import type { CheerioAPI } from 'cheerio';
import { META_DESCRIPTION_MIN_LENGTH, META_DESCRIPTION_MAX_LENGTH } from '../constants.js';

export interface MetaDescriptionCheckResult {
  issues: string[];
  metric: number;
}

export function checkMetaDescription($: CheerioAPI): MetaDescriptionCheckResult {
  const description = ($('meta[name="description"]').first().attr('content') || '').trim();
  const length = description.length;
  const issues: string[] = [];

  if (length === 0) {
    issues.push('META_DESCRIPTION_MISSING');
  } else if (length < META_DESCRIPTION_MIN_LENGTH) {
    issues.push('META_DESCRIPTION_TOO_SHORT');
  } else if (length > META_DESCRIPTION_MAX_LENGTH) {
    issues.push('META_DESCRIPTION_TOO_LONG');
  }

  return { issues, metric: length };
}
