// Visual cue primitives and their constants.
//
// Visual cues are abstract, language-independent grounding signals: the
// learner sees the cue, the cue makes the correct answer obvious, and the
// scene's correctness source is the cue itself (not an app-language hint).

export const SUPPORTED_VISUAL_CUE_TYPES = new Set([
  'colorCircle',
  'countDots',
  'objectGlyph',
  'dayPart',
  'comparisonCue',
  'characterCue',
  'familyCue',
]);

export const COUNT_DOTS_CONCEPT_BY_COUNT = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
};

export const COUNT_DOTS_MAX = 5;

export const SUPPORTED_DAY_PARTS = new Set(['morning', 'night']);

export const DAY_PART_CONCEPT_MAP = {
  morning: 'good-morning',
  night: 'good-night',
};

export const SUPPORTED_OBJECT_GLYPH_CONCEPT_IDS = new Set([
  'book',
  'phone',
  'table',
  'door',
  'thing',
]);

export const SUPPORTED_COMPARISON_CONCEPT_IDS = new Set(['big', 'small', 'tall', 'short']);

export const SUPPORTED_CHARACTER_CONCEPT_IDS = new Set([
  'i',
  'you-m',
  'you-f',
  'he',
  'she',
  'we',
  'they',
]);

export const SUPPORTED_FAMILY_CONCEPT_IDS = new Set([
  'mom',
  'dad',
  'family',
  'home',
  'friend',
  'child',
  'parent',
  'neighbor',
  'stranger',
]);
