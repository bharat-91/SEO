import { describe, it, expect } from 'vitest';
import { checkHttpStatus } from '../../../src/analyzer/rules/httpStatus.js';

describe('checkHttpStatus', () => {
  it('accepts 200', () => {
    expect(checkHttpStatus(200).issues).toEqual([]);
  });

  it('accepts other 2xx codes', () => {
    expect(checkHttpStatus(204).issues).toEqual([]);
  });

  it('flags 404', () => {
    expect(checkHttpStatus(404).issues).toEqual(['NON_200']);
  });

  it('flags 500', () => {
    expect(checkHttpStatus(500).issues).toEqual(['NON_200']);
  });

  it('flags redirects (3xx)', () => {
    expect(checkHttpStatus(301).issues).toEqual(['NON_200']);
  });

  it('flags null status (fetch failed entirely)', () => {
    expect(checkHttpStatus(null).issues).toEqual(['NON_200']);
  });
});
