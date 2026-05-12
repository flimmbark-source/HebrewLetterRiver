// English app-language strings for food_01.
// supportMeanings keys come from blueprint meaningChoice option.meaningId.
// lineSupportMeanings keys are target-language line IDs (scene + distractor).
// prompts are keyed by beat id.

export const food_01Strings = {
  goalText: 'Choose a drink, then get bread.',
  briefDescription:
    "Order in a small cafe. Hear the server, choose a drink, accept bread, and close politely.",

  prompts: {
    spot_drink_offer: 'Find the choice words.',
    understand_drink_offer: 'What choice did the server give you?',
    answer_drink: 'Answer the server.',
    accept_bread: 'How do you answer?',
    close_exchange: 'Close politely.',
  },

  supportMeanings: {
    coffee_or_water: 'Coffee or water?',
    bread_too: 'Bread too?',
    here_you_go: 'Here you go.',
  },

  lineSupportMeanings: {
    server_drink_choice: 'Coffee or water?',
    server_bread_too: 'Also bread?',
    server_here_you_go: 'Here you go.',
    player_coffee_please: 'Coffee please.',
    player_water_please: 'Water please.',
    player_yes_bread_please: 'Yes, bread please.',
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
