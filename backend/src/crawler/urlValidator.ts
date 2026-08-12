/**
 * Shared URL safety validation used both for incoming API requests
 * and for filtering crawl targets (defense in depth).
 */

const PRIVATE_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\.0\.0\.0$/,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
];

export function isPrivateHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return PRIVATE_HOSTNAME_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function isCrawlableUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    if (isPrivateHostname(parsed.hostname)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
