import { MAX_PAGE_SIZE_KB } from '../constants.js';

export interface PageSizeCheckResult {
  issues: string[];
  metric: number;
}

export function checkPageSize(sizeBytes: number): PageSizeCheckResult {
  const sizeKb = Math.ceil(sizeBytes / 1024);
  const issues: string[] = [];

  if (sizeKb > MAX_PAGE_SIZE_KB) {
    issues.push('PAGE_SIZE_TOO_LARGE');
  }

  return { issues, metric: sizeKb };
}
