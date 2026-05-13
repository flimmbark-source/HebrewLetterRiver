// Pack Scene blueprint for shopping_01 — language-independent scene logic.
// No target-language text or app-language strings live here.
// Line IDs reference rows in target-language realization files.
// Concept IDs reference the concept registry.
//
// Scene job:
//   The learner is at a small shop. They notice the shop/money context,
//   decide to buy, ask the price, pay, accept a bag, and close politely.
//   Each beat is staged so 'buy' and 'pay' are distinct social moments
//   and never compete as wrong answers for each other.

export const shopping_01Blueprint = {
  packId: 'shopping_01',
  archetype: 'choice',
  domainId: 'shop',
  goalId: 'shop_purchase_basic',
  packConceptIds: ['money', 'store', 'how-much', 'bag', 'buy', 'pay'],
  supportConceptIds: ['please', 'yes', 'thank-you', 'want', 'and'],

  contentContract: {
    vocabularyType: 'transactional-shopping',
    sceneModel: 'transactional-choice',
    correctnessSource: 'conversational-fit',
    answerPolicy: 'mixed-valid-replies',
    coverage: 'all-pack-concepts-meaningfully-used',
    maxBeats: 6,
    distractorPolicyNote:
      'Avoid plausible valid shopping replies as wrong answers; use clearly out-of-scene distractors. buy and pay must never be wrong-option foils for each other.',
  },

  beats: [
    {
      id: 'spot_shop_context',
      role: 'notice_options',
      actionType: 'spotPackWords',
      activeLineId: 'clerk_shop_money_line',
      targetConceptIds: ['store', 'money'],
    },
    {
      id: 'decide_to_buy',
      role: 'choose_or_build_response',
      actionType: 'chooseReply',
      cueLineId: 'clerk_want_to_buy',
      targetConceptIds: ['buy', 'yes'],
      options: [
        { id: 'correct', lineId: 'player_yes_to_buy', isCorrect: true },
        { id: 'wrong_home', lineId: 'distractor_i_am_home', isCorrect: false },
        { id: 'wrong_father', lineId: 'distractor_my_father', isCorrect: false },
      ],
    },
    {
      id: 'ask_how_much',
      role: 'choose_or_build_response',
      actionType: 'buildLine',
      cueLineId: 'clerk_shows_item',
      answerLineIds: ['player_how_much'],
      targetConceptIds: ['how-much'],
      acceptedConceptSets: [['how-much']],
      tileDistractorPolicy: {
        count: 2,
        domainExclusions: ['shop', 'shopping'],
      },
    },
    {
      id: 'pay',
      role: 'choose_or_build_response',
      actionType: 'chooseReply',
      cueLineId: 'clerk_price_line',
      targetConceptIds: ['pay'],
      options: [
        { id: 'correct', lineId: 'player_to_pay', isCorrect: true },
        { id: 'wrong_house', lineId: 'distractor_house_is_big', isCorrect: false },
        { id: 'wrong_morning', lineId: 'distractor_good_morning', isCorrect: false },
      ],
    },
    {
      id: 'bag',
      role: 'choose_or_build_response',
      actionType: 'chooseReply',
      cueLineId: 'clerk_bag_offer',
      targetConceptIds: ['bag', 'please'],
      options: [
        { id: 'correct', lineId: 'player_bag_please', isCorrect: true },
        { id: 'wrong_father', lineId: 'distractor_my_father', isCorrect: false },
        { id: 'wrong_home', lineId: 'distractor_i_am_home', isCorrect: false },
      ],
    },
    {
      id: 'close_exchange',
      role: 'close_exchange',
      actionType: 'chooseReply',
      cueLineId: 'clerk_here_you_go',
      targetConceptIds: ['thank-you'],
      options: [
        { id: 'correct', lineId: 'player_thank_you', isCorrect: true },
        { id: 'wrong_house', lineId: 'distractor_house_is_big', isCorrect: false },
        { id: 'wrong_father', lineId: 'distractor_my_father', isCorrect: false },
      ],
    },
  ],
};
