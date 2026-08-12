import * as cheerio from 'cheerio';
import { checkTitle } from './rules/title.js';
import { checkMetaDescription } from './rules/metaDescription.js';
import { checkH1 } from './rules/h1.js';
import { checkCanonical } from './rules/canonical.js';
import { checkNoindex } from './rules/noindex.js';
import { checkHttpStatus } from './rules/httpStatus.js';
import { checkPageSize } from './rules/pageSize.js';
import { countInternalLinks } from './rules/internalLinks.js';
import { DomainFilter } from '../crawler/domainFilter.js';
import type { PageMetrics } from '../types/audit.js';

export interface AnalyzePageInput {
  html: string;
  pageUrl: string;
  statusCode: number | null;
  responseSizeBytes: number;
  domainFilter: DomainFilter;
}

export interface AnalyzePageResult {
  issues: string[];
  metrics: PageMetrics;
}

export function analyzePage(input: AnalyzePageInput): AnalyzePageResult {
  const { html, pageUrl, statusCode, responseSizeBytes, domainFilter } = input;
  const $ = cheerio.load(html);

  const issues = new Set<string>();

  const titleResult = checkTitle($);
  titleResult.issues.forEach((i) => issues.add(i));

  const descResult = checkMetaDescription($);
  descResult.issues.forEach((i) => issues.add(i));

  const h1Result = checkH1($);
  h1Result.issues.forEach((i) => issues.add(i));

  const canonicalResult = checkCanonical($);
  canonicalResult.issues.forEach((i) => issues.add(i));

  const noindexResult = checkNoindex($);
  noindexResult.issues.forEach((i) => issues.add(i));

  const statusResult = checkHttpStatus(statusCode);
  statusResult.issues.forEach((i) => issues.add(i));

  const sizeResult = checkPageSize(responseSizeBytes);
  sizeResult.issues.forEach((i) => issues.add(i));

  const linksResult = countInternalLinks($, pageUrl, domainFilter);

  return {
    issues: Array.from(issues),
    metrics: {
      titleLength: titleResult.metric,
      metaDescriptionLength: descResult.metric,
      h1Count: h1Result.metric,
      canonical: canonicalResult.metric,
      noindex: noindexResult.metric,
      pageSizeKb: sizeResult.metric,
      internalLinkCount: linksResult.metric,
    },
  };
}
