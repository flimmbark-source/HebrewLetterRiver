// English app-language strings for colors_01.
// supportMeanings keys come from blueprint meaningChoice option.meaningId.
// lineSupportMeanings keys are target-language line IDs (scene + distractor).
// prompts are keyed by beat id.

export const colors_01Strings = {
  goalText: 'Name the colors your friend shows you.',
  briefDescription:
    'Your friend shows colored items and asks what color each one is. Answer with the matching Hebrew color word.',

  prompts: {
    identify_red: 'What color is this?',
    identify_blue: 'What color is this?',
    identify_green: 'What color is this?',
    identify_yellow: 'What color is this?',
    close_exchange: 'Close politely.',
  },

  supportMeanings: {},

  lineSupportMeanings: {
    friend_what_color_is_this: 'What color is this?',
    friend_nice: 'Very nice.',
    player_red: 'Red.',
    player_blue: 'Blue.',
    player_green: 'Green.',
    player_yellow: 'Yellow.',
    player_thank_you: 'Thank you.',
    distractor_i_am_home: 'I am at home.',
    distractor_my_father: 'My father.',
    distractor_house_is_big: 'The house is big.',
    distractor_good_morning: 'Good morning.',
  },

  recapTemplates: {
    intro: 'Nice work naming the colors!',
    learnedPrefix: 'You used:',
  },
};
