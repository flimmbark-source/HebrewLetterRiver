/**
 * Reading texts for the Reading Area learn mode.
 * Each text is tokenized into words with translations/transliterations
 * for different language pairs.
 */

/**
 * Reading text structure:
 * {
 *   id: string - unique identifier
 *   title: { [appLang]: string } - title in different UI languages
 *   subtitle: { [appLang]: string } - description
 *   practiceLanguage: string - language of the practice text
 *   tokens: Array<{ type: 'word'|'punct', text: string, id?: string }>
 *   translations: {
 *     [appLang]: {
 *       [wordId]: {
 *         canonical: string - canonical translation
 *         variants: string[] - accepted variants
 *         optionalChars?: Array<{index: number, char: string}> - optional characters
 *       }
 *     }
 *   }
 * }
 */

// Hebrew practice texts
export const hebrewReadingTexts = [
  {
    id: 'hebrew-starter-words',
    title: {
      en: 'Starter Words (5)',
      he: 'מילים בסיסיות (5)',
      es: 'Palabras Iniciales (5)',
      fr: 'Mots de Base (5)'
    },
    subtitle: {
      en: 'Common Hebrew words',
      he: 'מילים עבריות נפוצות',
      es: 'Palabras hebreas comunes',
      fr: 'Mots hébreux courants'
    },
    practiceLanguage: 'hebrew',
    tokens: [
      { type: 'word', text: 'שלום', id: 'shalom' },
      { type: 'word', text: 'תודה', id: 'todah' },
      { type: 'word', text: 'כן', id: 'ken' },
      { type: 'word', text: 'תורה', id: 'torah' },
      { type: 'word', text: 'אמת', id: 'emet' },
      { type: 'punct', text: '.' }
    ],
    translations: {
      en: {
        shalom: { canonical: 'shalom', variants: ['shalom'] },
        todah: { canonical: 'todah', variants: ['todah', 'toda'] },
        ken: { canonical: 'ken', variants: ['ken'] },
        torah: { canonical: 'torah', variants: ['torah', 'tora'] },
        emet: { canonical: 'emet', variants: ['emet'] }
      },
      he: {
        shalom: { canonical: 'שלום', variants: ['שלום'] },
        todah: { canonical: 'תודה', variants: ['תודה'] },
        ken: { canonical: 'כן', variants: ['כן'] },
        torah: { canonical: 'תורה', variants: ['תורה'] },
        emet: { canonical: 'אמת', variants: ['אמת'] }
      },
      es: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'paz'] },
        todah: { canonical: 'gracias', variants: ['gracias', 'todah'] },
        ken: { canonical: 'si', variants: ['si', 'sí', 'ken'] },
        torah: { canonical: 'torah', variants: ['torah', 'tora'] },
        emet: { canonical: 'verdad', variants: ['verdad', 'emet'] }
      },
      fr: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'paix'] },
        todah: { canonical: 'merci', variants: ['merci', 'todah'] },
        ken: { canonical: 'oui', variants: ['oui', 'ken'] },
        torah: { canonical: 'torah', variants: ['torah', 'tora'] },
        emet: { canonical: 'verite', variants: ['verite', 'vérité', 'emet'] }
      }
    }
  },
  {
    id: 'hebrew-greetings',
    title: {
      en: 'Greetings (6)',
      he: 'ברכות (6)',
      es: 'Saludos (6)',
      fr: 'Salutations (6)'
    },
    subtitle: {
      en: 'Common Hebrew greetings',
      he: 'ברכות עבריות נפוצות',
      es: 'Saludos hebreos comunes',
      fr: 'Salutations hébraïques courantes'
    },
    practiceLanguage: 'hebrew',
    tokens: [
      { type: 'word', text: 'שלום', id: 'shalom' },
      { type: 'word', text: 'בוקר', id: 'boker' },
      { type: 'word', text: 'טוב', id: 'tov' },
      { type: 'word', text: 'ערב', id: 'erev' },
      { type: 'word', text: 'טוב', id: 'tov2' },
      { type: 'word', text: 'להתראות', id: 'lehitraot' },
      { type: 'punct', text: '.' }
    ],
    translations: {
      en: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'hello', 'peace'] },
        boker: { canonical: 'boker', variants: ['boker', 'morning'] },
        tov: { canonical: 'tov', variants: ['tov', 'good'] },
        erev: { canonical: 'erev', variants: ['erev', 'evening'] },
        tov2: { canonical: 'tov', variants: ['tov', 'good'] },
        lehitraot: { canonical: 'lehitraot', variants: ['lehitraot', 'goodbye', 'bye'] }
      }
    }
  }
];

// Arabic practice texts
export const arabicReadingTexts = [
  {
    id: 'arabic-starter-words',
    title: {
      en: 'Starter Words (5)',
      ar: 'كلمات أساسية (٥)',
      es: 'Palabras Iniciales (5)',
      fr: 'Mots de Base (5)'
    },
    subtitle: {
      en: 'Common Arabic words',
      ar: 'كلمات عربية شائعة',
      es: 'Palabras árabes comunes',
      fr: 'Mots arabes courants'
    },
    practiceLanguage: 'arabic',
    tokens: [
      { type: 'word', text: 'سلام', id: 'salam' },
      { type: 'word', text: 'شكرا', id: 'shukran' },
      { type: 'word', text: 'نعم', id: 'naam' },
      { type: 'word', text: 'لا', id: 'la' },
      { type: 'word', text: 'كتاب', id: 'kitab' },
      { type: 'punct', text: '.' }
    ],
    translations: {
      en: {
        salam: { canonical: 'salam', variants: ['salam', 'salaam', 'peace'] },
        shukran: { canonical: 'shukran', variants: ['shukran', 'thanks'] },
        naam: { canonical: 'naam', variants: ['naam', 'na\'am', 'yes'] },
        la: { canonical: 'la', variants: ['la', 'laa', 'no'] },
        kitab: { canonical: 'kitab', variants: ['kitab', 'kitaab', 'book'] }
      },
      ar: {
        salam: { canonical: 'سلام', variants: ['سلام'] },
        shukran: { canonical: 'شكرا', variants: ['شكرا'] },
        naam: { canonical: 'نعم', variants: ['نعم'] },
        la: { canonical: 'لا', variants: ['لا'] },
        kitab: { canonical: 'كتاب', variants: ['كتاب'] }
      }
    }
  }
];

// Mandarin practice texts (using pinyin transliteration)
export const mandarinReadingTexts = [
  {
    id: 'mandarin-starter-words',
    title: {
      en: 'Starter Words (5)',
      zh: '基础词汇 (5)',
      es: 'Palabras Iniciales (5)',
      fr: 'Mots de Base (5)'
    },
    subtitle: {
      en: 'Common Mandarin words',
      zh: '常用中文词汇',
      es: 'Palabras chinas comunes',
      fr: 'Mots chinois courants'
    },
    practiceLanguage: 'mandarin',
    tokens: [
      { type: 'word', text: '你好', id: 'nihao' },
      { type: 'word', text: '谢谢', id: 'xiexie' },
      { type: 'word', text: '是', id: 'shi' },
      { type: 'word', text: '不', id: 'bu' },
      { type: 'word', text: '好', id: 'hao' },
      { type: 'punct', text: '。' }
    ],
    translations: {
      en: {
        nihao: { canonical: 'nihao', variants: ['nihao', 'ni hao', 'hello'] },
        xiexie: { canonical: 'xiexie', variants: ['xiexie', 'xie xie', 'thanks'] },
        shi: { canonical: 'shi', variants: ['shi', 'yes', 'is'] },
        bu: { canonical: 'bu', variants: ['bu', 'no', 'not'] },
        hao: { canonical: 'hao', variants: ['hao', 'good'] }
      },
      zh: {
        nihao: { canonical: '你好', variants: ['你好'] },
        xiexie: { canonical: '谢谢', variants: ['谢谢'] },
        shi: { canonical: '是', variants: ['是'] },
        bu: { canonical: '不', variants: ['不'] },
        hao: { canonical: '好', variants: ['好'] }
      }
    }
  }
];

// Hindi practice texts
export const hindiReadingTexts = [
  {
    id: 'hindi-starter-words',
    title: {
      en: 'Starter Words (5)',
      hi: 'बुनियादी शब्द (5)',
      es: 'Palabras Iniciales (5)',
      fr: 'Mots de Base (5)'
    },
    subtitle: {
      en: 'Common Hindi words',
      hi: 'सामान्य हिन्दी शब्द',
      es: 'Palabras hindi comunes',
      fr: 'Mots hindi courants'
    },
    practiceLanguage: 'hindi',
    tokens: [
      { type: 'word', text: 'नमस्ते', id: 'namaste' },
      { type: 'word', text: 'धन्यवाद', id: 'dhanyavaad' },
      { type: 'word', text: 'हाँ', id: 'haan' },
      { type: 'word', text: 'नहीं', id: 'nahin' },
      { type: 'word', text: 'अच्छा', id: 'accha' },
      { type: 'punct', text: '।' }
    ],
    translations: {
      en: {
        namaste: { canonical: 'namaste', variants: ['namaste', 'hello'] },
        dhanyavaad: { canonical: 'dhanyavaad', variants: ['dhanyavaad', 'dhanyavad', 'thanks'] },
        haan: { canonical: 'haan', variants: ['haan', 'haa', 'yes'] },
        nahin: { canonical: 'nahin', variants: ['nahin', 'nahi', 'no'] },
        accha: { canonical: 'accha', variants: ['accha', 'acha', 'good'] }
      },
      hi: {
        namaste: { canonical: 'नमस्ते', variants: ['नमस्ते'] },
        dhanyavaad: { canonical: 'धन्यवाद', variants: ['धन्यवाद'] },
        haan: { canonical: 'हाँ', variants: ['हाँ', 'हां'] },
        nahin: { canonical: 'नहीं', variants: ['नहीं'] },
        accha: { canonical: 'अच्छा', variants: ['अच्छा'] }
      }
    }
  }
];

// Aggregate all texts by practice language
export const readingTextsByLanguage = {
  hebrew: hebrewReadingTexts,
  arabic: arabicReadingTexts,
  mandarin: mandarinReadingTexts,
  hindi: hindiReadingTexts,
  // Add more languages as needed
  english: [], // English as practice language would have texts in Hebrew, Arabic, etc.
  spanish: [],
  french: [],
  portuguese: [],
  russian: [],
  japanese: [],
  bengali: [],
  amharic: []
};

/**
 * Get all reading texts for a specific practice language
 * @param {string} practiceLanguage - Language ID
 * @returns {Array} Reading texts for that language
 */
export function getReadingTextsForLanguage(practiceLanguage) {
  return readingTextsByLanguage[practiceLanguage] || [];
}

/**
 * Get a specific reading text by ID
 * @param {string} textId - Text ID
 * @returns {Object|null} Reading text object or null
 */
export function getReadingTextById(textId) {
  for (const texts of Object.values(readingTextsByLanguage)) {
    const text = texts.find(t => t.id === textId);
    if (text) return text;
  }
  return null;
}
