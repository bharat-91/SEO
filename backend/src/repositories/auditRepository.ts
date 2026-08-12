import { AuditModel } from '../models/audit.js';
import { Audit, AuditStatus } from '../types/audit.js';
import { NotFoundError } from '../utils/errors.js';

export class AuditRepository {
  async createAudit(url: string): Promise<Audit> {
    const audit = new AuditModel({
      url,
      status: 'PENDING',
      pages: [],
    });

    const saved = await audit.save();
    return this.toAuditDto(saved);
  }

  async getAuditById(auditId: string): Promise<Audit> {
    const audit = await AuditModel.findById(auditId);

    if (!audit) {
      throw new NotFoundError('Audit not found.');
    }

    return this.toAuditDto(audit);
  }

  async updateAuditStatus(auditId: string, status: AuditStatus, error?: string): Promise<Audit> {
    const updateData: any = { status };
    if (error) {
      updateData.error = error;
    }

    const audit = await AuditModel.findByIdAndUpdate(auditId, updateData, {
      new: true,
    });

    if (!audit) {
      throw new NotFoundError('Audit not found.');
    }

    return this.toAuditDto(audit);
  }

  async updateAuditResults(
    auditId: string,
    pages: any[],
    summary: any
  ): Promise<Audit> {
    const audit = await AuditModel.findByIdAndUpdate(
      auditId,
      {
        pages,
        summary,
        status: 'COMPLETED',
      },
      { new: true }
    );

    if (!audit) {
      throw new NotFoundError('Audit not found.');
    }

    return this.toAuditDto(audit);
  }

  private toAuditDto(doc: any): Audit {
    return {
      _id: doc._id.toString(),
      url: doc.url,
      status: doc.status,
      error: doc.error,
      summary: doc.summary,
      pages: doc.pages || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}

export const auditRepository = new AuditRepository();
