// Hebrew Pack Scene lines — food_01 cafe scene.
// Do not use 'he' / 'hebrew' as primary field names here.
// Those aliases exist only at the adapter boundary.

export const hebrewPackSceneLines = {
  'cafe-choice-coffee-water': {
    targetText: 'קפה או מים?',
    transliteration: 'kafe o mayim?',
    supportText: 'Coffee or water?',
    tokens: [
      { text: 'קפה', conceptId: 'coffee' },
      { text: 'או', conceptId: 'or' },
      { text: 'מים?', conceptId: 'water' },
    ],
  },

  'cafe-player-coffee-please': {
    targetText: 'קפה בבקשה.',
    transliteration: 'kafe bevakasha.',
    supportText: 'Coffee please.',
    tokens: [
      { text: 'קפה', conceptId: 'coffee' },
      { text: 'בבקשה.', conceptId: 'please' },
    ],
  },

  'cafe-server-bread-too': {
    targetText: 'גם לחם?',
    transliteration: 'gam lechem?',
    supportText: 'Also bread?',
    tokens: [
      { text: 'גם', conceptId: 'also' },
      { text: 'לחם?', conceptId: 'bread' },
    ],
  },

  'cafe-player-yes-bread': {
    targetText: 'כן, לחם בבקשה.',
    transliteration: 'ken, lechem bevakasha.',
    supportText: 'Yes, bread please.',
    tokens: [
      { text: 'כן,', conceptId: 'yes' },
      { text: 'לחם', conceptId: 'bread' },
      { text: 'בבקשה.', conceptId: 'please' },
    ],
  },

  'cafe-player-thank-you': {
    targetText: 'תודה.',
    transliteration: 'todah.',
    supportText: 'Thank you.',
    tokens: [
      { text: 'תודה.', conceptId: 'thank-you' },
    ],
  },

  'cafe-server-here-you-go': {
    targetText: 'בבקשה.',
    transliteration: 'bevakasha.',
    supportText: 'Here you go.',
    tokens: [
      { text: 'בבקשה.', conceptId: 'please' },
    ],
  },
};
