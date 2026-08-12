import type { Audit } from './audit.js';

export interface AuditResponseDto {
  audit_id: string;
  url: string;
  status: Audit['status'];
  error?: string;
  summary?: Audit['summary'];
  pages: Audit['pages'];
  createdAt?: Date;
  updatedAt?: Date;
}

export function toAuditResponse(audit: Audit): AuditResponseDto {
  return {
    audit_id: audit._id!,
    url: audit.url,
    status: audit.status,
    error: audit.error,
    summary: audit.summary,
    pages: audit.pages,
    createdAt: audit.createdAt,
    updatedAt: audit.updatedAt,
  };
}
