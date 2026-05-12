// Hebrew target-language realization for numbers_01.
// Cardinal numbers in the citation form (masculine, used when counting).
// Distractor lines live in the shared distractor pool, not here.

export const numbers_01Lines = {
  friend_how_many: {
    id: 'friend_how_many',
    speaker: 'friend',
    targetText: 'כמה?',
    direction: 'rtl',
    transliteration: 'kama?',
    tokens: [
      { text: 'כמה?' },
    ],
  },

  player_one: {
    id: 'player_one',
    speaker: 'player',
    targetText: 'אחד.',
    direction: 'rtl',
    transliteration: 'echad.',
    tokens: [
      { text: 'אחד.', conceptId: 'one' },
    ],
  },

  player_two: {
    id: 'player_two',
    speaker: 'player',
    targetText: 'שניים.',
    direction: 'rtl',
    transliteration: 'shnayim.',
    tokens: [
      { text: 'שניים.', conceptId: 'two' },
    ],
  },

  player_three: {
    id: 'player_three',
    speaker: 'player',
    targetText: 'שלושה.',
    direction: 'rtl',
    transliteration: 'shlosha.',
    tokens: [
      { text: 'שלושה.', conceptId: 'three' },
    ],
  },

  player_four: {
    id: 'player_four',
    speaker: 'player',
    targetText: 'ארבעה.',
    direction: 'rtl',
    transliteration: 'arba\'a.',
    tokens: [
      { text: 'ארבעה.', conceptId: 'four' },
    ],
  },

  player_five: {
    id: 'player_five',
    speaker: 'player',
    targetText: 'חמישה.',
    direction: 'rtl',
    transliteration: 'chamisha.',
    tokens: [
      { text: 'חמישה.', conceptId: 'five' },
    ],
  },

  friend_nice: {
    id: 'friend_nice',
    speaker: 'friend',
    targetText: 'יפה מאוד.',
    direction: 'rtl',
    transliteration: 'yafe meod.',
    tokens: [
      { text: 'יפה' },
      { text: 'מאוד.' },
    ],
  },

  player_thank_you: {
    id: 'player_thank_you',
    speaker: 'player',
    targetText: 'תודה.',
    direction: 'rtl',
    transliteration: 'todah.',
    tokens: [
      { text: 'תודה.', conceptId: 'thank-you' },
    ],
  },
};
