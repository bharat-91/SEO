import axios, { AxiosInstance } from 'axios';
import { getConfig } from '../config/index.js';
import { getLogger } from './logger.js';

let httpClient: AxiosInstance;

export function initializeHttpClient(): AxiosInstance {
  const config = getConfig();
  const logger = getLogger();

  httpClient = axios.create({
    timeout: config.CRAWLER_TIMEOUT_MS,
    maxContentLength: config.CRAWLER_MAX_RESPONSE_BYTES,
    maxRedirects: 5,
    headers: {
      'User-Agent': 'Zensor SEO Audit Tool (+https://example.com/bot)',
    },
  });

  httpClient.interceptors.response.use(
    (response) => {
      logger.debug('HTTP request successful', {
        url: response.config.url,
        status: response.status,
        size: response.headers['content-length'],
      });
      return response;
    },
    (error) => {
      logger.debug('HTTP request failed', {
        url: error.config?.url,
        message: error.message,
        code: error.code,
      });
      throw error;
    }
  );

  return httpClient;
}

export function getHttpClient(): AxiosInstance {
  if (!httpClient) {
    return initializeHttpClient();
  }
  return httpClient;
}
