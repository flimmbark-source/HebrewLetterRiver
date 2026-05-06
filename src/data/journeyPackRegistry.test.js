import { describe, it, expect } from 'vitest';
import { PRACTICE_LANGUAGES, JOURNEY_PACKS, getPackWordIds, canonicalLanguageId, validatePracticeLanguagePackCoverage, getWordPoolForLanguage, JOURNEY_FULLY_SUPPORTED_LANGUAGES } from './journeyPackRegistry.js';

describe('journey pack resolver', () => {
  it('normalizes common aliases', () => {
    expect(canonicalLanguageId('he')).toBe('hebrew');
    expect(canonicalLanguageId('ru')).toBe('russian');
    expect(canonicalLanguageId('es')).toBe('spanish');
    expect(canonicalLanguageId('en')).toBe('english');
  });

  it('returns empty list for invalid pack id', () => {
    expect(getPackWordIds('russian', 'missing_pack')).toEqual([]);
  });

  it('resolves starter packs for all practice languages with valid language-owned IDs', () => {
    for (const lang of JOURNEY_FULLY_SUPPORTED_LANGUAGES) {
      const pool = getWordPoolForLanguage(lang);
      const byId = new Map((pool || []).map((w) => [w.id, w]));
      for (const pack of JOURNEY_PACKS) {
        const ids = getPackWordIds(lang, pack.id);
        expect(ids.length, `${lang}:${pack.id} should resolve`).toBeGreaterThan(0);
        for (const id of ids) {
          const word = byId.get(id);
          expect(word, `${lang}:${pack.id}:${id} must exist`).toBeTruthy();
          const owner = word.languageId || 'hebrew';
          expect(owner, `${lang}:${pack.id}:${id} wrong language`).toBe(lang);
        }
      }
    }
  });

  it('coverage validator passes for current selectable languages', () => {
    const rows = validatePracticeLanguagePackCoverage();
    rows.filter((r) => JOURNEY_FULLY_SUPPORTED_LANGUAGES.includes(r.language)).forEach((row) => {
      expect(row.valid, row.language).toBe(true);
      expect(row.missingPackMappings.length, row.language).toBe(0);
    });
  });
});
