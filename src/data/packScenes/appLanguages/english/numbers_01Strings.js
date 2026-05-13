// English app-language strings for numbers_01.
// Number identify beats use the countDots visualCue as their correctness
// source, so prompts must NOT name the count in English — that would
// short-circuit the grounded-identification scene model.

export const numbers_01Strings = {
  goalText: 'Count the piles your friend sorts.',
  briefDescription:
    'Your friend sorts game stones into piles and asks "how many?" for each one. The dots show the pile. Answer with the matching Hebrew number.',

  prompts: {
    identify_one: '',
    identify_two: '',
    identify_three: '',
    identify_four: '',
    identify_five: '',
    close_exchange: 'Close politely.',
  },

  supportMeanings: {},

  lineSupportMeanings: {
    friend_how_many: 'How many?',
    friend_nice: 'Very nice.',
    player_one: 'One.',
    player_two: 'Two.',
    player_three: 'Three.',
    player_four: 'Four.',
    player_five: 'Five.',
    player_thank_you: 'Thank you.',
    distractor_i_am_home: 'I am at home.',
    distractor_my_father: 'My father.',
    distractor_house_is_big: 'The house is big.',
    distractor_good_morning: 'Good morning.',
  },

  recapTemplates: {
    intro: 'Nice work counting the piles!',
    learnedPrefix: 'You used:',
  },
};
