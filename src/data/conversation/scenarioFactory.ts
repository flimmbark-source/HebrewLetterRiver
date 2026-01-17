/**
 * Conversation Scenario Factory
 *
 * Converts sentences from sentencesByTheme into conversation scenarios
 * with lines, transliterations, and acceptable variants.
 */

import type { Sentence } from '../../types/sentences.ts';
import type {
  ConversationLine,
  ConversationScenario,
  ConversationScenarioMetadata,
  ConversationPracticePlan,
  ConversationBeat,
  ConversationModuleType
} from './types.ts';
import { cafeTalkTransliterations } from '../readingTexts/cafeTalk/lexicon/hebrew.js';

/**
 * Simple transliteration lookup extending cafeTalk with sentence-specific words
 */
export const sentenceTransliterationLookup: Record<string, string> = {
  // From baseWordIdLookup in sentences/index.ts
  'שלום': 'shalom',
  'תודה': 'todah',
  'כן': 'ken',
  'לא': 'lo',
  'יש': 'yesh',
  'כל': 'kol',
  'לי': 'li',
  'אני': 'ani',
  'ואני': 've-ani',
  'אתה': 'ata',
  'ואתה': 've-ata',
  'את': 'at',
  'הוא': 'hu',
  'היא': 'hi',
  'אנחנו': 'anachnu',
  'הם': 'hem',
  'דני': 'Dani',
  'אורי': 'Uri',
  'חבר': 'chaver',
  'החבר': 'ha-chaver',
  'משפחה': 'mishpacha',
  'שכן': 'shachen',
  'ילד': 'yeled',
  'הילד': 'ha-yeled',
  'שפה': 'safa',
  'מילה': 'mila',
  'בית': 'bayit',
  'הבית': 'ha-bayit',
  'בבית': 'ba-bayit',
  'לבית': 'la-bayit',
  'רעיון': 'rayon',
  'שאלה': 'sheela',
  'תשובה': 'tshuva',
  'התשובה': 'ha-tshuva',
  'ספר': 'sefer',
  'הספר': 'ha-sefer',
  'אוכל': 'ochel',
  'האוכל': 'ha-ochel',
  'מים': 'mayim',
  'קפה': 'kafe',
  'וקפה': 've-kafe',
  'עיר': 'ir',
  'לעיר': 'la-ir',
  'בעיר': 'ba-ir',
  'היום': 'ha-yom',
  'מחר': 'machar',
  'אתמול': 'etmol',
  'עכשיו': 'achshav',
  'זמן': 'zman',
  'הזמן': 'ha-zman',
  'יום': 'yom',
  'בוקר': 'boker',
  'בבוקר': 'ba-boker',
  'ערב': 'erev',
  'בערב': 'ba-erev',
  'מוקדם': 'mukdam',
  'מאוחר': 'meuchar',
  'תמיד': 'tamid',
  'לפעמים': 'lifamim',
  'נהדר': 'nehedar',
  'טוב': 'tov',
  'שמח': 'sameach',
  'נחמד': 'nechmad',
  'יפה': 'yafe',
  'רוצה': 'rotze',
  'צריך': 'tzarich',
  'בא': 'ba',
  'באים': 'baim',
  'להגיע': 'lehagia',
  'מגיעים': 'magiim',
  'מחכה': 'mechake',
  'חיכינו': 'chikinu',
  'לחכות': 'lechakot',
  'לשאול': 'lishol',
  'לומר': 'lomar',
  'ללמוד': 'lilmod',
  'לומדים': 'lomdim',
  'לקרוא': 'likro',
  'קורא': 'kore',
  'לאכול': 'leechol',
  'לשתות': 'lishtot',
  'שותה': 'shote',
  'ושותה': 've-shote',
  'שותים': 'shotim',
  'לקנות': 'liknot',
  'קונים': 'konim',
  'לשלם': 'leshalem',
  'משלם': 'meshalem',
  'לעזור': 'laazor',
  'עוזר': 'ozer',
  'להתחיל': 'lehatkhil',
  'מתחילה': 'matkhila',
  'לסיים': 'lesayem',
  'מסיימים': 'mesayemim',
  'ללכת': 'lalechet',
  'הולך': 'holech',
  'להכיר': 'lehakir',
  'מאיפה': 'meeifo',
  'חדש': 'chadash',
  'שבאת': 'shebata',
  'לך': 'lecha',
  'שאתה': 'she-ata',
  'כאן': 'kan',
  'איתנו': 'itanu',
  'חדשה': 'chadasha',
  'יחד': 'yachad',
  'איך': 'eich',
  'שלך': 'shelcha',
  'קצרה': 'ktzara',
  'קצר': 'katzar',
  'על': 'al',
  'זה': 'ze',
  'שמי': 'shmi',
  'אוהב': 'ohev',
  'עם': 'im',
  'חברים': 'chaverim',
  'שלנו': 'shelanu',
  'מלא': 'male',
  'במשפחה': 'ba-mishpacha',
  'וחברים': 've-chaverim',
  'אוהבים': 'ohavim',
  'לשבת': 'lashevet',
  'לדבר': 'ledaber',
  'ולדבר': 've-ledaber',
  'שקט': 'shaket',
  'ושקט': 've-shaket',
  'לנו': 'lanu',
  'קטן': 'katan',
  'בחדר': 'ba-cheder',
  'שלו': 'shelo',
  'במטבח': 'ba-mitbach',
  'גר': 'gar',
  'ליד': 'leyad',
  'חם': 'cham',
  'קרים': 'karim',
  'אוהבת': 'ohevet',
  'במסעדה': 'ba-misada',
  'טעים': 'taim',
  'מאוד': 'meod',
  'לחם': 'lechem',
  'טרי': 'tari',
  'המשפחה': 'ha-mishpacha',
  'מבשל': 'mevashel',
  'עוד': 'od',
  'בבקשה': 'bevakasha',
  'מזמינים': 'mazminem',
  'נוסף': 'nosaf',
  'ארוחת': 'aruchat',
  'לארוחת': 'le-aruchat',
  'הרבה': 'harbe',
  'בתחנה': 'ba-tachana',
  'כדי': 'kedei',
  'לנוח': 'lanuach',
  'פגישה': 'pgisha',
  'לפגישה': 'la-pgisha',
  'הפגישה': 'ha-pgisha',
  'בדיוק': 'bediyuk',
  'אחרי': 'acharei',
  'עשר': 'eser',
  'חמש': 'chamesh',
  'דקות': 'dakot',
  'מדי': 'midai',
  'שעה': 'shaa',
  'בשעה': 'ba-shaa',
  ...cafeTalkTransliterations // Extend with cafeTalk transliterations
};

/**
 * Generate transliteration for a Hebrew sentence by matching words
 */
function generateTransliteration(hebrewSentence: string): string {
  // Simple word-by-word transliteration
  const words = hebrewSentence.split(/[\s,\.!?]+/).filter(w => w.length > 0);
  const transliterated = words.map(word => {
    // Remove punctuation
    const cleanWord = word.replace(/[,\.!?،؛]/g, '');
    const transliteration = sentenceTransliterationLookup[cleanWord];

    if (!transliteration) {
      // Log warning for missing transliteration
      console.warn(`Missing transliteration for Hebrew word: "${cleanWord}"`);
      // Return placeholder instead of Hebrew text
      return `[${cleanWord}]`;
    }

    return transliteration;
  });

  return transliterated.join(' ');
}

/**
 * Parse pattern string to extract acceptable variants
 * Pattern format: "{Hi, Hello}, {I'm, I am} Dani..."
 */
function parsePatternVariants(pattern: string): string[] {
  if (!pattern) return [];

  const variants: string[] = [pattern];

  // Find all {option1, option2, ...} groups
  const groupRegex = /\{([^}]+)\}/g;
  const groups: { text: string; options: string[] }[] = [];
  let match;

  while ((match = groupRegex.exec(pattern)) !== null) {
    const options = match[1].split(',').map(opt => opt.trim());
    groups.push({
      text: match[0],
      options
    });
  }

  // Generate all combinations
  if (groups.length === 0) return [pattern];

  function generateCombinations(baseText: string, remainingGroups: typeof groups): string[] {
    if (remainingGroups.length === 0) return [baseText];

    const [currentGroup, ...restGroups] = remainingGroups;
    const results: string[] = [];

    for (const option of currentGroup.options) {
      const newText = baseText.replace(currentGroup.text, option);
      results.push(...generateCombinations(newText, restGroups));
    }

    return results;
  }

  return generateCombinations(pattern, groups);
}

/**
 * Convert a Sentence to a ConversationLine
 */
export function sentenceToLine(sentence: Sentence): ConversationLine {
  const transliteration = generateTransliteration(sentence.hebrew);
  const englishVariants = sentence.pattern
    ? parsePatternVariants(sentence.pattern)
    : [sentence.english];

  return {
    id: sentence.id,
    he: sentence.hebrew,
    tl: transliteration,
    en: sentence.english,
    acceptableVariants: {
      hebrew: [sentence.hebrew],
      english: englishVariants,
      transliteration: [transliteration]
    },
    sentenceData: sentence
  };
}

/**
 * Default practice plan: each line practices with all four modules
 */
const DEFAULT_MODULE_SEQUENCE: ConversationModuleType[] = [
  'listenMeaningChoice',
  'shadowRepeat',
  'guidedReplyChoice',
  'typeInput'
];

/**
 * Generate default practice plan for a scenario
 */
function generateDefaultPlan(
  scenarioId: string,
  lines: ConversationLine[]
): ConversationPracticePlan {
  const beats: ConversationBeat[] = [];

  // For each line, add all four modules in sequence
  for (const line of lines) {
    for (const moduleId of DEFAULT_MODULE_SEQUENCE) {
      beats.push({
        lineId: line.id,
        moduleId
      });
    }
  }

  return {
    scenarioId,
    beats,
    planName: 'default'
  };
}

/**
 * Create scenario metadata from theme info
 */
function createScenarioMetadata(
  themeKey: string,
  sentences: Sentence[],
  source: 'sentencesByTheme' | 'cafeTalk'
): ConversationScenarioMetadata {
  const avgDifficulty = sentences.reduce((sum, s) => sum + s.difficulty, 0) / sentences.length;

  // Generate i18n keys
  const themeSlug = themeKey.toLowerCase().replace(/[^\w]+/g, '-');

  return {
    id: `conversation-${themeSlug}`,
    theme: themeKey,
    titleKey: `conversation.scenarios.${themeSlug}.title`,
    subtitleKey: `conversation.scenarios.${themeSlug}.subtitle`,
    lineCount: sentences.length,
    difficulty: Math.round(avgDifficulty),
    source
  };
}

/**
 * Convert a theme's sentences into a conversation scenario
 */
export function createScenarioFromTheme(
  themeKey: string,
  sentences: Sentence[]
): ConversationScenario {
  const metadata = createScenarioMetadata(themeKey, sentences, 'sentencesByTheme');
  const lines = sentences.map(sentenceToLine);
  const defaultPlan = generateDefaultPlan(metadata.id, lines);

  return {
    metadata,
    lines,
    defaultPlan
  };
}

/**
 * Generate all conversation scenarios from sentencesByTheme
 */
export function buildAllScenarios(
  sentencesByTheme: Record<string, Sentence[]>
): ConversationScenario[] {
  return Object.entries(sentencesByTheme).map(([themeKey, sentences]) =>
    createScenarioFromTheme(themeKey, sentences)
  );
}
