// Hebrew target-language realization for colors_01.
// Contains only normal scene lines. Distractor lines live in the
// shared distractor pool, not here.

export const colors_01Lines = {
  friend_what_color_is_this: {
    id: 'friend_what_color_is_this',
    speaker: 'friend',
    targetText: 'איזה צבע זה?',
    direction: 'rtl',
    transliteration: 'eize tseva ze?',
    tokens: [
      { text: 'איזה' },
      { text: 'צבע' },
      { text: 'זה?' },
    ],
  },

  player_red: {
    id: 'player_red',
    speaker: 'player',
    targetText: 'אדום.',
    direction: 'rtl',
    transliteration: 'adom.',
    tokens: [
      { text: 'אדום.', conceptId: 'red' },
    ],
  },

  player_blue: {
    id: 'player_blue',
    speaker: 'player',
    targetText: 'כחול.',
    direction: 'rtl',
    transliteration: 'kachol.',
    tokens: [
      { text: 'כחול.', conceptId: 'blue' },
    ],
  },

  player_green: {
    id: 'player_green',
    speaker: 'player',
    targetText: 'ירוק.',
    direction: 'rtl',
    transliteration: 'yarok.',
    tokens: [
      { text: 'ירוק.', conceptId: 'green' },
    ],
  },

  player_yellow: {
    id: 'player_yellow',
    speaker: 'player',
    targetText: 'צהוב.',
    direction: 'rtl',
    transliteration: 'tsahov.',
    tokens: [
      { text: 'צהוב.', conceptId: 'yellow' },
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
