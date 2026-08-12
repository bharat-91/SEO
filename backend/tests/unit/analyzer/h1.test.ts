import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { checkH1 } from '../../../src/analyzer/rules/h1.js';

describe('checkH1', () => {
  it('flags missing H1', () => {
    const $ = cheerio.load('<html><body><p>No heading</p></body></html>');
    const result = checkH1($);
    expect(result.issues).toEqual(['H1_MISSING']);
    expect(result.metric).toBe(0);
  });

  it('accepts exactly one H1', () => {
    const $ = cheerio.load('<html><body><h1>Title</h1></body></html>');
    const result = checkH1($);
    expect(result.issues).toEqual([]);
    expect(result.metric).toBe(1);
  });

  it('flags multiple H1s', () => {
    const $ = cheerio.load('<html><body><h1>First</h1><h1>Second</h1></body></html>');
    const result = checkH1($);
    expect(result.issues).toEqual(['H1_MULTIPLE']);
    expect(result.metric).toBe(2);
  });
});
