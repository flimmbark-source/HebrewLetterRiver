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
 *
 * The canonical value should reflect how the practice language word is
 * pronounced (a transliteration), not the meaning translation. When
 * explicit transliterations are provided we use them; otherwise we fall
 * back to the practice language lexicon so every app language sees the
 * same pronunciation hints instead of a meaning translation.
 *
 * @param {string[]} wordIds - Array of word IDs
 * @param {Object} appLangLexicon - Lexicon for the app language (used for variants)
 * @param {Object} transliterationSource - Source for transliterations (explicit map or practice lexicon)
 * @returns {Object} Translations object for one language
 */
function buildTranslationsForLanguage(wordIds, appLangLexicon, transliterationSource) {
  const translations = {};
  wordIds.forEach(wordId => {
    // Prefer explicit transliterations; otherwise fall back to the practice lexicon
    const canonical = transliterationSource[wordId];
    const variants = [canonical];

    // Add the app language meaning translation as a variant (helps typing validation)
    const appLangVariant = appLangLexicon[wordId];
    if (appLangVariant && appLangVariant !== canonical) {
      variants.push(appLangVariant);
    }

    translations[wordId] = {
      canonical,
      variants: [...new Set(variants)] // Can be extended later with language-specific variants
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
  // If transliterations provided, use those instead of meaning translations so we surface pronunciation hints
  const transliterationSource = transliterations || practiceLexicon;
  let translations = {};
  if (i18nLexicons) {
    // Build translations for all app languages using i18n codes
    Object.keys(i18nLexicons).forEach(i18nCode => {
      translations[i18nCode] = buildTranslationsForLanguage(wordIds, i18nLexicons[i18nCode], transliterationSource);
    });
  } else {
    // Fallback: just use practice language lexicon with 'en' key
    translations['en'] = buildTranslationsForLanguage(wordIds, practiceLexicon, transliterationSource);
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
 * Build all Cafe Talk texts for a language (now with chunks)
 * @param {string} practiceLanguage - Practice language ID
 * @param {Object} practiceLexicon - Lexicon for practice language
 * @param {Object} [i18nLexicons] - Optional: lexicons mapped by i18n codes for all app languages
 * @param {Object} [transliterations] - Optional: practice language transliterations for typing validation
 * @returns {Array} Array of reading text objects for all chunks
 */
export function buildAllCafeTalkTexts(practiceLanguage, practiceLexicon, i18nLexicons = null, transliterations = null) {
  // Define titles and subtitles for each parent category and chunks
  // These are hardcoded multilingual strings (not from lexicons)
  const categoryMetadata = {
    conversationGlue: {
      baseTitle: {
        en: 'Conversation Glue',
        es: 'Conectores de Conversación',
        fr: 'Mots de Liaison',
        he: 'דבק שיחה'
      },
      baseSubtitle: {
        en: 'Essential discourse markers and connectors',
        es: 'Marcadores y conectores esenciales',
        fr: 'Marqueurs et connecteurs essentiels',
        he: 'סמנים וקישורים חיוניים'
      }
    },
    timeSequencing: {
      baseTitle: {
        en: 'Time & Sequencing',
        he: 'זמן ורצף'
      },
      baseSubtitle: {
        en: 'Words for expressing when things happen',
        he: 'מילים לביטוי מתי דברים קורים'
      }
    },
    peopleWords: {
      baseTitle: {
        en: 'People Words',
        he: 'מילות אנשים'
      },
      baseSubtitle: {
        en: 'Pronouns and references to people',
        he: 'כינויים והתייחסויות לאנשים'
      }
    },
    coreStoryVerbs: {
      baseTitle: {
        en: 'Core Story Verbs',
        he: 'פעלים מרכזיים לסיפור'
      },
      baseSubtitle: {
        en: 'Essential action verbs for storytelling',
        he: 'פעלי פעולה חיוניים לסיפור סיפורים'
      }
    },
    lifeLogistics: {
      baseTitle: {
        en: 'Life Logistics',
        he: 'לוגיסטיקה יומיומית'
      },
      baseSubtitle: {
        en: 'Daily life and practical words',
        he: 'חיי יום יום ומילים מעשיות'
      }
    },
    reactionsFeelings: {
      baseTitle: {
        en: 'Reactions & Feelings',
        he: 'תגובות ורגשות'
      },
      baseSubtitle: {
        en: 'Emotional responses and descriptions',
        he: 'תגובות רגשיות ותיאורים'
      }
    },
    everydayTopics: {
      baseTitle: {
        en: 'Everyday Topics',
        he: 'נושאים יומיומיים'
      },
      baseSubtitle: {
        en: 'Common conversation topics and things',
        he: 'נושאי שיחה נפוצים ודברים'
      }
    }
  };

  const results = [];

  // Build reading texts for all chunks
  Object.keys(CAFE_TALK_CATEGORIES).forEach(categoryId => {
    const category = CAFE_TALK_CATEGORIES[categoryId];
    const { parentCategory, chunkNumber, wordIds } = category;
    const metadata = categoryMetadata[parentCategory];

    if (!metadata) {
      console.warn(`No metadata found for parent category: ${parentCategory}`);
      return;
    }

    // Build titles with chunk information
    const titles = {};
    const subtitles = {};

    Object.keys(metadata.baseTitle).forEach(lang => {
      titles[lang] = `${metadata.baseTitle[lang]} - Part ${chunkNumber} (${wordIds.length})`;
      subtitles[lang] = metadata.baseSubtitle[lang];
    });

    results.push(buildCafeTalkText(
      categoryId,
      practiceLanguage,
      practiceLexicon,
      titles,
      subtitles,
      i18nLexicons,
      transliterations
    ));
  });

  return results;
}
