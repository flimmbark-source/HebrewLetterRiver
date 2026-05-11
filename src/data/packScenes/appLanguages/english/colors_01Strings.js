// English app-language strings for colors_01.
// supportMeanings keys come from blueprint meaningChoice option.meaningId.
// lineSupportMeanings keys are target-language line IDs (scene + distractor).
// prompts are keyed by beat id.

export const colors_01Strings = {
  goalText: 'Pick a color at the stall.',
  briefDescription:
    'A seller at the market asks if you want red or blue. Choose a color and finish politely.',

  prompts: {
    spot_color_choice: 'Find the choice words.',
    understand_color_choice: 'What choice did the seller give you?',
    answer_color: 'Answer the seller.',
    close_exchange: 'Close politely.',
  },

  supportMeanings: {
    red_or_blue: 'Red or blue?',
    coffee_or_water: 'Coffee or water?',
    i_am_home: 'I am at home.',
  },

  lineSupportMeanings: {
    seller_color_choice: 'Red or blue?',
    seller_here_you_go: 'Here you go.',
    player_red_please: 'Red, please.',
    player_blue_please: 'Blue, please.',
    player_thank_you: 'Thank you.',
    distractor_i_am_home: 'I am at home.',
    distractor_my_father: 'My father.',
    distractor_house_is_big: 'The house is big.',
    distractor_good_morning: 'Good morning.',
  },

  recapTemplates: {
    intro: 'Nice work at the stall!',
    learnedPrefix: 'You used:',
  },
};
