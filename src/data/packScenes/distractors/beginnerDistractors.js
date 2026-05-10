// Shared distractor pool for beginner Pack Scenes.
// Distractors are clearly out-of-scene utterances used as wrong reply
// choices and as filler tile tokens in buildLine beats.
//
// Each entry has:
//   id            — stable line id, must start with `distractor_`
//   domainId      — used by tileDistractorPolicy.domainExclusions
//   targetText    — target-language full utterance
//   direction     — 'rtl' or 'ltr'
//   transliteration — optional, for languages that benefit from it
//   tokens        — array of { text, conceptId? } in source order

export const beginnerDistractors = {
  hebrew: {
    distractor_i_am_home: {
      id: 'distractor_i_am_home',
      domainId: 'home',
      targetText: 'אני בבית.',
      direction: 'rtl',
      transliteration: 'ani babayit.',
      tokens: [
        { text: 'אני' },
        { text: 'בבית.' },
      ],
    },
    distractor_my_father: {
      id: 'distractor_my_father',
      domainId: 'family',
      targetText: 'אבא שלי.',
      direction: 'rtl',
      transliteration: 'aba sheli.',
      tokens: [
        { text: 'אבא' },
        { text: 'שלי.' },
      ],
    },
    distractor_house_is_big: {
      id: 'distractor_house_is_big',
      domainId: 'home',
      targetText: 'הבית גדול.',
      direction: 'rtl',
      transliteration: 'habayit gadol.',
      tokens: [
        { text: 'הבית' },
        { text: 'גדול.' },
      ],
    },
    distractor_good_morning: {
      id: 'distractor_good_morning',
      domainId: 'greetings',
      targetText: 'בוקר טוב.',
      direction: 'rtl',
      transliteration: 'boker tov.',
      tokens: [
        { text: 'בוקר' },
        { text: 'טוב.' },
      ],
    },
  },
};

export function getDistractorPool(targetLanguageId) {
  return beginnerDistractors[targetLanguageId] || null;
}
