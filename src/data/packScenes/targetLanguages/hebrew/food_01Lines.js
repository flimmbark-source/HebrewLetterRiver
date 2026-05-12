// Hebrew target-language realization for food_01.
// Contains only normal scene lines. Distractor lines live in the
// shared distractor pool, not here.

export const food_01Lines = {
  server_drink_choice: {
    id: 'server_drink_choice',
    speaker: 'server',
    targetText: 'קפה או מים?',
    direction: 'rtl',
    transliteration: 'kafe o mayim?',
    tokens: [
      { text: 'קפה', conceptId: 'coffee' },
      { text: 'או', conceptId: 'or' },
      { text: 'מים?', conceptId: 'water' },
    ],
  },

  server_bread_too: {
    id: 'server_bread_too',
    speaker: 'server',
    targetText: 'גם לחם?',
    direction: 'rtl',
    transliteration: 'gam lechem?',
    tokens: [
      { text: 'גם', conceptId: 'also' },
      { text: 'לחם?', conceptId: 'bread' },
    ],
  },

  server_here_you_go: {
    id: 'server_here_you_go',
    speaker: 'server',
    targetText: 'בבקשה.',
    direction: 'rtl',
    transliteration: 'bevakasha.',
    tokens: [
      { text: 'בבקשה.', conceptId: 'please' },
    ],
  },

  player_coffee_please: {
    id: 'player_coffee_please',
    speaker: 'player',
    targetText: 'קפה בבקשה.',
    direction: 'rtl',
    transliteration: 'kafe bevakasha.',
    tokens: [
      { text: 'קפה', conceptId: 'coffee' },
      { text: 'בבקשה.', conceptId: 'please' },
    ],
  },

  player_water_please: {
    id: 'player_water_please',
    speaker: 'player',
    targetText: 'מים בבקשה.',
    direction: 'rtl',
    transliteration: 'mayim bevakasha.',
    tokens: [
      { text: 'מים', conceptId: 'water' },
      { text: 'בבקשה.', conceptId: 'please' },
    ],
  },

  player_yes_bread_please: {
    id: 'player_yes_bread_please',
    speaker: 'player',
    targetText: 'כן, לחם בבקשה.',
    direction: 'rtl',
    transliteration: 'ken, lechem bevakasha.',
    tokens: [
      { text: 'כן,', conceptId: 'yes' },
      { text: 'לחם', conceptId: 'bread' },
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
