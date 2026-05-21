// Pack Scene blueprint for family_01.
// Language-independent: no target-language text or app-language strings live here.
//
// Scene model: grounded-identification. Family nouns use familyCue icons;
// home uses a home glyph; relationship words use distinct proximity cues.

const FAMILY_CONCEPTS = [
  'mom',
  'dad',
  'family',
  'home',
  'friend',
  'child',
  'parent',
  'neighbor',
  'stranger',
];

function familyIdentifyBeat(conceptId) {
  return {
    id: `identify_${conceptId}`,
    role: 'choose_or_build_response',
    actionType: 'chooseReply',
    cueLineId: conceptId === 'home' ? 'friend_what_is_this' : 'friend_who_is_this',
    visualCue: {
      type: 'familyCue',
      conceptId,
    },
    targetConceptIds: [conceptId],
    options: FAMILY_CONCEPTS.map((id) => ({
      id,
      lineId: `player_${id}`,
      isCorrect: id === conceptId,
    })),
  };
}

export const family_01Blueprint = {
  packId: 'family_01',
  archetype: 'identify',
  domainId: 'family_people_close_by',
  goalId: 'identify_family_and_nearby_people',
  packConceptIds: [
    'mom',
    'dad',
    'family',
    'home',
    'friend',
    'child',
    'parent',
    'neighbor',
    'stranger',
  ],
  supportConceptIds: ['thank-you'],

  contentContract: {
    vocabularyType: 'family-and-social-relationship-nouns',
    sceneModel: 'grounded-identification',
    correctnessSource: 'visualCue',
    answerPolicy: 'one-correct-per-beat',
    coverage: 'all-pack-concepts-produced',
    maxBeats: 11,
    distractorPolicyNote:
      'Same-category family and relationship distractors are acceptable only because the familyCue uses distinct role/proximity markers for each concept. This is a pragmatic full-pack bridge for read-in-context; future pack splitting can narrow it further.',
  },

  beats: [
    familyIdentifyBeat('mom'),
    familyIdentifyBeat('dad'),
    familyIdentifyBeat('family'),
    familyIdentifyBeat('home'),
    familyIdentifyBeat('friend'),
    familyIdentifyBeat('child'),
    familyIdentifyBeat('parent'),
    familyIdentifyBeat('neighbor'),
    familyIdentifyBeat('stranger'),
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
