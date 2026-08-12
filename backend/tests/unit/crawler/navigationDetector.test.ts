import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { detectNavigation } from '../../../src/crawler/navigationDetector.js';
import {
  navDetectionFixture,
  multipleNavFixture,
  noNavFixture,
} from '../../fixtures/html.js';

describe('navigationDetector', () => {
  it('detects a single <nav> element and extracts its links', () => {
    const $ = cheerio.load(navDetectionFixture);
    const result = detectNavigation($);

    expect(result.found).toBe(true);
    expect(result.candidateHrefs).toEqual(['/home', '/about', '/services', '/contact']);
  });

  it('prefers the header nav over a footer nav when multiple exist', () => {
    const $ = cheerio.load(multipleNavFixture);
    const result = detectNavigation($);

    expect(result.found).toBe(true);
    expect(result.candidateHrefs).toEqual(['/home', '/about']);
  });

  it('returns not found when no navigation exists', () => {
    const $ = cheerio.load(noNavFixture);
    const result = detectNavigation($);

    expect(result.found).toBe(false);
    expect(result.candidateHrefs).toEqual([]);
  });

  it('falls back to header nav-like class when no <nav> tag exists', () => {
    const html = `
      <html><body>
        <header>
          <div class="main-navigation">
            <a href="/home">Home</a>
            <a href="/about">About</a>
          </div>
        </header>
      </body></html>
    `;
    const $ = cheerio.load(html);
    const result = detectNavigation($);

    expect(result.found).toBe(true);
    expect(result.candidateHrefs).toEqual(['/home', '/about']);
  });

  it('filters out fragment-only, mailto, tel, and javascript hrefs', () => {
    const html = `
      <html><body>
        <nav>
          <a href="/home">Home</a>
          <a href="#">Skip</a>
          <a href="mailto:test@example.com">Email</a>
          <a href="tel:+1234567890">Call</a>
          <a href="javascript:void(0)">JS</a>
        </nav>
      </body></html>
    `;
    const $ = cheerio.load(html);
    const result = detectNavigation($);

    expect(result.candidateHrefs).toEqual(['/home']);
  });
});
