import { Router } from 'express';
import { getHealth, startAudit, getAudit } from '../controllers/auditController.js';
import { validateBody, validateParams } from '../middleware/validation.js';
import { StartAuditRequestSchema, AuditIdParamSchema } from '../types/schemas.js';

const router = Router();

router.get('/health', getHealth);

router.post('/audit', validateBody(StartAuditRequestSchema), startAudit);

router.get('/audit/:audit_id', validateParams(AuditIdParamSchema), getAudit);

export default router;
