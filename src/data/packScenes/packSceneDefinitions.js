// Pack Scene scene and beat definitions.
// Each beat has:
//   activeLineId — the line being produced / understood in this beat
//   cueLineId   — the prior line that makes this task meaningful (omit for opening beats)
//   cueLabel    — speaker context shown above the cue, e.g. 'Server asks:'
// chooseReply options carry targetText + supportText so choices are in-scene utterances.

export const packSceneDefinitions = {
  'food_01.cafe_order_basic': {
    id: 'food_01.cafe_order_basic',
    packId: 'food_01',
    title: 'At the Café',
    goal: 'Get coffee and bread.',
    sceneType: 'dialogue',
    difficulty: 1,
    targetConceptIds: ['coffee', 'water', 'bread', 'please', 'yes', 'thank-you'],

    beats: [
      {
        id: 'spot-drink-offer',
        actionType: 'spotPackWords',
        activeLineId: 'cafe-choice-coffee-water',
        cueLabel: 'Server asks:',
        targetConceptIds: ['coffee', 'water'],
        prompt: 'Tap the words you recognize.',
      },
      {
        id: 'understand-drink-offer',
        actionType: 'meaningChoice',
        cueLineId: 'cafe-choice-coffee-water',
        activeLineId: 'cafe-choice-coffee-water',
        cueLabel: 'Server asks:',
        targetConceptIds: ['coffee', 'water'],
        prompt: 'What did the server ask?',
        options: [
          { id: 'correct', text: 'Coffee or water?', isCorrect: true },
          { id: 'near', text: 'Bread too?', isCorrect: false },
          { id: 'wrong', text: 'Here you go.', isCorrect: false },
        ],
      },
      {
        id: 'order-coffee',
        actionType: 'buildLine',
        cueLineId: 'cafe-choice-coffee-water',
        activeLineId: 'cafe-player-coffee-please',
        cueLabel: 'Server asks:',
        targetConceptIds: ['coffee', 'please'],
        prompt: 'Order your drink.',
      },
      {
        id: 'spot-bread-offer',
        actionType: 'spotPackWords',
        activeLineId: 'cafe-server-bread-too',
        cueLabel: 'Server asks:',
        targetConceptIds: ['bread'],
        prompt: 'Tap the word you recognize.',
      },
      {
        id: 'accept-bread',
        actionType: 'chooseReply',
        cueLineId: 'cafe-server-bread-too',
        activeLineId: 'cafe-player-yes-bread',
        cueLabel: 'Server asks:',
        targetConceptIds: ['yes', 'bread', 'please'],
        prompt: 'How do you answer?',
        options: [
          { id: 'accept', targetText: 'כן, לחם בבקשה.', supportText: 'Yes, bread please.', isCorrect: true },
          { id: 'decline', targetText: 'לא, תודה.', supportText: 'No, thank you.', isCorrect: false },
          { id: 'only-coffee', targetText: 'רק קפה, תודה.', supportText: 'Just coffee, thanks.', isCorrect: false },
        ],
      },
      {
        id: 'close-exchange',
        actionType: 'chooseReply',
        cueLineId: 'cafe-server-here-you-go',
        activeLineId: 'cafe-player-thank-you',
        cueLabel: 'Server says:',
        targetConceptIds: ['thank-you'],
        prompt: 'Close politely.',
        options: [
          { id: 'thanks', targetText: 'תודה.', supportText: 'Thank you.', isCorrect: true },
          { id: 'more-coffee', targetText: 'עוד קפה, בבקשה.', supportText: 'More coffee, please.', isCorrect: false },
          { id: 'yes-please', targetText: 'כן, בבקשה.', supportText: 'Yes, please.', isCorrect: false },
        ],
      },
    ],
  },
};
