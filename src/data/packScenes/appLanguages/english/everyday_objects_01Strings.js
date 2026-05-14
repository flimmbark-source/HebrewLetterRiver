// English app-language strings for everyday_objects_01.
// The objectGlyph visual cue is the correctness source for each
// identification beat, so prompts must NOT name the object in English —
// that would short-circuit the grounded-identification scene model.

export const everyday_objects_01Strings = {
  goalText: 'Name the objects your friend points to.',
  briefDescription:
    'Your friend shows you objects around the room and asks what each one is. ' +
    'An icon appears alongside the question. Answer with the matching Hebrew word.',

  prompts: {
    identify_book: '',
    identify_phone: '',
    identify_table: '',
    identify_door: '',
    identify_thing: '',
    close_exchange: 'Close politely.',
  },

  supportMeanings: {},

  lineSupportMeanings: {
    friend_what_is_this: 'What is this?',
    friend_nice: 'Very nice.',
    player_book: 'Book.',
    player_phone: 'Phone.',
    player_table: 'Table.',
    player_door: 'Door.',
    player_thing: 'Thing.',
    player_thank_you: 'Thank you.',
    distractor_i_am_home: 'I am at home.',
    distractor_my_father: 'My father.',
    distractor_house_is_big: 'The house is big.',
    distractor_good_morning: 'Good morning.',
  },

  recapTemplates: {
    intro: 'Nice work naming the objects!',
    learnedPrefix: 'You used:',
  },
};
