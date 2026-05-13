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

  server_want_food: {
    id: 'server_want_food',
    speaker: 'server',
    targetText: 'רוצה אוכל?',
    direction: 'rtl',
    transliteration: 'rotse ochel?',
    tokens: [
      { text: 'רוצה', conceptId: 'want' },
      { text: 'אוכל?', conceptId: 'food' },
    ],
  },

  server_snack_choice: {
    id: 'server_snack_choice',
    speaker: 'server',
    targetText: 'לחם או תפוח?',
    direction: 'rtl',
    transliteration: 'lechem o tapuach?',
    tokens: [
      { text: 'לחם', conceptId: 'bread' },
      { text: 'או', conceptId: 'or' },
      { text: 'תפוח?', conceptId: 'apple' },
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

  player_yes_food_please: {
    id: 'player_yes_food_please',
    speaker: 'player',
    targetText: 'כן, אוכל בבקשה.',
    direction: 'rtl',
    transliteration: 'ken, ochel bevakasha.',
    tokens: [
      { text: 'כן,', conceptId: 'yes' },
      { text: 'אוכל', conceptId: 'food' },
      { text: 'בבקשה.', conceptId: 'please' },
    ],
  },

  player_bread_please: {
    id: 'player_bread_please',
    speaker: 'player',
    targetText: 'לחם בבקשה.',
    direction: 'rtl',
    transliteration: 'lechem bevakasha.',
    tokens: [
      { text: 'לחם', conceptId: 'bread' },
      { text: 'בבקשה.', conceptId: 'please' },
    ],
  },

  player_apple_please: {
    id: 'player_apple_please',
    speaker: 'player',
    targetText: 'תפוח בבקשה.',
    direction: 'rtl',
    transliteration: 'tapuach bevakasha.',
    tokens: [
      { text: 'תפוח', conceptId: 'apple' },
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
