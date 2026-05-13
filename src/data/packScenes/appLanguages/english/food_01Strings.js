// English app-language strings for food_01.
// lineSupportMeanings keys are target-language line IDs (scene + distractor).
// prompts are keyed by beat id.

export const food_01Strings = {
  goalText: 'Order a drink, accept food, and choose a snack.',
  briefDescription:
    'Order in a small cafe. Hear the server, choose a drink, accept food, choose a snack, and close politely.',

  prompts: {
    spot_drink_offer: 'Find the choice words.',
    answer_drink: 'Answer the server.',
    accept_food: 'How do you answer?',
    spot_snack_offer: 'Find the snack choices.',
    answer_snack: 'Choose your snack.',
    close_exchange: 'Close politely.',
  },

  supportMeanings: {},

  lineSupportMeanings: {
    server_drink_choice: 'Coffee or water?',
    server_want_food: 'Want food?',
    server_snack_choice: 'Bread or apple?',
    server_here_you_go: 'Here you go.',
    player_coffee_please: 'Coffee, please.',
    player_water_please: 'Water, please.',
    player_yes_food_please: 'Yes, food please.',
    player_bread_please: 'Bread, please.',
    player_apple_please: 'Apple, please.',
    player_thank_you: 'Thank you.',
    distractor_i_am_home: 'I am at home.',
    distractor_my_father: 'My father.',
    distractor_house_is_big: 'The house is big.',
    distractor_good_morning: 'Good morning.',
  },

  recapTemplates: {
    intro: 'Nice work at the cafe!',
    learnedPrefix: 'You used:',
  },
};
