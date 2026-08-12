import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { checkNoindex } from '../../../src/analyzer/rules/noindex.js';

describe('checkNoindex', () => {
  it('detects noindex directive', () => {
    const $ = cheerio.load(
      '<html><head><meta name="robots" content="noindex, follow"></head></html>'
    );
    const result = checkNoindex($);
    expect(result.issues).toEqual(['NOINDEX']);
    expect(result.metric).toBe(true);
  });

  it('detects noindex via x-robots-tag meta', () => {
    const $ = cheerio.load(
      '<html><head><meta name="x-robots-tag" content="noindex"></head></html>'
    );
    const result = checkNoindex($);
    expect(result.issues).toEqual(['NOINDEX']);
  });

  it('does not flag pages with index, follow', () => {
    const $ = cheerio.load(
      '<html><head><meta name="robots" content="index, follow"></head></html>'
    );
    const result = checkNoindex($);
    expect(result.issues).toEqual([]);
    expect(result.metric).toBe(false);
  });

  it('does not flag pages with no robots meta tag', () => {
    const $ = cheerio.load('<html><head></head></html>');
    const result = checkNoindex($);
    expect(result.issues).toEqual([]);
  });
});
