import { describe, expect, it } from 'vitest';
import { analyzeHebrewMorphology } from './grammarLensLite.ts';

const noopTranslate = (key) => key;

describe('analyzeHebrewMorphology', () => {
  it('breaks down ובבית into prefixes and base', () => {
    const result = analyzeHebrewMorphology('ובבית', 'hebrew', 'en', noopTranslate);
    const breakdown = result?.breakdown;

    expect(breakdown?.prefixes.map(p => p.text)).toEqual(['ו', 'ב']);
    expect(breakdown?.base.text).toBe('בית');
    expect(breakdown?.suffixes).toEqual([]);
  });

  it('breaks down הספר into ה + ספר', () => {
    const result = analyzeHebrewMorphology('הספר', 'hebrew', 'en', noopTranslate);
    const breakdown = result?.breakdown;

    expect(breakdown?.prefixes.map(p => p.text)).toEqual(['ה']);
    expect(breakdown?.base.text).toBe('ספר');
  });

  it('breaks down לכתוב into ל + כתוב/כתב base guess', () => {
    const result = analyzeHebrewMorphology('לכתוב', 'hebrew', 'en', noopTranslate);
    const breakdown = result?.breakdown;

    expect(breakdown?.prefixes.map(p => p.text)).toEqual(['ל']);
    expect(breakdown?.base.text.startsWith('כתוב') || breakdown?.base.text.startsWith('כתב')).toBe(true);
  });
});
