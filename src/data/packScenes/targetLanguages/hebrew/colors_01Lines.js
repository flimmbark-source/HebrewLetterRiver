// Hebrew target-language realization for colors_01.
// Contains only normal scene lines. Distractor lines live in the
// shared distractor pool, not here.

export const colors_01Lines = {
  seller_color_choice: {
    id: 'seller_color_choice',
    speaker: 'seller',
    targetText: 'אדום או כחול?',
    direction: 'rtl',
    transliteration: 'adom o kachol?',
    tokens: [
      { text: 'אדום', conceptId: 'red' },
      { text: 'או', conceptId: 'or' },
      { text: 'כחול?', conceptId: 'blue' },
    ],
  },

  player_red_please: {
    id: 'player_red_please',
    speaker: 'player',
    targetText: 'אדום בבקשה.',
    direction: 'rtl',
    transliteration: 'adom bevakasha.',
    tokens: [
      { text: 'אדום', conceptId: 'red' },
      { text: 'בבקשה.', conceptId: 'please' },
    ],
  },

  player_blue_please: {
    id: 'player_blue_please',
    speaker: 'player',
    targetText: 'כחול בבקשה.',
    direction: 'rtl',
    transliteration: 'kachol bevakasha.',
    tokens: [
      { text: 'כחול', conceptId: 'blue' },
      { text: 'בבקשה.', conceptId: 'please' },
    ],
  },

  seller_here_you_go: {
    id: 'seller_here_you_go',
    speaker: 'seller',
    targetText: 'בבקשה.',
    direction: 'rtl',
    transliteration: 'bevakasha.',
    tokens: [
      { text: 'בבקשה.', conceptId: 'please' },
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
