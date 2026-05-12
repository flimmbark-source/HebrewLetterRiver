// Pack Scene blueprint for numbers_01.
// Language-independent: no target-language text or app-language strings live here.
//
// Scene model: grounded-identification (countDots cue grounds correctness).
// Coherent frame: a friend is sorting game stones into piles and asks
// כמה? for each pile. The dots visualize the pile size; the learner
// answers with the matching number word.

const NUMBER_CONCEPTS = ['one', 'two', 'three', 'four', 'five'];

function numberIdentifyBeat(count, conceptId) {
  return {
    id: `identify_${conceptId}`,
    role: 'choose_or_build_response',
    actionType: 'chooseReply',
    cueLineId: 'friend_how_many',
    visualCue: {
      type: 'countDots',
      count,
      conceptId,
    },
    targetConceptIds: [conceptId],
    options: NUMBER_CONCEPTS.map((id) => ({
      id,
      lineId: `player_${id}`,
      isCorrect: id === conceptId,
    })),
  };
}

export const numbers_01Blueprint = {
  packId: 'numbers_01',
  archetype: 'identify',
  domainId: 'numbers',
  goalId: 'identify_basic_numbers',
  packConceptIds: ['one', 'two', 'three', 'four', 'five'],
  supportConceptIds: ['thank-you'],

  contentContract: {
    vocabularyType: 'cardinal-numbers',
    sceneModel: 'grounded-identification',
    correctnessSource: 'visualCue',
    answerPolicy: 'one-correct-per-beat',
    coverage: 'all-pack-concepts-produced',
    maxBeats: 6,
    distractorPolicyNote:
      'Same-category number distractors are fair because the countDots visual cue establishes ground truth.',
  },

  beats: [
    numberIdentifyBeat(1, 'one'),
    numberIdentifyBeat(2, 'two'),
    numberIdentifyBeat(3, 'three'),
    numberIdentifyBeat(4, 'four'),
    numberIdentifyBeat(5, 'five'),
    {
      id: 'close_exchange',
      role: 'close_exchange',
      actionType: 'chooseReply',
      cueLineId: 'friend_nice',
      targetConceptIds: ['thank-you'],
      options: [
        { id: 'correct', lineId: 'player_thank_you', isCorrect: true },
        { id: 'wrong_home', lineId: 'distractor_i_am_home', isCorrect: false },
        { id: 'wrong_father', lineId: 'distractor_my_father', isCorrect: false },
      ],
    },
  ],
};
