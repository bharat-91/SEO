import type { CheerioAPI, Cheerio } from 'cheerio';
import type { Element } from 'domhandler';

/**
 * Navigation Detection
 *
 * Heuristic-based detection of a page's primary navigation menu.
 *
 * Algorithm:
 * 1. Collect all <nav> elements.
 * 2. If exactly one, use it.
 * 3. If multiple, score each and pick the highest-scoring one:
 *    - +10 if it's the only <nav> directly inside <header>
 *    - +5 if aria-label/role="navigation" mentions "nav"
 *    - +3 if link count is in a sane range (2-25)
 *    - -5 if it's inside <footer>
 * 4. If zero <nav> elements, fall back to header elements with
 *    class/id matching /nav|menu/i, or [role="navigation"] anywhere.
 * 5. If nothing found, no navigation detected - return empty list.
 */

const IGNORED_HREF_PATTERNS = [/^#/, /^mailto:/i, /^tel:/i, /^javascript:/i];

export interface NavigationDetectionResult {
  found: boolean;
  candidateHrefs: string[];
}

export function detectNavigation($: CheerioAPI): NavigationDetectionResult {
  const navElements = $('nav').toArray();

  let chosenNav: Element | null = null;

  if (navElements.length === 1) {
    chosenNav = navElements[0];
  } else if (navElements.length > 1) {
    chosenNav = pickHighestScoringNav($, navElements);
  }

  if (!chosenNav) {
    chosenNav = fallbackDetection($);
  }

  if (!chosenNav) {
    return { found: false, candidateHrefs: [] };
  }

  const hrefs = extractHrefs($, $(chosenNav));
  return { found: true, candidateHrefs: hrefs };
}

function pickHighestScoringNav($: CheerioAPI, navElements: Element[]): Element {
  let bestScore = -Infinity;
  let bestNav = navElements[0];

  for (const nav of navElements) {
    const score = scoreNavElement($, nav);
    if (score > bestScore) {
      bestScore = score;
      bestNav = nav;
    }
  }

  return bestNav;
}

function scoreNavElement($: CheerioAPI, nav: Element): number {
  let score = 0;
  const $nav = $(nav);

  // +10 if inside header
  const isInHeader = $nav.parents('header').length > 0;
  if (isInHeader) {
    score += 10;
  }

  // -5 if inside footer
  const isInFooter = $nav.parents('footer').length > 0;
  if (isInFooter) {
    score -= 5;
  }

  // +5 if aria-label or role mentions navigation
  const ariaLabel = ($nav.attr('aria-label') || '').toLowerCase();
  const role = ($nav.attr('role') || '').toLowerCase();
  if (ariaLabel.includes('nav') || role.includes('navigation')) {
    score += 5;
  }

  // +3 if link count is in sane range
  const linkCount = $nav.find('a').length;
  if (linkCount >= 2 && linkCount <= 25) {
    score += 3;
  }

  return score;
}

function fallbackDetection($: CheerioAPI): Element | null {
  // Look inside header for nav/menu class or id
  const headerNavLike = $('header [class*="nav" i], header [class*="menu" i], header [id*="nav" i], header [id*="menu" i]');
  if (headerNavLike.length > 0) {
    return headerNavLike.first().get(0) || null;
  }

  // Look for role="navigation" anywhere
  const roleNav = $('[role="navigation"]');
  if (roleNav.length > 0) {
    return roleNav.first().get(0) || null;
  }

  return null;
}

function extractHrefs($: CheerioAPI, container: Cheerio<Element>): string[] {
  const hrefs: string[] = [];

  container.find('a').each((_, el) => {
    const href = $(el).attr('href');
    if (href && !isIgnoredHref(href)) {
      hrefs.push(href);
    }
  });

  return hrefs;
}

function isIgnoredHref(href: string): boolean {
  const trimmed = href.trim();
  if (trimmed.length === 0) {
    return true;
  }
  return IGNORED_HREF_PATTERNS.some((pattern) => pattern.test(trimmed));
}
