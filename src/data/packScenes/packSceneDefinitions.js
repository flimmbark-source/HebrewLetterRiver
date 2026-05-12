// Pack Scene scene and beat definitions.
// Each beat has:
//   activeLineId — the line being produced / understood in this beat
//   cueLineId   — the prior line that makes this task meaningful (omit for opening beats)
//   cueLabel    — speaker context shown above the cue, e.g. 'Server asks:'
// chooseReply options carry targetText + supportText so choices are in-scene utterances.
// Beginner distractors should be clearly out-of-scene, not alternate valid replies.

export const packSceneDefinitions = {
  'food_01.cafe_order_basic': {
    id: 'food_01.cafe_order_basic',
    packId: 'food_01',
    title: 'At the Café',
    goal: 'Choose a drink, then get bread.',
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
        prompt: 'Find the choice words.',
      },
      {
        id: 'understand-drink-offer',
        actionType: 'meaningChoice',
        cueLineId: 'cafe-choice-coffee-water',
        activeLineId: 'cafe-choice-coffee-water',
        cueLabel: 'Server asks:',
        targetConceptIds: ['coffee', 'water'],
        prompt: 'What choice did the server give you?',
        options: [
          { id: 'correct', text: 'Coffee or water?', isCorrect: true },
          { id: 'near', text: 'Bread too?', isCorrect: false },
          { id: 'wrong', text: 'Here you go.', isCorrect: false },
        ],
      },
      {
        id: 'order-drink',
        actionType: 'buildLine',
        cueLineId: 'cafe-choice-coffee-water',
        activeLineId: 'cafe-player-coffee-please',
        cueLabel: 'Server asks:',
        targetConceptIds: ['coffee', 'water', 'please'],
        acceptedConceptSequences: [
          ['coffee', 'please'],
          ['water', 'please'],
        ],
        prompt: 'Answer the server.',
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
          {
            id: 'accept',
            targetText: 'כן, לחם בבקשה.',
            supportText: 'Yes, bread please.',
            isCorrect: true,
          },
          {
            id: 'at-home',
            targetText: 'אני בבית.',
            supportText: 'I am at home.',
            isCorrect: false,
          },
          {
            id: 'my-father',
            targetText: 'אבא שלי.',
            supportText: 'My father.',
            isCorrect: false,
          },
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
          {
            id: 'thanks',
            targetText: 'תודה.',
            supportText: 'Thank you.',
            isCorrect: true,
          },
          {
            id: 'the-house-is-big',
            targetText: 'הבית גדול.',
            supportText: 'The house is big.',
            isCorrect: false,
          },
          {
            id: 'my-father-close',
            targetText: 'אבא שלי.',
            supportText: 'My father.',
            isCorrect: false,
          },
        ],
      },
    ],
  },
};
