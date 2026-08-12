export type IssueSeverity = 'critical' | 'warning';

export interface IssueDefinition {
  code: string;
  message: string;
  category: string;
  severity: IssueSeverity;
}

export const ISSUE_DEFINITIONS: Record<string, IssueDefinition> = {
  TITLE_MISSING: {
    code: 'TITLE_MISSING',
    message: 'Page is missing a title tag.',
    category: 'title',
    severity: 'critical',
  },
  TITLE_TOO_SHORT: {
    code: 'TITLE_TOO_SHORT',
    message: 'Title is shorter than 30 characters.',
    category: 'title',
    severity: 'warning',
  },
  TITLE_TOO_LONG: {
    code: 'TITLE_TOO_LONG',
    message: 'Title is longer than 65 characters.',
    category: 'title',
    severity: 'warning',
  },

  META_DESCRIPTION_MISSING: {
    code: 'META_DESCRIPTION_MISSING',
    message: 'Page is missing a meta description tag.',
    category: 'meta_description',
    severity: 'warning',
  },
  META_DESCRIPTION_TOO_SHORT: {
    code: 'META_DESCRIPTION_TOO_SHORT',
    message: 'Meta description is shorter than 70 characters.',
    category: 'meta_description',
    severity: 'warning',
  },
  META_DESCRIPTION_TOO_LONG: {
    code: 'META_DESCRIPTION_TOO_LONG',
    message: 'Meta description is longer than 160 characters.',
    category: 'meta_description',
    severity: 'warning',
  },

  H1_MISSING: {
    code: 'H1_MISSING',
    message: 'Page has no H1 tag.',
    category: 'h1',
    severity: 'critical',
  },
  H1_MULTIPLE: {
    code: 'H1_MULTIPLE',
    message: 'Page has multiple H1 tags.',
    category: 'h1',
    severity: 'critical',
  },

  CANONICAL_MISSING: {
    code: 'CANONICAL_MISSING',
    message: 'Page is missing a canonical tag.',
    category: 'canonical',
    severity: 'warning',
  },

  NOINDEX: {
    code: 'NOINDEX',
    message: 'Page has noindex robots directive.',
    category: 'robots',
    severity: 'critical',
  },

  NON_200: {
    code: 'NON_200',
    message: 'Page returned a non-2xx HTTP status code.',
    category: 'http_status',
    severity: 'critical',
  },

  PAGE_SIZE_TOO_LARGE: {
    code: 'PAGE_SIZE_TOO_LARGE',
    message: 'Page is larger than 2 MB.',
    category: 'page_size',
    severity: 'warning',
  },
};

export function getIssueDefinition(code: string): IssueDefinition {
  return (
    ISSUE_DEFINITIONS[code] || {
      code,
      message: code,
      category: 'unknown',
      severity: 'warning',
    }
  );
}
