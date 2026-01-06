/**
 * Module grammar reading texts
 * Each module has a corresponding grammar reading text for practice
 * Grammar is presented as example sentences demonstrating the patterns
 */

import { createReadingText } from '../common/helpers.js';

/**
 * Module 1: Greetings & Introductions Grammar
 * Single grammar card covering all module grammar with vocab words
 */
export const module1GrammarText = createReadingText({
  id: 'module-1-grammar-1',
  title: {
    en: 'Module 1 Grammar — Greetings & Introductions',
    he: 'דקדוק מודול 1 — ברכות והיכרות'
  },
  subtitle: {
    en: 'Practice grammar with vocabulary words',
    he: 'תרגל דקדוק עם מילות אוצר מילים'
  },
  practiceLanguage: 'hebrew',
  sectionId: 'modules',
  tokens: [
    { type: 'word', text: 'שלום', id: 'shalom-grammar-1' },
    { type: 'word', text: 'אני', id: 'ani-grammar-1' },
    { type: 'word', text: 'שמח', id: 'sameach-grammar-1' },
    { type: 'word', text: 'כאן', id: 'kan-grammar-1' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'שלום', id: 'shalom-grammar-2' },
    { type: 'word', text: 'אתה', id: 'atah-grammar' },
    { type: 'word', text: 'שמח', id: 'sameach-grammar-2' },
    { type: 'word', text: 'היום', id: 'hayom-grammar-1' },
    { type: 'punct', text: '?' },
    { type: 'word', text: 'שלום', id: 'shalom-grammar-3' },
    { type: 'word', text: 'אנחנו', id: 'anachnu-grammar' },
    { type: 'word', text: 'לומדים', id: 'lomdim-grammar-1' },
    { type: 'word', text: 'שפה', id: 'safah-grammar-1' },
    { type: 'word', text: 'חדשה', id: 'chadashah-grammar' },
    { type: 'word', text: 'יחד', id: 'yachad-grammar-1' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'אני', id: 'ani-grammar-2' },
    { type: 'word', text: 'רוצה', id: 'rotseh-grammar-1' },
    { type: 'word', text: 'לשאול', id: 'lishol-grammar' },
    { type: 'word', text: 'שאלה', id: 'sheela-grammar' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'אני', id: 'ani-grammar-3' },
    { type: 'word', text: 'רוצה', id: 'rotseh-grammar-2' },
    { type: 'word', text: 'תשובה', id: 'teshuvah-grammar' },
    { type: 'word', text: 'היום', id: 'hayom-grammar-2' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'רעיון', id: 'rayon-grammar' },
    { type: 'word', text: 'להתחיל', id: 'lehatchil-grammar' },
    { type: 'word', text: 'עוזר', id: 'ozer-grammar' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'רוצה', id: 'rotseh-grammar-4' },
    { type: 'word', text: 'יחד', id: 'yachad-grammar-2' },
    { type: 'punct', text: '!' },
    { type: 'word', text: 'תודה', id: 'todah-grammar' },
    { type: 'word', text: 'עוזר', id: 'ozer-grammar' },
    { type: 'word', text: 'לומדים', id: 'lomdim-grammar-2' },
    { type: 'punct', text: '.' }
  ],
  glosses: {
    en: {
      'shalom-grammar-1': 'hello',
      'shalom-grammar-2': 'hello',
      'shalom-grammar-3': 'hello',
      'ani-grammar-1': 'I',
      'ani-grammar-2': 'I',
      'ani-grammar-3': 'I',
      'atah-grammar': 'you (masculine)',
      'anachnu-grammar': 'we',
      'sameach-grammar-1': 'happy',
      'sameach-grammar-2': 'happy',
      'kan-grammar-1': 'here',
      'hayom-grammar-1': 'today',
      'hayom-grammar-2': 'today',
      'lomdim-grammar-1': 'learn',
      'lomdim-grammar-2': 'learn',
      'safah-grammar-1': 'language',
      'chadashah-grammar': 'new (f.)',
      'yachad-grammar-1': 'together',
      'yachad-grammar-2': 'together',
      'rotseh-grammar-1': 'want',
      'rotseh-grammar-2': 'want',
      'lishol-grammar': 'to ask',
      'sheela-grammar': 'question',
      'teshuvah-grammar': 'answer',
      'rayon-grammar': 'idea',
      'lehatchil-grammar': 'to start',
      'todah-grammar': 'thank you',
      'ozer-grammar': 'helps'
    }
  },
  translations: {
    en: {
      'shalom-grammar-1': { canonical: 'shalom', variants: ['shalom'] },
      'shalom-grammar-2': { canonical: 'shalom', variants: ['shalom'] },
      'shalom-grammar-3': { canonical: 'shalom', variants: ['shalom'] },
      'ani-grammar-1': { canonical: 'ani', variants: ['ani'] },
      'ani-grammar-2': { canonical: 'ani', variants: ['ani'] },
      'ani-grammar-3': { canonical: 'ani', variants: ['ani'] },
      'atah-grammar': { canonical: 'atah', variants: ['atah', 'ata'] },
      'anachnu-grammar': { canonical: 'anachnu', variants: ['anachnu', 'anakhnu'] },
      'sameach-grammar-1': { canonical: 'sameach', variants: ['sameach', 'same\'ach'] },
      'sameach-grammar-2': { canonical: 'sameach', variants: ['sameach', 'same\'ach'] },
      'kan-grammar-1': { canonical: 'kan', variants: ['kan'] },
      'hayom-grammar-1': { canonical: 'hayom', variants: ['hayom', 'ha-yom'] },
      'hayom-grammar-2': { canonical: 'hayom', variants: ['hayom', 'ha-yom'] },
      'lomdim-grammar-1': { canonical: 'lomdim', variants: ['lomdim', 'lom\'dim'] },
      'lomdim-grammar-2': { canonical: 'lomdim', variants: ['lomdim', 'lom\'dim'] },
      'safah-grammar-1': { canonical: 'safah', variants: ['safah', 'safa'] },
      'chadashah-grammar': { canonical: 'chadashah', variants: ['chadashah', 'hadasha'] },
      'yachad-grammar-1': { canonical: 'yachad', variants: ['yachad', 'ya\'had'] },
      'yachad-grammar-2': { canonical: 'yachad', variants: ['yachad', 'ya\'had'] },
      'rotseh-grammar-1': { canonical: 'rotseh', variants: ['rotseh', 'rotzeh'] },
      'rotseh-grammar-2': { canonical: 'rotseh', variants: ['rotseh', 'rotzeh'] },
      'lishol-grammar': { canonical: 'lish\'ol', variants: ['lish\'ol', 'lishol'] },
      'sheela-grammar': { canonical: 'she\'elah', variants: ['she\'elah', 'sheelah', 'shayla'] },
      'teshuvah-grammar': { canonical: 'teshuvah', variants: ['teshuvah', 'teshuva'] },
      'rayon-grammar': { canonical: 'ra\'ayon', variants: ['ra\'ayon', 'rayon'] },
      'lehatchil-grammar': { canonical: 'lehatchil', variants: ['lehatchil', 'lehat\'hil'] },
      'todah-grammar': { canonical: 'todah', variants: ['todah', 'toda', 'thanks'] },
      'ozer-grammar': { canonical: 'ozer', variants: ['ozer', '\'ozer'] }
    }
  }
});

// Backwards compatibility for any code that still expects the old
// per-card grammar exports from Module 1. Map the removed names to the
// unified text so stale references won't throw at runtime.
export const module1Grammar1Text = module1GrammarText;
export const module1Grammar2Text = module1GrammarText;
export const module1Grammar3Text = module1GrammarText;

/**
 * Module 2: At Home Grammar
 */
export const module2GrammarText = createReadingText({
  id: 'module-2-grammar',
  title: {
    en: 'Module 2 Grammar',
    he: 'דקדוק מודול 2'
  },
  subtitle: {
    en: 'Grammar patterns with examples',
    he: 'דפוסי דקדוק עם דוגמאות'
  },
  practiceLanguage: 'hebrew',
  sectionId: 'modules',
  tokens: [
    // Align with module-2 vocab: house and family words
    { type: 'word', text: 'בית', id: 'bayit-grammar-1' },
    { type: 'word', text: 'שלי', id: 'sheli-grammar' },
    { type: 'word', text: 'שקט', id: 'shaket-grammar' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'בית', id: 'bayit-grammar-2' },
    { type: 'word', text: 'שלנו', id: 'shelanu-grammar' },
    { type: 'word', text: 'מלא', id: 'maleh-grammar' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'בית', id: 'bayit-grammar-3' },
    { type: 'word', text: 'ליד', id: 'leyad-grammar' },
    { type: 'word', text: 'משפחה', id: 'mishpachah-grammar' },
    { type: 'punct', text: '.' }
  ],
  glosses: {
    en: {
      'bayit-grammar-1': 'home',
      'bayit-grammar-2': 'home',
      'bayit-grammar-3': 'home',
      'sheli-grammar': 'my',
      'shelanu-grammar': 'our',
      'shaket-grammar': 'quiet',
      'maleh-grammar': 'full',
      'leyad-grammar': 'near',
      'mishpachah-grammar': 'family'
    }
  },
  translations: {
    en: {
      'bayit-grammar-1': { canonical: 'bayit', variants: ['bayit', 'bait'] },
      'bayit-grammar-2': { canonical: 'bayit', variants: ['bayit', 'bait'] },
      'bayit-grammar-3': { canonical: 'bayit', variants: ['bayit', 'bait'] },
      'sheli-grammar': { canonical: 'sheli', variants: ['sheli'] },
      'shelanu-grammar': { canonical: 'shelanu', variants: ['shelanu', 'shel-anu'] },
      'shaket-grammar': { canonical: 'shaket', variants: ['shaket', 'sheket'] },
      'maleh-grammar': { canonical: 'maleh', variants: ['maleh', 'male'] },
      'leyad-grammar': { canonical: 'leyad', variants: ['leyad', 'le-yad'] },
      'mishpachah-grammar': { canonical: 'mishpachah', variants: ['mishpachah', 'mishpacha'] }
    }
  }
});

/**
 * Module 3: Food & Eating Grammar
 */
export const module3GrammarText = createReadingText({
  id: 'module-3-grammar',
  title: {
    en: 'Module 3 Grammar',
    he: 'דקדוק מודול 3'
  },
  subtitle: {
    en: 'Grammar patterns with examples',
    he: 'דפוסי דקדוק עם דוגמאות'
  },
  practiceLanguage: 'hebrew',
  sectionId: 'modules',
  tokens: [
    // Align with module-3 vocab: food words
    { type: 'word', text: 'אוכל', id: 'ochel-grammar-1' },
    { type: 'word', text: 'חם', id: 'cham-grammar' },
    { type: 'word', text: 'מאוד', id: 'meod-grammar-1' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'אוכל', id: 'ochel-grammar-2' },
    { type: 'word', text: 'טרי', id: 'tari-grammar' },
    { type: 'word', text: 'עכשיו', id: 'achshav-grammar' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'אוכל', id: 'ochel-grammar-3' },
    { type: 'word', text: 'עוד', id: 'od-grammar' },
    { type: 'word', text: 'בבקשה', id: 'bevakasha-grammar' },
    { type: 'punct', text: '.' }
  ],
  glosses: {
    en: {
      'ochel-grammar-1': 'food',
      'ochel-grammar-2': 'food',
      'ochel-grammar-3': 'food',
      'cham-grammar': 'warm',
      'meod-grammar-1': 'very',
      'tari-grammar': 'fresh',
      'achshav-grammar': 'now',
      'od-grammar': 'more',
      'bevakasha-grammar': 'please'
    }
  },
  translations: {
    en: {
      'ochel-grammar-1': { canonical: 'ochel', variants: ['ochel', '\'ochel'] },
      'ochel-grammar-2': { canonical: 'ochel', variants: ['ochel', '\'ochel'] },
      'ochel-grammar-3': { canonical: 'ochel', variants: ['ochel', '\'ochel'] },
      'cham-grammar': { canonical: 'cham', variants: ['cham', 'ham'] },
      'meod-grammar-1': { canonical: 'me\'od', variants: ['me\'od', 'meod'] },
      'tari-grammar': { canonical: 'tari', variants: ['tari'] },
      'achshav-grammar': { canonical: 'achshav', variants: ['achshav', 'akhshav'] },
      'od-grammar': { canonical: 'od', variants: ['od', '\'od'] },
      'bevakasha-grammar': { canonical: 'bevakasha', variants: ['bevakasha', 'be-vakasha'] }
    }
  }
});

/**
 * Module 4: Numbers & Time Grammar
 */
export const module4GrammarText = createReadingText({
  id: 'module-4-grammar',
  title: {
    en: 'Module 4 Grammar',
    he: 'דקדוק מודול 4'
  },
  subtitle: {
    en: 'Grammar patterns with examples',
    he: 'דפוסי דקדוק עם דוגמאות'
  },
  practiceLanguage: 'hebrew',
  sectionId: 'modules',
  tokens: [
    // Align with module-4 vocab: time words
    { type: 'word', text: 'מחר', id: 'machar-grammar-1' },
    { type: 'word', text: 'באים', id: 'baim-grammar' },
    { type: 'word', text: 'עיר', id: 'ir-grammar' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'מחר', id: 'machar-grammar-2' },
    { type: 'word', text: 'מגיעים', id: 'magiim-grammar' },
    { type: 'word', text: 'פגישה', id: 'pgishah-grammar' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'מחר', id: 'machar-grammar-3' },
    { type: 'word', text: 'מחכה', id: 'mechakeh-grammar' },
    { type: 'word', text: 'שעה', id: 'shaah-grammar' },
    { type: 'punct', text: '.' }
  ],
  glosses: {
    en: {
      'machar-grammar-1': 'tomorrow',
      'machar-grammar-2': 'tomorrow',
      'machar-grammar-3': 'tomorrow',
      'baim-grammar': 'come',
      'magiim-grammar': 'arrive',
      'mechakeh-grammar': 'waits',
      'ir-grammar': 'city',
      'pgishah-grammar': 'meeting',
      'shaah-grammar': 'hour'
    }
  },
  translations: {
    en: {
      'machar-grammar-1': { canonical: 'machar', variants: ['machar'] },
      'machar-grammar-2': { canonical: 'machar', variants: ['machar'] },
      'machar-grammar-3': { canonical: 'machar', variants: ['machar'] },
      'baim-grammar': { canonical: 'ba\'im', variants: ['ba\'im', 'baim'] },
      'magiim-grammar': { canonical: 'magi\'im', variants: ['magi\'im', 'magiim'] },
      'mechakeh-grammar': { canonical: 'mechakeh', variants: ['mechakeh', 'mekhakeh'] },
      'ir-grammar': { canonical: 'ir', variants: ['ir', '\'ir'] },
      'pgishah-grammar': { canonical: 'p\'gishah', variants: ['p\'gishah', 'pgishah'] },
      'shaah-grammar': { canonical: 'sha\'ah', variants: ['sha\'ah', 'shaah'] }
    }
  }
});

export const moduleGrammarTexts = [
  module1Grammar1Text,
  module1Grammar2Text,
  module1Grammar3Text,
  module2GrammarText,
  module3GrammarText,
  module4GrammarText
];
