import * as cheerio from 'cheerio';
import pLimit from 'p-limit';
import { fetchPage } from './fetcher.js';
import { detectNavigation } from './navigationDetector.js';
import { normalize, deduplicateUrls } from './urlNormalizer.js';
import { createDomainFilter, DomainFilter } from './domainFilter.js';
import { isCrawlableUrl } from './urlValidator.js';
import { getConfig } from '../config/index.js';
import { getLogger } from '../utils/logger.js';

export interface CrawledPage {
  url: string;
  html: string | null;
  statusCode: number | null;
  responseSizeBytes: number;
  fetchError?: string;
}

export interface CrawlResult {
  pages: CrawledPage[];
  domainFilter: DomainFilter;
  navigationFound: boolean;
}

/**
 * Crawl a website: homepage + primary navigation links only.
 * Never crawls recursively beyond the navigation-discovered pages.
 */
export async function crawlSite(inputUrl: string): Promise<CrawlResult> {
  const config = getConfig();
  const logger = getLogger();

  const homepageUrl = normalize(inputUrl);
  const domainFilter = createDomainFilter(homepageUrl);

  logger.info('Fetching homepage', { url: homepageUrl });
  const homepageFetch = await fetchPage(homepageUrl);

  const pages: CrawledPage[] = [
    {
      url: homepageUrl,
      html: homepageFetch.html ?? null,
      statusCode: homepageFetch.statusCode,
      responseSizeBytes: homepageFetch.responseSizeBytes,
      fetchError: homepageFetch.fetchError,
    },
  ];

  if (!homepageFetch.success || !homepageFetch.html) {
    logger.warn('Homepage fetch failed, skipping navigation discovery', {
      url: homepageUrl,
      error: homepageFetch.fetchError,
    });
    return { pages, domainFilter, navigationFound: false };
  }

  const $ = cheerio.load(homepageFetch.html);
  const navResult = detectNavigation($);

  if (!navResult.found || navResult.candidateHrefs.length === 0) {
    logger.info('No navigation detected on homepage', { url: homepageUrl });
    return { pages, domainFilter, navigationFound: false };
  }

  logger.info('Navigation detected', {
    url: homepageUrl,
    linkCount: navResult.candidateHrefs.length,
  });

  const navUrls = resolveNavigationUrls(navResult.candidateHrefs, homepageUrl, domainFilter, config.CRAWLER_MAX_NAV_LINKS);

  logger.info('Discovered internal navigation pages', { count: navUrls.length });

  const limit = pLimit(config.CRAWLER_CONCURRENCY);
  const navPages = await Promise.all(
    navUrls.map((url) =>
      limit(async () => {
        logger.info('Fetching navigation page', { url });
        const result = await fetchPage(url);
        return {
          url,
          html: result.html ?? null,
          statusCode: result.statusCode,
          responseSizeBytes: result.responseSizeBytes,
          fetchError: result.fetchError,
        } as CrawledPage;
      })
    )
  );

  pages.push(...navPages);

  return { pages, domainFilter, navigationFound: true };
}

function resolveNavigationUrls(
  hrefs: string[],
  baseUrl: string,
  domainFilter: DomainFilter,
  maxLinks: number
): string[] {
  const resolved: string[] = [];

  for (const href of hrefs) {
    try {
      const absolute = normalize(href, baseUrl);

      if (!isCrawlableUrl(absolute)) {
        continue;
      }

      if (!domainFilter.isSameDomain(absolute, baseUrl)) {
        continue;
      }

      // Don't re-add the homepage itself
      if (absolute === baseUrl) {
        continue;
      }

      resolved.push(absolute);
    } catch {
      // Skip invalid URLs
    }
  }

  const deduped = deduplicateUrls(resolved);
  return deduped.slice(0, maxLinks);
}
