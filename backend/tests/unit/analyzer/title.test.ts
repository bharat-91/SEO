import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { checkTitle } from '../../../src/analyzer/rules/title.js';

describe('checkTitle', () => {
  it('flags missing title', () => {
    const $ = cheerio.load('<html><head></head><body></body></html>');
    const result = checkTitle($);
    expect(result.issues).toEqual(['TITLE_MISSING']);
    expect(result.metric).toBe(0);
  });

  it('flags title too short', () => {
    const $ = cheerio.load('<html><head><title>Hi</title></head></html>');
    const result = checkTitle($);
    expect(result.issues).toEqual(['TITLE_TOO_SHORT']);
  });

  it('accepts a valid title (30-65 chars)', () => {
    const $ = cheerio.load(
      '<html><head><title>This is a perfectly valid SEO title</title></head></html>'
    );
    const result = checkTitle($);
    expect(result.issues).toEqual([]);
  });

  it('flags title too long', () => {
    const $ = cheerio.load(`<html><head><title>${'A'.repeat(70)}</title></head></html>`);
    const result = checkTitle($);
    expect(result.issues).toEqual(['TITLE_TOO_LONG']);
  });
});
