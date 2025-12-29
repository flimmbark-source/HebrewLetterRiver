/**
 * Tests for Section Dictionary validation
 */

import { describe, it, expect } from 'vitest';
import {
  validateSectionMeaningKeys,
  validateSectionTranslations,
  validateI18nMeanings,
  assertSectionDictionaryValid
} from './validateSectionDictionary.js';

// Import i18n translations
import enTranslations from '../i18n/en.json';
import heTranslations from '../i18n/he.json';
import esTranslations from '../i18n/spanish.json';

const PRACTICE_LANGUAGES = [
  'hebrew',
  'arabic',
  'mandarin',
  'hindi',
  'english',
  'spanish',
  'french',
  'portuguese',
  'russian',
  'japanese',
  'bengali',
  'amharic'
];

const APP_LANGUAGES = ['english', 'hebrew', 'spanish'];

const I18N_BY_LANGUAGE = {
  english: enTranslations,
  hebrew: heTranslations,
  spanish: esTranslations
};

describe('Section Dictionary Validation', () => {
  describe('Cafe Talk Section', () => {
    const sectionId = 'cafeTalk';

    APP_LANGUAGES.forEach(appLang => {
      describe(`App Language: ${appLang}`, () => {
        PRACTICE_LANGUAGES.forEach(practiceLang => {
          it(`should have all meaningKeys for ${practiceLang}`, () => {
            const errors = validateSectionMeaningKeys(sectionId, practiceLang);
            expect(errors).toEqual([]);
          });

          it(`should have all translations for ${practiceLang} → ${appLang}`, () => {
            const errors = validateSectionTranslations(sectionId, practiceLang, appLang);
            expect(errors).toEqual([]);
          });

          it(`should have all i18n meanings for ${practiceLang} in ${appLang}`, () => {
            const errors = validateI18nMeanings(
              I18N_BY_LANGUAGE[appLang],
              sectionId,
              practiceLang
            );
            expect(errors).toEqual([]);
          });
        });
      });
    });
  });

  describe('Starter Section', () => {
    const sectionId = 'starter';

    // Only test languages that have starter content
    const starterLanguages = ['hebrew', 'english'];

    APP_LANGUAGES.forEach(appLang => {
      describe(`App Language: ${appLang}`, () => {
        starterLanguages.forEach(practiceLang => {
          it(`should have all meaningKeys for ${practiceLang}`, () => {
            const errors = validateSectionMeaningKeys(sectionId, practiceLang);
            expect(errors).toEqual([]);
          });

          it(`should have all translations for ${practiceLang} → ${appLang}`, () => {
            const errors = validateSectionTranslations(sectionId, practiceLang, appLang);
            expect(errors).toEqual([]);
          });

          it(`should have all i18n meanings for ${practiceLang} in ${appLang}`, () => {
            const errors = validateI18nMeanings(
              I18N_BY_LANGUAGE[appLang],
              sectionId,
              practiceLang
            );
            expect(errors).toEqual([]);
          });
        });
      });
    });
  });

  describe('Complete Validation (throws on error)', () => {
    it('should pass complete validation for Hebrew Cafe Talk → English', () => {
      expect(() => {
        assertSectionDictionaryValid(
          'cafeTalk',
          'hebrew',
          'english',
          enTranslations
        );
      }).not.toThrow();
    });

    it('should pass complete validation for Hebrew Cafe Talk → Hebrew', () => {
      expect(() => {
        assertSectionDictionaryValid(
          'cafeTalk',
          'hebrew',
          'hebrew',
          heTranslations
        );
      }).not.toThrow();
    });

    it('should pass complete validation for English Cafe Talk → Spanish', () => {
      expect(() => {
        assertSectionDictionaryValid(
          'cafeTalk',
          'english',
          'spanish',
          esTranslations
        );
      }).not.toThrow();
    });
  });
});
