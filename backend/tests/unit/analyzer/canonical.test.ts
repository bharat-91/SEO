import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { checkCanonical } from '../../../src/analyzer/rules/canonical.js';

describe('checkCanonical', () => {
  it('flags missing canonical tag', () => {
    const $ = cheerio.load('<html><head></head></html>');
    const result = checkCanonical($);
    expect(result.issues).toEqual(['CANONICAL_MISSING']);
    expect(result.metric).toBeNull();
  });

  it('accepts a present canonical tag', () => {
    const $ = cheerio.load(
      '<html><head><link rel="canonical" href="https://example.com/page"></head></html>'
    );
    const result = checkCanonical($);
    expect(result.issues).toEqual([]);
    expect(result.metric).toBe('https://example.com/page');
  });
});
