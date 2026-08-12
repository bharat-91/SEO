/**
 * URL Normalization
 *
 * Rules:
 * - Lowercase protocol and hostname
 * - Remove default ports (80 for http, 443 for https)
 * - Strip hash fragment
 * - Resolve relative URLs to absolute
 * - Remove trailing slash (except root /)
 * - Keep query strings as-is
 */

export function normalize(urlString: string, baseUrl?: string): string {
  try {
    // Resolve relative URLs if baseUrl provided
    const absolute = baseUrl ? new URL(urlString, baseUrl).href : urlString;
    const url = new URL(absolute);

    // Lowercase protocol and hostname
    url.protocol = url.protocol.toLowerCase();
    url.hostname = url.hostname.toLowerCase();

    // Remove default ports
    if ((url.protocol === 'http:' && url.port === '80') ||
        (url.protocol === 'https:' && url.port === '443')) {
      url.port = '';
    }

    // Strip hash fragment
    url.hash = '';

    // Remove trailing slash (except for root /)
    if (url.pathname !== '/' && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
    }

    return url.toString();
  } catch {
    throw new Error(`Invalid URL: ${urlString}`);
  }
}

export function areSameNormalizedUrl(urlA: string, urlB: string): boolean {
  try {
    return normalize(urlA) === normalize(urlB);
  } catch {
    return false;
  }
}

export function deduplicateUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const url of urls) {
    try {
      const normalized = normalize(url);
      if (!seen.has(normalized)) {
        seen.add(normalized);
        result.push(url);
      }
    } catch {
      // Skip invalid URLs
    }
  }

  return result;
}
