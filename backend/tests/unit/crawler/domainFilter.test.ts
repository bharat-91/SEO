import { describe, it, expect } from 'vitest';
import { createDomainFilter } from '../../../src/crawler/domainFilter.js';

describe('domainFilter', () => {
  it('treats the same hostname as same-domain', () => {
    const filter = createDomainFilter('https://example.com');
    expect(filter.isSameDomain('https://example.com/about')).toBe(true);
  });

  it('treats subdomains as same registrable domain', () => {
    const filter = createDomainFilter('https://www.example.com');
    expect(filter.isSameDomain('https://api.example.com/data')).toBe(true);
  });

  it('rejects external domains', () => {
    const filter = createDomainFilter('https://example.com');
    expect(filter.isSameDomain('https://other.com/page')).toBe(false);
  });

  it('rejects invalid URLs', () => {
    const filter = createDomainFilter('https://example.com');
    expect(filter.isSameDomain('not-a-url')).toBe(false);
  });

  it('filterSameDomain keeps only matching domains', () => {
    const filter = createDomainFilter('https://example.com');
    const urls = [
      'https://example.com/a',
      'https://external.com/b',
      'https://www.example.com/c',
    ];
    expect(filter.filterSameDomain(urls)).toEqual([
      'https://example.com/a',
      'https://www.example.com/c',
    ]);
  });
});
