// English app-language strings for greetings_01.
// correctnessSource is 'mixed': some beats use dayPart visual cues; others use
// conversational fit. No English prompt may name the expected answer before action.

export const greetings_01Strings = {
  goalText: 'Greet your friend and respond politely.',
  briefDescription:
    'Share quick exchanges with a friend throughout the day — a hello, a morning greeting, ' +
    'a thank you, a you\'re welcome, and a good night.',

  prompts: {
    respond_with_hello: '',
    say_good_morning: '',
    say_thank_you: '',
    say_you_are_welcome: '',
    say_good_night: '',
  },

  supportMeanings: {},

  lineSupportMeanings: {
    friend_hello: 'Hello!',
    player_hello: 'Hello!',
    player_good_morning: 'Good morning!',
    friend_here_you_go: 'Here you go!',
    player_thank_you: 'Thank you!',
    friend_thank_you: 'Thank you!',
    player_you_are_welcome: "You're welcome!",
    friend_goodbye: 'See you later!',
    player_good_night: 'Good night!',
    distractor_i_am_home: 'I am at home.',
  },

  recapTemplates: {
    intro: 'Great job with your greetings!',
    learnedPrefix: 'You used:',
  },
};
