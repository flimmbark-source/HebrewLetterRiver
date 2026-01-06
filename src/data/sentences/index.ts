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
  בא: 'come',
  באים: 'come',
  להגיע: 'arrive',
  מגיעים: 'arrive',
  מחכה: 'wait',
  חיכינו: 'wait',
  לחכות: 'wait',
  לשאול: 'ask',
  לומר: 'say',
  ללמוד: 'study',
  לומדים: 'study',
  לקרוא: 'read',
  קורא: 'read',
  לאכול: 'eat',
  לשתות: 'drink',
  שותה: 'drink',
  שותים: 'drink',
  לקנות: 'buy',
  קונים: 'buy',
  לשלם: 'pay',
  משלם: 'pay',
  לעזור: 'help',
  עוזר: 'help',
  להתחיל: 'start',
  מתחילה: 'start',
  לסיים: 'finish',
  מסיימים: 'finish',
  ללכת: 'go',
  הולך: 'go'
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
      hebrew: 'שלום אני דני',
      english: 'Hello, I am Dani.',
      theme: 'Greetings & Introductions',
      difficulty: 1,
      grammarPoints: ['greeting', 'simple present']
    }),
    createSentence({
      id: 'greetings-2',
      hebrew: 'שלום, אתה חבר כאן',
      english: 'Hello, are you a friend here?',
      theme: 'Greetings & Introductions',
      difficulty: 1,
      grammarPoints: ['greeting', 'yes-no question']
    }),
    createSentence({
      id: 'greetings-3',
      hebrew: 'שלום תודה אתה כאן',
      english: 'Hello, thanks, you are here.',
      theme: 'Greetings & Introductions',
      difficulty: 1,
      grammarPoints: ['gratitude', 'present tense linking']
    }),
    createSentence({
      id: 'greetings-4',
      hebrew: 'אני שמח לפגוש אותך היום',
      english: 'I am happy to meet you today.',
      theme: 'Greetings & Introductions',
      difficulty: 2,
      grammarPoints: ['present tense', 'infinitive complement']
    }),
    createSentence({
      id: 'greetings-5',
      hebrew: 'אנחנו מדברים שפה חדשה היום',
      english: 'We speak a new language today.',
      theme: 'Greetings & Introductions',
      difficulty: 2,
      grammarPoints: ['plural subject', 'present progressive nuance']
    }),
    createSentence({
      id: 'greetings-6',
      hebrew: 'אתה בא לעיר היום',
      english: 'You are coming to the city today.',
      theme: 'Greetings & Introductions',
      difficulty: 2,
      grammarPoints: ['motion verb', 'time adverb']
    }),
    createSentence({
      id: 'greetings-7',
      hebrew: 'אני רוצה לשאול שאלה קצרה',
      english: 'I want to ask a quick question.',
      theme: 'Greetings & Introductions',
      difficulty: 3,
      grammarPoints: ['verb + infinitive', 'object noun']
    }),
    createSentence({
      id: 'greetings-8',
      hebrew: 'תודה על התשובה הטובה',
      english: 'Thanks for the good answer.',
      theme: 'Greetings & Introductions',
      difficulty: 2,
      grammarPoints: ['prepositions', 'noun modifiers']
    }),
    createSentence({
      id: 'greetings-9',
      hebrew: 'היום יש לנו רעיון נהדר',
      english: 'Today we have a great idea.',
      theme: 'Greetings & Introductions',
      difficulty: 2,
      grammarPoints: ['possession', 'adjectives']
    }),
    createSentence({
      id: 'greetings-10',
      hebrew: 'שמי אורי ואני אוהב ללמוד שפה',
      english: 'My name is Ori and I love to study a language.',
      theme: 'Greetings & Introductions',
      difficulty: 3,
      grammarPoints: ['coordination', 'infinitive phrase']
    })
  ],
  'At Home': [
    createSentence({
      id: 'home-1',
      hebrew: 'הבית שלנו מלא משפחה',
      english: 'Our home is full of family.',
      theme: 'At Home',
      difficulty: 2,
      grammarPoints: ['possession', 'adjectives']
    }),
    createSentence({
      id: 'home-2',
      hebrew: 'אנחנו אוהבים לשבת בסלון',
      english: 'We like to sit in the living room.',
      theme: 'At Home',
      difficulty: 2,
      grammarPoints: ['verb + infinitive', 'prepositions']
    }),
    createSentence({
      id: 'home-3',
      hebrew: 'אני צריך בית שקט',
      english: 'I need a quiet home.',
      theme: 'At Home',
      difficulty: 1,
      grammarPoints: ['need statements', 'adjectives']
    }),
    createSentence({
      id: 'home-4',
      hebrew: 'שכן עוזר לנו כל יום',
      english: 'A neighbor helps us every day.',
      theme: 'At Home',
      difficulty: 2,
      grammarPoints: ['present tense', 'frequency adverb']
    }),
    createSentence({
      id: 'home-5',
      hebrew: 'היום אנחנו לומדים בבית',
      english: 'Today we study at home.',
      theme: 'At Home',
      difficulty: 2,
      grammarPoints: ['time adverb', 'location preposition']
    }),
    createSentence({
      id: 'home-6',
      hebrew: 'יש לי רעיון לסדר את הבית',
      english: 'I have an idea to organize the home.',
      theme: 'At Home',
      difficulty: 3,
      grammarPoints: ['possession', 'infinitive purpose']
    }),
    createSentence({
      id: 'home-7',
      hebrew: 'הילד קורא ספר בחדר',
      english: 'The child reads a book in the room.',
      theme: 'At Home',
      difficulty: 2,
      grammarPoints: ['present tense', 'location phrases']
    }),
    createSentence({
      id: 'home-8',
      hebrew: 'יש לנו מים וקפה במטבח',
      english: 'We have water and coffee in the kitchen.',
      theme: 'At Home',
      difficulty: 1,
      grammarPoints: ['possession', 'conjunctions']
    }),
    createSentence({
      id: 'home-9',
      hebrew: 'אני רוצה זמן שקט בבוקר',
      english: 'I want quiet time in the morning.',
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
      hebrew: 'אני רוצה לאכול אוכל חם',
      english: 'I want to eat warm food.',
      theme: 'Food & Eating',
      difficulty: 1,
      grammarPoints: ['verb + infinitive', 'adjectives']
    }),
    createSentence({
      id: 'food-2',
      hebrew: 'אנחנו שותים מים קרים',
      english: 'We drink cold water.',
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
      hebrew: 'האוכל במסעדה טעים מאוד',
      english: 'The food at the restaurant is very tasty.',
      theme: 'Food & Eating',
      difficulty: 3,
      grammarPoints: ['copula', 'intensifiers']
    }),
    createSentence({
      id: 'food-5',
      hebrew: 'אנחנו קונים לחם חדש היום',
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
      hebrew: 'הוא מבשל בבית עם המשפחה',
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
      hebrew: 'הם מזמינים קפה נוסף',
      english: 'They order another coffee.',
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
      hebrew: 'היום יום טוב',
      english: 'Today is a good day.',
      theme: 'Numbers & Time',
      difficulty: 1,
      grammarPoints: ['copula', 'adjectives']
    }),
    createSentence({
      id: 'time-2',
      hebrew: 'מחר אנחנו באים לעיר',
      english: 'Tomorrow we are coming to the city.',
      theme: 'Numbers & Time',
      difficulty: 2,
      grammarPoints: ['future reference', 'motion verb']
    }),
    createSentence({
      id: 'time-3',
      hebrew: 'אתמול חיכינו הרבה זמן',
      english: 'Yesterday we waited a long time.',
      theme: 'Numbers & Time',
      difficulty: 2,
      grammarPoints: ['past reference', 'time duration']
    }),
    createSentence({
      id: 'time-4',
      hebrew: 'עכשיו אני הולך לבית',
      english: 'Now I am going home.',
      theme: 'Numbers & Time',
      difficulty: 2,
      grammarPoints: ['present progressive', 'direction']
    }),
    createSentence({
      id: 'time-5',
      hebrew: 'אנחנו מגיעים מוקדם בבוקר',
      english: 'We arrive early in the morning.',
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
      hebrew: 'אנחנו מסיימים מאוחר בערב',
      english: 'We finish late in the evening.',
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
      hebrew: 'לפעמים הזמן קצר מדי',
      english: 'Sometimes the time is too short.',
      theme: 'Numbers & Time',
      difficulty: 2,
      grammarPoints: ['frequency adverb', 'adjectives']
    }),
    createSentence({
      id: 'time-10',
      hebrew: 'תמיד יש לנו שעה לקרוא ספר',
      english: 'We always have an hour to read a book.',
      theme: 'Numbers & Time',
      difficulty: 3,
      grammarPoints: ['frequency adverb', 'infinitive purpose']
    })
  ]
};

export const allSentences: Sentence[] = Object.values(sentencesByTheme).flat();
