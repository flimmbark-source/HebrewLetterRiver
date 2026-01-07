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
    { type: 'word', text: 'אני', id: 'ani-base' },
    { type: 'punct', text: '—' },
    { type: 'word', text: 'אני', id: 'ani-masc' },
    { type: 'word', text: 'שמח', id: 'sameach-masc' },
    { type: 'punct', text: '/' },
    { type: 'word', text: 'אני', id: 'ani-fem' },
    { type: 'word', text: 'שמחה', id: 'smecha' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'אתה', id: 'atah-base' },
    { type: 'punct', text: '—' },
    { type: 'word', text: 'אתה', id: 'atah-question' },
    { type: 'word', text: 'שמח', id: 'sameach-question' },
    { type: 'word', text: 'היום', id: 'hayom-question' },
    { type: 'punct', text: '?' },
    { type: 'word', text: 'שמח', id: 'sameach-base' },
    { type: 'punct', text: '—' },
    { type: 'word', text: 'שמחה', id: 'smecha-base' },
    { type: 'punct', text: ';' },
    { type: 'word', text: 'שמחים', id: 'smechim' },
    { type: 'punct', text: '/' },
    { type: 'word', text: 'שמחות', id: 'smechot' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'לומד', id: 'lomed' },
    { type: 'punct', text: '/' },
    { type: 'word', text: 'לומדים', id: 'lomdim' },
    { type: 'punct', text: '—' },
    { type: 'word', text: 'רוצה', id: 'rotze-lilmod' },
    { type: 'word', text: 'ללמוד', id: 'lilmod' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'רוצה', id: 'rotze-ask' },
    { type: 'punct', text: '—' },
    { type: 'word', text: 'רוצה', id: 'rotze-ask-verb' },
    { type: 'word', text: 'לשאול', id: 'lishol' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'תשובה', id: 'teshuvah-base' },
    { type: 'punct', text: '—' },
    { type: 'word', text: 'התשובה', id: 'hateshuvah' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'היום', id: 'hayom-base' },
    { type: 'punct', text: '/' },
    { type: 'word', text: 'עכשיו', id: 'achshav' },
    { type: 'punct', text: '.' }
  ],
  glosses: {
    en: {
      'ani-base': 'I (base)',
      'ani-masc': 'I (masculine adjective)',
      'sameach-masc': 'happy (m.)',
      'ani-fem': 'I (feminine adjective)',
      'smecha': 'happy (f.)',
      'atah-base': 'you (m. base)',
      'atah-question': 'you (question)',
      'sameach-question': 'happy (m.)',
      'hayom-question': 'today',
      'sameach-base': 'happy (m. singular)',
      'smecha-base': 'happy (f. singular)',
      'smechim': 'happy (m. plural)',
      'smechot': 'happy (f. plural)',
      'lomed': 'learns (m. sg.)',
      'lomdim': 'learn (plural)',
      'rotze-lilmod': 'want to learn',
      'lilmod': 'to learn (inf.)',
      'rotze-ask': 'want (base)',
      'rotze-ask-verb': 'want to ask',
      'lishol': 'to ask (inf.)',
      'teshuvah-base': 'answer (base)',
      'hateshuvah': 'the answer (definite)',
      'hayom-base': 'today',
      'achshav': 'now'
    }
  },
  translations: {
    en: {
      'ani-base': { canonical: 'ani', variants: ['ani'] },
      'ani-masc': { canonical: 'ani', variants: ['ani'] },
      'sameach-masc': { canonical: 'sameach', variants: ['sameach', "same'ach"] },
      'ani-fem': { canonical: 'ani', variants: ['ani'] },
      'smecha': { canonical: 'smecha', variants: ['smecha', "s'mecha"] },
      'atah-base': { canonical: 'atah', variants: ['atah', 'ata'] },
      'atah-question': { canonical: 'atah', variants: ['atah', 'ata'] },
      'sameach-question': { canonical: 'sameach', variants: ['sameach', "same'ach"] },
      'hayom-question': { canonical: 'hayom', variants: ['hayom', 'ha-yom'] },
      'sameach-base': { canonical: 'sameach', variants: ['sameach', "same'ach"] },
      'smecha-base': { canonical: 'smecha', variants: ['smecha', "s'mecha"] },
      'smechim': { canonical: 'smechim', variants: ['smechim', "smech\'im"] },
      'smechot': { canonical: 'smechot', variants: ['smechot', 'smechot'] },
      'lomed': { canonical: 'lomed', variants: ['lomed'] },
      'lomdim': { canonical: 'lomdim', variants: ['lomdim', "lom'dim"] },
      'rotze-lilmod': { canonical: 'rotze', variants: ['rotze', 'rotseh', 'rotzeh'] },
      'lilmod': { canonical: 'lilmod', variants: ['lilmod'] },
      'rotze-ask': { canonical: 'rotze', variants: ['rotze', 'rotseh', 'rotzeh'] },
      'rotze-ask-verb': { canonical: 'rotze', variants: ['rotze', 'rotseh', 'rotzeh'] },
      'lishol': { canonical: "lish'ol", variants: ["lish'ol", 'lishol'] },
      'teshuvah-base': { canonical: 'teshuvah', variants: ['teshuvah', 'teshuva'] },
      'hateshuvah': { canonical: 'ha-teshuvah', variants: ['ha-teshuvah', 'hateshuva'] },
      'hayom-base': { canonical: 'hayom', variants: ['hayom', 'ha-yom'] },
      'achshav': { canonical: 'achshav', variants: ['achshav'] }
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
