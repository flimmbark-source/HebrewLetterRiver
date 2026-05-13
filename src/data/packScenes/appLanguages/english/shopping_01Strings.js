// English app-language strings for shopping_01.
// lineSupportMeanings keys are target-language line IDs (scene + distractor).
// prompts are keyed by beat id. Prompts must not leak the answer before
// the learner acts.

export const shopping_01Strings = {
  goalText: 'Buy something at a small shop and finish politely.',
  briefDescription:
    'You are at a small shop. Notice the shop and money, decide to buy, ask how much, pay, take a bag, and close politely.',

  prompts: {
    spot_shop_context: 'Find the shop words.',
    decide_to_buy: 'How do you answer?',
    ask_how_much: 'Ask the price.',
    pay: 'How do you answer?',
    bag: 'How do you answer?',
    close_exchange: 'Close politely.',
  },

  supportMeanings: {},

  lineSupportMeanings: {
    clerk_shop_money_line: 'Shop and money.',
    clerk_want_to_buy: 'Want to buy?',
    clerk_shows_item: 'Here.',
    clerk_price_line: 'Money please.',
    clerk_bag_offer: 'Bag?',
    clerk_here_you_go: 'Here you go.',
    player_yes_to_buy: 'Yes, to buy.',
    player_how_much: 'How much?',
    player_to_pay: 'To pay.',
    player_bag_please: 'Bag, please.',
    player_thank_you: 'Thank you.',
    distractor_i_am_home: 'I am at home.',
    distractor_my_father: 'My father.',
    distractor_house_is_big: 'The house is big.',
    distractor_good_morning: 'Good morning.',
  },

  recapTemplates: {
    intro: 'Nice work at the shop!',
    learnedPrefix: 'You used:',
  },
};
