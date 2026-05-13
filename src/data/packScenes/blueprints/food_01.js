// Pack Scene blueprint for food_01 — language-independent scene logic.
// No target-language text or app-language strings live here.
// Line IDs reference rows in target-language realization files.
// Concept IDs reference the concept registry.

export const food_01Blueprint = {
  packId: 'food_01',
  archetype: 'choice',
  domainId: 'cafe',
  goalId: 'cafe_order_basic',
  packConceptIds: ['coffee', 'water', 'bread', 'apple', 'food'],
  supportConceptIds: ['please', 'yes', 'thank-you', 'also', 'or'],

  contentContract: {
    vocabularyType: 'transactional-food-and-drink',
    sceneModel: 'transactional-choice',
    correctnessSource: 'conversational-fit',
    answerPolicy: 'mixed-valid-replies',
    coverage: 'all-pack-concepts-meaningfully-used',
    maxBeats: 6,
    distractorPolicyNote:
      'Avoid plausible valid café replies as wrong answers; use clearly out-of-scene distractors.',
  },

  beats: [
    {
      id: 'spot_drink_offer',
      role: 'notice_options',
      actionType: 'spotPackWords',
      activeLineId: 'server_drink_choice',
      targetConceptIds: ['coffee', 'water'],
    },
    {
      id: 'answer_drink',
      role: 'choose_or_build_response',
      actionType: 'buildLine',
      cueLineId: 'server_drink_choice',
      answerLineIds: ['player_coffee_please', 'player_water_please'],
      targetConceptIds: ['coffee', 'water', 'please'],
      acceptedConceptSets: [
        ['coffee', 'please'],
        ['water', 'please'],
      ],
      tileDistractorPolicy: {
        count: 2,
        domainExclusions: ['cafe', 'food_ordering'],
      },
    },
    {
      id: 'accept_food',
      role: 'choose_or_build_response',
      actionType: 'chooseReply',
      cueLineId: 'server_want_food',
      targetConceptIds: ['yes', 'food', 'please'],
      options: [
        { id: 'correct', lineId: 'player_yes_food_please', isCorrect: true },
        { id: 'wrong_home', lineId: 'distractor_i_am_home', isCorrect: false },
        { id: 'wrong_father', lineId: 'distractor_my_father', isCorrect: false },
      ],
    },
    {
      id: 'spot_snack_offer',
      role: 'notice_options',
      actionType: 'spotPackWords',
      activeLineId: 'server_snack_choice',
      targetConceptIds: ['bread', 'apple'],
    },
    {
      id: 'answer_snack',
      role: 'choose_or_build_response',
      actionType: 'buildLine',
      cueLineId: 'server_snack_choice',
      answerLineIds: ['player_bread_please', 'player_apple_please'],
      targetConceptIds: ['bread', 'apple', 'please'],
      acceptedConceptSets: [
        ['bread', 'please'],
        ['apple', 'please'],
      ],
      tileDistractorPolicy: {
        count: 2,
        domainExclusions: ['cafe', 'food_ordering'],
      },
    },
    {
      id: 'close_exchange',
      role: 'close_exchange',
      actionType: 'chooseReply',
      cueLineId: 'server_here_you_go',
      targetConceptIds: ['thank-you'],
      options: [
        { id: 'correct', lineId: 'player_thank_you', isCorrect: true },
        { id: 'wrong_house', lineId: 'distractor_house_is_big', isCorrect: false },
        { id: 'wrong_father', lineId: 'distractor_my_father', isCorrect: false },
      ],
    },
  ],
};
