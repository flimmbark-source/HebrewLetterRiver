// Pack Scene blueprint for colors_01.
// Language-independent: no target-language text or app-language strings live here.
// Colors are grounded-reference vocabulary, so each answer beat is determined
// by a visual cue rather than by a free preference choice.

const colorOptions = [
  { id: 'red', lineId: 'player_red' },
  { id: 'blue', lineId: 'player_blue' },
  { id: 'green', lineId: 'player_green' },
  { id: 'yellow', lineId: 'player_yellow' },
];

function colorIdentifyBeat(colorConceptId) {
  return {
    id: `identify_${colorConceptId}`,
    role: 'choose_or_build_response',
    actionType: 'chooseReply',
    cueLineId: 'friend_what_color_is_this',
    visualCue: {
      type: 'colorCircle',
      colorConceptId,
    },
    targetConceptIds: [colorConceptId],
    options: colorOptions.map((option) => ({
      id: option.id,
      lineId: option.lineId,
      isCorrect: option.id === colorConceptId,
    })),
  };
}

export const colors_01Blueprint = {
  packId: 'colors_01',
  archetype: 'identify',
  domainId: 'colors',
  goalId: 'identify_basic_colors',
  packConceptIds: ['red', 'blue', 'green', 'yellow'],
  supportConceptIds: ['thank-you'],

  beats: [
    colorIdentifyBeat('red'),
    colorIdentifyBeat('blue'),
    colorIdentifyBeat('green'),
    colorIdentifyBeat('yellow'),
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
