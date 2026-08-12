import { describe, it, expect } from 'vitest';
import { checkPageSize } from '../../../src/analyzer/rules/pageSize.js';

describe('checkPageSize', () => {
  it('accepts small pages', () => {
    const result = checkPageSize(50 * 1024); // 50 KB
    expect(result.issues).toEqual([]);
    expect(result.metric).toBe(50);
  });

  it('accepts pages right at the 2MB limit', () => {
    const result = checkPageSize(2048 * 1024); // exactly 2048 KB
    expect(result.issues).toEqual([]);
  });

  it('flags pages over 2MB', () => {
    const result = checkPageSize(3 * 1024 * 1024); // 3 MB
    expect(result.issues).toEqual(['PAGE_SIZE_TOO_LARGE']);
    expect(result.metric).toBe(3072);
  });
});
