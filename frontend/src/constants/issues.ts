export const ISSUE_DEFINITIONS: Record<
  string,
  { message: string; severity: 'critical' | 'warning'; category: string }
> = {
  TITLE_MISSING: {
    message: 'Page is missing a title tag.',
    severity: 'critical',
    category: 'title',
  },
  TITLE_TOO_SHORT: {
    message: 'Title is shorter than 30 characters.',
    severity: 'warning',
    category: 'title',
  },
  TITLE_TOO_LONG: {
    message: 'Title is longer than 65 characters.',
    severity: 'warning',
    category: 'title',
  },

  META_DESCRIPTION_MISSING: {
    message: 'Page is missing a meta description tag.',
    severity: 'warning',
    category: 'meta_description',
  },
  META_DESCRIPTION_TOO_SHORT: {
    message: 'Meta description is shorter than 70 characters.',
    severity: 'warning',
    category: 'meta_description',
  },
  META_DESCRIPTION_TOO_LONG: {
    message: 'Meta description is longer than 160 characters.',
    severity: 'warning',
    category: 'meta_description',
  },

  H1_MISSING: {
    message: 'Page has no H1 tag.',
    severity: 'critical',
    category: 'h1',
  },
  H1_MULTIPLE: {
    message: 'Page has multiple H1 tags.',
    severity: 'critical',
    category: 'h1',
  },

  CANONICAL_MISSING: {
    message: 'Page is missing a canonical tag.',
    severity: 'warning',
    category: 'canonical',
  },

  NOINDEX: {
    message: 'Page has noindex robots directive.',
    severity: 'critical',
    category: 'robots',
  },

  NON_200: {
    message: 'Page returned a non-2xx HTTP status code.',
    severity: 'critical',
    category: 'http_status',
  },

  PAGE_SIZE_TOO_LARGE: {
    message: 'Page is larger than 2 MB.',
    severity: 'warning',
    category: 'page_size',
  },
};

export function getIssueDefinition(code: string) {
  return ISSUE_DEFINITIONS[code] || { message: code, severity: 'warning', category: 'unknown' };
}
