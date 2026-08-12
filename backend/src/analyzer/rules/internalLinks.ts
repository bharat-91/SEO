import type { CheerioAPI } from 'cheerio';
import { DomainFilter } from '../../crawler/domainFilter.js';

export interface InternalLinksCheckResult {
  metric: number;
}

export function countInternalLinks(
  $: CheerioAPI,
  pageUrl: string,
  domainFilter: DomainFilter
): InternalLinksCheckResult {
  let count = 0;

  $('a').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;

    try {
      const resolved = new URL(href, pageUrl).href;
      if (domainFilter.isSameDomain(resolved, pageUrl)) {
        count += 1;
      }
    } catch {
      // Skip invalid hrefs
    }
  });

  return { metric: count };
}
