// Pack Scene blueprint for everyday_objects_01.
// Language-independent: no target-language text or app-language strings live here.
//
// Scene model: grounded-identification (objectGlyph cue grounds correctness).
// Coherent frame: a friend shows you around their place, pointing to objects
// one at a time and asking מה זה? For each object the friend points at, an
// objectGlyph icon appears alongside the question — that icon uniquely
// determines the correct Hebrew word. A mystery shape grounds the 'thing' beat.

const OBJECT_CONCEPTS = ['book', 'phone', 'table', 'door', 'thing'];

const objectOptions = OBJECT_CONCEPTS.map((id) => ({
  id,
  lineId: `player_${id}`,
}));

function objectIdentifyBeat(objectConceptId) {
  return {
    id: `identify_${objectConceptId}`,
    role: 'choose_or_build_response',
    actionType: 'chooseReply',
    cueLineId: 'friend_what_is_this',
    visualCue: {
      type: 'objectGlyph',
      objectConceptId,
    },
    targetConceptIds: [objectConceptId],
    options: objectOptions.map((option) => ({
      id: option.id,
      lineId: option.lineId,
      isCorrect: option.id === objectConceptId,
    })),
  };
}

export const everyday_objects_01Blueprint = {
  packId: 'everyday_objects_01',
  archetype: 'identify',
  domainId: 'objects',
  goalId: 'identify_everyday_objects',
  packConceptIds: ['book', 'phone', 'table', 'door', 'thing'],
  supportConceptIds: ['thank-you'],

  contentContract: {
    vocabularyType: 'concrete-everyday-objects',
    sceneModel: 'grounded-identification',
    correctnessSource: 'visualCue',
    answerPolicy: 'one-correct-per-beat',
    coverage: 'all-pack-concepts-produced',
    maxBeats: 7,
    distractorPolicyNote:
      'Same-category object distractors are fair because the objectGlyph visual cue establishes ground truth. ' +
      'The mystery-shape glyph for "thing" distinguishes it from every specific object.',
  },

  beats: [
    objectIdentifyBeat('book'),
    objectIdentifyBeat('phone'),
    objectIdentifyBeat('table'),
    objectIdentifyBeat('door'),
    objectIdentifyBeat('thing'),
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
