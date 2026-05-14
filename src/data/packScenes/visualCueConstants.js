// Visual cue primitives and their constants.
//
// Visual cues are abstract, language-independent grounding signals: the
// learner sees the cue, the cue makes the correct answer obvious, and the
// scene's correctness source is the cue itself (not an app-language hint).
//
// Supported types so far:
//   colorCircle  — a solid color swatch; correctness = colorConceptId
//   countDots    — N dots (1..COUNT_DOTS_MAX); correctness = the matching number concept
//   objectGlyph  — a simple icon for a concrete object; correctness = objectConceptId
//
// New cue types must be added here AND validated by archetype rules.

export const SUPPORTED_VISUAL_CUE_TYPES = new Set(['colorCircle', 'countDots', 'objectGlyph', 'dayPart']);

export const COUNT_DOTS_CONCEPT_BY_COUNT = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
};

export const COUNT_DOTS_MAX = 5;

// dayPart values and their corresponding pack concept IDs.
// Used by both the renderer (VisualCue.jsx) and the validator (validationRules.js).
export const SUPPORTED_DAY_PARTS = new Set(['morning', 'night']);

export const DAY_PART_CONCEPT_MAP = {
  morning: 'good-morning',
  night: 'good-night',
};

// Concept IDs that have a registered objectGlyph renderer.
// Any objectGlyph beat must use one of these IDs.
export const SUPPORTED_OBJECT_GLYPH_CONCEPT_IDS = new Set([
  'book',
  'phone',
  'table',
  'door',
  'thing',
]);
