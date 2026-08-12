import { describe, it, expect } from 'vitest';
import { normalize, areSameNormalizedUrl, deduplicateUrls } from '../../../src/crawler/urlNormalizer.js';

describe('urlNormalizer', () => {
  describe('normalize', () => {
    it('lowercases protocol and hostname', () => {
      expect(normalize('HTTPS://Example.COM')).toBe('https://example.com/');
    });

    it('removes default https port', () => {
      expect(normalize('https://example.com:443/page')).toBe('https://example.com/page');
    });

    it('removes default http port', () => {
      expect(normalize('http://example.com:80/page')).toBe('http://example.com/page');
    });

    it('keeps non-default ports', () => {
      expect(normalize('https://example.com:8443/page')).toBe('https://example.com:8443/page');
    });

    it('strips hash fragment', () => {
      expect(normalize('https://example.com/page#section')).toBe('https://example.com/page');
    });

    it('removes trailing slash on non-root path', () => {
      expect(normalize('https://example.com/page/')).toBe('https://example.com/page');
    });

    it('keeps root path as-is', () => {
      expect(normalize('https://example.com/')).toBe('https://example.com/');
    });

    it('preserves query strings', () => {
      expect(normalize('https://example.com/page?id=1')).toBe('https://example.com/page?id=1');
    });

    it('resolves relative URLs against a base', () => {
      expect(normalize('/about', 'https://example.com/products/item')).toBe(
        'https://example.com/about'
      );
    });

    it('resolves parent-relative URLs against a base', () => {
      expect(normalize('../about', 'https://example.com/products/item')).toBe(
        'https://example.com/about'
      );
    });

    it('throws on invalid URLs', () => {
      expect(() => normalize('not a url')).toThrow();
    });
  });

  describe('areSameNormalizedUrl', () => {
    it('treats https://example.com and https://example.com/ as identical', () => {
      expect(areSameNormalizedUrl('https://example.com', 'https://example.com/')).toBe(true);
    });

    it('treats https://example.com/#section and https://example.com/ as identical', () => {
      expect(areSameNormalizedUrl('https://example.com/#section', 'https://example.com/')).toBe(
        true
      );
    });

    it('treats different paths as different', () => {
      expect(areSameNormalizedUrl('https://example.com/a', 'https://example.com/b')).toBe(false);
    });

    it('returns false for invalid URLs', () => {
      expect(areSameNormalizedUrl('not-a-url', 'https://example.com')).toBe(false);
    });
  });

  describe('deduplicateUrls', () => {
    it('removes duplicate URLs after normalization', () => {
      const urls = [
        'https://example.com',
        'https://example.com/',
        'https://example.com/#top',
      ];
      expect(deduplicateUrls(urls)).toHaveLength(1);
    });

    it('keeps distinct URLs', () => {
      const urls = ['https://example.com/a', 'https://example.com/b'];
      expect(deduplicateUrls(urls)).toHaveLength(2);
    });

    it('skips invalid URLs without throwing', () => {
      const urls = ['https://example.com/a', 'not-a-url'];
      expect(deduplicateUrls(urls)).toEqual(['https://example.com/a']);
    });
  });
});
