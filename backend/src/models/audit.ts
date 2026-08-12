import mongoose, { Schema, Document } from 'mongoose';
import type { Audit, PageResult, AuditSummary } from '../types/audit.js';

type AuditDocument = Document & Omit<Audit, '_id'>;

const pageResultSchema = new Schema<PageResult>(
  {
    url: { type: String, required: true },
    statusCode: { type: Number, default: null },
    fetchError: { type: String },
    issues: { type: [String], default: [] },
    metrics: {
      titleLength: { type: Number, required: true },
      metaDescriptionLength: { type: Number, required: true },
      h1Count: { type: Number, required: true },
      canonical: { type: String, default: null },
      noindex: { type: Boolean, required: true },
      pageSizeKb: { type: Number, required: true },
      internalLinkCount: { type: Number, required: true },
    },
  },
  { _id: false }
);

const auditSummarySchema = new Schema<AuditSummary>(
  {
    totalPages: { type: Number, required: true },
    totalIssues: { type: Number, required: true },
    missingTitles: { type: Number, required: true },
    metaDescriptionIssues: { type: Number, required: true },
    h1Issues: { type: Number, required: true },
    canonicalIssues: { type: Number, required: true },
    noindexPages: { type: Number, required: true },
    non200Pages: { type: Number, required: true },
    pagesOverSizeLimit: { type: Number, required: true },
  },
  { _id: false }
);

const auditSchema = new Schema<AuditDocument>(
  {
    url: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
      required: true,
    },
    error: { type: String },
    summary: { type: auditSummarySchema },
    pages: { type: [pageResultSchema], default: [] },
  },
  {
    timestamps: true,
    collection: 'audits',
  }
);

// Index for queries
auditSchema.index({ status: 1 });
auditSchema.index({ createdAt: -1 });

export const AuditModel = mongoose.model<AuditDocument>('Audit', auditSchema);

export default AuditModel;
