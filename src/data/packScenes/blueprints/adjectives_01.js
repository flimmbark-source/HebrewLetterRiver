// Pack Scene blueprint for adjectives_01.
// Language-independent: no target-language text or app-language strings live here.
//
// Scene model: grounded-identification. A comparisonCue shows two objects and
// highlights the one being named, so big / small / tall / short can be answered
// from the cue instead of from an app-language hint.

const ADJECTIVE_CONCEPTS = ['big', 'small', 'tall', 'short'];

function adjectiveIdentifyBeat(conceptId) {
  return {
    id: `identify_${conceptId}`,
    role: 'choose_or_build_response',
    actionType: 'chooseReply',
    cueLineId: 'friend_how_is_this',
    visualCue: {
      type: 'comparisonCue',
      conceptId,
    },
    targetConceptIds: [conceptId],
    options: ADJECTIVE_CONCEPTS.map((id) => ({
      id,
      lineId: `player_${id}`,
      isCorrect: id === conceptId,
    })),
  };
}

export const adjectives_01Blueprint = {
  packId: 'adjectives_01',
  archetype: 'identify',
  domainId: 'comparison_adjectives',
  goalId: 'identify_size_and_height_adjectives',
  packConceptIds: ['big', 'small', 'tall', 'short'],
  supportConceptIds: ['thank-you'],

  contentContract: {
    vocabularyType: 'grounded-visual-property',
    sceneModel: 'grounded-identification',
    correctnessSource: 'visualCue',
    answerPolicy: 'one-correct-per-beat',
    coverage: 'all-pack-concepts-produced',
    maxBeats: 6,
    distractorPolicyNote:
      'Same-category adjective distractors are fair because the comparisonCue shows the target object and the size or height contrast.',
  },

  beats: [
    adjectiveIdentifyBeat('big'),
    adjectiveIdentifyBeat('small'),
    adjectiveIdentifyBeat('tall'),
    adjectiveIdentifyBeat('short'),
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
