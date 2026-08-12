import { getApiClient } from './client';
import type { StartAuditRequest, StartAuditResponse, Audit } from '../types/audit';

export const auditApi = {
  async startAudit(request: StartAuditRequest): Promise<StartAuditResponse> {
    const client = getApiClient();
    const response = await client.post<StartAuditResponse>('/audit', request);
    return response.data;
  },

  async getAudit(auditId: string): Promise<Audit> {
    const client = getApiClient();
    const response = await client.get<Audit>(`/audit/${auditId}`);
    return response.data;
  },

  async getHealth(): Promise<{ status: string }> {
    const client = getApiClient();
    const response = await client.get<{ status: string }>('/health');
    return response.data;
  },
};
