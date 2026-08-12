import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { countInternalLinks } from '../../../src/analyzer/rules/internalLinks.js';
import { createDomainFilter } from '../../../src/crawler/domainFilter.js';

describe('countInternalLinks', () => {
  it('counts only same-domain links', () => {
    const html = `
      <html><body>
        <a href="/about">About</a>
        <a href="https://example.com/contact">Contact</a>
        <a href="https://external.com/page">External</a>
      </body></html>
    `;
    const $ = cheerio.load(html);
    const domainFilter = createDomainFilter('https://example.com');

    const result = countInternalLinks($, 'https://example.com/', domainFilter);
    expect(result.metric).toBe(2);
  });

  it('returns 0 when there are no links', () => {
    const $ = cheerio.load('<html><body><p>No links here</p></body></html>');
    const domainFilter = createDomainFilter('https://example.com');

    const result = countInternalLinks($, 'https://example.com/', domainFilter);
    expect(result.metric).toBe(0);
  });

  it('ignores links with missing or invalid hrefs', () => {
    const html = `
      <html><body>
        <a>No href</a>
        <a href="">Empty href</a>
        <a href="/valid">Valid</a>
      </body></html>
    `;
    const $ = cheerio.load(html);
    const domainFilter = createDomainFilter('https://example.com');

    const result = countInternalLinks($, 'https://example.com/', domainFilter);
    expect(result.metric).toBe(1);
  });
});
