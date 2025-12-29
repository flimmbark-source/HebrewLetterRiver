/**
 * Cafe Talk Factory
 * 
 * Helper functions to build Cafe Talk reading texts from lexicons.
 * This eliminates code duplication and ensures consistent structure.
 */

import { createReadingText } from '../common/helpers.js';
import { CAFE_TALK_CATEGORIES } from './cafeTalkCanonical.js';

/**
 * Build tokens array from word IDs and lexicon
 * @param {string[]} wordIds - Array of word IDs in order
 * @param {Object} lexicon - Lexicon mapping word ID to translated text
 * @returns {Array} Token array
 */
function buildTokensFromLexicon(wordIds, lexicon) {
  const tokens = wordIds.map(wordId => ({
    type: 'word',
    text: lexicon[wordId],
    id: wordId
  }));
  
  // Add punctuation at end
  tokens.push({ type: 'punct', text: '.' });
  
  return tokens;
}

/**
 * Build meaningKeys object from word IDs
 * @param {string[]} wordIds - Array of word IDs
 * @returns {Object} MeaningKeys mapping
 */
function buildMeaningKeys(wordIds) {
  const meaningKeys = {};
  wordIds.forEach(wordId => {
    meaningKeys[wordId] = `reading.meaning.${wordId}`;
  });
  return meaningKeys;
}

/**
 * Build translations object for a single app language
 * @param {string[]} wordIds - Array of word IDs
 * @param {Object} appLangLexicon - Lexicon for the app language
 * @param {Object} [transliterations] - Optional: practice language transliterations (overrides appLangLexicon)
 * @returns {Object} Translations object for one language
 */
function buildTranslationsForLanguage(wordIds, appLangLexicon, transliterations = null) {
  const translations = {};
  wordIds.forEach(wordId => {
    // If transliterations provided, use those (for practice language typing)
    // Otherwise use the app language lexicon (for meaning-based typing)
    const canonical = transliterations ? transliterations[wordId] : appLangLexicon[wordId];
    translations[wordId] = {
      canonical,
      variants: [canonical] // Can be extended later with language-specific variants
    };
  });
  return translations;
}

/**
 * Build a complete Cafe Talk reading text from category and lexicons
 * @param {string} categoryId - Category ID (e.g., 'conversationGlue')
 * @param {string} practiceLanguage - Practice language ID
 * @param {Object} practiceLexicon - Lexicon for practice language
 * @param {Object} titles - Title translations {en, es, fr, he, ...}
 * @param {Object} subtitles - Subtitle translations {en, es, fr, he, ...}
 * @param {Object} [i18nLexicons] - Optional: lexicons mapped by i18n codes (en, es, fr, etc.) for app language translations
 * @param {Object} [transliterations] - Optional: practice language transliterations for typing validation
 * @returns {Object} Reading text object
 */
export function buildCafeTalkText(categoryId, practiceLanguage, practiceLexicon, titles, subtitles, i18nLexicons = null, transliterations = null) {
  const category = CAFE_TALK_CATEGORIES[categoryId];

  if (!category) {
    throw new Error(`Unknown Cafe Talk category: ${categoryId}`);
  }

  const { wordIds } = category;

  // Build translations object
  // Translations use i18n language codes (en, es, fr, etc.) NOT internal IDs (english, spanish, etc.)
  // If transliterations provided, use those instead of i18n lexicons (for transliteration-based practice)
  let translations = {};
  if (i18nLexicons) {
    // Build translations for all app languages using i18n codes
    Object.keys(i18nLexicons).forEach(i18nCode => {
      translations[i18nCode] = buildTranslationsForLanguage(wordIds, i18nLexicons[i18nCode], transliterations);
    });
  } else {
    // Fallback: just use practice language lexicon with 'en' key
    translations['en'] = buildTranslationsForLanguage(wordIds, practiceLexicon, transliterations);
  }

  return createReadingText({
    id: `cafeTalk.${categoryId}`,
    title: titles,
    subtitle: subtitles,
    practiceLanguage,
    tokens: buildTokensFromLexicon(wordIds, practiceLexicon),
    meaningKeys: buildMeaningKeys(wordIds),
    translations
  });
}

/**
 * Build all 7 Cafe Talk texts for a language
 * @param {string} practiceLanguage - Practice language ID
 * @param {Object} practiceLexicon - Lexicon for practice language
 * @param {Object} [i18nLexicons] - Optional: lexicons mapped by i18n codes for all app languages
 * @param {Object} [transliterations] - Optional: practice language transliterations for typing validation
 * @returns {Array} Array of 7 reading text objects
 */
export function buildAllCafeTalkTexts(practiceLanguage, practiceLexicon, i18nLexicons = null, transliterations = null) {
  // Define titles and subtitles for each category
  // These are hardcoded multilingual strings (not from lexicons)
  const categoryMetadata = {
    conversationGlue: {
      titles: {
        en: 'Conversation Glue (25)',
        es: 'Conectores de Conversación (25)',
        fr: 'Mots de Liaison (25)',
        he: 'דבק שיחה (25)'
      },
      subtitles: {
        en: 'Essential discourse markers and connectors',
        es: 'Marcadores y conectores esenciales',
        fr: 'Marqueurs et connecteurs essentiels',
        he: 'סמנים וקישורים חיוניים'
      }
    },
    timeSequencing: {
      titles: {
        en: 'Time & Sequencing (20)',
        he: 'זמן ורצף (20)'
      },
      subtitles: {
        en: 'Words for expressing when things happen',
        he: 'מילים לביטוי מתי דברים קורים'
      }
    },
    peopleWords: {
      titles: {
        en: 'People Words (18)',
        he: 'מילות אנשים (18)'
      },
      subtitles: {
        en: 'Pronouns and references to people',
        he: 'כינויים והתייחסויות לאנשים'
      }
    },
    coreStoryVerbs: {
      titles: {
        en: 'Core Story Verbs (22)',
        he: 'פעלים מרכזיים לסיפור (22)'
      },
      subtitles: {
        en: 'Essential action verbs for storytelling',
        he: 'פעלי פעולה חיוניים לסיפור סיפורים'
      }
    },
    lifeLogistics: {
      titles: {
        en: 'Life Logistics (20)',
        he: 'לוגיסטיקה יומיומית (20)'
      },
      subtitles: {
        en: 'Daily life and practical words',
        he: 'חיי יום יום ומילים מעשיות'
      }
    },
    reactionsFeelings: {
      titles: {
        en: 'Reactions & Feelings (20)',
        he: 'תגובות ורגשות (20)'
      },
      subtitles: {
        en: 'Emotional responses and descriptions',
        he: 'תגובות רגשיות ותיאורים'
      }
    },
    everydayTopics: {
      titles: {
        en: 'Everyday Topics (20)',
        he: 'נושאים יומיומיים (20)'
      },
      subtitles: {
        en: 'Common conversation topics and things',
        he: 'נושאי שיחה נפוצים ודברים'
      }
    }
  };
  
  return Object.keys(categoryMetadata).map(categoryId => {
    const { titles, subtitles } = categoryMetadata[categoryId];
    return buildCafeTalkText(categoryId, practiceLanguage, practiceLexicon, titles, subtitles, i18nLexicons, transliterations);
  });
}
