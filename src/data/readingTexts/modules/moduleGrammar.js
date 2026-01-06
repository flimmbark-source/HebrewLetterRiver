/**
 * Module grammar reading texts
 * Each module has a corresponding grammar reading text for practice
 * Grammar is presented as example sentences demonstrating the patterns
 */

import { createReadingText } from '../common/helpers.js';

/**
 * Module 1: Greetings & Introductions Grammar
 * Grammar patterns presented as example sentences
 */
export const module1GrammarText = createReadingText({
  id: 'module-1-grammar',
  title: {
    en: 'Module 1 Grammar',
    he: 'דקדוק מודול 1'
  },
  subtitle: {
    en: 'Grammar patterns with examples',
    he: 'דפוסי דקדוק עם דוגמאות'
  },
  practiceLanguage: 'hebrew',
  sectionId: 'modules',
  tokens: [
    // Simple Present with אני
    { type: 'word', text: 'אני', id: 'ani-1' },
    { type: 'word', text: 'שמח', id: 'sameach' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'אני', id: 'ani-2' },
    { type: 'word', text: 'רוצה', id: 'rotseh' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'אני', id: 'ani-3' },
    { type: 'word', text: 'חדש', id: 'chadash' },
    { type: 'punct', text: '.' },
    // Simple Present with אנחנו
    { type: 'word', text: 'אנחנו', id: 'anachnu-1' },
    { type: 'word', text: 'לומדים', id: 'lomdim' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'אנחנו', id: 'anachnu-2' },
    { type: 'word', text: 'רוצים', id: 'rotzim' },
    { type: 'punct', text: '.' },
    // Verb + Infinitive
    { type: 'word', text: 'אני', id: 'ani-4' },
    { type: 'word', text: 'רוצה', id: 'rotseh-2' },
    { type: 'word', text: 'לשאול', id: 'lishol' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'אני', id: 'ani-5' },
    { type: 'word', text: 'רוצה', id: 'rotseh-3' },
    { type: 'word', text: 'להתחיל', id: 'lehatchil' },
    { type: 'punct', text: '.' },
    // Questions
    { type: 'word', text: 'מאיפה', id: 'meeifo' },
    { type: 'word', text: 'אתה', id: 'atah' },
    { type: 'punct', text: '?' },
    { type: 'word', text: 'איך', id: 'eich' },
    { type: 'word', text: 'היום', id: 'hayom' },
    { type: 'word', text: 'שלך', id: 'shelcha' },
    { type: 'punct', text: '?' }
  ],
  glosses: {
    en: {
      'ani-1': 'I am',
      sameach: 'happy',
      'ani-2': 'I',
      rotseh: 'want',
      'ani-3': 'I am',
      chadash: 'new',
      'anachnu-1': 'we',
      lomdim: 'learn',
      'anachnu-2': 'we',
      rotzim: 'want',
      'ani-4': 'I',
      'rotseh-2': 'want',
      lishol: 'to ask',
      'ani-5': 'I',
      'rotseh-3': 'want',
      lehatchil: 'to start',
      meeifo: 'where from',
      atah: 'you',
      eich: 'how',
      hayom: 'today',
      shelcha: 'your'
    }
  },
  translations: {
    en: {
      'ani-1': { canonical: 'ani', variants: ['ani'] },
      sameach: { canonical: 'sameach', variants: ['sameach', 'same\'ach'] },
      'ani-2': { canonical: 'ani', variants: ['ani'] },
      rotseh: { canonical: 'rotseh', variants: ['rotseh', 'rotzeh'] },
      'ani-3': { canonical: 'ani', variants: ['ani'] },
      chadash: { canonical: 'chadash', variants: ['chadash', 'hadash'] },
      'anachnu-1': { canonical: 'anachnu', variants: ['anachnu', 'anakhnu'] },
      lomdim: { canonical: 'lomdim', variants: ['lomdim', 'lom\'dim'] },
      'anachnu-2': { canonical: 'anachnu', variants: ['anachnu', 'anakhnu'] },
      rotzim: { canonical: 'rotzim', variants: ['rotzim', 'rot\'zim'] },
      'ani-4': { canonical: 'ani', variants: ['ani'] },
      'rotseh-2': { canonical: 'rotseh', variants: ['rotseh', 'rotzeh'] },
      lishol: { canonical: 'lish\'ol', variants: ['lish\'ol', 'lishol'] },
      'ani-5': { canonical: 'ani', variants: ['ani'] },
      'rotseh-3': { canonical: 'rotseh', variants: ['rotseh', 'rotzeh'] },
      lehatchil: { canonical: 'lehatchil', variants: ['lehatchil', 'lehat\'hil'] },
      meeifo: { canonical: 'me\'eifo', variants: ['me\'eifo', 'meeifo', 'meayfo'] },
      atah: { canonical: 'atah', variants: ['atah', 'ata'] },
      eich: { canonical: 'eich', variants: ['eich', 'ech'] },
      hayom: { canonical: 'hayom', variants: ['hayom', 'ha-yom'] },
      shelcha: { canonical: 'shelcha', variants: ['shelcha', 'shel\'cha'] }
    }
  }
});

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
    // Possession
    { type: 'word', text: 'הבית', id: 'habayit-1' },
    { type: 'word', text: 'שלנו', id: 'shelanu' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'החדר', id: 'hacheder' },
    { type: 'word', text: 'שלו', id: 'shelo' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'הרעיון', id: 'harayon' },
    { type: 'word', text: 'שלי', id: 'sheli' },
    { type: 'punct', text: '.' },
    // Location prepositions
    { type: 'word', text: 'בבית', id: 'babayit' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'בחדר', id: 'bacheder' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'ליד', id: 'leyad' },
    { type: 'word', text: 'הבית', id: 'habayit-2' },
    { type: 'punct', text: '.' },
    // Yesh (have)
    { type: 'word', text: 'יש', id: 'yesh-1' },
    { type: 'word', text: 'לי', id: 'li' },
    { type: 'word', text: 'רעיון', id: 'rayon' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'יש', id: 'yesh-2' },
    { type: 'word', text: 'לנו', id: 'lanu' },
    { type: 'word', text: 'מים', id: 'mayim' },
    { type: 'punct', text: '.' },
    // Adjectives
    { type: 'word', text: 'בית', id: 'bayit' },
    { type: 'word', text: 'שקט', id: 'shaket' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'רעיון', id: 'rayon-2' },
    { type: 'word', text: 'קטן', id: 'katan' },
    { type: 'punct', text: '.' }
  ],
  glosses: {
    en: {
      'habayit-1': 'the home',
      shelanu: 'our',
      hacheder: 'the room',
      shelo: 'his',
      harayon: 'the idea',
      sheli: 'my',
      babayit: 'at home',
      bacheder: 'in the room',
      leyad: 'near',
      'habayit-2': 'the home',
      'yesh-1': 'there is',
      li: 'to me',
      rayon: 'idea',
      'yesh-2': 'there is',
      lanu: 'to us',
      mayim: 'water',
      bayit: 'home',
      shaket: 'quiet',
      'rayon-2': 'idea',
      katan: 'small'
    }
  },
  translations: {
    en: {
      'habayit-1': { canonical: 'habayit', variants: ['habayit', 'ha-bayit'] },
      shelanu: { canonical: 'shelanu', variants: ['shelanu', 'shel-anu'] },
      hacheder: { canonical: 'hacheder', variants: ['hacheder', 'ha-cheder'] },
      shelo: { canonical: 'shelo', variants: ['shelo'] },
      harayon: { canonical: 'hara\'ayon', variants: ['hara\'ayon', 'harayon'] },
      sheli: { canonical: 'sheli', variants: ['sheli'] },
      babayit: { canonical: 'babayit', variants: ['babayit', 'ba-bayit'] },
      bacheder: { canonical: 'bacheder', variants: ['bacheder', 'ba-cheder'] },
      leyad: { canonical: 'leyad', variants: ['leyad', 'le-yad'] },
      'habayit-2': { canonical: 'habayit', variants: ['habayit', 'ha-bayit'] },
      'yesh-1': { canonical: 'yesh', variants: ['yesh'] },
      li: { canonical: 'li', variants: ['li'] },
      rayon: { canonical: 'ra\'ayon', variants: ['ra\'ayon', 'rayon'] },
      'yesh-2': { canonical: 'yesh', variants: ['yesh'] },
      lanu: { canonical: 'lanu', variants: ['lanu', 'la-nu'] },
      mayim: { canonical: 'mayim', variants: ['mayim', 'ma\'im'] },
      bayit: { canonical: 'bayit', variants: ['bayit', 'bait'] },
      shaket: { canonical: 'shaket', variants: ['shaket', 'sheket'] },
      'rayon-2': { canonical: 'ra\'ayon', variants: ['ra\'ayon', 'rayon'] },
      katan: { canonical: 'katan', variants: ['katan'] }
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
    // Present Progressive
    { type: 'word', text: 'אני', id: 'ani-1' },
    { type: 'word', text: 'שותה', id: 'shoteh' },
    { type: 'word', text: 'קפה', id: 'kafeh' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'אנחנו', id: 'anachnu' },
    { type: 'word', text: 'קונים', id: 'konim' },
    { type: 'word', text: 'לחם', id: 'lechem' },
    { type: 'punct', text: '.' },
    // Intensifiers (מאוד)
    { type: 'word', text: 'טעים', id: 'taim' },
    { type: 'word', text: 'מאוד', id: 'meod-1' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'חם', id: 'cham' },
    { type: 'word', text: 'מאוד', id: 'meod-2' },
    { type: 'punct', text: '.' },
    // Quantifiers
    { type: 'word', text: 'עוד', id: 'od' },
    { type: 'word', text: 'מים', id: 'mayim' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'הרבה', id: 'harbeh' },
    { type: 'word', text: 'אוכל', id: 'ochel' },
    { type: 'punct', text: '.' },
    // Preposition עם
    { type: 'word', text: 'עם', id: 'im-1' },
    { type: 'word', text: 'המשפחה', id: 'hamishpacha' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'עם', id: 'im-2' },
    { type: 'word', text: 'חברים', id: 'chaverim' },
    { type: 'punct', text: '.' }
  ],
  glosses: {
    en: {
      'ani-1': 'I',
      shoteh: 'drink',
      kafeh: 'coffee',
      anachnu: 'we',
      konim: 'buy',
      lechem: 'bread',
      taim: 'tasty',
      'meod-1': 'very',
      cham: 'hot',
      'meod-2': 'very',
      od: 'more',
      mayim: 'water',
      harbeh: 'a lot',
      ochel: 'food',
      'im-1': 'with',
      hamishpacha: 'the family',
      'im-2': 'with',
      chaverim: 'friends'
    }
  },
  translations: {
    en: {
      'ani-1': { canonical: 'ani', variants: ['ani'] },
      shoteh: { canonical: 'shoteh', variants: ['shoteh', 'shote'] },
      kafeh: { canonical: 'kafeh', variants: ['kafeh', 'kafe'] },
      anachnu: { canonical: 'anachnu', variants: ['anachnu', 'anakhnu'] },
      konim: { canonical: 'konim', variants: ['konim'] },
      lechem: { canonical: 'lechem', variants: ['lechem'] },
      taim: { canonical: 'ta\'im', variants: ['ta\'im', 'taim'] },
      'meod-1': { canonical: 'me\'od', variants: ['me\'od', 'meod'] },
      cham: { canonical: 'cham', variants: ['cham', 'ham'] },
      'meod-2': { canonical: 'me\'od', variants: ['me\'od', 'meod'] },
      od: { canonical: 'od', variants: ['od', '\'od'] },
      mayim: { canonical: 'mayim', variants: ['mayim', 'ma\'im'] },
      harbeh: { canonical: 'harbeh', variants: ['harbeh', 'har-be'] },
      ochel: { canonical: 'ochel', variants: ['ochel', '\'ochel'] },
      'im-1': { canonical: 'im', variants: ['im'] },
      hamishpacha: { canonical: 'hamishpachah', variants: ['hamishpachah', 'hamishpacha'] },
      'im-2': { canonical: 'im', variants: ['im'] },
      chaverim: { canonical: 'chaverim', variants: ['chaverim', 'haverim'] }
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
    // Time expressions
    { type: 'word', text: 'היום', id: 'hayom' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'מחר', id: 'machar' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'אתמול', id: 'etmol' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'בבוקר', id: 'baboker' },
    { type: 'punct', text: '.' },
    // Frequency adverbs
    { type: 'word', text: 'תמיד', id: 'tamid' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'לפעמים', id: 'lifamim' },
    { type: 'punct', text: '.' },
    // Purpose phrases (כדי ל)
    { type: 'word', text: 'הולך', id: 'holech' },
    { type: 'word', text: 'לבית', id: 'labayit' },
    { type: 'word', text: 'כדי', id: 'kedei' },
    { type: 'word', text: 'לנוח', id: 'lanuach' },
    { type: 'punct', text: '.' },
    // Motion verbs
    { type: 'word', text: 'באים', id: 'baim' },
    { type: 'word', text: 'לעיר', id: 'lair' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'מגיעים', id: 'magiim' },
    { type: 'word', text: 'מוקדם', id: 'mukdam' },
    { type: 'punct', text: '.' },
    { type: 'word', text: 'הולך', id: 'holech-2' },
    { type: 'word', text: 'לבית', id: 'labayit-2' },
    { type: 'punct', text: '.' }
  ],
  glosses: {
    en: {
      hayom: 'today',
      machar: 'tomorrow',
      etmol: 'yesterday',
      baboker: 'in the morning',
      tamid: 'always',
      lifamim: 'sometimes',
      holech: 'going',
      labayit: 'home',
      kedei: 'in order to',
      lanuach: 'to rest',
      baim: 'coming',
      lair: 'to the city',
      magiim: 'arriving',
      mukdam: 'early',
      'holech-2': 'going',
      'labayit-2': 'home'
    }
  },
  translations: {
    en: {
      hayom: { canonical: 'hayom', variants: ['hayom', 'ha-yom'] },
      machar: { canonical: 'machar', variants: ['machar'] },
      etmol: { canonical: 'etmol', variants: ['etmol'] },
      baboker: { canonical: 'baboker', variants: ['baboker', 'ba-boker'] },
      tamid: { canonical: 'tamid', variants: ['tamid'] },
      lifamim: { canonical: 'lif\'amim', variants: ['lif\'amim', 'lifamim'] },
      holech: { canonical: 'holech', variants: ['holech', 'hole\'h'] },
      labayit: { canonical: 'labayit', variants: ['labayit', 'la-bayit'] },
      kedei: { canonical: 'kedei', variants: ['kedei', 'k\'dei'] },
      lanuach: { canonical: 'lanuach', variants: ['lanuach', 'la-nuach'] },
      baim: { canonical: 'ba\'im', variants: ['ba\'im', 'baim'] },
      lair: { canonical: 'la\'ir', variants: ['la\'ir', 'lair'] },
      magiim: { canonical: 'magi\'im', variants: ['magi\'im', 'magiim'] },
      mukdam: { canonical: 'mukdam', variants: ['mukdam'] },
      'holech-2': { canonical: 'holech', variants: ['holech', 'hole\'h'] },
      'labayit-2': { canonical: 'labayit', variants: ['labayit', 'la-bayit'] }
    }
  }
});

export const moduleGrammarTexts = [
  module1GrammarText,
  module2GrammarText,
  module3GrammarText,
  module4GrammarText
];
