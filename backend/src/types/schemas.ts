import { z } from 'zod';
import { isCrawlableUrl } from '../crawler/urlValidator.js';

export const StartAuditRequestSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .url('Invalid URL format')
    .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
      message: 'URL must use http or https protocol',
    })
    .refine(isCrawlableUrl, {
      message: 'Cannot audit private, loopback, or local network addresses',
    }),
});

export const AuditIdParamSchema = z.object({
  audit_id: z
    .string()
    .length(24, 'Invalid audit ID format')
    .regex(/^[a-f0-9]{24}$/, 'Invalid audit ID format'),
});

export type StartAuditRequest = z.infer<typeof StartAuditRequestSchema>;
export type AuditIdParam = z.infer<typeof AuditIdParamSchema>;
