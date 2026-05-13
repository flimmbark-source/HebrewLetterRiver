// Hebrew target-language realization for shopping_01.
// Contains only normal scene lines. Distractor lines live in the
// shared distractor pool, not here.

export const shopping_01Lines = {
  clerk_shop_money_line: {
    id: 'clerk_shop_money_line',
    speaker: 'clerk',
    targetText: 'חנות וכסף.',
    direction: 'rtl',
    transliteration: 'chanut ve-kesef.',
    tokens: [
      { text: 'חנות', conceptId: 'store' },
      { text: 'ו', conceptId: 'and' },
      { text: 'כסף.', conceptId: 'money' },
    ],
  },

  clerk_want_to_buy: {
    id: 'clerk_want_to_buy',
    speaker: 'clerk',
    targetText: 'רוצה לקנות?',
    direction: 'rtl',
    transliteration: 'rotse liknot?',
    tokens: [
      { text: 'רוצה', conceptId: 'want' },
      { text: 'לקנות?', conceptId: 'buy' },
    ],
  },

  player_yes_to_buy: {
    id: 'player_yes_to_buy',
    speaker: 'player',
    targetText: 'כן, לקנות.',
    direction: 'rtl',
    transliteration: 'ken, liknot.',
    tokens: [
      { text: 'כן,', conceptId: 'yes' },
      { text: 'לקנות.', conceptId: 'buy' },
    ],
  },

  clerk_shows_item: {
    id: 'clerk_shows_item',
    speaker: 'clerk',
    targetText: 'הנה.',
    direction: 'rtl',
    transliteration: 'hineh.',
    tokens: [
      { text: 'הנה.' },
    ],
  },

  player_how_much: {
    id: 'player_how_much',
    speaker: 'player',
    targetText: 'כמה?',
    direction: 'rtl',
    transliteration: 'kamah?',
    tokens: [
      { text: 'כמה?', conceptId: 'how-much' },
    ],
  },

  clerk_price_line: {
    id: 'clerk_price_line',
    speaker: 'clerk',
    targetText: 'כסף בבקשה.',
    direction: 'rtl',
    transliteration: 'kesef bevakasha.',
    tokens: [
      { text: 'כסף', conceptId: 'money' },
      { text: 'בבקשה.', conceptId: 'please' },
    ],
  },

  player_to_pay: {
    id: 'player_to_pay',
    speaker: 'player',
    targetText: 'לשלם.',
    direction: 'rtl',
    transliteration: 'leshalem.',
    tokens: [
      { text: 'לשלם.', conceptId: 'pay' },
    ],
  },

  clerk_bag_offer: {
    id: 'clerk_bag_offer',
    speaker: 'clerk',
    targetText: 'שקית?',
    direction: 'rtl',
    transliteration: 'sakit?',
    tokens: [
      { text: 'שקית?', conceptId: 'bag' },
    ],
  },

  player_bag_please: {
    id: 'player_bag_please',
    speaker: 'player',
    targetText: 'שקית בבקשה.',
    direction: 'rtl',
    transliteration: 'sakit bevakasha.',
    tokens: [
      { text: 'שקית', conceptId: 'bag' },
      { text: 'בבקשה.', conceptId: 'please' },
    ],
  },

  clerk_here_you_go: {
    id: 'clerk_here_you_go',
    speaker: 'clerk',
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
