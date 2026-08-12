import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/auditService.js';
import type { StartAuditRequest, AuditIdParam } from '../types/schemas.js';
import { toAuditResponse } from '../types/dto.js';

export async function getHealth(
  _req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  res.json({ status: 'ok' });
}

export async function startAudit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { url } = req.body as StartAuditRequest;
    const audit = await auditService.startAudit(url);

    res.status(202).json({
      audit_id: audit._id,
      status: audit.status,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAudit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { audit_id } = req.params as AuditIdParam;
    const audit = await auditService.getAudit(audit_id);

    res.json(toAuditResponse(audit));
  } catch (error) {
    next(error);
  }
}
