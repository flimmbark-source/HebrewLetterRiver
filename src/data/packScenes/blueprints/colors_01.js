// Pack Scene blueprint for colors_01 — canary scene built entirely on the
// new Pack Scene architecture. Language-independent: no target-language
// text or app-language strings live here.

export const colors_01Blueprint = {
  packId: 'colors_01',
  archetype: 'choice',
  domainId: 'colors',
  goalId: 'choose_color_basic',
  packConceptIds: ['red', 'blue'],
  supportConceptIds: ['please', 'thank-you', 'or'],

  beats: [
    {
      id: 'spot_color_choice',
      role: 'notice_options',
      actionType: 'spotPackWords',
      activeLineId: 'seller_color_choice',
      targetConceptIds: ['red', 'blue'],
    },
    {
      id: 'understand_color_choice',
      role: 'understand_cue',
      actionType: 'meaningChoice',
      cueLineId: 'seller_color_choice',
      activeLineId: 'seller_color_choice',
      targetConceptIds: ['red', 'blue'],
      options: [
        { id: 'correct', meaningId: 'red_or_blue', isCorrect: true },
        { id: 'wrong_drink', meaningId: 'coffee_or_water', isCorrect: false },
        { id: 'wrong_home', meaningId: 'i_am_home', isCorrect: false },
      ],
    },
    {
      id: 'answer_color',
      role: 'choose_or_build_response',
      actionType: 'buildLine',
      cueLineId: 'seller_color_choice',
      answerLineIds: ['player_red_please', 'player_blue_please'],
      targetConceptIds: ['red', 'blue', 'please'],
      acceptedConceptSets: [
        ['red', 'please'],
        ['blue', 'please'],
      ],
      tileDistractorPolicy: {
        count: 2,
        domainExclusions: ['colors', 'market', 'clothing'],
      },
    },
    {
      id: 'close_exchange',
      role: 'close_exchange',
      actionType: 'chooseReply',
      cueLineId: 'seller_here_you_go',
      targetConceptIds: ['thank-you'],
      options: [
        { id: 'correct', lineId: 'player_thank_you', isCorrect: true },
        { id: 'wrong_home', lineId: 'distractor_i_am_home', isCorrect: false },
        { id: 'wrong_father', lineId: 'distractor_my_father', isCorrect: false },
      ],
    },
  ],
};
