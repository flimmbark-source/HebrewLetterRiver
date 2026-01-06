/**
 * Module vocabulary reading texts
 * Each module has a corresponding vocab reading text for practice
 */

import { createReadingText } from '../common/helpers.js';

/**
 * Module 1: Greetings & Introductions Vocabulary - Section 1
 * Basic greetings and pronouns
 */
export const module1Vocab1Text = createReadingText({
  id: 'module-1-vocab-1',
  title: {
    en: 'Vocabulary Part 1',
    he: 'אוצר מילים חלק 1'
  },
  subtitle: {
    en: 'Basic Greetings & Pronouns',
    he: 'ברכות וכינויים בסיסיים'
  },
  practiceLanguage: 'hebrew',
  sectionId: 'modules',
  tokens: [
    { type: 'word', text: 'שלום', id: 'shalom' },
    { type: 'word', text: 'תודה', id: 'todah' },
    { type: 'word', text: 'אני', id: 'I' },
    { type: 'word', text: 'אתה', id: 'you-m' },
    { type: 'word', text: 'את', id: 'you-f' },
    { type: 'word', text: 'אנחנו', id: 'we' },
    { type: 'word', text: 'שמח', id: 'happy' }
  ],
  glosses: {
    en: {
      shalom: 'hello, peace',
      todah: 'thank you',
      I: 'I',
      'you-m': 'you (masculine)',
      'you-f': 'you (feminine)',
      we: 'we',
      happy: 'happy'
    }
  },
  translations: {
    en: {
      shalom: { canonical: 'shalom', variants: ['shalom', 'hello', 'peace'] },
      todah: { canonical: 'todah', variants: ['todah', 'toda', 'thanks'] },
      I: { canonical: 'ani', variants: ['ani'] },
      'you-m': { canonical: 'atah', variants: ['atah', 'ata'] },
      'you-f': { canonical: 'at', variants: ['at'] },
      we: { canonical: 'anachnu', variants: ['anachnu', 'anakhnu'] },
      happy: { canonical: 'sameach', variants: ['sameach', 'same\'ach'] }
    }
  }
});

/**
 * Module 1: Greetings & Introductions Vocabulary - Section 2
 * Nouns and descriptive words
 */
export const module1Vocab2Text = createReadingText({
  id: 'module-1-vocab-2',
  title: {
    en: 'Vocabulary Part 2',
    he: 'אוצר מילים חלק 2'
  },
  subtitle: {
    en: 'Nouns & Descriptions',
    he: 'שמות עצם ותיאורים'
  },
  practiceLanguage: 'hebrew',
  sectionId: 'modules',
  tokens: [
    { type: 'word', text: 'חדשה', id: 'new-f' },
    { type: 'word', text: 'שפה', id: 'language' },
    { type: 'word', text: 'שאלה', id: 'question' },
    { type: 'word', text: 'תשובה', id: 'answer' },
    { type: 'word', text: 'רעיון', id: 'idea' },
    { type: 'word', text: 'היום', id: 'today' },
    { type: 'word', text: 'כאן', id: 'here' }
  ],
  glosses: {
    en: {
      'new-f': 'new (feminine)',
      language: 'language',
      question: 'question',
      answer: 'answer',
      idea: 'idea',
      today: 'today',
      here: 'here'
    }
  },
  translations: {
    en: {
      'new-f': { canonical: 'chadashah', variants: ['chadashah', 'hadasha'] },
      language: { canonical: 'safah', variants: ['safah', 'safa'] },
      question: { canonical: 'she\'elah', variants: ['she\'elah', 'sheelah', 'shayla'] },
      answer: { canonical: 'teshuvah', variants: ['teshuvah', 'teshuva'] },
      idea: { canonical: 'ra\'ayon', variants: ['ra\'ayon', 'rayon'] },
      today: { canonical: 'hayom', variants: ['hayom', 'ha-yom'] },
      here: { canonical: 'kan', variants: ['kan'] }
    }
  }
});

/**
 * Module 1: Greetings & Introductions Vocabulary - Section 3
 * Action words and verbs
 */
export const module1Vocab3Text = createReadingText({
  id: 'module-1-vocab-3',
  title: {
    en: 'Vocabulary Part 3',
    he: 'אוצר מילים חלק 3'
  },
  subtitle: {
    en: 'Actions & Verbs',
    he: 'פעולות ופעלים'
  },
  practiceLanguage: 'hebrew',
  sectionId: 'modules',
  tokens: [
    { type: 'word', text: 'יחד', id: 'together' },
    { type: 'word', text: 'רוצה', id: 'want' },
    { type: 'word', text: 'לומדים', id: 'study' },
    { type: 'word', text: 'לשאול', id: 'ask' },
    { type: 'word', text: 'עוזר', id: 'help' },
    { type: 'word', text: 'להתחיל', id: 'start' }
  ],
  glosses: {
    en: {
      together: 'together',
      want: 'want',
      study: 'study, learn',
      ask: 'to ask',
      help: 'helps',
      start: 'to start'
    }
  },
  translations: {
    en: {
      together: { canonical: 'yachad', variants: ['yachad', 'ya\'had'] },
      want: { canonical: 'rotseh', variants: ['rotseh', 'rotzeh'] },
      study: { canonical: 'lomdim', variants: ['lomdim', 'lom\'dim'] },
      ask: { canonical: 'lish\'ol', variants: ['lish\'ol', 'lishol'] },
      help: { canonical: 'ozer', variants: ['ozer', '\'ozer'] },
      start: { canonical: 'lehatchil', variants: ['lehatchil', 'lehat\'hil'] }
    }
  }
});

/**
 * Module 2: At Home Vocabulary
 */
export const module2VocabText = createReadingText({
  id: 'module-2-vocab',
  title: {
    en: 'Module 2 Vocabulary',
    he: 'אוצר מילים מודול 2'
  },
  subtitle: {
    en: 'At Home',
    he: 'בבית'
  },
  practiceLanguage: 'hebrew',
  sectionId: 'modules',
  tokens: [
    { type: 'word', text: 'בית', id: 'home' },
    { type: 'word', text: 'משפחה', id: 'family' },
    { type: 'word', text: 'חבר', id: 'friend' },
    { type: 'word', text: 'חברים', id: 'friends' },
    { type: 'word', text: 'שכן', id: 'neighbor' },
    { type: 'word', text: 'ילד', id: 'child' },
    { type: 'word', text: 'ספר', id: 'book' },
    { type: 'word', text: 'מים', id: 'water' },
    { type: 'word', text: 'קפה', id: 'coffee' },
    { type: 'word', text: 'שקט', id: 'quiet' },
    { type: 'word', text: 'קטן', id: 'small' },
    { type: 'word', text: 'מלא', id: 'full' },
    { type: 'word', text: 'ערב', id: 'erev' },
    { type: 'word', text: 'בוקר', id: 'boker' },
    { type: 'word', text: 'יום', id: 'day' },
    { type: 'word', text: 'זמן', id: 'time' },
    { type: 'word', text: 'אוהבים', id: 'like' },
    { type: 'word', text: 'לשבת', id: 'sit' },
    { type: 'word', text: 'לדבר', id: 'speak' },
    { type: 'word', text: 'צריך', id: 'need' },
    { type: 'word', text: 'קורא', id: 'read' },
    { type: 'word', text: 'גר', id: 'live' }
  ],
  glosses: {
    en: {
      home: 'home, house',
      family: 'family',
      friend: 'friend',
      friends: 'friends',
      neighbor: 'neighbor',
      child: 'child',
      book: 'book',
      water: 'water',
      coffee: 'coffee',
      quiet: 'quiet',
      small: 'small',
      full: 'full',
      erev: 'evening',
      boker: 'morning',
      day: 'day',
      time: 'time',
      like: 'like, love',
      sit: 'to sit',
      speak: 'to speak, talk',
      need: 'need',
      read: 'read',
      live: 'live, reside'
    }
  },
  translations: {
    en: {
      home: { canonical: 'bayit', variants: ['bayit', 'bait', 'ba\'it'] },
      family: { canonical: 'mishpachah', variants: ['mishpachah', 'mishpacha'] },
      friend: { canonical: 'chaver', variants: ['chaver', 'haver'] },
      friends: { canonical: 'chaverim', variants: ['chaverim', 'haverim'] },
      neighbor: { canonical: 'shachen', variants: ['shachen', 'shakhen'] },
      child: { canonical: 'yeled', variants: ['yeled'] },
      book: { canonical: 'sefer', variants: ['sefer'] },
      water: { canonical: 'mayim', variants: ['mayim', 'ma\'im'] },
      coffee: { canonical: 'kafeh', variants: ['kafeh', 'kafe'] },
      quiet: { canonical: 'shaket', variants: ['shaket', 'sheket'] },
      small: { canonical: 'katan', variants: ['katan'] },
      full: { canonical: 'maleh', variants: ['maleh', 'male'] },
      erev: { canonical: 'erev', variants: ['erev'] },
      boker: { canonical: 'boker', variants: ['boker'] },
      day: { canonical: 'yom', variants: ['yom'] },
      time: { canonical: 'zman', variants: ['zman', 'z\'man'] },
      like: { canonical: 'ohavim', variants: ['ohavim', '\'ohavim'] },
      sit: { canonical: 'lashevet', variants: ['lashevet', 'la-shevet'] },
      speak: { canonical: 'ledaber', variants: ['ledaber', 'le-daber'] },
      need: { canonical: 'tzarich', variants: ['tzarich', 'tsarich'] },
      read: { canonical: 'koreh', variants: ['koreh', 'kore'] },
      live: { canonical: 'gar', variants: ['gar'] }
    }
  }
});

/**
 * Module 3: Food & Eating Vocabulary
 */
export const module3VocabText = createReadingText({
  id: 'module-3-vocab',
  title: {
    en: 'Module 3 Vocabulary',
    he: 'אוצר מילים מודול 3'
  },
  subtitle: {
    en: 'Food & Eating',
    he: 'אוכל ואכילה'
  },
  practiceLanguage: 'hebrew',
  sectionId: 'modules',
  tokens: [
    { type: 'word', text: 'אוכל', id: 'food' },
    { type: 'word', text: 'לחם', id: 'bread' },
    { type: 'word', text: 'מסעדה', id: 'restaurant' },
    { type: 'word', text: 'ארוחת', id: 'meal-of' },
    { type: 'word', text: 'חם', id: 'warm' },
    { type: 'word', text: 'קרים', id: 'cold-pl' },
    { type: 'word', text: 'טעים', id: 'tasty' },
    { type: 'word', text: 'טרי', id: 'fresh' },
    { type: 'word', text: 'עכשיו', id: 'now' },
    { type: 'word', text: 'מאוד', id: 'very' },
    { type: 'word', text: 'עוד', id: 'more' },
    { type: 'word', text: 'בבקשה', id: 'please' },
    { type: 'word', text: 'לאכול', id: 'eat' },
    { type: 'word', text: 'לשתות', id: 'drink' },
    { type: 'word', text: 'קונים', id: 'buy' },
    { type: 'word', text: 'משלם', id: 'pay' },
    { type: 'word', text: 'מבשל', id: 'cook' },
    { type: 'word', text: 'מזמינים', id: 'order' }
  ],
  glosses: {
    en: {
      food: 'food',
      bread: 'bread',
      restaurant: 'restaurant',
      'meal-of': 'meal of',
      warm: 'warm, hot',
      'cold-pl': 'cold (plural)',
      tasty: 'tasty',
      fresh: 'fresh',
      now: 'now, right now',
      very: 'very',
      more: 'more, another',
      please: 'please',
      eat: 'to eat',
      drink: 'to drink',
      buy: 'buy',
      pay: 'pay',
      cook: 'cook',
      order: 'order'
    }
  },
  translations: {
    en: {
      food: { canonical: 'ochel', variants: ['ochel', '\'ochel'] },
      bread: { canonical: 'lechem', variants: ['lechem'] },
      restaurant: { canonical: 'mis\'adah', variants: ['mis\'adah', 'misada'] },
      'meal-of': { canonical: 'aruchat', variants: ['aruchat', '\'aruchat'] },
      warm: { canonical: 'cham', variants: ['cham', 'ham'] },
      'cold-pl': { canonical: 'karim', variants: ['karim'] },
      tasty: { canonical: 'ta\'im', variants: ['ta\'im', 'taim'] },
      fresh: { canonical: 'tari', variants: ['tari'] },
      now: { canonical: 'achshav', variants: ['achshav', 'akhshav'] },
      very: { canonical: 'me\'od', variants: ['me\'od', 'meod'] },
      more: { canonical: 'od', variants: ['od', '\'od'] },
      please: { canonical: 'bevakasha', variants: ['bevakasha', 'be-vakasha'] },
      eat: { canonical: 'le\'echol', variants: ['le\'echol', 'leechol'] },
      drink: { canonical: 'lishtot', variants: ['lishtot', 'lish\'tot'] },
      buy: { canonical: 'konim', variants: ['konim'] },
      pay: { canonical: 'meshalem', variants: ['meshalem'] },
      cook: { canonical: 'mevashel', variants: ['mevashel'] },
      order: { canonical: 'mazminim', variants: ['mazminim'] }
    }
  }
});

/**
 * Module 4: Numbers & Time Vocabulary
 */
export const module4VocabText = createReadingText({
  id: 'module-4-vocab',
  title: {
    en: 'Module 4 Vocabulary',
    he: 'אוצר מילים מודול 4'
  },
  subtitle: {
    en: 'Numbers & Time',
    he: 'מספרים וזמן'
  },
  practiceLanguage: 'hebrew',
  sectionId: 'modules',
  tokens: [
    { type: 'word', text: 'מחר', id: 'tomorrow' },
    { type: 'word', text: 'אתמול', id: 'yesterday' },
    { type: 'word', text: 'מוקדם', id: 'early' },
    { type: 'word', text: 'מאוחר', id: 'late' },
    { type: 'word', text: 'תמיד', id: 'always' },
    { type: 'word', text: 'לפעמים', id: 'sometimes' },
    { type: 'word', text: 'טוב', id: 'tov' },
    { type: 'word', text: 'עיר', id: 'city' },
    { type: 'word', text: 'פגישה', id: 'meeting' },
    { type: 'word', text: 'שעה', id: 'hour' },
    { type: 'word', text: 'דקות', id: 'minutes' },
    { type: 'word', text: 'באים', id: 'come' },
    { type: 'word', text: 'מגיעים', id: 'arrive' },
    { type: 'word', text: 'מחכה', id: 'wait' },
    { type: 'word', text: 'הולך', id: 'go' },
    { type: 'word', text: 'מסיימים', id: 'finish' },
    { type: 'word', text: 'לנוח', id: 'rest' }
  ],
  glosses: {
    en: {
      tomorrow: 'tomorrow',
      yesterday: 'yesterday',
      early: 'early',
      late: 'late',
      always: 'always',
      sometimes: 'sometimes',
      tov: 'good',
      city: 'city',
      meeting: 'meeting',
      hour: 'hour, o\'clock',
      minutes: 'minutes',
      come: 'come',
      arrive: 'arrive',
      wait: 'wait',
      go: 'go',
      finish: 'finish',
      rest: 'to rest'
    }
  },
  translations: {
    en: {
      tomorrow: { canonical: 'machar', variants: ['machar'] },
      yesterday: { canonical: 'etmol', variants: ['etmol'] },
      early: { canonical: 'mukdam', variants: ['mukdam'] },
      late: { canonical: 'me\'uchar', variants: ['me\'uchar', 'meuchar'] },
      always: { canonical: 'tamid', variants: ['tamid'] },
      sometimes: { canonical: 'lif\'amim', variants: ['lif\'amim', 'lifamim'] },
      tov: { canonical: 'tov', variants: ['tov'] },
      city: { canonical: 'ir', variants: ['ir', '\'ir'] },
      meeting: { canonical: 'p\'gishah', variants: ['p\'gishah', 'pgishah'] },
      hour: { canonical: 'sha\'ah', variants: ['sha\'ah', 'shaah'] },
      minutes: { canonical: 'dakot', variants: ['dakot'] },
      come: { canonical: 'ba\'im', variants: ['ba\'im', 'baim'] },
      arrive: { canonical: 'magi\'im', variants: ['magi\'im', 'magiim'] },
      wait: { canonical: 'mechakeh', variants: ['mechakeh', 'mekhakeh'] },
      go: { canonical: 'holech', variants: ['holech', 'hole\'h'] },
      finish: { canonical: 'mesayemim', variants: ['mesayemim', 'mesaymim'] },
      rest: { canonical: 'lanuach', variants: ['lanuach', 'la-nuach'] }
    }
  }
});

export const moduleVocabTexts = [
  module1Vocab1Text,
  module1Vocab2Text,
  module1Vocab3Text,
  module2VocabText,
  module3VocabText,
  module4VocabText
];
