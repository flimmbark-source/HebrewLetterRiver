// Pack Scene scene and beat definitions.
// Concept IDs bridge across languages — they are not sentence generators.
// Options for meaningChoice / chooseReply beats are defined here in English (supportText).
// Coverage matters, but naturalness matters more: 3 natural concepts > 5 forced ones.

export const packSceneDefinitions = {
  'food_01.cafe_order_basic': {
    id: 'food_01.cafe_order_basic',
    packId: 'food_01',
    title: 'At the café',
    sceneType: 'dialogue',
    difficulty: 1,
    targetConceptIds: ['coffee', 'water', 'bread', 'please'],

    beats: [
      {
        id: 'spot-request',
        actionType: 'spotPackWords',
        lineId: 'cafe-request-coffee-water',
        targetConceptIds: ['coffee', 'water'],
      },
      {
        id: 'understand-request',
        actionType: 'meaningChoice',
        lineId: 'cafe-request-coffee-water',
        options: [
          { id: 'correct', text: 'Can I get coffee and water?', isCorrect: true },
          { id: 'near-scene', text: 'Yes, bread please.', isCorrect: false },
          { id: 'wrong-scene', text: 'I am going home now.', isCorrect: false },
        ],
      },
      {
        id: 'build-bread-reply',
        actionType: 'buildLine',
        lineId: 'cafe-yes-bread-please',
        targetConceptIds: ['bread', 'please'],
      },
      {
        id: 'choose-close',
        actionType: 'chooseReply',
        prompt: 'What should you say next?',
        lineId: 'cafe-thank-you',
        targetConceptIds: ['thank-you'],
        options: [
          { id: 'correct-thanks', lineId: 'cafe-thank-you', text: 'Thank you.', isCorrect: true },
          { id: 'near-bread', lineId: 'cafe-yes-bread-please', text: 'Yes, bread please.', isCorrect: false },
          { id: 'wrong-home', text: 'I am going home now.', isCorrect: false },
        ],
      },
    ],
  },
};
