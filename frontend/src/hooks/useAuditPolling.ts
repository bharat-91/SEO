import { useEffect, useRef, useCallback } from 'react';
import { POLLING_INTERVAL_MS, POLLING_MAX_ATTEMPTS } from '../constants/ui';

export interface UseAuditPollingOptions {
  auditId: string | null;
  enabled?: boolean;
  interval?: number;
  maxAttempts?: number;
  onError?: (error: Error) => void;
  onFetch?: (stop: () => void) => Promise<void>;
}

export function useAuditPolling({
  auditId,
  enabled = true,
  interval = POLLING_INTERVAL_MS,
  maxAttempts = POLLING_MAX_ATTEMPTS,
  onError,
  onFetch,
}: UseAuditPollingOptions) {
  const attemptCount = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stoppedRef = useRef(false);

  const stopPolling = useCallback(() => {
    stoppedRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    attemptCount.current = 0;
  }, []);

  useEffect(() => {
    if (!auditId || !enabled || !onFetch) {
      return;
    }

    stoppedRef.current = false;

    const poll = async () => {
      attemptCount.current += 1;

      try {
        await onFetch(stopPolling);

        if (stoppedRef.current) {
          return;
        }

        if (attemptCount.current >= maxAttempts) {
          stopPolling();
          onError?.(new Error('Polling timed out.'));
          return;
        }

        timeoutRef.current = setTimeout(poll, interval);
      } catch (error) {
        stopPolling();
        onError?.(error instanceof Error ? error : new Error(String(error)));
      }
    };

    poll();

    return () => {
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditId, enabled]);

  return { stopPolling };
}
