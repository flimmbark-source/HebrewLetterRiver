// Pack Scene scene and moment definitions.
// Concept IDs bridge across languages — they are not sentence generators.
// Each moment = one speaker's utterance with one or more nested interactions.
// Coverage matters, but naturalness matters more: 3 natural concepts > 5 forced ones.

export const packSceneDefinitions = {
  'food_01.cafe_order_basic': {
    id: 'food_01.cafe_order_basic',
    packId: 'food_01',
    title: 'At the Café',
    goal: 'Order the thing you actually want.',
    sceneType: 'dialogue',
    difficulty: 1,
    targetConceptIds: ['coffee', 'water', 'bread', 'please', 'yes', 'thank-you'],

    moments: [
      {
        id: 'server-asks',
        speaker: 'other',
        speakerLabel: 'Server',
        lineId: 'cafe-choice-coffee-water',
        interactions: [
          {
            type: 'spotPackWords',
            targetConceptIds: ['coffee', 'water'],
            prompt: 'Tap the words you recognize.',
          },
          {
            type: 'meaningChoice',
            targetConceptIds: ['coffee', 'water'],
            prompt: 'What did the server ask?',
            options: [
              { id: 'correct', text: 'Coffee or water?', isCorrect: true },
              { id: 'near', text: 'Coffee and bread?', isCorrect: false },
              { id: 'wrong', text: 'Are you ready to order?', isCorrect: false },
            ],
          },
        ],
      },
      {
        id: 'player-coffee',
        speaker: 'you',
        speakerLabel: 'You',
        lineId: 'cafe-player-coffee-please',
        interactions: [
          {
            type: 'buildLine',
            targetConceptIds: ['coffee', 'please'],
            prompt: 'Order your drink.',
          },
        ],
      },
      {
        id: 'server-adds-bread',
        speaker: 'other',
        speakerLabel: 'Server',
        lineId: 'cafe-server-bread-too',
        interactions: [
          {
            type: 'spotPackWords',
            targetConceptIds: ['bread'],
            prompt: 'Tap the word you recognize.',
          },
        ],
      },
      {
        id: 'player-accepts',
        speaker: 'you',
        speakerLabel: 'You',
        lineId: 'cafe-player-yes-bread',
        interactions: [
          {
            type: 'chooseReply',
            targetConceptIds: ['yes', 'bread', 'please'],
            prompt: 'What should you say?',
            options: [
              { id: 'correct', text: 'Yes, bread please.', isCorrect: true },
              { id: 'near', text: 'No thank you.', isCorrect: false },
              { id: 'wrong', text: 'What is bread?', isCorrect: false },
            ],
          },
        ],
      },
      {
        id: 'player-closes',
        speaker: 'you',
        speakerLabel: 'You',
        lineId: 'cafe-player-thank-you',
        interactions: [
          {
            type: 'chooseReply',
            targetConceptIds: ['thank-you'],
            prompt: 'Close the exchange.',
            options: [
              { id: 'correct', text: 'Thank you.', isCorrect: true },
              { id: 'near', text: 'Yes please.', isCorrect: false },
              { id: 'wrong', text: 'I want more coffee.', isCorrect: false },
            ],
          },
        ],
      },
    ],
  },
};
