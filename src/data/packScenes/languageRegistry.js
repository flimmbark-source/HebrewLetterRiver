// Language registry for Pack Scenes.
// Phase 2A creates the scaffold; concrete realization tables land in Phase 2B.
// Until then this module exists so blueprint consumers can import it without
// triggering a missing-module error.

export const TARGET_LANGUAGE_IDS = [
  'amharic',
  'arabic',
  'bengali',
  'english',
  'french',
  'hebrew',
  'hindi',
  'japanese',
  'mandarin',
  'portuguese',
  'russian',
  'spanish',
];

export const APP_LANGUAGE_IDS = [...TARGET_LANGUAGE_IDS];

export function isTargetLanguageId(value) {
  return TARGET_LANGUAGE_IDS.includes(value);
}

export function isAppLanguageId(value) {
  return APP_LANGUAGE_IDS.includes(value);
}
