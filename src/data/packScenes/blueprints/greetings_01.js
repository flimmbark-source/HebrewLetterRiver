// Pack Scene blueprint for greetings_01.
// Language-independent: no target-language text or app-language strings live here.
//
// Scene model: social-exchange (mixed correctness source).
// Coherent frame: a series of brief social exchanges across the day.
//   Beat 1 — a friend greets you: שלום → respond with שלום (hello).
//   Beat 2 — morning context (dayPart cue): friend greets you at sunrise → בוקר טוב.
//   Beat 3 — friend hands you something with הנה! → reply with תודה (thank you).
//   Beat 4 — friend thanks you with תודה! → reply with בבקשה (you're welcome).
//   Beat 5 — night context (dayPart cue): friend parts at night → לילה טוב.
//
// Polysemy contract:
//   bb-shalom maps to concept 'hello' here only. שלום as peace or goodbye is not
//   taught in this scene, so שלום is excluded from options on dayPart beats to
//   avoid marking a plausible greeting wrong.
//
//   bb-bevakasha maps to concept 'you-are-welcome' here only. The 'please' reading
//   of בבקשה is not taught in this scene (please remains available for food/shopping).
//   בבקשה is excluded from the options on respond_with_hello so the learner is not
//   confused into thinking it is a greeting.

export const greetings_01Blueprint = {
  packId: 'greetings_01',
  archetype: 'socialExchange',
  domainId: 'greetings',
  goalId: 'basic_greetings_courtesy',
  packConceptIds: ['hello', 'good-morning', 'thank-you', 'you-are-welcome', 'good-night'],
  supportConceptIds: [],

  contentContract: {
    vocabularyType: 'social-greeting-courtesy',
    sceneModel: 'social-exchange',
    correctnessSource: 'mixed',
    answerPolicy: 'one-correct-per-beat',
    coverage: 'all-pack-concepts-produced',
    maxBeats: 6,
    distractorPolicyNote:
      'dayPart beats must not include hello (shalom) as a wrong option because it is plausible in morning and farewell contexts. ' +
      'good-morning and good-night are fair foils only when a dayPart cue makes one clearly correct. ' +
      'you-are-welcome (bevakasha) is used only as you-are-welcome in this scene, not please. ' +
      'player_thank_you is excluded from say_you_are_welcome options to avoid a matching-not-meaning trap.',
  },

  beats: [
    // Beat 1: friend says שלום — respond with שלום.
    // No dayPart cue, so time-specific greetings (good-morning/good-night) are excluded
    // as wrong options — without context they could feel ambiguous.
    {
      id: 'respond_with_hello',
      role: 'choose_or_build_response',
      actionType: 'chooseReply',
      cueLineId: 'friend_hello',
      targetConceptIds: ['hello'],
      options: [
        { id: 'player_hello', lineId: 'player_hello', isCorrect: true },
        { id: 'player_thank_you', lineId: 'player_thank_you', isCorrect: false },
        { id: 'player_you_are_welcome', lineId: 'player_you_are_welcome', isCorrect: false },
        { id: 'wrong_home', lineId: 'distractor_i_am_home', isCorrect: false },
      ],
    },

    // Beat 2: morning context — dayPart cue makes בוקר טוב unambiguously correct.
    // שלום excluded: it is a plausible morning greeting and cannot be fairly marked wrong.
    {
      id: 'say_good_morning',
      role: 'choose_or_build_response',
      actionType: 'chooseReply',
      cueLineId: 'friend_hello',
      visualCue: { type: 'dayPart', dayPart: 'morning' },
      targetConceptIds: ['good-morning'],
      options: [
        { id: 'player_good_morning', lineId: 'player_good_morning', isCorrect: true },
        { id: 'player_good_night', lineId: 'player_good_night', isCorrect: false },
        { id: 'player_thank_you', lineId: 'player_thank_you', isCorrect: false },
        { id: 'player_you_are_welcome', lineId: 'player_you_are_welcome', isCorrect: false },
      ],
    },

    // Beat 3: friend hands something over with הנה! — reply with תודה.
    // בבקשה (you're welcome) is wrong here: one doesn't say you're welcome before being thanked.
    {
      id: 'say_thank_you',
      role: 'choose_or_build_response',
      actionType: 'chooseReply',
      cueLineId: 'friend_here_you_go',
      targetConceptIds: ['thank-you'],
      options: [
        { id: 'player_thank_you', lineId: 'player_thank_you', isCorrect: true },
        { id: 'player_you_are_welcome', lineId: 'player_you_are_welcome', isCorrect: false },
        { id: 'player_hello', lineId: 'player_hello', isCorrect: false },
        { id: 'wrong_home', lineId: 'distractor_i_am_home', isCorrect: false },
      ],
    },

    // Beat 4: friend says תודה! — reply with בבקשה (you're welcome).
    // player_thank_you excluded: cue word is תודה so showing it as an option
    // risks a matching-not-meaning trap.
    {
      id: 'say_you_are_welcome',
      role: 'choose_or_build_response',
      actionType: 'chooseReply',
      cueLineId: 'friend_thank_you',
      targetConceptIds: ['you-are-welcome'],
      options: [
        { id: 'player_you_are_welcome', lineId: 'player_you_are_welcome', isCorrect: true },
        { id: 'player_hello', lineId: 'player_hello', isCorrect: false },
        { id: 'player_good_morning', lineId: 'player_good_morning', isCorrect: false },
        { id: 'player_good_night', lineId: 'player_good_night', isCorrect: false },
      ],
    },

    // Beat 5: night context — dayPart cue makes לילה טוב unambiguously correct.
    // שלום excluded: it functions as a farewell too, so marking it wrong would be unfair.
    {
      id: 'say_good_night',
      role: 'choose_or_build_response',
      actionType: 'chooseReply',
      cueLineId: 'friend_goodbye',
      visualCue: { type: 'dayPart', dayPart: 'night' },
      targetConceptIds: ['good-night'],
      options: [
        { id: 'player_good_night', lineId: 'player_good_night', isCorrect: true },
        { id: 'player_good_morning', lineId: 'player_good_morning', isCorrect: false },
        { id: 'player_thank_you', lineId: 'player_thank_you', isCorrect: false },
        { id: 'player_you_are_welcome', lineId: 'player_you_are_welcome', isCorrect: false },
      ],
    },
  ],
};
