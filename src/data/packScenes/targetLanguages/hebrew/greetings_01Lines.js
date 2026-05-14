// Hebrew target-language realization for greetings_01.
//
// Polysemy contract (repeated here for clarity):
//   שלום  → tagged with conceptId 'hello' only. The peace/goodbye readings are not
//            active in this scene.
//   בבקשה → tagged with conceptId 'you-are-welcome' only. The 'please' reading is
//            not active in this scene.

export const greetings_01Lines = {
  // ─── Friend (NPC) cue lines ───────────────────────────────────────────────

  friend_hello: {
    id: 'friend_hello',
    speaker: 'friend',
    targetText: 'שלום!',
    direction: 'rtl',
    transliteration: 'shalom!',
    tokens: [
      { text: 'שלום!' },
    ],
  },

  friend_here_you_go: {
    id: 'friend_here_you_go',
    speaker: 'friend',
    targetText: 'הנה!',
    direction: 'rtl',
    transliteration: 'hine!',
    tokens: [
      { text: 'הנה!' },
    ],
  },

  friend_thank_you: {
    id: 'friend_thank_you',
    speaker: 'friend',
    targetText: 'תודה!',
    direction: 'rtl',
    transliteration: 'todah!',
    tokens: [
      { text: 'תודה!' },
    ],
  },

  friend_goodbye: {
    id: 'friend_goodbye',
    speaker: 'friend',
    targetText: 'להתראות!',
    direction: 'rtl',
    transliteration: 'lehitraot!',
    tokens: [
      { text: 'להתראות!' },
    ],
  },

  // ─── Player (learner) response lines ──────────────────────────────────────

  player_hello: {
    id: 'player_hello',
    speaker: 'player',
    targetText: 'שלום!',
    direction: 'rtl',
    transliteration: 'shalom!',
    tokens: [
      { text: 'שלום!', conceptId: 'hello' },
    ],
  },

  player_good_morning: {
    id: 'player_good_morning',
    speaker: 'player',
    targetText: 'בוקר טוב!',
    direction: 'rtl',
    transliteration: 'boker tov!',
    tokens: [
      { text: 'בוקר' },
      { text: 'טוב!', conceptId: 'good-morning' },
    ],
  },

  player_thank_you: {
    id: 'player_thank_you',
    speaker: 'player',
    targetText: 'תודה!',
    direction: 'rtl',
    transliteration: 'todah!',
    tokens: [
      { text: 'תודה!', conceptId: 'thank-you' },
    ],
  },

  player_you_are_welcome: {
    id: 'player_you_are_welcome',
    speaker: 'player',
    targetText: 'בבקשה!',
    direction: 'rtl',
    transliteration: 'bevakasha!',
    tokens: [
      { text: 'בבקשה!', conceptId: 'you-are-welcome' },
    ],
  },

  player_good_night: {
    id: 'player_good_night',
    speaker: 'player',
    targetText: 'לילה טוב!',
    direction: 'rtl',
    transliteration: 'layla tov!',
    tokens: [
      { text: 'לילה' },
      { text: 'טוב!', conceptId: 'good-night' },
    ],
  },
};
