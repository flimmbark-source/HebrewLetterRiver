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

  // Extract sectionId if provided in the category object (used by buildAllCafeTalkTexts)
  // Otherwise default to cafeTalk for backward compatibility
  const categoryData = CAFE_TALK_CATEGORIES[categoryId];
  const sectionPrefix = categoryData?.sectionId || 'cafeTalk';

  return createReadingText({
    id: `${sectionPrefix}.${categoryId}`,
    title: titles,
    subtitle: subtitles,
    practiceLanguage,
    tokens: buildTokensFromLexicon(wordIds, practiceLexicon),
    meaningKeys: buildMeaningKeys(wordIds),
    translations
  });
}

/**
 * Build all Cafe Talk texts for a language (now with descriptive names)
 * @param {string} practiceLanguage - Practice language ID
 * @param {Object} practiceLexicon - Lexicon for practice language
 * @param {Object} [i18nLexicons] - Optional: lexicons mapped by i18n codes for all app languages
 * @param {Object} [transliterations] - Optional: practice language transliterations for typing validation
 * @returns {Array} Array of reading text objects for all chunks
 */
export function buildAllCafeTalkTexts(practiceLanguage, practiceLexicon, i18nLexicons = null, transliterations = null) {
  // Define titles and subtitles for each specific card
  // These are hardcoded multilingual strings (not from lexicons)
  const cardMetadata = {
    // Conversation Glue section
    basicConnectors: {
      titles: {
        en: 'Basic Connectors',
        es: 'Conectores Básicos',
        fr: 'Connecteurs de Base',
        he: 'מקשרים בסיסיים'
      },
      subtitles: {
        en: 'Essential words to connect thoughts',
        es: 'Palabras esenciales para conectar ideas',
        fr: 'Mots essentiels pour relier les pensées',
        he: 'מילים חיוניות לחיבור מחשבות'
      }
    },
    discourseMarkers: {
      titles: {
        en: 'Discourse Markers',
        es: 'Marcadores Discursivos',
        fr: 'Marqueurs du Discours',
        he: 'סמני שיח'
      },
      subtitles: {
        en: 'Words that structure conversations',
        es: 'Palabras que estructuran conversaciones',
        fr: 'Mots qui structurent les conversations',
        he: 'מילים שמבנות שיחות'
      }
    },
    logicalConnectors: {
      titles: {
        en: 'Logical Connectors',
        es: 'Conectores Lógicos',
        fr: 'Connecteurs Logiques',
        he: 'מקשרים לוגיים'
      },
      subtitles: {
        en: 'Words showing cause and consequence',
        es: 'Palabras que muestran causa y consecuencia',
        fr: 'Mots montrant cause et conséquence',
        he: 'מילים המראות סיבה ותוצאה'
      }
    },
    qualifiersModifiers: {
      titles: {
        en: 'Qualifiers & Modifiers',
        es: 'Calificadores y Modificadores',
        fr: 'Qualificateurs et Modificateurs',
        he: 'מגדירים ומתאמים'
      },
      subtitles: {
        en: 'Words that adjust meaning',
        es: 'Palabras que ajustan el significado',
        fr: 'Mots qui ajustent le sens',
        he: 'מילים המתאימות משמעות'
      }
    },

    // Time & Sequencing section
    presentTransitions: {
      titles: {
        en: 'Present & Transitions',
        he: 'הווה ומעברים'
      },
      subtitles: {
        en: 'Current time and sequential words',
        he: 'זמן נוכחי ומילים רציפות'
      }
    },
    timeReferences: {
      titles: {
        en: 'Time References',
        he: 'הפניות זמן'
      },
      subtitles: {
        en: 'Specific points in time',
        he: 'נקודות זמן ספציפיות'
      }
    },
    frequencyTiming: {
      titles: {
        en: 'Frequency & Timing',
        he: 'תדירות ותזמון'
      },
      subtitles: {
        en: 'How often things happen',
        he: 'כמה פעמים דברים קורים'
      }
    },

    // People Words section
    personalPronouns: {
      titles: {
        en: 'Personal Pronouns',
        he: 'כינויי גוף'
      },
      subtitles: {
        en: 'Basic references to people',
        he: 'התייחסויות בסיסיות לאנשים'
      }
    },
    peopleReferences: {
      titles: {
        en: 'People References',
        he: 'התייחסויות לאנשים'
      },
      subtitles: {
        en: 'General ways to refer to people',
        he: 'דרכים כלליות להתייחס לאנשים'
      }
    },
    socialRoles: {
      titles: {
        en: 'Social Roles',
        he: 'תפקידים חברתיים'
      },
      subtitles: {
        en: 'Relationships and types of people',
        he: 'קשרים וסוגי אנשים'
      }
    },

    // Core Story Verbs section
    communicationPerception: {
      titles: {
        en: 'Communication & Perception',
        he: 'תקשורת ותפיסה'
      },
      subtitles: {
        en: 'Verbs for talking and sensing',
        he: 'פעלים לדיבור וחישה'
      }
    },
    emotionsCreation: {
      titles: {
        en: 'Emotions & Creation',
        he: 'רגשות ויצירה'
      },
      subtitles: {
        en: 'Verbs for feelings and making',
        he: 'פעלים לרגשות ויצירה'
      }
    },
    actionVerbs: {
      titles: {
        en: 'Action Verbs',
        he: 'פעלי פעולה'
      },
      subtitles: {
        en: 'Essential verbs for doing',
        he: 'פעלים חיוניים לעשייה'
      }
    },

    // Life Logistics section
    dailyRoutines: {
      titles: {
        en: 'Daily Routines',
        he: 'שגרה יומית'
      },
      subtitles: {
        en: 'Everyday activities and places',
        he: 'פעילויות ומקומות יומיומיים'
      }
    },
    timeResources: {
      titles: {
        en: 'Time & Resources',
        he: 'זמן ומשאבים'
      },
      subtitles: {
        en: 'Essential concepts for planning',
        he: 'מושגים חיוניים לתכנון'
      }
    },
    actionsMovement: {
      titles: {
        en: 'Actions & Movement',
        he: 'פעולות ותנועה'
      },
      subtitles: {
        en: 'Verbs for getting things done',
        he: 'פעלים לביצוע דברים'
      }
    },

    // Reactions & Feelings section
    basicEmotions: {
      titles: {
        en: 'Basic Emotions',
        he: 'רגשות בסיסיים'
      },
      subtitles: {
        en: 'Core emotional states',
        he: 'מצבים רגשיים מרכזיים'
      }
    },
    statesOfBeing: {
      titles: {
        en: 'States of Being',
        he: 'מצבי הוויה'
      },
      subtitles: {
        en: 'How you feel right now',
        he: 'איך אתה מרגיש כרגע'
      }
    },
    descriptions: {
      titles: {
        en: 'Descriptions',
        he: 'תיאורים'
      },
      subtitles: {
        en: 'Words to describe people and things',
        he: 'מילים לתאר אנשים ודברים'
      }
    },

    // Everyday Topics section
    commonObjects: {
      titles: {
        en: 'Common Objects',
        he: 'חפצים נפוצים'
      },
      subtitles: {
        en: 'Things you use every day',
        he: 'דברים שאתה משתמש בהם כל יום'
      }
    },
    placesConcepts: {
      titles: {
        en: 'Places & Concepts',
        he: 'מקומות ומושגים'
      },
      subtitles: {
        en: 'Locations and ideas',
        he: 'מיקומים ורעיונות'
      }
    },
    abstractTerms: {
      titles: {
        en: 'Abstract Terms',
        he: 'מונחים מופשטים'
      },
      subtitles: {
        en: 'General concepts and ideas',
        he: 'מושגים ורעיונות כלליים'
      }
    }
  };

  const results = [];

  // Build reading texts for all cards
  Object.keys(CAFE_TALK_CATEGORIES).forEach(categoryId => {
    const category = CAFE_TALK_CATEGORIES[categoryId];
    const { sectionId, wordIds } = category;
    const metadata = cardMetadata[categoryId];

    if (!metadata) {
      console.warn(`No metadata found for category: ${categoryId}`);
      return;
    }

    const readingText = buildCafeTalkText(
      categoryId,
      practiceLanguage,
      practiceLexicon,
      metadata.titles,
      metadata.subtitles,
      i18nLexicons,
      transliterations
    );

    results.push(readingText);
  });

  return results;
}
