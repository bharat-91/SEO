import { getHttpClient } from '../utils/httpClient.js';
import { getLogger } from '../utils/logger.js';

export interface FetchResult {
  success: boolean;
  html?: string;
  statusCode: number | null;
  responseSizeBytes: number;
  fetchError?: string;
}

/**
 * Fetch a single URL, tolerant of failures.
 * Never throws - all errors are captured in the result.
 */
export async function fetchPage(url: string): Promise<FetchResult> {
  const client = getHttpClient();
  const logger = getLogger();

  try {
    const response = await client.get<string>(url, {
      responseType: 'text',
      validateStatus: () => true, // Don't throw on non-2xx; we record it
    });

    const contentType = String(response.headers['content-type'] || '');
    const isHtml = contentType.includes('text/html') || contentType.includes('application/xhtml+xml');

    const html = typeof response.data === 'string' ? response.data : '';
    const responseSizeBytes = Buffer.byteLength(html, 'utf-8');

    if (!isHtml) {
      logger.warn('Non-HTML response received', { url, contentType });
      return {
        success: false,
        statusCode: response.status,
        responseSizeBytes,
        fetchError: `Non-HTML content type: ${contentType || 'unknown'}`,
      };
    }

    return {
      success: true,
      html,
      statusCode: response.status,
      responseSizeBytes,
    };
  } catch (error: unknown) {
    const message = describeFetchError(error);
    logger.warn('Failed to fetch page', { url, message });

    return {
      success: false,
      statusCode: extractStatusCode(error),
      responseSizeBytes: 0,
      fetchError: message,
    };
  }
}

function extractStatusCode(error: unknown): number | null {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as any).response;
    if (response && typeof response.status === 'number') {
      return response.status;
    }
  }
  return null;
}

function describeFetchError(error: unknown): string {
  if (error && typeof error === 'object') {
    const err = error as any;
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      return 'Request timed out';
    }
    if (err.code === 'ENOTFOUND') {
      return 'DNS lookup failed';
    }
    if (err.code === 'ECONNREFUSED') {
      return 'Connection refused';
    }
    if (err.code === 'CERT_HAS_EXPIRED' || err.code?.startsWith('ERR_TLS')) {
      return 'SSL/TLS certificate error';
    }
    if (err.message?.includes('maxContentLength')) {
      return 'Response exceeded maximum allowed size';
    }
    if (err.message) {
      return err.message;
    }
  }
  return 'Unknown fetch error';
}
