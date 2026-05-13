// Hebrew target-language realization for numbers_01.
// Number forms match the Bridge Builder pack word list. We use the
// feminine/short citation forms for 2..5 (שתיים, שלוש, ארבע, חמש) and
// the masculine אחד for 1, with no counted noun — the abstract dots
// are the referent, so there is no gender to agree with.
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
    targetText: 'שתיים.',
    direction: 'rtl',
    transliteration: 'shtayim.',
    tokens: [
      { text: 'שתיים.', conceptId: 'two' },
    ],
  },

  player_three: {
    id: 'player_three',
    speaker: 'player',
    targetText: 'שלוש.',
    direction: 'rtl',
    transliteration: 'shalosh.',
    tokens: [
      { text: 'שלוש.', conceptId: 'three' },
    ],
  },

  player_four: {
    id: 'player_four',
    speaker: 'player',
    targetText: 'ארבע.',
    direction: 'rtl',
    transliteration: 'arba.',
    tokens: [
      { text: 'ארבע.', conceptId: 'four' },
    ],
  },

  player_five: {
    id: 'player_five',
    speaker: 'player',
    targetText: 'חמש.',
    direction: 'rtl',
    transliteration: 'chamesh.',
    tokens: [
      { text: 'חמש.', conceptId: 'five' },
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
