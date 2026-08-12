import { useState, useCallback } from 'react';
import { auditApi } from '../api/endpoints';
import type { Audit, StartAuditRequest } from '../types/audit';

export interface UseAuditState {
  audit: Audit | null;
  loading: boolean;
  error: string | null;
}

export function useAudit() {
  const [state, setState] = useState<UseAuditState>({
    audit: null,
    loading: false,
    error: null,
  });

  const startAudit = useCallback(
    async (request: StartAuditRequest) => {
      setState({ audit: null, loading: true, error: null });

      try {
        const response = await auditApi.startAudit(request);
        setState({
          audit: {
            ...response,
            url: request.url,
            pages: [],
          },
          loading: false,
          error: null,
        });
        return response.audit_id;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to start audit.';
        setState({
          audit: null,
          loading: false,
          error: errorMessage,
        });
        throw error;
      }
    },
    []
  );

  const fetchAudit = useCallback(async (auditId: string) => {
    try {
      const audit = await auditApi.getAudit(auditId);
      setState((prev) => ({
        ...prev,
        audit,
        error: null,
      }));
      return audit;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch audit.';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    ...state,
    startAudit,
    fetchAudit,
    clearError,
  };
}
