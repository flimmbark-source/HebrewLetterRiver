// Hebrew Pack Scene lines — food_01 cafe scene.
// Do not use 'he' / 'hebrew' as primary field names here.
// Those aliases exist only at the adapter boundary.

export const hebrewPackSceneLines = {
  'cafe-request-coffee-water': {
    targetText: 'אפשר קפה ומים?',
    transliteration: 'efshar kafe ve-mayim?',
    supportText: 'Can I get coffee and water?',
    tokens: [
      { text: 'אפשר', conceptId: 'can-get' },
      { text: 'קפה', conceptId: 'coffee' },
      { text: 'ו', conceptId: 'and' },
      { text: 'מים', conceptId: 'water' },
    ],
  },

  'cafe-yes-bread-please': {
    targetText: 'כן, לחם בבקשה.',
    transliteration: 'ken, lechem bevakasha.',
    supportText: 'Yes, bread please.',
    tokens: [
      { text: 'כן,', conceptId: 'yes' },
      { text: 'לחם', conceptId: 'bread' },
      { text: 'בבקשה.', conceptId: 'please' },
    ],
  },

  'cafe-thank-you': {
    targetText: 'תודה.',
    transliteration: 'todah.',
    supportText: 'Thank you.',
    tokens: [
      { text: 'תודה.', conceptId: 'thank-you' },
    ],
  },
};
