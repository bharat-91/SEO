export type AuditStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface PageMetrics {
  titleLength: number;
  metaDescriptionLength: number;
  h1Count: number;
  canonical: string | null;
  noindex: boolean;
  pageSizeKb: number;
  internalLinkCount: number;
}

export interface PageResult {
  url: string;
  statusCode: number | null;
  fetchError?: string;
  issues: string[];
  metrics: PageMetrics;
}

export interface AuditSummary {
  totalPages: number;
  totalIssues: number;
  missingTitles: number;
  metaDescriptionIssues: number;
  h1Issues: number;
  canonicalIssues: number;
  noindexPages: number;
  non200Pages: number;
  pagesOverSizeLimit: number;
}

export interface Audit {
  audit_id: string;
  url: string;
  status: AuditStatus;
  error?: string;
  summary?: AuditSummary;
  pages: PageResult[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StartAuditRequest {
  url: string;
}

export interface StartAuditResponse {
  audit_id: string;
  status: AuditStatus;
}
