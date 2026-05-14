// Hebrew target-language realization for everyday_objects_01.
// The objectGlyph visual cue grounds each identification beat, so the cue
// line (מה זה?) is identical for every beat. Distractor lines live in the
// shared pool, not here.

export const everyday_objects_01Lines = {
  friend_what_is_this: {
    id: 'friend_what_is_this',
    speaker: 'friend',
    targetText: 'מה זה?',
    direction: 'rtl',
    transliteration: 'ma ze?',
    tokens: [
      { text: 'מה' },
      { text: 'זה?' },
    ],
  },

  player_book: {
    id: 'player_book',
    speaker: 'player',
    targetText: 'ספר.',
    direction: 'rtl',
    transliteration: 'sefer.',
    tokens: [
      { text: 'ספר.', conceptId: 'book' },
    ],
  },

  player_phone: {
    id: 'player_phone',
    speaker: 'player',
    targetText: 'טלפון.',
    direction: 'rtl',
    transliteration: 'telefon.',
    tokens: [
      { text: 'טלפון.', conceptId: 'phone' },
    ],
  },

  player_table: {
    id: 'player_table',
    speaker: 'player',
    targetText: 'שולחן.',
    direction: 'rtl',
    transliteration: 'shulchan.',
    tokens: [
      { text: 'שולחן.', conceptId: 'table' },
    ],
  },

  player_door: {
    id: 'player_door',
    speaker: 'player',
    targetText: 'דלת.',
    direction: 'rtl',
    transliteration: 'delet.',
    tokens: [
      { text: 'דלת.', conceptId: 'door' },
    ],
  },

  player_thing: {
    id: 'player_thing',
    speaker: 'player',
    targetText: 'דבר.',
    direction: 'rtl',
    transliteration: 'davar.',
    tokens: [
      { text: 'דבר.', conceptId: 'thing' },
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
