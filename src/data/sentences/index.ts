import type { Sentence, SentenceWord } from '../../types/sentences.ts';
import { tokenizeHebrewSentence } from '../../lib/sentenceTokenizer.ts';

const baseWordIdLookup: Record<string, string> = {
  שלום: 'shalom',
  תודה: 'todah',
  כן: 'ken',
  לא: 'no',
  אני: 'I',
  אתה: 'you',
  את: 'you',
  הוא: 'he',
  היא: 'she',
  אנחנו: 'we',
  הם: 'they',

  // Names
  דני: 'Dani',
  חבר: 'friend',
  משפחה: 'family',
  שכן: 'neighbor',
  ילד: 'child',
  שפה: 'language',
  מילה: 'word',
  בית: 'home',
  הבית: 'home',
  בבית: 'home',
  לבית: 'home',
  רעיון: 'idea',
  שאלה: 'question',
  תשובה: 'answer',
  ספר: 'book',
  אוכל: 'food',
  מים: 'water',
  קפה: 'coffee',
  עיר: 'city',
  לעיר: 'city',
  בעיר: 'city',
  היום: 'today',
  מחר: 'tomorrow',
  אתמול: 'yesterday',
  עכשיו: 'now',
  זמן: 'time',
  יום: 'day',
  בוקר: 'boker',
  בבוקר: 'boker',
  ערב: 'erev',
  בערב: 'erev',
  מוקדם: 'early',
  מאוחר: 'late',
  תמיד: 'always',
  לפעמים: 'sometimes',
  נהדר: 'great',
  טוב: 'tov',
  שמח: 'happy',
  נחמד: 'nice',
  יפה: 'beautiful',
  רוצה: 'want',
  צריך: 'need',
  בא: 'ba',
  באים: 'baim',
  להגיע: 'lehagia',
  מגיעים: 'magiim',
  מחכה: 'mechake',
  חיכינו: 'chikinu',
  לחכות: 'lechakot',
  לשאול: 'lishol',
  לומר: 'lomar',
  ללמוד: 'lilmod',
  לומדים: 'lomdim',
  לקרוא: 'likro',
  קורא: 'kore',
  לאכול: 'leechol',
  לשתות: 'lishtot',
  שותה: 'shote',
  שותים: 'shotim',
  לקנות: 'liknot',
  קונים: 'konim',
  לשלם: 'leshalem',
  משלם: 'meshalem',
  לעזור: 'laazor',
  עוזר: 'ozer',
  להתחיל: 'lehatkhil',
  מתחילה: 'matkhila',
  לסיים: 'lesayem',
  מסיימים: 'mesayemim',
  ללכת: 'lalechet',
  הולך: 'holech',
  להכיר: 'meet',
  מאיפה: 'where-from',
  חדש: 'new',
  שבאת: 'you-came',
  לך: 'to-you',
  שאתה: 'that-you',
  כאן: 'here',
  איתנו: 'with-us',
  חדשה: 'new-f',
  יחד: 'together',
  איך: 'how',
  שלך: 'yours',
  קצרה: 'short',
  על: 'about',
  זה: 'this',
  שמי: 'my-name',
  אוהב: 'love',
  עם: 'with',
  חברים: 'friends',
  שלנו: 'ours',
  מלא: 'full',
  במשפחה: 'in-family',
  וחברים: 'and-friends',
  אוהבים: 'like',
  לשבת: 'sit',
  לדבר: 'speak',
  שקט: 'quiet',
  לנו: 'to-us',
  קטן: 'small',
  בחדר: 'in-room',
  שלו: 'his',
  במטבח: 'in-kitchen',
  גר: 'live',
  ליד: 'near',
  חם: 'warm',
  קרים: 'cold-pl',
  אוהבת: 'love-f',
  במסעדה: 'restaurant',
  טעים: 'tasty',
  מאוד: 'very',
  לחם: 'bread',
  טרי: 'fresh',
  המשפחה: 'the-family',
  מבשל: 'cook',
  עוד: 'more',
  בבקשה: 'please',
  מזמינים: 'order',
  נוסף: 'another',
  ארוחת: 'meal-of',
  הרבה: 'a-lot',
  בתחנה: 'at-station',
  כדי: 'in-order-to',
  לנוח: 'rest',
  פגישה: 'meeting',
  בדיוק: 'exactly',
  אחרי: 'after',
  עשר: 'ten',
  דקות: 'minutes',
  מדי: 'too',
  שעה: 'hour'
};

function attachWordIds(
  hebrew: string,
  overrides: Record<string, string> = {}
): SentenceWord[] {
  const spans = tokenizeHebrewSentence(hebrew);
  const lookup = { ...baseWordIdLookup, ...overrides };

  return spans.map(span => ({
    ...span,
    wordId: lookup[span.hebrew]
  }));
}

function createSentence(config: {
  id: string;
  hebrew: string;
  english: string;
  pattern?: string;
  theme: string;
  difficulty: Sentence['difficulty'];
  grammarPoints: string[];
  wordIdOverrides?: Record<string, string>;
}): Sentence {
  const words = attachWordIds(config.hebrew, config.wordIdOverrides);

  return {
    ...config,
    words
  };
}

export const sentencesByTheme: Record<string, Sentence[]> = {
  'Greetings & Introductions': [
    createSentence({
      id: 'greetings-1',
      hebrew: 'שלום, אני דני.',
      english: "Hi, I'm Dani.",
      pattern: "{Hi, Hello}, {I'm, I am} Dani.",
      theme: 'Greetings & Introductions',
      difficulty: 1,
      grammarPoints: ['greeting', 'simple present']
    }),
    createSentence({
      id: 'greetings-2',
      hebrew: 'אני חדש כאן.',
      english: 'I am new here.',
      pattern: "{I am, I'm} new here.",
      theme: 'Greetings & Introductions',
      difficulty: 1,
      grammarPoints: ['greeting', 'simple present']
    }),
    createSentence({
      id: 'greetings-3',
      hebrew: 'תודה שבאת היום, חיכינו לך.',
      english: 'Thanks for coming today, we were waiting for you.',
      pattern: "{Thanks, Thank you} for coming today, we were waiting for you.",
      theme: 'Greetings & Introductions',
      difficulty: 1,
      grammarPoints: ['gratitude', 'present tense linking']
    }),
    createSentence({
      id: 'greetings-4',
      hebrew: 'אני שמח שאתה כאן איתנו.',
      english: "I'm happy you're here with us.",
      pattern: "{I'm, I am} happy {you're, you are} here with us.",
      theme: 'Greetings & Introductions',
      difficulty: 2,
      grammarPoints: ['present tense', 'present progressive nuance']
    }),
    createSentence({
      id: 'greetings-5',
      hebrew: 'אנחנו לומדים שפה חדשה יחד.',
      english: 'We are learning a new language together.',
      pattern: "{We are, We're} learning a new language together.",
      theme: 'Greetings & Introductions',
      difficulty: 2,
      grammarPoints: ['plural subject', 'present progressive nuance']
    }),
    createSentence({
      id: 'greetings-6',
      hebrew: 'איך היום שלך?',
      english: 'How is your day today?',
      pattern: "How is your day {today, going}?",
      theme: 'Greetings & Introductions',
      difficulty: 2,
      grammarPoints: ['questions', 'time adverb']
    }),
    createSentence({
      id: 'greetings-7',
      hebrew: 'אני רוצה לשאול שאלה קצרה.',
      english: 'I want to ask a quick question.',
      theme: 'Greetings & Introductions',
      difficulty: 3,
      grammarPoints: ['verb + infinitive', 'object noun']
    }),
    createSentence({
      id: 'greetings-8',
      hebrew: 'תודה על התשובה, זה עוזר.',
      english: 'Thanks for the answer, it helps.',
      theme: 'Greetings & Introductions',
      difficulty: 2,
      grammarPoints: ['prepositions', 'noun modifiers']
    }),
    createSentence({
      id: 'greetings-9',
      hebrew: 'היום יש לנו רעיון טוב להתחיל.',
      english: 'Today we have a good idea to get started.',
      theme: 'Greetings & Introductions',
      difficulty: 2,
      grammarPoints: ['possession', 'adjectives']
    }),
    createSentence({
      id: 'greetings-10',
      hebrew: 'שמי אורי ואני אוהב ללמוד שפה עם חברים.',
      english: 'My name is Ori and I love to study the language with friends.',
      theme: 'Greetings & Introductions',
      difficulty: 3,
      grammarPoints: ['coordination', 'infinitive phrase']
    })
  ],
  'At Home': [
    createSentence({
      id: 'home-1',
      hebrew: 'הבית שלנו מלא במשפחה וחברים.',
      english: 'Our home is full of family and friends.',
      theme: 'At Home',
      difficulty: 2,
      grammarPoints: ['possession', 'adjectives']
    }),
    createSentence({
      id: 'home-2',
      hebrew: 'אנחנו אוהבים לשבת בבית ולדבר.',
      english: 'We like to sit at home and talk.',
      theme: 'At Home',
      difficulty: 2,
      grammarPoints: ['verb + infinitive', 'prepositions']
    }),
    createSentence({
      id: 'home-3',
      hebrew: 'אני צריך בית שקט בערב.',
      english: 'I need a quiet home in the evening.',
      theme: 'At Home',
      difficulty: 1,
      grammarPoints: ['need statements', 'adjectives']
    }),
    createSentence({
      id: 'home-4',
      hebrew: 'שכן עוזר לנו כל יום בבית.',
      english: 'A neighbor helps us every day at home.',
      theme: 'At Home',
      difficulty: 2,
      grammarPoints: ['present tense', 'frequency adverb']
    }),
    createSentence({
      id: 'home-5',
      hebrew: 'היום אנחנו לומדים בבית יחד.',
      english: 'Today we study at home together.',
      theme: 'At Home',
      difficulty: 2,
      grammarPoints: ['time adverb', 'location preposition']
    }),
    createSentence({
      id: 'home-6',
      hebrew: 'יש לי רעיון קטן לבית שלנו.',
      english: 'I have a small idea for our home.',
      theme: 'At Home',
      difficulty: 3,
      grammarPoints: ['possession', 'infinitive purpose']
    }),
    createSentence({
      id: 'home-7',
      hebrew: 'הילד קורא ספר בחדר שלו.',
      english: 'The child reads a book in his room.',
      theme: 'At Home',
      difficulty: 2,
      grammarPoints: ['present tense', 'location phrases']
    }),
    createSentence({
      id: 'home-8',
      hebrew: 'יש לנו מים וקפה במטבח.',
      english: 'We have water and coffee in the kitchen.',
      theme: 'At Home',
      difficulty: 1,
      grammarPoints: ['possession', 'conjunctions']
    }),
    createSentence({
      id: 'home-9',
      hebrew: 'אני רוצה זמן שקט בבוקר עם קפה.',
      english: 'I want a quiet time in the morning with coffee.',
      theme: 'At Home',
      difficulty: 2,
      grammarPoints: ['time phrases', 'adjectives']
    }),
    createSentence({
      id: 'home-10',
      hebrew: 'החבר גר ליד הבית שלנו',
      english: 'The friend lives near our home.',
      theme: 'At Home',
      difficulty: 3,
      grammarPoints: ['location prepositions', 'possession']
    })
  ],
  'Food & Eating': [
    createSentence({
      id: 'food-1',
      hebrew: 'אני רוצה לאכול אוכל חם עכשיו.',
      english: 'I want to eat warm food right now.',
      theme: 'Food & Eating',
      difficulty: 1,
      grammarPoints: ['verb + infinitive', 'adjectives']
    }),
    createSentence({
      id: 'food-2',
      hebrew: 'אנחנו שותים מים קרים יחד.',
      english: 'We drink cold water together.',
      theme: 'Food & Eating',
      difficulty: 1,
      grammarPoints: ['plural subject', 'adjectives']
    }),
    createSentence({
      id: 'food-3',
      hebrew: 'היא אוהבת לשתות קפה בבוקר',
      english: 'She loves to drink coffee in the morning.',
      theme: 'Food & Eating',
      difficulty: 2,
      grammarPoints: ['verb + infinitive', 'time phrases']
    }),
    createSentence({
      id: 'food-4',
      hebrew: 'האוכל במסעדה טעים מאוד.',
      english: 'The food at the restaurant is very tasty.',
      theme: 'Food & Eating',
      difficulty: 3,
      grammarPoints: ['copula', 'intensifiers']
    }),
    createSentence({
      id: 'food-5',
      hebrew: 'אנחנו קונים לחם טרי היום.',
      english: 'We are buying fresh bread today.',
      theme: 'Food & Eating',
      difficulty: 2,
      grammarPoints: ['present progressive', 'adjectives']
    }),
    createSentence({
      id: 'food-6',
      hebrew: 'אני משלם על אוכל ושותה מים',
      english: 'I pay for food and drink water.',
      theme: 'Food & Eating',
      difficulty: 3,
      grammarPoints: ['prepositions', 'coordinating verbs']
    }),
    createSentence({
      id: 'food-7',
      hebrew: 'הוא מבשל בבית עם המשפחה.',
      english: 'He cooks at home with the family.',
      theme: 'Food & Eating',
      difficulty: 2,
      grammarPoints: ['location phrases', 'prepositions']
    }),
    createSentence({
      id: 'food-8',
      hebrew: 'אני רוצה עוד מים בבקשה',
      english: 'I want more water, please.',
      theme: 'Food & Eating',
      difficulty: 1,
      grammarPoints: ['politeness', 'quantifiers']
    }),
    createSentence({
      id: 'food-9',
      hebrew: 'הם מזמינים קפה נוסף כל ערב.',
      english: 'They order another coffee every evening.',
      theme: 'Food & Eating',
      difficulty: 3,
      grammarPoints: ['present tense', 'quantifiers']
    }),
    createSentence({
      id: 'food-10',
      hebrew: 'יש לנו רעיון לארוחת ערב',
      english: 'We have an idea for dinner.',
      theme: 'Food & Eating',
      difficulty: 2,
      grammarPoints: ['possession', 'purpose phrase']
    })
  ],
  'Numbers & Time': [
    createSentence({
      id: 'time-1',
      hebrew: 'היום יום טוב ושקט.',
      english: 'Today is a good and quiet day.',
      theme: 'Numbers & Time',
      difficulty: 1,
      grammarPoints: ['copula', 'adjectives']
    }),
    createSentence({
      id: 'time-2',
      hebrew: 'מחר אנחנו באים לעיר מוקדם.',
      english: 'Tomorrow we are coming to the city early.',
      theme: 'Numbers & Time',
      difficulty: 2,
      grammarPoints: ['future reference', 'motion verb']
    }),
    createSentence({
      id: 'time-3',
      hebrew: 'אתמול חיכינו הרבה זמן בתחנה.',
      english: 'Yesterday we waited a long time at the station.',
      theme: 'Numbers & Time',
      difficulty: 2,
      grammarPoints: ['past reference', 'time duration']
    }),
    createSentence({
      id: 'time-4',
      hebrew: 'עכשיו אני הולך לבית כדי לנוח.',
      english: 'Now I am going home to rest.',
      theme: 'Numbers & Time',
      difficulty: 2,
      grammarPoints: ['present progressive', 'direction']
    }),
    createSentence({
      id: 'time-5',
      hebrew: 'אנחנו מגיעים מוקדם בבוקר לפגישה.',
      english: 'We arrive early in the morning for a meeting.',
      theme: 'Numbers & Time',
      difficulty: 2,
      grammarPoints: ['time phrases', 'motion verbs']
    }),
    createSentence({
      id: 'time-6',
      hebrew: 'הפגישה מתחילה בשעה חמש',
      english: 'The meeting starts at five o\'clock.',
      theme: 'Numbers & Time',
      difficulty: 3,
      grammarPoints: ['clock time', 'present tense']
    }),
    createSentence({
      id: 'time-7',
      hebrew: 'אנחנו מסיימים מאוחר בערב אחרי הספר.',
      english: 'We finish late in the evening after the book.',
      theme: 'Numbers & Time',
      difficulty: 2,
      grammarPoints: ['time phrases', 'adverbs']
    }),
    createSentence({
      id: 'time-8',
      hebrew: 'אני מחכה עשר דקות ואתה בא',
      english: 'I wait ten minutes and you come.',
      theme: 'Numbers & Time',
      difficulty: 3,
      grammarPoints: ['numbers', 'coordinated clauses']
    }),
    createSentence({
      id: 'time-9',
      hebrew: 'לפעמים הזמן קצר מדי לקרוא ספר.',
      english: 'Sometimes time is too short to read a book.',
      theme: 'Numbers & Time',
      difficulty: 2,
      grammarPoints: ['frequency adverb', 'adjectives']
    }),
    createSentence({
      id: 'time-10',
      hebrew: 'תמיד יש לנו שעה לקרוא ספר יחד.',
      english: 'We always have an hour to read a book together.',
      theme: 'Numbers & Time',
      difficulty: 3,
      grammarPoints: ['frequency adverb', 'infinitive purpose']
    })
  ]
};

export const allSentences: Sentence[] = Object.values(sentencesByTheme).flat();
