import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { checkMetaDescription } from '../../../src/analyzer/rules/metaDescription.js';

describe('checkMetaDescription', () => {
  it('flags missing description', () => {
    const $ = cheerio.load('<html><head></head></html>');
    const result = checkMetaDescription($);
    expect(result.issues).toEqual(['META_DESCRIPTION_MISSING']);
  });

  it('flags description too short', () => {
    const $ = cheerio.load('<html><head><meta name="description" content="Too short"></head></html>');
    const result = checkMetaDescription($);
    expect(result.issues).toEqual(['META_DESCRIPTION_TOO_SHORT']);
  });

  it('accepts a valid description (70-160 chars)', () => {
    const validDescription = 'A'.repeat(100);
    const $ = cheerio.load(
      `<html><head><meta name="description" content="${validDescription}"></head></html>`
    );
    const result = checkMetaDescription($);
    expect(result.issues).toEqual([]);
  });

  it('flags description too long', () => {
    const longDescription = 'A'.repeat(200);
    const $ = cheerio.load(
      `<html><head><meta name="description" content="${longDescription}"></head></html>`
    );
    const result = checkMetaDescription($);
    expect(result.issues).toEqual(['META_DESCRIPTION_TOO_LONG']);
  });
});
