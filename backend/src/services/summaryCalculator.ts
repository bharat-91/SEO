import type { PageResult, AuditSummary } from '../types/audit.js';

export function calculateSummary(pages: PageResult[]): AuditSummary {
  const summary: AuditSummary = {
    totalPages: pages.length,
    totalIssues: 0,
    missingTitles: 0,
    metaDescriptionIssues: 0,
    h1Issues: 0,
    canonicalIssues: 0,
    noindexPages: 0,
    non200Pages: 0,
    pagesOverSizeLimit: 0,
  };

  for (const page of pages) {
    summary.totalIssues += page.issues.length;

    if (page.issues.includes('TITLE_MISSING')) {
      summary.missingTitles += 1;
    }
    if (
      page.issues.includes('META_DESCRIPTION_MISSING') ||
      page.issues.includes('META_DESCRIPTION_TOO_SHORT') ||
      page.issues.includes('META_DESCRIPTION_TOO_LONG')
    ) {
      summary.metaDescriptionIssues += 1;
    }
    if (page.issues.includes('H1_MISSING') || page.issues.includes('H1_MULTIPLE')) {
      summary.h1Issues += 1;
    }
    if (page.issues.includes('CANONICAL_MISSING')) {
      summary.canonicalIssues += 1;
    }
    if (page.issues.includes('NOINDEX')) {
      summary.noindexPages += 1;
    }
    if (page.issues.includes('NON_200')) {
      summary.non200Pages += 1;
    }
    if (page.issues.includes('PAGE_SIZE_TOO_LARGE')) {
      summary.pagesOverSizeLimit += 1;
    }
  }

  return summary;
}
