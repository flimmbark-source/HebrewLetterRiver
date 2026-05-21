// Pack Scene blueprint for pronouns_01.
// Language-independent: no target-language text or app-language strings live here.
//
// Scene model: grounded-identification. A characterCue marks the speaker,
// listener, outside person, pair, or group so each pronoun answer is grounded
// by scene role rather than by an app-language hint.

const PRONOUN_CONCEPTS = ['i', 'you-m', 'you-f', 'he', 'she', 'we', 'they'];

function pronounIdentifyBeat(conceptId) {
  return {
    id: `identify_${conceptId.replace(/-/g, '_')}`,
    role: 'choose_or_build_response',
    actionType: 'chooseReply',
    cueLineId: 'friend_who_is_this',
    visualCue: {
      type: 'characterCue',
      conceptId,
    },
    targetConceptIds: [conceptId],
    options: PRONOUN_CONCEPTS.map((id) => ({
      id,
      lineId: `player_${id.replace(/-/g, '_')}`,
      isCorrect: id === conceptId,
    })),
  };
}

export const pronouns_01Blueprint = {
  packId: 'pronouns_01',
  archetype: 'identify',
  domainId: 'pronouns',
  goalId: 'identify_basic_pronouns',
  packConceptIds: ['i', 'you-m', 'you-f', 'he', 'she', 'we', 'they'],
  supportConceptIds: ['thank-you'],

  contentContract: {
    vocabularyType: 'role-and-person-pronouns',
    sceneModel: 'grounded-identification',
    correctnessSource: 'visualCue',
    answerPolicy: 'one-correct-per-beat',
    coverage: 'all-pack-concepts-produced',
    maxBeats: 9,
    distractorPolicyNote:
      'Same-category pronoun distractors are fair because the characterCue marks speaker/listener/referent role, gender cue, and plurality.',
  },

  beats: [
    pronounIdentifyBeat('i'),
    pronounIdentifyBeat('you-m'),
    pronounIdentifyBeat('you-f'),
    pronounIdentifyBeat('he'),
    pronounIdentifyBeat('she'),
    pronounIdentifyBeat('we'),
    pronounIdentifyBeat('they'),
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
