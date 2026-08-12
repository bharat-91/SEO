import { parse } from 'tldjs';

/**
 * Domain Filtering
 *
 * Ensures that crawled links stay within the same registrable domain.
 * For example:
 * - example.com and www.example.com are the same domain
 * - example.com and api.example.com are the same domain
 * - example.com and other.com are different domains
 */

export class DomainFilter {
  private baseUrl: string;
  private baseDomain: string | null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.baseDomain = this.extractDomain(baseUrl);
  }

  /**
   * Check if a URL belongs to the same registrable domain as the base URL.
   * Reuses the cached base domain when comparing against the site's own base URL.
   */
  isSameDomain(url: string, pageUrl: string = this.baseUrl): boolean {
    try {
      const urlDomain = this.extractDomain(url);
      const pageDomain = pageUrl === this.baseUrl ? this.baseDomain : this.extractDomain(pageUrl);

      if (!urlDomain || !pageDomain) {
        return false;
      }

      return urlDomain === pageDomain;
    } catch {
      return false;
    }
  }

  /**
   * Extract registrable domain from a URL
   * e.g., https://www.example.co.uk/path -> example.co.uk
   */
  private extractDomain(url: string): string | null {
    try {
      const parsed = new URL(url);
      const domain = parse(parsed.hostname).domain;
      return domain || null;
    } catch {
      return null;
    }
  }

  /**
   * Filter an array of URLs to only same-domain URLs
   */
  filterSameDomain(urls: string[]): string[] {
    return urls.filter((url) => this.isSameDomain(url));
  }
}

/**
 * Create a domain filter for a given URL
 */
export function createDomainFilter(baseUrl: string): DomainFilter {
  return new DomainFilter(baseUrl);
}
