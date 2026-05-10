// Direction config: determines text direction per UI region.
// Different regions of a Pack Scene UI may use different directions
// (e.g. an English prompt above an RTL Hebrew cue).

const RTL_LANGUAGES = new Set(['hebrew', 'arabic']);

export function getLanguageDirection(languageId) {
  if (!languageId) return 'ltr';
  return RTL_LANGUAGES.has(languageId) ? 'rtl' : 'ltr';
}

/**
 * Build a per-region direction config for a Pack Scene render.
 *
 * @param {string} appLanguageId
 * @param {string} targetLanguageId
 * @returns {{
 *   promptDirection: 'ltr'|'rtl',
 *   cueDirection:    'ltr'|'rtl',
 *   tileDirection:   'ltr'|'rtl',
 *   answerDirection: 'ltr'|'rtl',
 *   supportDirection:'ltr'|'rtl'
 * }}
 */
export function buildDirectionConfig(appLanguageId, targetLanguageId) {
  const app = getLanguageDirection(appLanguageId);
  const target = getLanguageDirection(targetLanguageId);
  return {
    promptDirection: app,
    cueDirection: target,
    tileDirection: target,
    answerDirection: target,
    supportDirection: app,
  };
}
