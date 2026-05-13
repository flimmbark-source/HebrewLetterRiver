// Visual cue primitives and their constants.
//
// Visual cues are abstract, language-independent grounding signals: the
// learner sees the cue, the cue makes the correct answer obvious, and the
// scene's correctness source is the cue itself (not an app-language hint).
//
// Supported types so far:
//   colorCircle  — a solid color swatch; correctness = colorConceptId
//   countDots    — N dots (1..COUNT_DOTS_MAX); correctness = the matching number concept
//
// New cue types must be added here AND validated by archetype rules.

export const SUPPORTED_VISUAL_CUE_TYPES = new Set(['colorCircle', 'countDots']);

export const COUNT_DOTS_CONCEPT_BY_COUNT = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
};

export const COUNT_DOTS_MAX = 5;
